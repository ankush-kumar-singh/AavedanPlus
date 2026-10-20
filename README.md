# Aavedan+ — AI-Powered Government Service Assistant

A local prototype that guides citizens through government service applications using a real AI agent (Ollama + Qwen3). Includes document upload, form review, consent flow, mock government portal, and an admin panel.

**IMPORTANT:** This is a local prototype for learning and demonstration. NOT connected to any real government service. Do not upload real sensitive documents.

---

## 1. What This Project Does

Aavedan+ helps citizens apply for government services (Income Certificate, Caste Certificate, etc.) through a conversational AI flow.

What it does:
- Understands which service user needs (using LLM)
- Tells user which documents are required
- Accepts PDF uploads (up to 10 MB)
- Extracts text from PDFs using pypdf
- Extracts form fields using Qwen3 LLM
- Auto-fills application form
- Waits for user consent
- Submits to a mock government portal
- Tracks application status
- Provides audit log
- Admin panel for officers to approve/reject

Supported services (6):
1. Income Certificate
2. Caste Certificate
3. Residence Certificate
4. EWS Certificate
5. Birth Certificate
6. Scholarship Application

---

## 2. Architecture

Three main parts:

1. **Frontend (React + Vite)** — port 5173
   - User UI + Admin panel
   - Pages: Home, Services, AI Chat, Documents, Review, Consent, Portal, Status, Audit, Admin

2. **Backend (FastAPI + Python)** — port 8000
   - AI agent orchestration
   - Document processing (PDF + OCR)
   - Session management (SQLite)
   - Audit logging

3. **Ollama + Qwen3:1.7b** — port 11434
   - Local LLM for understanding and extraction

Flow:
User → Frontend → Backend → Ollama → Response → Back

---

## 3. Tech Stack

Backend:
- Python 3.12
- FastAPI
- Uvicorn
- Ollama + Qwen3:1.7b
- pypdf (PDF parsing)
- pytesseract (OCR)
- SQLite (database)
- Pydantic

Frontend:
- React 18
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React

---

## 4. Project Structure

AavedanPlus/
├── ai-agent/              (Backend)
│   ├── app/
│   │   ├── main.py        (FastAPI entry)
│   │   ├── agents/        (AI logic)
│   │   ├── services/      (Business logic)
│   │   ├── schemas/       (Data models)
│   │   └── routes/        (API routes)
│   ├── audit_logs/        (Audit trail)
│   ├── uploads/           (User files)
│   ├── documents/         (Service configs)
│   ├── .env               (Env vars)
│   ├── application_state.sqlite3
│   ├── application_records.json
│   ├── requirements.txt
│   └── llm_demo.py
│
└── frontend/              (UI)
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Services.jsx
    │   │   ├── AgentWorkspace.jsx
    │   │   ├── Documents.jsx
    │   │   ├── ApplicationReview.jsx
    │   │   ├── Consent.jsx
    │   │   ├── GovernmentPortal.jsx
    │   │   ├── ApplicationStatus.jsx
    │   │   ├── AuditLog.jsx
    │   │   ├── Login.jsx
    │   │   └── AdminPanel.jsx
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── package.json
    └── vite.config.js

---

## 5. Features

User side:
- AI chat with real LLM (Qwen3)
- Hindi + English support
- Voice input (browser API)
- PDF upload (up to 10 MB)
- Auto form fill from documents
- Consent flow before submission
- Application tracking
- Full audit log

Admin side:
- Dashboard with all applications
- Accept / Reject buttons
- Applicant details
- Audit trail

AI features:
- Service understanding (LLM)
- Document text extraction (pypdf + OCR)
- Field extraction (LLM)
- Contextual replies (LLM)
- Failure recovery (retry + escalation)

---

## 6. Prerequisites

Install these first:
- Python 3.12+
- Node.js 18+
- npm 9+
- Ollama (latest)
- Tesseract OCR (optional, for scanned PDFs)

Check with:
python --version
node --version
npm --version
ollama --version

---

## 7. Installation

Step 1 — Go to project folder
cd C:\Users\HP\OneDrive\Desktop\AavedanPlus

Step 2 — Install Ollama model
ollama pull qwen3:1.7b
ollama list

Step 3 — Backend setup
cd ai-agent
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Step 4 — Frontend setup
(New terminal)
cd frontend
npm install

Step 5 — Environment files

Backend ai-agent/.env:
OLLAMA_MODEL=qwen3:1.7b
OLLAMA_BASE_URL=http://localhost:11434

Frontend frontend/.env:
VITE_API_BASE_URL=http://localhost:8000

---

## 8. Running the Application

You need 3 terminals.

Terminal 1 — Ollama
ollama serve

Terminal 2 — Backend
cd ai-agent
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Test: http://localhost:8000/docs

Terminal 3 — Frontend
cd frontend
npm run dev

Open: http://localhost:5173

---

## 9. User Flow (Step-by-Step)

Step 1 — Home page (http://localhost:5173)
Type "I want income certificate" → Enter

Step 2 — AI Chat (/agent)
Real AI greets you. Type "Haan" to confirm.

Step 3 — Documents (/documents)
Upload 3 PDFs: Aadhaar, Salary Slip, Self Declaration
Backend parses each PDF and extracts fields using LLM.

Step 4 — Review (/review)
Auto-filled form appears. Check details. Click "Proceed to Consent".

Step 5 — Consent (/consent)
Tick checkbox. Click "Approve & Submit".

Step 6 — Portal (/portal)
Mock submission. Application ID generated. Receipt shown.

Step 7 — Status (/status)
See timeline: Request → Docs → Form → Consent → Submitted.

Step 8 — Audit Log (/audit)
Full activity history.

---

## 10. Admin Flow

Access: http://localhost:5173/admin

- See all submitted applications
- Each shows: ID, applicant, status, timestamp
- Click "Accept" → Status becomes APPROVED
- Click "Reject" → Status becomes REJECTED

---

## 11. API Endpoints

Public:
GET /                  → API info
GET /health            → Health check
GET /docs              → Swagger UI

Application:
GET /service-requirements/{service_id}
POST /application-session
GET /application-session/{user_id}
POST /chat
DELETE /chat/{user_id}
POST /documents
PUT /application-form
GET /application-status/{application_id}
PATCH /application-status/{application_id}
GET /audit-log/{user_id}

Test all in browser: http://localhost:8000/docs

---

## 12. Data Storage

Files:
- application_state.sqlite3 → Active sessions
- application_records.json → Seed data
- local_application_records.json → Live records
- uploads/ → Uploaded PDFs
- audit_logs/ → Audit trail

Security notes:
- PDFs are local, removed when session clears
- Passwords use PBKDF2 hashing (not production-ready)
- Never commit uploads/ or .sqlite3 to git
- Do not upload real sensitive documents

---

## 13. AI/ML Implementation

Real (fully working):
- Service understanding → Qwen3 LLM
- Conversational agent → Qwen3 LLM
- PDF text extraction → pypdf
- OCR for scans → pytesseract
- Field extraction → Qwen3 LLM
- Form auto-fill → LLM mapping
- Consent handling → State machine
- Failure recovery → Retry + escalation
- Audit logging → SQLite

Mock (demo only):
- Government portal → No real API
- Application IDs → Locally generated
- UIDAI verification → Privacy/legal

Not implemented (out of scope):
- Document forgery detection
- RAG / Vector embeddings
- Advanced ML models

Reason: Focus is on working end-to-end flow with real LLM, not advanced ML research.

---

## 14. For Interviewers

Project highlights:
1. Real LLM integration (Ollama + Qwen3, not mocked)
2. Agent architecture (state machine with 10+ states)
3. Document intelligence (PDF parsing + LLM extraction)
4. Consent-first design (user approval before sensitive action)
5. Failure recovery (retry + human escalation)
6. Audit trail (every action logged)
7. Two-sided system (user portal + admin panel)
8. Bilingual (Hindi + English)

Key technical decisions:
- Local LLM → Privacy, no cost, offline
- FastAPI → Async support, auto docs
- SQLite → Zero config, file-based
- React + Vite → Fast dev experience
- State machine → Predictable, auditable

What I learned:
- Integrating LLMs with real applications
- State-based workflow design
- Document processing pipelines
- Building trustworthy AI (consent, audit, recovery)
- Full-stack: React + FastAPI + LLM

Possible extensions:
- Add RAG for better context
- Integrate real Aadhaar/DigiLocker APIs
- Multi-user auth with JWT
- Cloud deployment (AWS/GCP)
- Document forgery detection

---

## 15. License

Learning prototype. Not for production use.

---

## 16. Contact


Developer Team Name: CODE CATALYSTS
Email: ansarijasim171@gmail.com
Project: Aavedan+ — AI-Powered Government Service Assistant

Last Updated: 16-10-2026