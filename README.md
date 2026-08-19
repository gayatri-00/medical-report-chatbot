# 🩺 Medical Report Chatbot

> **AI-powered medical report understanding using Retrieval-Augmented Generation (RAG)**
>
> *Disclaimer: This application provides educational information based strictly on uploaded reports and is not a replacement for professional medical advice.*

---

## 1. Project Overview

The **Medical Report Chatbot** is a production-ready application designed to help patients and healthcare students comprehend complex laboratory panels, clinical biochemistry reports, and diagnostic radiology notes. 

By leveraging **Retrieval-Augmented Generation (RAG)**, the chatbot extracts text page-by-page from PDF documents, generates semantic embeddings, indexes chunks into a vector database, and answers user inquiries in natural language **grounded exclusively in the uploaded report**.

---

## 2. Key Features

- 📤 **Intelligent PDF Ingestion**: Robust text extraction using `pdfplumber` and `pypdf` with multiline formatting and table preservation.
- ✂️ **Context-Preserving Chunking**: LangChain `RecursiveCharacterTextSplitter` with chunk overlap and exact page-number metadata tracking.
- 🧬 **Sentence Transformers Embeddings**: High-performance semantic vector generation using `all-MiniLM-L6-v2`.
- ⚡ **FAISS Vector Search**: Fast inner-product/cosine similarity retrieval for relevant context snippets.
- 🤖 **Gemini AI Grounding**: Strict medical prompt guardrails ensuring the AI only answers from document facts (no hallucinations, no medication prescriptions).
- 📌 **Verified Source Citations**: Every response includes `Source: Page X` badges to allow verification.
- 📊 **Clinical Dashboard**: Real-time KPI cards, reports table with Pandas, and multi-report switching.
- 🔐 **Firebase Authentication & Firestore**: Secure user sign-up/login and user-isolated report and chat storage.
- 🧪 **Preloaded Clinical Samples**: Immediate testing with Blood CBC & Lipid Panels, Chest CT scans, and Metabolic/Thyroid panels.

---

## 3. Technologies & Libraries Used

| Component | Technology |
|---|---|
| **Language** | Python 3.10+ |
| **Frontend UI** | Streamlit |
| **PDF Extraction** | pdfplumber & pypdf |
| **RAG Framework** | LangChain (`langchain-text-splitters`) |
| **Embeddings** | Sentence Transformers (`all-MiniLM-L6-v2`) |
| **Vector Store** | FAISS (`faiss-cpu`) |
| **Language Model** | Google Gemini API (`gemini-3.7-flash` / `gemini-1.5-flash`) |
| **Data Processing** | NumPy & Pandas |
| **Authentication & Database** | Google Firebase (Auth & Firestore) |

---

## 4. Architecture & RAG Workflow

```
[ Uploaded PDF Medical Report ]
             │
             ▼
[ PDF Text Extraction (pdfplumber / pypdf) ]
             │
             ▼
[ Text Cleaning & Document Segmentation ]
             │
             ▼
[ LangChain Recursive Character Text Splitter ] (Chunk Size: 450, Overlap: 80)
             │
             ▼
[ Sentence Transformer Embeddings ] (all-MiniLM-L6-v2, 384 dimensions)
             │
             ▼
[ FAISS Vector Database Index ]
             │
             ▼
[ User Asks Question ] ──▶ [ Query Vectorization ]
                                 │
                                 ▼
                     [ FAISS Top-K Similarity Search ]
                                 │
                                 ▼
                     [ Top Relevant Chunks + Page Metadata ]
                                 │
                                 ▼
                 [ Gemini API Medical Grounding Prompt ]
                                 │
                                 ▼
         [ Final Answer + Source Page Citations (e.g. Page 1, 2) ]
```

---

## 5. Directory Structure

```
medical-report-chatbot/
│
├── app.py                     # Main Streamlit application & navigation
├── requirements.txt           # Python dependency specifications
├── README.md                  # Complete documentation and setup guide
├── .env.example               # Environment variables template
├── .gitignore                 # Protected secret and build rules
│
├── pages/
│   ├── login.py               # Firebase / local user login
│   ├── signup.py              # User registration with user isolation
│   ├── dashboard.py           # Metrics, active report summary, and tables
│   ├── upload.py              # PDF upload, 6-step RAG progress, sample data
│   ├── reports.py             # Multiple report manager and clinical summaries
│   └── chat.py                # Grounded medical chatbot with page citations
│
├── utils/
│   ├── pdf_processor.py       # PDF text extraction & section parser
│   ├── embeddings.py          # Sentence Transformers & FAISS vector store
│   ├── rag_pipeline.py        # End-to-end RAG workflow & context switcher
│   ├── firebase.py            # Firebase Auth & Firestore persistence
│   └── gemini.py              # Google Gemini API client & safety guardrails
│
└── data/
    ├── sample_blood_report.txt     # Sample Complete Blood Count & Lipid Panel
    ├── sample_radiology_report.txt # Sample Thoracic CT Radiology Scan
    └── sample_metabolic_report.txt # Sample Metabolic & Thyroid Panel
```

---

## 6. Step-by-Step Installation & Setup

### Prerequisites
- Python 3.10 or higher
- Git installed on your system

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/medical-report-chatbot.git
cd medical-report-chatbot
```

### Step 2: Create a Virtual Environment
```bash
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 7. Configuring the Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/) and click **Get API key**.
2. Create a new key and copy the value.
3. Duplicate `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and configure your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
*(Streamlit secrets in `.streamlit/secrets.toml` are also automatically supported!)*

---

## 8. Google Firebase Setup (Optional)

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (e.g., `medical-report-chatbot`).
3. Enable **Authentication** -> **Sign-in method** -> **Email/Password**.
4. Enable **Firestore Database** in production mode.
5. Apply the following Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /reports/{reportId} {
         allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
       }
       match /chat_history/{chatId} {
         allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
       }
     }
   }
   ```
6. Download your Firebase Admin credentials JSON and place it as `firebase-credentials.json` (it is already in `.gitignore`).

---

## 9. Running the Application

Launch the Streamlit app with:

```bash
streamlit run app.py
```

The application will open in your browser at `http://localhost:8501`.

---

## 10. Publishing to GitHub

To push your project to GitHub:

```bash
# 1. Initialize git repository
git init

# 2. Add files
git add .

# 3. Commit changes
git commit -m "Initial commit: Complete Medical Report Chatbot with RAG & Gemini"

# 4. Set main branch
git branch -M main

# 5. Link remote repository
git remote add origin https://github.com/your-username/medical-report-chatbot.git

# 6. Push code
git push -u origin main
```

*(Note: `.gitignore` automatically prevents your `.env` and `firebase-credentials.json` from being pushed).*

---

## 11. Troubleshooting

- **Missing Gemini API Key**: Ensure `GEMINI_API_KEY` is set in your `.env` file or environment variables.
- **Empty PDF Text**: Some scanned PDFs contain scanned images without OCR text layers. Use digital text PDFs or the preloaded sample reports.
- **FAISS Installation on Windows**: Use `pip install faiss-cpu` (already specified in `requirements.txt`).
