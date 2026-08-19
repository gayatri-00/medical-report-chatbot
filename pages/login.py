"""
Login Page
Authenticates users via Firebase Auth or local fallback store.
"""

import streamlit as st
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.firebase import login_user

st.set_page_config(page_title="Login - Medical Report Chatbot", page_icon="🔐")

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
    }
</style>
""", unsafe_allow_html=True)

st.title("🔐 User Login")
st.caption("Sign in to access your personal medical reports and chat history.")

if "user" in st.session_state and st.session_state.user:
    st.success(f"You are currently logged in as `{st.session_state.user.get('email')}`.")
    if st.button("Log Out"):
        st.session_state.user = None
        st.rerun()
else:
    with st.form("login_form"):
        email = st.text_input("Email Address", placeholder="doctor@hospital.org or patient@email.com")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Sign In")

        if submitted:
            if not email or not password:
                st.error("Please provide both email and password.")
            else:
                res = login_user(email, password)
                if res.get("success"):
                    st.session_state.user = {
                        "user_id": res["user_id"],
                        "email": res["email"]
                    }
                    st.success("Login successful! Redirecting to dashboard...")
                    st.rerun()
                else:
                    st.error(res.get("error", "Login failed."))

    st.markdown("---")
    st.markdown("#### 🚀 Quick Demo Login")
    if st.button("Use Demo Account (demo@hospital.org)"):
        st.session_state.user = {
            "user_id": "demo_user",
            "email": "demo@hospital.org"
        }
        st.success("Logged in as Demo User!")
        st.rerun()
