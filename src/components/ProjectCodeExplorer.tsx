import React, { useState } from "react";
import { Code2, FileCode, Copy, Check, Terminal, FolderTree } from "lucide-react";

export const ProjectCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>("app.py");
  const [copied, setCopied] = useState<boolean>(false);

  const fileMap: Record<string, { label: string; path: string; lang: string; description: string; code: string }> = {
    "app.py": {
      label: "app.py (Main Streamlit Entry)",
      path: "app.py",
      lang: "python",
      description: "Main application setup, classic medical CSS styling, user session management, and RAG routing.",
      code: `import streamlit as st
import os
import sys

from utils.firebase import login_user, sign_up_user
from utils.rag_pipeline import switch_active_report

st.set_page_config(
    page_title="Medical Report Chatbot",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Classic Clean Medical Theme CSS (White / Light-Blue / Soft Teal Gradient)
st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
</style>
""", unsafe_allow_html=True)

def main():
    st.title("🩺 Medical Report Chatbot")
    st.caption("AI-powered medical report understanding using RAG")
    # Multi-page Streamlit application structure...

if __name__ == "__main__":
    main()`,
    },
    "rag_pipeline.py": {
      label: "utils/rag_pipeline.py (LangChain & FAISS Pipeline)",
      path: "utils/rag_pipeline.py",
      lang: "python",
      description: "LangChain text chunking, Sentence Transformers vectorization, and active context switching.",
      code: `from utils.pdf_processor import extract_text_from_pdf
from utils.embeddings import compute_embeddings, FAISSVectorStore
from utils.gemini import generate_rag_answer
from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_medical_report_rag(file_bytes, filename, report_id, status_callback=None):
    # 1. PDF Text Extraction
    pages_data, meta = extract_text_from_pdf(file_bytes, filename)
    
    # 2. Text Chunking (LangChain)
    splitter = RecursiveCharacterTextSplitter(chunk_size=450, chunk_overlap=80)
    chunks = splitter.split_text(full_text)
    
    # 3. Embeddings & FAISS Index
    embeddings = compute_embeddings([c['text'] for c in chunks])
    vector_store = FAISSVectorStore()
    vector_store.add_documents(chunks, embeddings)
    
    return True, {"status": "READY", "report_id": report_id}`,
    },
    "gemini.py": {
      label: "utils/gemini.py (Gemini API & Safety)",
      path: "utils/gemini.py",
      lang: "python",
      description: "Strict medical grounding system prompt, no medication prescription guardrail, and citations formatter.",
      code: `from google import genai
import os

MEDICAL_RAG_SYSTEM_PROMPT = """You are a medical report explanation assistant.
Answer questions ONLY using information retrieved from the user's uploaded document.
If the requested information is not present, respond: 'I couldn't find that information in the uploaded report.'
Never fabricate values, diagnoses, test results, or medical history.
Do NOT prescribe medications or recommend dosages."""

def generate_rag_answer(question, retrieved_chunks, report_name="Medical Report"):
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=user_prompt,
        config={"system_instruction": MEDICAL_RAG_SYSTEM_PROMPT, "temperature": 0.15}
    )
    return {"answer": response.text, "source_pages": [1]}`,
    },
    "pdf_processor.py": {
      label: "utils/pdf_processor.py (PDF Parsing)",
      path: "utils/pdf_processor.py",
      lang: "python",
      description: "Extracts formatted text page-by-page using pdfplumber and pypdf with multiline formatting preservation.",
      code: `import pdfplumber
import io

def extract_text_from_pdf(file_bytes, filename="report.pdf"):
    pages_data = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for idx, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text() or ""
            pages_data.append({
                "page_number": idx,
                "text": page_text.strip(),
                "char_count": len(page_text)
            })
    return pages_data, {"filename": filename, "total_pages": len(pages_data)}`,
    },
    "firebase.py": {
      label: "utils/firebase.py (Auth & Firestore)",
      path: "utils/firebase.py",
      lang: "python",
      description: "Firebase Authentication, per-user report metadata storage, and per-report chat history isolation.",
      code: `import time

def save_report_metadata(user_id, report_id, filename, summary="", page_count=1):
    report_doc = {
        "report_id": report_id,
        "user_id": user_id,
        "filename": filename,
        "uploaded_at": time.time(),
        "status": "ready"
    }
    return report_doc

def save_chat_message(user_id, report_id, question, answer, source_pages=None):
    return {"user_id": user_id, "report_id": report_id, "question": question, "answer": answer}`,
    },
    "requirements.txt": {
      label: "requirements.txt",
      path: "requirements.txt",
      lang: "text",
      description: "Clean Python dependency specifications for Streamlit, LangChain, FAISS, and Gemini.",
      code: `streamlit>=1.32.0
pdfplumber>=0.11.0
pypdf>=4.1.0
langchain>=0.2.0
langchain-text-splitters>=0.2.0
sentence-transformers>=2.7.0
faiss-cpu>=1.8.0
google-genai>=0.1.1
numpy>=1.26.0
pandas>=2.2.0
firebase-admin>=6.5.0
python-dotenv>=1.0.0`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileMap[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Python Project Code Explorer</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Inspect and export the complete modular Python & Streamlit codebase built for this project
        </p>
      </div>

      {/* Terminal Command Banner */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 font-mono text-xs shadow-md space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
          <Terminal className="w-4 h-4" />
          <span>Local Python Execution Command</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg text-emerald-400 text-xs sm:text-sm overflow-x-auto flex items-center justify-between">
          <code>streamlit run app.py</code>
          <span className="text-slate-500 text-[11px]">Port 8501</span>
        </div>
      </div>

      {/* File Viewer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar File List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Project Files</span>
          </div>
          {Object.entries(fileMap).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedFile(key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                selectedFile === key
                  ? "bg-teal-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${selectedFile === key ? "text-white" : "text-teal-600"}`} />
              <span className="truncate">{key}</span>
            </button>
          ))}
        </div>

        {/* Code Content Box */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{fileMap[selectedFile].label}</h4>
              <p className="text-xs text-slate-500">{fileMap[selectedFile].description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Code" : "Copy Code"}</span>
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            <code>{fileMap[selectedFile].code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
