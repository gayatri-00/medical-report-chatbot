"""
Chat Page
Main conversation interface for asking questions about the active medical report using RAG.
"""

import streamlit as st
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.rag_pipeline import ask_question_rag
from utils.firebase import save_chat_message, get_report_chat_history

st.set_page_config(page_title="Chat - Medical Report Chatbot", page_icon="💬", layout="wide")

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
    }
    .report-banner {
        background: white;
        border: 1px solid #99f6e4;
        border-radius: 10px;
        padding: 12px 18px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 6px rgba(13, 148, 136, 0.06);
    }
    .citation-tag {
        display: inline-block;
        background-color: #e0f2fe;
        color: #0369a1;
        font-weight: 600;
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid #bae6fd;
        margin-right: 4px;
        margin-top: 6px;
    }
    .safety-notice {
        font-size: 0.8rem;
        color: #64748b;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        padding: 8px 12px;
        margin-top: 10px;
    }
</style>
""", unsafe_allow_html=True)

st.title("💬 Medical Report Chatbot")

user_id = st.session_state.user.get("user_id") if st.session_state.get("user") else "guest_session"
active_report_id = st.session_state.get("active_report_id")
active_report_name = st.session_state.get("active_report_name")

if not active_report_id or not active_report_name:
    st.warning("⚠️ **No active medical report selected.**")
    st.write("Please upload a report or select an existing document from the Dashboard.")
    c1, c2 = st.columns(2)
    with c1:
        if st.button("Upload New Report"):
            st.switch_page("pages/upload.py")
    with c2:
        if st.button("Go to Dashboard"):
            st.switch_page("pages/dashboard.py")
    st.stop()

# Display Current Report Banner
st.markdown(f"""
<div class="report-banner">
    <div>
        <span style="font-size:0.85rem; color:#64748b; text-transform:uppercase; font-weight:600;">Current Active Report:</span><br>
        <span style="font-size:1.15rem; font-weight:700; color:#0f766e;">📄 {active_report_name}</span>
    </div>
    <span style="background:#ccfbf1; color:#0f766e; font-weight:600; font-size:0.8rem; padding:4px 10px; border-radius:20px;">
        RAG Vector Index Active
    </span>
</div>
""", unsafe_allow_html=True)

# Load chat history for active report
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []

# Suggested Questions Prompts
st.markdown("##### 💡 Suggested Questions")
prompt_cols = st.columns(4)
suggested_prompts = [
    "What is this report about?",
    "What are the main findings?",
    "What abnormal values are mentioned?",
    "Explain this report in simple words.",
]

selected_prompt = None
for idx, prompt in enumerate(suggested_prompts):
    with prompt_cols[idx]:
        if st.button(prompt, key=f"sugg_{idx}", use_container_width=True):
            selected_prompt = prompt

# Display conversation messages
for msg in st.session_state.chat_messages:
    if msg["role"] == "user":
        with st.chat_message("user"):
            st.markdown(msg["content"])
    else:
        with st.chat_message("assistant", avatar="🩺"):
            st.markdown(msg["content"])
            if msg.get("source_pages"):
                citations_html = "".join([f"<span class='citation-tag'>Source: Page {p}</span>" for p in msg["source_pages"]])
                st.markdown(f"<div style='margin-top:4px;'>{citations_html}</div>", unsafe_allow_html=True)

# Chat Input Box
user_input = st.chat_input("Ask any question strictly about this medical report...")
if selected_prompt:
    user_input = selected_prompt

if user_input:
    # 1. Append User Message
    st.session_state.chat_messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    # 2. Run RAG Pipeline
    with st.chat_message("assistant", avatar="🩺"):
        with st.spinner("Searching document chunks and consulting Gemini..."):
            rag_res = ask_question_rag(user_input, active_report_id)
            answer_text = rag_res.get("answer", "I couldn't find that information in the uploaded report.")
            source_pages = rag_res.get("source_pages", [])
            
            st.markdown(answer_text)
            if source_pages:
                citations_html = "".join([f"<span class='citation-tag'>Source: Page {p}</span>" for p in source_pages])
                st.markdown(f"<div style='margin-top:4px;'>{citations_html}</div>", unsafe_allow_html=True)

    # 3. Store in State and Firebase
    st.session_state.chat_messages.append({
        "role": "assistant",
        "content": answer_text,
        "source_pages": source_pages
    })
    
    save_chat_message(
        user_id=user_id,
        report_id=active_report_id,
        question=user_input,
        answer=answer_text,
        source_pages=source_pages
    )

st.markdown("""
<div class="safety-notice">
    <strong>Educational Notice:</strong> Answers are derived exclusively from the uploaded document. The assistant does not prescribe drugs or offer standalone diagnostic decisions.
</div>
""", unsafe_allow_html=True)
