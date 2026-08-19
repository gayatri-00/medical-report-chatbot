"""
Medical Report Chatbot - Main Application Entry Point
Streamlit multi-page setup with medical styling, RAG state management, and user sessions.
"""

import streamlit as st
import os
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.firebase import login_user, sign_up_user
from utils.rag_pipeline import switch_active_report

# Configure Streamlit page
st.set_page_config(
    page_title="Medical Report Chatbot",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Classic Clean Medical Theme CSS (White / Light-Blue / Soft Teal Gradient)
MEDICAL_THEME_CSS = """
<style>
    /* Main Background & Gradient */
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
    }
    
    /* Medical Header Cards */
    .med-header-card {
        background-color: #ffffff;
        border: 1px solid #cce7e8;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(13, 148, 136, 0.06);
        margin-bottom: 20px;
    }
    
    /* Disclaimer Banner */
    .med-disclaimer {
        background-color: #f0fdfa;
        border-left: 4px solid #0d9488;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 0.88rem;
        color: #134e4a;
        margin-bottom: 20px;
    }
    
    /* Status Badge */
    .med-badge {
        display: inline-block;
        padding: 4px 10px;
        background-color: #ccfbf1;
        color: #0f766e;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 600;
    }
    
    /* Source Page Citation Chip */
    .source-citation {
        display: inline-block;
        background-color: #e0f2fe;
        color: #0369a1;
        font-weight: 600;
        font-size: 0.78rem;
        padding: 3px 8px;
        border-radius: 6px;
        border: 1px solid #bae6fd;
        margin-right: 6px;
    }
    
    /* Primary Buttons */
    .stButton>button {
        background: linear-gradient(to right, #0d9488, #0284c7);
        color: white !important;
        border: none;
        border-radius: 8px;
        padding: 8px 20px;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    .stButton>button:hover {
        background: linear-gradient(to right, #0f766e, #0369a1);
        box-shadow: 0 4px 8px rgba(13, 148, 136, 0.2);
    }
</style>
"""
st.markdown(MEDICAL_THEME_CSS, unsafe_allow_html=True)

# Initialize Session State
if "user" not in st.session_state:
    st.session_state.user = None  # {'user_id': str, 'email': str}
if "active_report_id" not in st.session_state:
    st.session_state.active_report_id = None
if "active_report_name" not in st.session_state:
    st.session_state.active_report_name = None
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

def render_sidebar():
    with st.sidebar:
        st.markdown("### 🩺 Medical Report Chatbot")
        st.caption("AI-powered medical report understanding using RAG")
        st.markdown("---")

        # Active User Info
        if st.session_state.user:
            st.markdown(f"**Logged in as:** `{st.session_state.user.get('email', 'User')}`")
            if st.button("🚪 Logout", key="sidebar_logout_btn"):
                st.session_state.user = None
                st.session_state.active_report_id = None
                st.session_state.active_report_name = None
                st.session_state.chat_history = []
                st.rerun()
        else:
            st.info("💡 You are browsing as a Guest. Sign in to save your reports permanently.")

        st.markdown("---")
        st.markdown("#### 📄 Active Medical Report")
        if st.session_state.active_report_name:
            st.markdown(f"<span class='med-badge'>✓ Active</span>", unsafe_allow_html=True)
            st.write(f"**{st.session_state.active_report_name}**")
        else:
            st.caption("No report selected. Please upload or choose a report from Dashboard.")

        st.markdown("---")
        st.markdown("""
        <div style="font-size:0.78rem; color:#64748b; line-height:1.4;">
            <strong>Medical Safety Disclaimer:</strong><br>
            This application provides educational information based strictly on uploaded reports. It does not replace professional medical advice.
        </div>
        """, unsafe_allow_html=True)


def render_home_page():
    st.markdown("""
    <div class="med-header-card">
        <h1 style="color:#0f766e; margin-bottom:4px; font-size: 2.2rem;">Medical Report Chatbot</h1>
        <h3 style="color:#0284c7; font-weight:400; margin-top:0; font-size: 1.2rem;">
            AI-powered medical report understanding using RAG
        </h3>
        <p style="color:#475569; font-size:1.05rem; margin-top:12px; line-height:1.6;">
            Understand complex laboratory results, diagnostic scans, and clinical observations.
            The chatbot reads your uploaded medical reports, creates high-dimensional vector embeddings,
            and answers your questions in natural language grounded <strong>strictly and exclusively in your document</strong>.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Medical Disclaimer Banner
    st.markdown("""
    <div class="med-disclaimer">
        🩺 <strong>Medical Disclaimer:</strong> This application provides educational information based on the uploaded report and is not a replacement for professional medical advice. Always consult a qualified physician for clinical diagnosis and treatment plans.
    </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("### 📤 1. Upload Report")
        st.write("Upload blood work, radiology findings, or clinical summaries in PDF format.")
    with col2:
        st.markdown("### 🧠 2. RAG Processing")
        st.write("Extracts text page-by-page, generates Sentence Transformers embeddings, and indexes with FAISS.")
    with col3:
        st.markdown("### 💬 3. Ask Questions")
        st.write("Ask natural questions and receive precise answers with verified page citations.")

    st.markdown("---")
    st.subheader("🧬 How Retrieval-Augmented Generation (RAG) Works")
    st.markdown("""
    ```
    Uploaded PDF → Text Extraction → Cleaning & Chunking → Sentence Transformers (all-MiniLM-L6-v2) 
    → FAISS Vector Store → Top-K Semantic Similarity Search → Retrieved Chunks → Gemini API → Grounded Answer + Source Page Citation
    ```
    """)


def main():
    render_sidebar()
    render_home_page()

if __name__ == "__main__":
    main()
