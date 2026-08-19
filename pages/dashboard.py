"""
Dashboard Page
Displays key metrics, uploaded reports table, active RAG document, and quick action buttons.
"""

import streamlit as st
import pandas as pd
import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.firebase import get_user_reports, delete_user_report
from utils.rag_pipeline import switch_active_report, _REPORT_METADATA

st.set_page_config(page_title="Dashboard - Medical Report Chatbot", page_icon="📊", layout="wide")

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
    }
    .metric-card {
        background: white;
        border: 1px solid #d1e8e8;
        border-radius: 12px;
        padding: 18px 20px;
        box-shadow: 0 2px 8px rgba(13, 148, 136, 0.05);
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #0f766e;
        margin-top: 4px;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
""", unsafe_allow_html=True)

st.title("📊 Medical Reports Dashboard")
st.caption("Overview of processed medical reports, vector indexes, and chat sessions.")

user_id = st.session_state.user.get("user_id") if st.session_state.get("user") else "guest_session"
reports = get_user_reports(user_id)

# Metrics Row
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-label">Total Reports</div>
        <div class="metric-value">{len(reports)}</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    active_name = st.session_state.get("active_report_name") or "None Selected"
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-label">Current Active Report</div>
        <div class="metric-value" style="font-size:1.1rem; color:#0284c7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            {active_name}
        </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    last_upload = "No uploads yet"
    if reports:
        last_time = reports[-1].get("uploaded_at", 0)
        last_upload = datetime.datetime.fromtimestamp(last_time).strftime("%b %d, %H:%M")
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-label">Last Upload</div>
        <div class="metric-value" style="font-size:1.1rem; color:#334155;">
            {last_upload}
        </div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    total_chats = len(st.session_state.get("chat_history", []))
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-label">Chat Interactions</div>
        <div class="metric-value">{total_chats}</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# Quick Actions
st.subheader("⚡ Quick Actions")
qa_col1, qa_col2, qa_col3 = st.columns(3)
with qa_col1:
    if st.button("📤 Upload New Medical PDF", use_container_width=True):
        st.switch_page("pages/upload.py")
with qa_col2:
    if st.button("💬 Open Medical Chatbot", use_container_width=True):
        st.switch_page("pages/chat.py")
with qa_col3:
    if st.button("📄 View All Reports & Summaries", use_container_width=True):
        st.switch_page("pages/reports.py")

st.markdown("---")

# Tabular Reports Overview using Pandas
st.subheader("📋 Uploaded Medical Documents")
if reports:
    df_data = []
    for r in reports:
        upload_time_str = datetime.datetime.fromtimestamp(r.get("uploaded_at", 0)).strftime("%Y-%m-%d %H:%M")
        is_active = "🟢 Active" if r.get("report_id") == st.session_state.get("active_report_id") else "⚪ Inactive"
        df_data.append({
            "Status": is_active,
            "Document Name": r.get("filename"),
            "Uploaded At": upload_time_str,
            "Pages": r.get("page_count", 1),
            "Processing State": r.get("status", "ready").upper(),
            "Report ID": r.get("report_id")
        })
    
    df = pd.DataFrame(df_data)
    st.dataframe(df[["Status", "Document Name", "Uploaded At", "Pages", "Processing State"]], use_container_width=True)

    # Report Selection & Switcher
    st.markdown("#### 🔄 Switch Active Report Context")
    selected_rep = st.selectbox(
        "Select a report to make active for Chat & RAG:",
        options=[r["report_id"] for r in reports],
        format_func=lambda rid: next((r["filename"] for r in reports if r["report_id"] == rid), rid)
    )
    if st.button("Set as Active Report"):
        st.session_state.active_report_id = selected_rep
        st.session_state.active_report_name = next((r["filename"] for r in reports if r["report_id"] == selected_rep), selected_rep)
        switch_active_report(selected_rep)
        st.success(f"Switched active RAG context to **{st.session_state.active_report_name}**!")
        st.rerun()
else:
    st.info("No medical reports uploaded yet. Click **'Upload New Medical PDF'** to begin.")
