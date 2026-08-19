"""
Sign Up Page
Registers a new user in Firebase Auth / database with unique user isolation.
"""

import streamlit as st
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.firebase import sign_up_user

st.set_page_config(page_title="Sign Up - Medical Report Chatbot", page_icon="📝")

st.markdown("""
<style>
    .stApp {
        background: linear-gradient(135deg, #ffffff 0%, #f0f7fa 50%, #e6f4f2 100%);
    }
</style>
""", unsafe_allow_html=True)

st.title("📝 Create Account")
st.caption("Sign up for secure, private access to your medical reports.")

with st.form("signup_form"):
    email = st.text_input("Email Address", placeholder="your.name@example.com")
    password = st.text_input("Password (min 6 characters)", type="password")
    confirm_password = st.text_input("Confirm Password", type="password")
    submitted = st.form_submit_button("Create Account")

    if submitted:
        if not email or not password:
            st.error("All fields are required.")
        elif password != confirm_password:
            st.error("Passwords do not match. Please re-enter.")
        elif len(password) < 6:
            st.error("Password must be at least 6 characters.")
        else:
            res = sign_up_user(email, password)
            if res.get("success"):
                st.session_state.user = {
                    "user_id": res["user_id"],
                    "email": res["email"]
                }
                st.success("Account created successfully! You are now logged in.")
                st.rerun()
            else:
                st.error(res.get("error", "Sign up failed."))
