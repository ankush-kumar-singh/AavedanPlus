# Aavedan+ Frontend

React/Vite frontend for the Aavedan+ local AI government-service agent.

This version is wired to the existing FastAPI backend **without changing the backend**.

## Backend

Run the existing backend first:

```powershell
cd C:\Users\anmol\Downloads\AavedanPlus\ai-agent
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

The backend uses the local Ollama model:

```text
qwen3:1.7b
```

Make sure Ollama is running before using the agent.

## Frontend

From this `frontend` directory:

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Backend compatibility

The frontend uses only the existing backend endpoints:

```text
POST   /chat
GET    /application-status/{application_id}
PATCH  /application-status/{application_id}
DELETE /chat/{user_id}
GET    /health
```

The Vite development server proxies `/api/*` to:

```text
http://127.0.0.1:8000
```

This avoids requiring any CORS changes in the backend.

## Main flow

```text
Home
 ↓
AI Agent
 ↓
Documents
 ↓
Backend validation
 ↓
Application Review
 ↓
Explicit Consent
 ↓
Backend submission
 ↓
Government Portal receipt
 ↓
Application Status
```

## Important document note

The current backend accepts document **paths** through `/chat`:

```json
{
  "documents": [
    "C:\\path\\to\\aadhaar.pdf",
    "C:\\path\\to\\salary.pdf",
    "C:\\path\\to\\declaration.pdf"
  ]
}
```

It does not currently expose a multipart `/upload-document` endpoint.

Therefore the frontend provides path fields instead of pretending that browser file selection uploads files to the backend.

The paths must be accessible by the machine running FastAPI.

## What was changed

- Replaced the old `localhost:5000/api` calls with the existing FastAPI API.
- Added Vite proxying so the backend does not need CORS changes.
- Connected the Agent Workspace to the real `/chat` endpoint.
- Connected document validation to the real `/chat` endpoint.
- Removed frontend-generated fake application IDs.
- Removed fake frontend-only submission logic.
- Consent now sends explicit `Yes, submit the application.` to the backend.
- Government Portal receipt reads the real application record.
- Application Status reads the real backend status and status history.
- Frontend state now stores backend application ID, service, status and workflow step.
- Kept the existing React UI structure and styling approach.

## Demo service

The primary demo flow is:

```text
Income Certificate
```

Typical documents:

```text
Aadhaar / Identity Document
Salary Slip / Income Proof
Self Declaration
```

## Production note

The current project is a hackathon/demo integration. A production implementation should use authenticated users, secure document upload/storage, HTTPS, server-side authorization, real government API integration where permitted, and stronger audit/security controls.
