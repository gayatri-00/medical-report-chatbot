"""
Reports & Summary Page
Manages uploaded reports, allows switching active RAG context, and displays structured clinical summaries.
"""

import streamlit as st
import pandas as pd
import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.firebase import get_user_reports, delete_user_report
from utils.rag_pipeline import switch_active_report, delete_report_rag, _REPORT_METADATA
from utils.gemini import generate_structured_report_summary

st.set_page_config(page_title="Reports & Summary - Medical Report Chatbot", page_icon="📄", layout="wide")

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
    }
    .summary-card {
        background: white;
        border: 1px solid #cce7e8;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.05);
        margin-bottom: 20px;
    }
    .section-pill {
        display: inline-block;
        background-color: #f0fdfa;
        color: #0f766e;
        border: 1px solid #99f6e4;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.82rem;
        margin-right: 6px;
        margin-bottom: 6px;
    }
</style>
""", unsafe_allow_html=True)

st.title("📄 Medical Reports & Clinical Summaries")
st.caption("Manage documents, select active RAG context, and review extracted clinical findings.")

user_id = st.session_state.user.get("user_id") if st.session_state.get("user") else "guest_session"
reports = get_user_reports(user_id)

if not reports:
    st.info("No reports found. Please upload a report from the **Upload Report** page.")
    if st.button("Go to Upload Page"):
        st.switch_page("pages/upload.py")
else:
    col_list, col_detail = st.columns([1, 2])

    with col_list:
        st.subheader("📚 Available Reports")
        for r in reports:
            rid = r["report_id"]
            is_active = (rid == st.session_state.get("active_report_id"))
            
            with st.container():
                st.markdown(f"""
                <div style="background:{'#f0fdfa' if is_active else 'white'}; border:1px solid {'#0d9488' if is_active else '#e2e8f0'}; border-radius:8px; padding:12px; margin-bottom:10px;">
                    <strong>{'🟢 ' if is_active else ''}{r.get('filename')}</strong><br>
                    <span style="font-size:0.8rem; color:#64748b;">Uploaded: {datetime.datetime.fromtimestamp(r.get('uploaded_at', 0)).strftime('%b %d, %H:%M')}</span>
                </div>
                """, unsafe_allow_html=True)

                c1, c2 = st.columns(2)
                with c1:
                    if st.button("Set Active", key=f"act_{rid}", disabled=is_active):
                        st.session_state.active_report_id = rid
                        st.session_state.active_report_name = r.get("filename")
                        switch_active_report(rid)
                        st.success(f"Switched active report to {r.get('filename')}!")
                        st.rerun()
                with c2:
                    if st.button("🗑️ Delete", key=f"del_{rid}"):
                        delete_user_report(user_id, rid)
                        delete_report_rag(rid)
                        if st.session_state.get("active_report_id") == rid:
                            st.session_state.active_report_id = None
                            st.session_state.active_report_name = None
                        st.warning("Report deleted.")
                        st.rerun()

    with col_detail:
        active_id = st.session_state.get("active_report_id")
        if not active_id or active_id not in _REPORT_METADATA:
            st.info("Select a report from the list on the left to inspect its summary.")
        else:
            rep_meta = _REPORT_METADATA[active_id]
            st.subheader(f"📋 Report Summary: {rep_meta.get('filename')}")

            st.markdown("""
            <div class="summary-card">
                <h4 style="color:#0f766e; margin-top:0;">🏥 Clinical Overview</h4>
            """, unsafe_allow_html=True)

            # Detected Sections
            st.markdown("**Detected Report Sections:**")
            sec_html = "".join([f"<span class='section-pill'>{sec}</span>" for sec in rep_meta.get("detected_sections", [])])
            st.markdown(sec_html, unsafe_allow_html=True)

            st.markdown(f"**Total Pages:** `{rep_meta.get('total_pages', 1)}` | **Indexed Chunks:** `{rep_meta.get('total_chunks', 0)}` | **Word Count:** `{rep_meta.get('word_count', 0)}`")

            # Document Text Preview
            st.markdown("---")
            st.markdown("#### 🔍 Document Content Preview (Exact Extracted Text)")
            st.text_area("Extracted Document Text", rep_meta.get("full_text", "")[:2500], height=300, disabled=True)

            st.markdown("</div>", unsafe_allow_html=True)

            if st.button("💬 Ask Questions About This Report", use_container_width=True):
                st.switch_page("pages/chat.py")
