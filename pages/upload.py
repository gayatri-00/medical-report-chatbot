"""
Upload Report Page
Uploads, validates, chunks, embeds, and indexes medical reports into FAISS vector database.
"""

import streamlit as st
import time
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.rag_pipeline import process_medical_report_rag
from utils.firebase import save_report_metadata

st.set_page_config(page_title="Upload Report - Medical Report Chatbot", page_icon="📤", layout="wide")

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
    }
    .status-step {
        background: white;
        border-left: 4px solid #0d9488;
        padding: 10px 16px;
        margin-bottom: 8px;
        border-radius: 4px;
        font-size: 0.95rem;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
</style>
""", unsafe_allow_html=True)

st.title("📤 Upload Medical Report")
st.caption("Upload clinical laboratory results, pathology panels, or radiology reports (PDF format).")

user_id = st.session_state.user.get("user_id") if st.session_state.get("user") else "guest_session"

tab_upload, tab_sample = st.tabs(["📁 Upload Your PDF", "🧪 Use Preloaded Sample Medical Reports"])

with tab_upload:
    uploaded_file = st.file_uploader(
        "Choose a medical report PDF",
        type=["pdf"],
        help="Only genuine PDF files containing text or digital reports are supported."
    )

    if uploaded_file is not None:
        file_bytes = uploaded_file.read()
        file_size_kb = len(file_bytes) / 1024.0
        
        st.markdown(f"**Filename:** `{uploaded_file.name}` | **File Size:** `{file_size_kb:.1f} KB`")

        if st.button("🚀 Process & Index Report with RAG", key="process_uploaded_btn"):
            progress_bar = st.progress(0.0)
            status_container = st.container()

            def update_status(message: str, progress_val: float):
                progress_bar.progress(progress_val)
                with status_container:
                    st.markdown(f"<div class='status-step'>✓ {message}</div>", unsafe_allow_html=True)
                time.sleep(0.3)

            report_id = "rep_" + str(uuid.uuid4())[:8]
            success, result = process_medical_report_rag(
                file_bytes=file_bytes,
                filename=uploaded_file.name,
                report_id=report_id,
                status_callback=update_status
            )

            if success:
                st.session_state.active_report_id = report_id
                st.session_state.active_report_name = uploaded_file.name
                
                # Save metadata
                save_report_metadata(
                    user_id=user_id,
                    report_id=report_id,
                    filename=uploaded_file.name,
                    summary=f"Detected {len(result.get('detected_sections', []))} clinical sections.",
                    page_count=result.get("total_pages", 1)
                )

                st.success("🎉 **Report successfully processed and ready for questions!**")
                st.balloons()

                col_sum, col_chat = st.columns(2)
                with col_sum:
                    if st.button("📊 View Report Summary"):
                        st.switch_page("pages/reports.py")
                with col_chat:
                    if st.button("💬 Start Chatting with this Report"):
                        st.switch_page("pages/chat.py")
            else:
                st.error(f"Processing failed: {result.get('error', 'Unknown extraction error')}")

with tab_sample:
    st.markdown("#### 🧪 Select a Realistic Clinical Sample for Instant Testing")
    st.write("Ideal for testing the RAG pipeline without needing to locate a personal medical PDF.")
    
    samples = [
        {
            "id": "sample_cbc",
            "name": "Complete_Blood_Count_&_Lipid_Panel.pdf",
            "file": "data/sample_blood_report.txt",
            "desc": "Eleanor Vance (Age 52) - Anemia, high cholesterol, borderline blood glucose."
        },
        {
            "id": "sample_rad",
            "name": "Thoracic_CT_Radiology_Report.pdf",
            "file": "data/sample_radiology_report.txt",
            "desc": "Robert Chen (Age 56) - 3.2mm solitary pulmonary nodule, bronchial thickening."
        },
        {
            "id": "sample_met",
            "name": "Metabolic_&_Thyroid_Panel.pdf",
            "file": "data/sample_metabolic_report.txt",
            "desc": "James Henderson (Age 47) - Subclinical hypothyroidism (TSH 5.85), normal renal/liver function."
        }
    ]

    for s in samples:
        col_info, col_act = st.columns([3, 1])
        with col_info:
            st.markdown(f"**📄 {s['name']}**")
            st.caption(s['desc'])
        with col_act:
            if st.button(f"Load & Process", key=f"btn_{s['id']}"):
                progress_bar = st.progress(0.0)
                status_container = st.container()

                def update_status(message: str, progress_val: float):
                    progress_bar.progress(progress_val)
                    with status_container:
                        st.markdown(f"<div class='status-step'>✓ {message}</div>", unsafe_allow_html=True)
                    time.sleep(0.2)

                # Read sample text as bytes
                sample_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), s['file'])
                if os.path.exists(sample_path):
                    with open(sample_path, "rb") as f:
                        file_bytes = f.read()
                else:
                    file_bytes = b"SAMPLE MEDICAL REPORT\nPatient Name: Demo\nHemoglobin: 11.2 g/dL (LOW)\nCholesterol: 238 mg/dL (HIGH)"

                report_id = s['id']
                success, result = process_medical_report_rag(
                    file_bytes=file_bytes,
                    filename=s['name'],
                    report_id=report_id,
                    status_callback=update_status
                )

                if success:
                    st.session_state.active_report_id = report_id
                    st.session_state.active_report_name = s['name']
                    save_report_metadata(
                        user_id=user_id,
                        report_id=report_id,
                        filename=s['name'],
                        summary=s['desc'],
                        page_count=1
                    )
                    st.success(f"Loaded **{s['name']}**! Switched active RAG context.")
                    st.rerun()
