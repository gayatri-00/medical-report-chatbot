"""
RAG Pipeline Utility
Integrates LangChain text splitting, Sentence Transformers embeddings, FAISS vector index,
and context retrieval for document-grounded question answering.
"""

from typing import List, Dict, Any, Optional, Tuple
from utils.pdf_processor import extract_text_from_pdf, extract_report_sections
from utils.embeddings import compute_embeddings, FAISSVectorStore
from utils.gemini import generate_rag_answer, generate_structured_report_summary

# In-memory registry of active report vector stores: {report_id: FAISSVectorStore}
_REPORT_STORES: Dict[str, FAISSVectorStore] = {}
_REPORT_METADATA: Dict[str, Dict[str, Any]] = {}

def split_text_into_chunks(pages_data: List[Dict[str, Any]], chunk_size: int = 500, chunk_overlap: int = 100) -> List[Dict[str, Any]]:
    """
    Splits multi-page text into chunks with metadata using LangChain RecursiveCharacterTextSplitter.
    Preserves source page numbers in chunk metadata.
    """
    chunks: List[Dict[str, Any]] = []
    
    try:
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "; ", ", ", " "]
        )
    except Exception:
        # Fallback manual splitter if LangChain not yet installed
        class SimpleSplitter:
            def __init__(self, c_size, c_overlap):
                self.c_size = c_size
                self.c_overlap = c_overlap
            def split_text(self, text):
                res = []
                start = 0
                while start < len(text):
                    end = start + self.c_size
                    res.append(text[start:end])
                    start += (self.c_size - self.c_overlap)
                return res
        splitter = SimpleSplitter(chunk_size, chunk_overlap)

    chunk_global_id = 0
    for page in pages_data:
        page_num = page.get("page_number", 1)
        page_text = page.get("text", "").strip()
        if not page_text:
            continue
        
        split_segments = splitter.split_text(page_text)
        for segment in split_segments:
            if len(segment.strip()) > 10:
                chunks.append({
                    "chunk_id": chunk_global_id,
                    "page_number": page_num,
                    "text": segment.strip(),
                    "char_count": len(segment.strip())
                })
                chunk_global_id += 1

    return chunks


def process_medical_report_rag(
    file_bytes: bytes,
    filename: str,
    report_id: str,
    status_callback = None
) -> Tuple[bool, Dict[str, Any]]:
    """
    Complete end-to-end RAG ingestion pipeline:
    1. PDF Uploaded & Validated
    2. Text Extracted page-by-page
    3. Text Chunked (LangChain)
    4. Sentence Transformer Embeddings Generated
    5. FAISS Vector Database Created & Stored
    6. Report ready for questions

    Returns:
        (success_bool, report_details_dict)
    """
    try:
        if status_callback:
            status_callback("1. PDF uploaded & validating...", 0.15)

        # 1. Extract Text
        pages_data, pdf_meta = extract_text_from_pdf(file_bytes, filename)
        if not pdf_meta.get("has_readable_text"):
            return False, {
                "error": "Unable to extract readable text from this PDF. It may be an image-only scan or empty document.",
                "metadata": pdf_meta
            }

        if status_callback:
            status_callback(f"2. Text extracted ({pdf_meta['total_pages']} pages, {pdf_meta['total_characters']} chars)", 0.35)

        # 2. Chunk text
        chunks = split_text_into_chunks(pages_data, chunk_size=450, chunk_overlap=80)
        if status_callback:
            status_callback(f"3. Text chunked into {len(chunks)} contextual chunks", 0.55)

        # 3. Generate embeddings
        chunk_texts = [c["text"] for c in chunks]
        embeddings = compute_embeddings(chunk_texts)
        if status_callback:
            status_callback("4. Sentence Transformer embeddings generated (dim: 384)", 0.75)

        # 4. Create FAISS Vector Store
        vector_store = FAISSVectorStore(embedding_dimension=embeddings.shape[1] if len(embeddings) > 0 else 384)
        vector_store.add_documents(chunks, embeddings)
        
        # Save vector store in memory registry
        _REPORT_STORES[report_id] = vector_store

        # 5. Extract structural summary
        full_text = "\n\n".join([p["text"] for p in pages_data if p["text"]])
        section_info = extract_report_sections(full_text)

        report_summary = {
            "report_id": report_id,
            "filename": filename,
            "total_pages": pdf_meta["total_pages"],
            "total_chunks": len(chunks),
            "detected_sections": section_info["detected_sections"],
            "word_count": section_info["word_count"],
            "full_text": full_text,
            "pages_data": pages_data,
            "status": "READY"
        }
        
        _REPORT_METADATA[report_id] = report_summary

        if status_callback:
            status_callback("5. Vector database created & indexed in FAISS", 0.90)
            status_callback("6. Report ready for questions!", 1.0)

        return True, report_summary

    except Exception as e:
        return False, {"error": f"RAG Pipeline error: {str(e)}"}


def switch_active_report(report_id: str) -> bool:
    """
    Switches active RAG context so subsequent questions are strictly answered from the new report.
    """
    return report_id in _REPORT_STORES


def ask_question_rag(question: str, report_id: str) -> Dict[str, Any]:
    """
    Answers user question using RAG:
    1. Embed query
    2. Search FAISS index for top-k chunks
    3. Generate grounded answer via Gemini API
    """
    if not question or not question.strip():
        return {
            "answer": "Please enter a valid question about the medical report.",
            "source_pages": [],
            "citations": []
        }

    vector_store = _REPORT_STORES.get(report_id)
    metadata = _REPORT_METADATA.get(report_id, {})
    report_name = metadata.get("filename", "Medical Report")

    if not vector_store or len(vector_store.chunks_metadata) == 0:
        return {
            "answer": "No active report selected or the selected report vector index is empty. Please select or upload a report first.",
            "source_pages": [],
            "citations": []
        }

    # 1. Compute query embedding
    query_emb = compute_embeddings([question.strip()])[0]

    # 2. Similarity search in FAISS
    retrieved_matches = vector_store.similarity_search(query_emb, top_k=4)
    retrieved_chunks = [match[0] for match in retrieved_matches]

    # 3. Generate answer via Gemini API
    result = generate_rag_answer(
        question=question.strip(),
        retrieved_chunks=retrieved_chunks,
        report_name=report_name
    )

    result["retrieved_chunks"] = retrieved_chunks
    result["report_id"] = report_id
    result["report_name"] = report_name

    return result


def delete_report_rag(report_id: str):
    """Removes report and vector store from memory."""
    if report_id in _REPORT_STORES:
        del _REPORT_STORES[report_id]
    if report_id in _REPORT_METADATA:
        del _REPORT_METADATA[report_id]
