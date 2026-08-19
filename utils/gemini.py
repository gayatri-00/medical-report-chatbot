"""
Gemini API Client Utility
Handles communication with Google Gemini API using strict medical context grounding and safety guardrails.
"""

import os
from typing import List, Dict, Any, Optional

# System instruction strictly enforcing document-grounded answers and medical safety
MEDICAL_RAG_SYSTEM_PROMPT = """You are a medical report explanation assistant.
Answer questions ONLY using information retrieved from the user's uploaded document.
If the requested information is not present in the document, clearly say that the information is not available in the uploaded report.
Never fabricate values, diagnoses, test results, or medical history.

Important Rules:
1. If the information is unavailable in the provided context, respond:
   "I couldn't find that information in the uploaded report."
2. You must NOT:
   - Diagnose diseases or confirm speculative conditions
   - Prescribe medicines
   - Recommend specific medication doses
   - Tell the user to start or stop medications
   - Replace a physician or professional healthcare provider
3. If the user asks about taking medicines (e.g. "Which medicine should I take?"), respond:
   "I can explain what the uploaded report says, but I cannot prescribe or recommend a medication. Please discuss medication choices with a qualified healthcare professional."
4. If a medication is already listed in the report, you may state that it is mentioned in the report, but do not independently recommend taking it.
5. Always explain complex laboratory units, medical acronyms, or clinical jargon in simple, accessible, clear terms.
6. Clearly cite the source page(s) whenever provided in the context chunks (e.g., "According to Page 1...").
"""

def get_gemini_api_key() -> Optional[str]:
    """Retrieves Gemini API key from environment variables or Streamlit secrets."""
    # 1. Check standard environment variable
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here" and len(api_key.strip()) > 5:
        return api_key.strip()
    
    # 2. Check Streamlit secrets if running inside Streamlit
    try:
        import streamlit as st
        if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
            return st.secrets["GEMINI_API_KEY"]
    except Exception:
        pass

    return None


def generate_rag_answer(question: str, retrieved_chunks: List[Dict[str, Any]], report_name: str = "Medical Report") -> Dict[str, Any]:
    """
    Generates a context-grounded answer using Google Gemini API based on retrieved chunks.
    
    Returns:
        Dict with:
            'answer': str
            'source_pages': List[int]
            'citations': List[str]
            'model_used': str
            'error': Optional[str]
    """
    api_key = get_gemini_api_key()
    
    # Extract source pages and build context string
    source_pages = sorted(list(set([c.get("page_number", 1) for c in retrieved_chunks if "page_number" in c])))
    
    context_blocks = []
    for idx, chunk in enumerate(retrieved_chunks, 1):
        page_num = chunk.get("page_number", 1)
        text = chunk.get("text", "").strip()
        context_blocks.append(f"[Snippet {idx} - Page {page_num}]\n{text}")
    
    context_str = "\n\n---\n\n".join(context_blocks)
    
    # Check if chunks are completely empty
    if not retrieved_chunks or len(context_str.strip()) < 10:
        return {
            "answer": "I couldn't find that information in the uploaded report.",
            "source_pages": [],
            "citations": [],
            "model_used": "grounding-filter",
            "error": None
        }

    # Prompt structure
    user_prompt = f"""DOCUMENT NAME: {report_name}

RETRIEVED CONTEXT FROM REPORT:
{context_str}

USER QUESTION:
{question}

Please answer the user's question based strictly and exclusively on the RETRIEVED CONTEXT above. Include source page references (e.g., 'Source: Page {source_pages[0] if source_pages else 1}')."""

    # If Gemini API Key is missing, give a clear friendly message
    if not api_key:
        return {
            "answer": f"**Gemini API key is not configured.**\n\nAdd `GEMINI_API_KEY` to the application secrets or environment configuration to generate live LLM responses.\n\n*Retrieved context from {report_name} (Pages: {', '.join(map(str, source_pages))}):*\n\n> " + context_blocks[0][:250] + "...",
            "source_pages": source_pages,
            "citations": [f"Page {p}" for p in source_pages],
            "model_used": "none (missing key)",
            "error": "Missing GEMINI_API_KEY"
        }

    # Call Gemini API
    try:
        # Option A: Modern google.genai SDK
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=user_prompt,
            config={
                "system_instruction": MEDICAL_RAG_SYSTEM_PROMPT,
                "temperature": 0.2,
            }
        )
        answer_text = response.text or "I couldn't find that information in the uploaded report."
        return {
            "answer": answer_text,
            "source_pages": source_pages,
            "citations": [f"Page {p}" for p in source_pages],
            "model_used": "gemini-3.7-flash",
            "error": None
        }
    except Exception as e:
        # Option B: Fallback google.generativeai if older package installed
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=api_key)
            model = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=MEDICAL_RAG_SYSTEM_PROMPT
            )
            response = model.generate_content(user_prompt)
            return {
                "answer": response.text,
                "source_pages": source_pages,
                "citations": [f"Page {p}" for p in source_pages],
                "model_used": "gemini-1.5-flash",
                "error": None
            }
        except Exception as e2:
            return {
                "answer": f"Unable to generate response: {str(e2)}. Please verify your Gemini API key and internet connectivity.",
                "source_pages": source_pages,
                "citations": [],
                "model_used": "error",
                "error": str(e2)
            }


def generate_structured_report_summary(full_text: str, filename: str = "report.pdf") -> Dict[str, Any]:
    """
    Generates a structured medical summary directly from extracted report text.
    """
    api_key = get_gemini_api_key()
    
    if not api_key:
        # Rule-based fallback extraction if no API key
        return {
            "report_name": filename,
            "main_findings": "Summary available once Gemini API key is configured. Report text extracted successfully.",
            "important_observations": "Extracted " + str(len(full_text.split())) + " words from document.",
            "tests": [],
            "dates": ["Date extracted from document metadata"],
            "raw_text_preview": full_text[:500]
        }

    prompt = f"""You are an objective clinical document summarizer. Summarize the following medical report strictly based on the text. Do not invent any values or conditions.

REPORT CONTENT:
{full_text[:8000]}

Provide a clean summary with:
1. Main Findings
2. Important Observations / Abnormal values flagged
3. Tests Included
4. Relevant Dates if mentioned
"""
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt,
            config={
                "system_instruction": "You are a medical document analyzer. Only extract facts present in the text.",
                "temperature": 0.1
            }
        )
        return {
            "report_name": filename,
            "summary_text": response.text,
            "raw_text_preview": full_text[:500]
        }
    except Exception as e:
        return {
            "report_name": filename,
            "summary_text": f"Document processed. Summary generation error: {str(e)}",
            "raw_text_preview": full_text[:500]
        }
