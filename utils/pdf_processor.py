"""
PDF Processing Utility
Extracts clean text page-by-page from uploaded PDF medical reports using pdfplumber or pypdf.
"""

import io
from typing import List, Dict, Any, Tuple

def extract_text_from_pdf(file_bytes: bytes, filename: str = "report.pdf") -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Extracts text page by page from raw PDF bytes.
    
    Returns:
        Tuple of (pages_data, metadata)
        pages_data: List of dicts containing {'page_number': int, 'text': str, 'char_count': int}
        metadata: Summary metadata including page count, total characters, status
    """
    pages_data: List[Dict[str, Any]] = []
    total_text_length = 0
    extraction_errors = []

    # 1. Try extraction using pdfplumber (best for medical tables & formatted reports)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for idx, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text() or ""
                # Clean up repeated spaces while preserving lines
                cleaned_text = "\n".join([line.strip() for line in page_text.splitlines() if line.strip()])
                char_count = len(cleaned_text)
                total_text_length += char_count
                
                pages_data.append({
                    "page_number": idx,
                    "text": cleaned_text,
                    "char_count": char_count,
                    "is_empty": char_count == 0
                })
    except Exception as e1:
        extraction_errors.append(f"pdfplumber error: {str(e1)}")
        # 2. Fallback to pypdf / PyPDF2
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            pages_data = []
            total_text_length = 0
            for idx, page in enumerate(reader.pages, start=1):
                page_text = page.extract_text() or ""
                cleaned_text = "\n".join([line.strip() for line in page_text.splitlines() if line.strip()])
                char_count = len(cleaned_text)
                total_text_length += char_count
                
                pages_data.append({
                    "page_number": idx,
                    "text": cleaned_text,
                    "char_count": char_count,
                    "is_empty": char_count == 0
                })
        except Exception as e2:
            extraction_errors.append(f"pypdf error: {str(e2)}")

    # 3. Handle non-extractable / scanned / empty PDFs gracefully
    has_text = total_text_length > 30
    status_msg = "Successfully extracted readable text." if has_text else "Unable to extract readable text from this PDF."

    metadata = {
        "filename": filename,
        "total_pages": len(pages_data),
        "total_characters": total_text_length,
        "has_readable_text": has_text,
        "status_message": status_msg,
        "errors": extraction_errors
    }

    return pages_data, metadata


def extract_report_sections(full_text: str) -> Dict[str, Any]:
    """
    Scans extracted text for common medical report markers to generate a high-level summary.
    """
    sections_found = []
    text_lower = full_text.lower()

    common_sections = [
        ("Patient Demographics", ["patient name", "age", "gender", "dob", "mrn", "id:"]),
        ("Clinical History / Indication", ["clinical indication", "history", "chief complaint", "reason for exam"]),
        ("Hematology / Blood Counts", ["complete blood count", "cbc", "hemoglobin", "wbc", "platelet count"]),
        ("Metabolic & Renal Panel", ["comprehensive metabolic panel", "cmp", "glucose", "creatinine", "bun", "sodium", "potassium"]),
        ("Lipid Panel", ["lipid panel", "cholesterol", "triglycerides", "hdl", "ldl"]),
        ("Thyroid Panel", ["thyroid panel", "tsh", "free t4", "free t3"]),
        ("Radiology / Imaging Findings", ["technique", "findings", "impression", "lungs", "mediastinum", "impression:"]),
        ("Conclusions / Recommendations", ["impression", "conclusion", "recommendations", "follow-up"])
    ]

    for section_name, keywords in common_sections:
        if any(kw in text_lower for kw in keywords):
            sections_found.append(section_name)

    return {
        "detected_sections": sections_found or ["General Medical Report"],
        "word_count": len(full_text.split()),
        "preview_snippet": full_text[:400] + "..." if len(full_text) > 400 else full_text
    }
