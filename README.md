# Aavedan+

Aavedan+ is a local prototype for guiding a user through document upload, form review, consent, and a simulated application submission. It currently supports six example service flows.

**This is not connected to government services.** The portal, application references, and status records are local demo data. Do not use them as official receipts or upload real sensitive documents.

## What the prototype does

1. Loads document requirements for the selected service.
2. Accepts PDF uploads up to 10 MB and checks that the PDF is readable and its likely document type can be identified.
3. Extracts some form information and asks the user to complete required missing fields.
4. Saves the reviewed form and waits for explicit consent.
5. Writes a demo submission record to the local mock portal and shows its status history.

Document checks do not confirm authenticity or verify information with UIDAI, tax, state, or other government databases. Form schemas and requirements are examples and may not match any particular jurisdiction.

## Requirements

- Python 3.12 or newer
- Node.js and npm
- Ollama running locally with the configured model
- Tesseract OCR installed and available on `PATH` for image-only/scanned PDFs

## Start the backend

In PowerShell:

```powershell
cd ai-agent
python -m venv .venv-windows
.\.venv-windows\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
ollama pull qwen3:1.7b
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep Ollama running in a separate terminal. The backend health endpoint reports `healthy` only when Ollama is reachable and the configured model is present. To use another local Ollama model or host, set `OLLAMA_MODEL` and `OLLAMA_BASE_URL` before starting the backend.

## Start the frontend

In another PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. In development, Vite forwards `/api` requests to `http://127.0.0.1:8000`. A production deployment needs a reverse proxy or an explicit `VITE_API_BASE_URL` configuration.

## Local data

- Uploaded PDFs are stored in `ai-agent/uploads/` and are removed when the active application session is cleared.
- Workflow sessions and audit events are stored in `ai-agent/application_state.sqlite3` so an in-progress application can be restored after a restart.
- Simulated submission records are stored in the ignored local file `ai-agent/local_application_records.json`. Existing sample records in `ai-agent/application_records.json` remain unchanged and seed the local store until its first update.
- Browser accounts are a prototype-only local feature. Passwords are stored as salted PBKDF2 hashes, but authentication is not backed by a trusted server and is not suitable for production.

These local files can contain personal information. Keep them on a trusted machine and do not commit uploaded documents or local database files.
