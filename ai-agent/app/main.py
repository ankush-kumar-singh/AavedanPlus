from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import threading
from urllib.error import URLError
from urllib.request import urlopen
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.graph import agent
from app.tools.status import (
    get_application_status,
    update_application_status
)
from app.tools.documents import validate_documents, validate_uploaded_files
from app.tools.requirements import (
    check_requirements,
    get_service_config,
    get_supported_services,
    get_service_name,
)
from app.tools.forms import get_form_schema
from app.session_store import (
    add_audit_event,
    delete_session,
    get_audit_events,
    load_all_sessions,
    load_session,
    save_session,
)


app = FastAPI(
    title="Aavedan+ AI Agent",
    description="Local prototype for preparing example service applications.",
    version="1.0.0"
)


sessions = load_all_sessions()
SESSIONS_LOCK = threading.RLock()
UPLOAD_DIRECTORY = Path(__file__).resolve().parent.parent / "uploads"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:1.7b")


class ChatRequest(BaseModel):
    user_id: str
    message: str
    service_id: str | None = None
    mock_portal_mode: str | None = None


class FormUpdateRequest(BaseModel):
    user_id: str
    fields: dict[str, str]


class StartSessionRequest(BaseModel):
    user_id: str
    service_id: str


CONSENT_MESSAGES = {
    "yes",
    "yes submit",
    "submit",
    "submit it",
    "go ahead",
    "approve",
    "approved",
    "i agree",
    "i approve",
    "approve and save",
    "haan",
    "haan ji",
    "ji haan",
    "han",
    "haan submit karo",
    "haan kar do",
    "haa kar do",
    "manzoor hai",
}


SERVICE_MENTION_PATTERNS = {
    "income_certificate": re.compile(r"\bincome(?:\s+certificate)?\b|\baay\s+praman\s+patra\b"),
    "caste_certificate": re.compile(r"\bcaste(?:\s+certificate)?\b|\bjaat(?:i)?(?:\s+certificate)?\b|\bjaati\s+praman\s+patra\b"),
    "residence_certificate": re.compile(r"\b(?:residence|domicile)(?:\s+certificate)?\b|\bniwas\s+praman\s+patra\b"),
    "ews_certificate": re.compile(r"\bews(?:\s+certificate)?\b|\beconomic(?:ally)?\s+weaker\s+section(?:\s+certificate)?\b"),
    "birth_certificate": re.compile(r"\bbirth(?:\s+certificate)?\b|\bjanam\s+praman\s+patra\b"),
    "scholarship": re.compile(r"\bscholarship(?:\s+application)?\b|\bscholarship\s+form\b"),
}
SERVICE_CHANGE_ACTION = re.compile(
    r"\b(?:want|need|create|make|get|apply|start|begin|switch|change|move|prefer|request|looking\s+for|"
    r"chahiye|banana|banwana|bana\s+do|karna|krna|lena|mujhe)\b"
)
SERVICE_CHANGE_NEGATION = re.compile(
    r"\b(?:don\s*t|dont|do\s+not|not|never|no\s+longer|nahi|nahin|mat)\b"
)


def detect_requested_service(message: str) -> str | None:
    """Return the service the user is explicitly asking to start or switch to."""
    normalized = re.sub(r"[^a-z0-9\u0900-\u097f]+", " ", message.lower()).strip()
    clauses = re.split(r"[,;.!?]+|\b(?:and|but|however|instead|now|then)\b", normalized)
    requested = []

    for clause_index, clause in enumerate(clauses):
        for service_id, pattern in SERVICE_MENTION_PATTERNS.items():
            for match in pattern.finditer(clause):
                prefix = clause[:match.start()]
                suffix = clause[match.end():]
                if service_id == "income_certificate" and match.group(0).strip() == "income":
                    if re.search(r"\b(?:annual|monthly|yearly|family|my|your|the|our|their)\s*$", prefix):
                        continue
                    if re.match(r"\s+(?:proof|document|amount|details|information|level|source)\b", suffix):
                        continue

                has_action = bool(SERVICE_CHANGE_ACTION.search(prefix)) or bool(
                    re.search(r"\b(?:chahiye|banana|banwana|bana\s+do|karna\s+hai|krna\s+hai)\b", suffix)
                )
                is_negated = bool(SERVICE_CHANGE_NEGATION.search(prefix))
                if has_action and not is_negated:
                    requested.append((clause_index, match.start(), service_id))

    if requested:
        return max(requested, key=lambda item: (item[0], item[1]))[2]
    return None


def build_state(
    request,
    previous_state=None,
    service_override=None,
):

    previous_state = previous_state or {}

    state = dict(
        previous_state
    )

    state[
        "user_id"
    ] = request.user_id

    state[
        "user_message"
    ] = request.message

    history = previous_state.get("conversation_history", [])
    if not isinstance(history, list):
        history = []
    history = [
        turn
        for turn in history
        if isinstance(turn, dict)
        and turn.get("role") in {"user", "assistant"}
        and isinstance(turn.get("content"), str)
    ]
    history.append({"role": "user", "content": request.message})
    state["conversation_history"] = history[-8:]

    requested_service = service_override or request.service_id
    if requested_service:
        if requested_service not in get_supported_services():
            raise HTTPException(
                status_code=422,
                detail="Unsupported service."
            )
        state["service"] = requested_service

    normalize_saved_form(state)

    state.setdefault(
        "uploaded_documents",
        []
    )

    state.setdefault(
        "uploaded_file_paths",
        []
    )

    state.setdefault(
        "completed_steps",
        []
    )

    if request.mock_portal_mode:

        state[
            "mock_portal_mode"
        ] = request.mock_portal_mode

    return state


def normalize_saved_form(state: dict) -> None:
    form_data = state.get("form_data")
    if not isinstance(form_data, dict) or not isinstance(form_data.get("fields"), dict):
        return
    schema_fields = {
        item.get("key"): item
        for item in get_form_schema(form_data.get("service") or state.get("service") or "").get("fields", [])
    }
    for key, value in form_data["fields"].items():
        schema_field = schema_fields.get(key)
        if schema_field and isinstance(value, dict):
            value["required"] = schema_field.get("required", True)


def remove_uploaded_files(state):
    upload_root = UPLOAD_DIRECTORY.resolve()
    for item in state.get("uploaded_file_paths", []):
        stored_path = item.get("file_path") if isinstance(item, dict) else item
        if not isinstance(stored_path, str):
            continue
        try:
            path = Path(stored_path).resolve()
            if path.parent == upload_root and path.suffix.lower() == ".pdf":
                path.unlink(missing_ok=True)
        except OSError:
            continue


def get_chat_intent(message: str) -> str | None:
    normalized = re.sub(r"[^a-z0-9]+", " ", message.lower()).strip()
    if normalized.startswith("prepare my application form"):
        return None
    if normalized in {"review", "review it", "review karo", "form review", "review form"} or re.search(r"\b(review|show|check|dikhao|dekh)\b.{0,30}\b(form|application|it|karo|dekhna)\b|\b(form|application)\b.{0,30}\b(review|show|check|dikhao|dekh)\b", normalized):
        return "review"
    if re.search(r"\b(track|status|progress)\b|\bwhere\b.*\b(application|process)\b|\bhow\b.*\b(application|process)\b|\b(kaha|kahan|track karo)\b", normalized):
        return "status"
    if re.search(r"\b(activity|audit|actions so far|what have you done)\b", normalized):
        return "activity"
    if re.search(r"\b(what|which|show|list|batao|dikhao)\b.*\b(document|docs?|paper|requirement)s?\b|\b(missing|remaining)\b.*\b(document|docs?|paper)s?\b|\b(document|docs?|paper)s?\b.*\b(batao|dikhao|chahiye)\b", normalized):
        return "documents"
    return None


def respond_to_chat_intent(state: dict, intent: str) -> tuple[dict, dict | None]:
    result = dict(state)
    service_name = result.get("service_name") or get_service_name(result.get("service") or "")
    user_message = str(result.get("user_message") or "")
    hindi_chat = bool(
        re.search(r"[\u0900-\u097f]", user_message)
        or re.search(r"\b(mera|meri|mujhe|batao|dikhao|kya|hai|ho|kar|kr|chahiye|abhi|kaise)\b", user_message.lower())
    )
    status_report = None

    if intent == "review":
        form_fields = result.get("form_data", {}).get("fields", {})
        if form_fields:
            missing = [
                field.get("label", key.replace("_", " ").title())
                for key, field in form_fields.items()
                if field.get("required", True) and not str(field.get("value") or "").strip()
            ]
            if missing:
                result["response"] = (
                    "Aapka form isi chat mein dikh raha hai. Documents se ye zaroori details nahi mili: "
                    + ", ".join(missing)
                    + ". Bas yehi details chahiye; baaki fields optional hain."
                    if hindi_chat else
                    "Your form is shown in this chat. I could not read these required details from your documents: "
                    + ", ".join(missing)
                    + ". Only these details are needed; the other fields are optional."
                )
            else:
                result["response"] = (
                    "Aapka form isi chat mein hai aur saari zaroori details bhari hui hain. Yahin review kar lijiye."
                    if hindi_chat else
                    "Your form is shown in this chat and all required details are filled. Please review it here."
                )
        else:
            missing_docs = result.get("validated_documents", {}).get("missing_documents", [])
            if missing_docs:
                labels = [item.get("label", "required document") for item in missing_docs]
                result["response"] = (
                    "Form abhi ready nahi hai. Ye zaroori documents baaki hain: " + ", ".join(labels) + ". PDF isi chat mein bhej dijiye."
                    if hindi_chat else
                    "The form is not ready yet. I am still waiting for: " + ", ".join(labels) + ". Attach the next PDF here in the chat."
                )
            else:
                result["response"] = (
                    "Form abhi prepare nahi hua hai; application details isi chat mein check ho rahi hain."
                    if hindi_chat else
                    "The form has not been prepared yet. Your application details are still being checked in this chat."
                )

    elif intent == "documents":
        requirements = result.get("required_documents", [])
        validation = result.get("validated_documents", {})
        missing_keys = {
            item.get("key")
            for item in validation.get("missing_documents", [])
            if isinstance(item, dict)
        }
        if not requirements:
            result["response"] = (
                "Kaunsa certificate ya scholarship chahiye? Naam bata dijiye, main uske zaroori documents yahin dikha dunga."
                if hindi_chat else
                "Tell me which certificate or scholarship you need, and I will show its configured document requirements here."
            )
        else:
            lines = []
            for item in requirements:
                if item.get("required", True) is False:
                    continue
                label = item.get("label", "Required document")
                accepted = ", ".join(
                    str(value).replace("_", " ").title()
                    for value in item.get("accepted_documents", [])
                )
                state_label = (
                    ("abhi chahiye" if item.get("key") in missing_keys else "mil gaya")
                    if hindi_chat else
                    ("still needed" if item.get("key") in missing_keys else "received")
                )
                alternatives = (f" (inmein se koi ek: {accepted})" if hindi_chat else f" (any one: {accepted})")
                lines.append(f"{label}: {state_label}" + (alternatives if accepted else ""))
            result["response"] = (
                f"{service_name} ke liye configured zaroori documents:\n" + "\n".join(lines)
                if hindi_chat else
                f"For your {service_name}, the required documents are:\n" + "\n".join(lines)
            )

    elif intent == "status":
        requested_id = re.search(r"\b(?:APP|INC|CAST|RES|EWS|BIRTH|SCH)-\d{4}-\d{6}\b", user_message, re.IGNORECASE)
        application_id = requested_id.group(0).upper() if requested_id else result.get("application_id")
        if application_id:
            record = get_application_status(application_id)
            if record:
                status_report = {
                    "application_id": record.get("application_id"),
                    "service_name": record.get("service_name") or service_name,
                    "status": record.get("status", "SUBMITTED"),
                    "submitted_at": record.get("submitted_at"),
                    "status_history": record.get("status_history", []),
                }
                history_lines = [
                    f"{item.get('status', 'Status').replace('_', ' ').title()}"
                    + (f" — {item.get('timestamp')}" if item.get("timestamp") else "")
                    for item in status_report["status_history"]
                ]
                status_label = status_report["status"].replace("_", " ").lower()
                result["response"] = (
                    f"Aapka {status_report['service_name']} demo record {application_id} abhi {status_label} status mein hai."
                    + (" Status history: " + "; ".join(history_lines) + "." if history_lines else "")
                    if hindi_chat else
                    f"Your {status_report['service_name']} demo record {application_id} is {status_report['status'].replace('_', ' ').lower()}."
                    + (" Status history: " + "; ".join(history_lines) + "." if history_lines else "")
                )
            else:
                result["response"] = (
                    "Is application ka saved demo record nahi mila, isliye status available nahi hai."
                    if hindi_chat else
                    "I could not find the saved demo record for this application. Its status is not available."
                )
        else:
            step_code = result.get("current_step") or "REQUEST_RECEIVED"
            step_labels = {
                "REQUEST_RECEIVED": "request received",
                "DOCUMENTS_PENDING": "waiting for required documents",
                "FORM_INCOMPLETE": "waiting for essential form details",
                "FORM_FILLED": "form ready for review",
                "FORM_READY": "form ready for review",
                "WAITING_CONSENT": "waiting for your approval",
                "SUBMITTED": "local demo record saved",
            }
            current_step = step_labels.get(step_code, str(step_code).replace("_", " ").lower())
            result["response"] = (
                f"Aapka {service_name} application abhi {current_step} stage par hai. Local demo record save hoga to uska tracking reference yahin milega."
                if hindi_chat else
                f"Your {service_name} application is currently at: {current_step}. A tracking reference will appear here if a local demo record is saved."
            )

    elif intent == "activity":
        events = get_audit_events(str(result.get("user_id") or ""), limit=8)
        if events:
            lines = [
                f"{str(item.get('event', 'Activity')).replace('_', ' ').title()}"
                + (f" — {item.get('timestamp')}" if item.get("timestamp") else "")
                for item in reversed(events)
            ]
            result["response"] = (
                "Is application ki recent activity isi chat mein:\n" + "\n".join(lines)
                if hindi_chat else
                "Recent activity for this application:\n" + "\n".join(lines)
            )
        else:
            result["response"] = (
                "Abhi is application ke liye koi activity record nahi hai."
                if hindi_chat else
                "There is no activity recorded for this application yet."
            )

    history = result.get("conversation_history", [])
    response = result.get("response", "")
    if response:
        result["conversation_history"] = [
            *history,
            {"role": "assistant", "content": response},
        ][-8:]
    return result, status_report


@app.get("/")
def root():

    return {
        "name":
            "Aavedan+ AI Agent",
        "status":
            "api_ready",
        "model":
            OLLAMA_MODEL,
        "health_endpoint":
            "/health",
    }


@app.get("/health")
def health():
    try:
        with urlopen(f"{OLLAMA_BASE_URL}/api/tags", timeout=1.5) as response:
            available_models = json.load(response).get("models", [])
    except (OSError, URLError, TimeoutError, json.JSONDecodeError, AttributeError, TypeError):
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "model": OLLAMA_MODEL,
                "ollama": "unreachable",
                "message": "Start Ollama and make sure the configured model is available.",
            },
        )

    model_available = any(
        isinstance(model, dict)
        and (
            model.get("name") == OLLAMA_MODEL
            or model.get("model") == OLLAMA_MODEL
        )
        for model in available_models
    )
    if not model_available:
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "model": OLLAMA_MODEL,
                "ollama": "reachable",
                "message": "The configured model is not available in Ollama.",
            },
        )

    return {
        "status": "healthy",
        "model": OLLAMA_MODEL,
        "ollama": "ready",
    }


@app.get("/service-requirements/{service_id}")
def service_requirements(service_id: str):
    config = get_service_config(service_id)
    if not config:
        raise HTTPException(status_code=404, detail="Unsupported service.")
    return {
        "service_id": service_id,
        "service_name": config["name"],
        "requirements": config.get("requirements", []),
    }


@app.get("/application-session/{user_id}")
def application_session(user_id: str):
    state = load_session(user_id)
    if not state:
        return {"found": False}
    normalize_saved_form(state)
    stored_service = state.get("service")
    return {
        "found": True,
        "service": stored_service if stored_service in get_supported_services() else None,
        "service_name": state.get("service_name") or get_service_name(stored_service or ""),
        "current_step": state.get("current_step"),
        "application_status": state.get("application_status"),
        "application_id": state.get("application_id"),
        "submitted_at": state.get("submitted_at"),
        "conversation_history": state.get("conversation_history", [])[-8:],
        "form_data": state.get("form_data"),
        "required_documents": state.get("required_documents", []),
        "validated_documents": state.get("validated_documents", {}),
        "uploaded_documents": state.get("uploaded_document_records", []),
        "consent_granted": state.get("consent_granted", False),
        "escalated": state.get("escalated", False),
    }


@app.post("/application-session")
def start_application_session(request: StartSessionRequest):
    if request.service_id not in get_supported_services():
        raise HTTPException(status_code=422, detail="Unsupported service.")

    with SESSIONS_LOCK:
        existing_state = load_session(request.user_id)
        if existing_state:
            if existing_state.get("service") != request.service_id:
                raise HTTPException(
                    status_code=409,
                    detail="Clear the previous application before changing services.",
                )
            return {
                "found": True,
                "service": existing_state.get("service"),
                "service_name": existing_state.get("service_name") or get_service_name(request.service_id),
                "current_step": existing_state.get("current_step"),
            }

        state = {
            "user_id": request.user_id,
            "service": request.service_id,
            "service_name": get_service_name(request.service_id),
            "current_step": "REQUEST_RECEIVED",
            "uploaded_documents": [],
            "uploaded_file_paths": [],
            "uploaded_document_records": [],
            "completed_steps": [],
            "consent_granted": False,
        }
        sessions[request.user_id] = state
        save_session(request.user_id, state)
        add_audit_event(
            request.user_id,
            "USER",
            "SESSION_STARTED",
            {"service": request.service_id},
        )

    return {
        "found": True,
        "service": request.service_id,
        "service_name": get_service_name(request.service_id),
        "current_step": "REQUEST_RECEIVED",
    }


@app.get("/audit-log/{user_id}")
def audit_log(user_id: str, limit: int = 500):
    return {"events": get_audit_events(user_id, limit)}


@app.post("/documents")
async def upload_document(
    request: Request,
    user_id: str,
    service_id: str,
    filename: str = "document.pdf",
):
    if service_id not in get_supported_services():
        raise HTTPException(status_code=422, detail="Unsupported service.")

    previous_state = load_session(user_id)
    if previous_state and (
        previous_state.get("current_step") == "SUBMITTED"
        or previous_state.get("application_status") == "SUBMITTED"
    ):
        raise HTTPException(
            status_code=409,
            detail="Submitted demo applications are read-only. Start a new application to make changes.",
        )
    if previous_state and previous_state.get("service") not in (None, service_id):
        raise HTTPException(
            status_code=409,
            detail="Clear the previous application before changing services.",
        )

    content_type = request.headers.get("content-type", "").split(";", 1)[0]
    if content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Upload a PDF file.")

    content = await request.body()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="PDF files must be 10 MB or smaller.")
    if b"%PDF-" not in content[:1024]:
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid PDF.")

    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    stored_path = UPLOAD_DIRECTORY / f"{uuid4().hex}.pdf"
    stored_path.write_bytes(content)

    validation = validate_uploaded_files([str(stored_path)])
    detected = validation.get("detected_documents", [])
    if not detected:
        stored_path.unlink(missing_ok=True)
        errors = validation.get("invalid_documents", [])
        detail = errors[0].get("error") if errors else "Could not read this PDF."
        add_audit_event(
            user_id,
            "SYSTEM",
            "DOCUMENT_REJECTED",
            {"filename": Path(filename.replace("\\", "/")).name, "reason": detail},
        )
        raise HTTPException(status_code=422, detail=detail)

    detected_document = detected[0]
    document_type = detected_document["document_type"]
    display_name = Path(filename.replace("\\", "/")).name
    document_record = {
        "id": uuid4().hex,
        "filename": display_name[:200] or "document.pdf",
        "document_type": document_type,
        "status": "readable",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }

    with SESSIONS_LOCK:
        state = load_session(user_id) or {}
        if state.get("current_step") == "SUBMITTED" or state.get("application_status") == "SUBMITTED":
            stored_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=409,
                detail="Submitted demo applications are read-only. Start a new application to make changes.",
            )
        if state and state.get("service") not in (None, service_id):
            stored_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=409,
                detail="Clear the previous application before changing services.",
            )
        is_new_session = not state
        state.setdefault("user_id", user_id)
        state["service"] = service_id
        state.setdefault("uploaded_documents", [])
        state.setdefault("uploaded_file_paths", [])
        state.setdefault("completed_steps", [])
        state["required_documents"] = check_requirements(service_id)
        existing_records = state.setdefault("uploaded_document_records", [])
        requirements = state["required_documents"]
        new_requirement_keys = {
            item["key"]
            for item in requirements
            if document_type in item.get("accepted_documents", [])
        }
        replaced_records = []
        retained_records = []
        for existing in existing_records:
            if not isinstance(existing, dict):
                retained_records.append(existing)
                continue
            old_type = existing.get("document_type")
            old_requirement_keys = {
                item["key"]
                for item in requirements
                if old_type in item.get("accepted_documents", [])
            }
            if old_type == document_type:
                replaced_records.append(existing)
                continue
            shared_keys = old_requirement_keys & new_requirement_keys
            if not shared_keys:
                retained_records.append(existing)
                continue

            old_required_slots = {
                item["key"]
                for item in requirements
                if item.get("required", True)
                and old_type in item.get("accepted_documents", [])
            }
            covered_after_replacement = set(new_requirement_keys)
            for other in existing_records:
                if other is existing or not isinstance(other, dict):
                    continue
                other_type = other.get("document_type")
                covered_after_replacement.update(
                    item["key"]
                    for item in requirements
                    if other_type in item.get("accepted_documents", [])
                )
            if old_required_slots.issubset(covered_after_replacement):
                replaced_records.append(existing)
            else:
                retained_records.append(existing)

        replaced_ids = {
            item.get("id") for item in replaced_records if item.get("id")
        }
        replaced_types = {
            item.get("document_type") for item in replaced_records
        }
        state["uploaded_document_records"] = [*retained_records, document_record]
        old_file_paths = state.get("uploaded_file_paths", [])
        kept_file_paths = []
        files_to_remove = []
        retained_types = {
            item.get("document_type")
            for item in retained_records
            if isinstance(item, dict)
        }
        for item in old_file_paths:
            if not isinstance(item, dict):
                kept_file_paths.append(item)
                continue
            item_id = item.get("document_id")
            item_type = item.get("document_type")
            should_remove = item_id in replaced_ids if item_id else (
                item_type in replaced_types and item_type not in retained_types
            )
            if should_remove:
                files_to_remove.append(item)
            else:
                kept_file_paths.append(item)
        state["uploaded_file_paths"] = [
            *kept_file_paths,
            {
                "file_path": str(stored_path),
                "document_type": document_type,
                "document_id": document_record["id"],
            },
        ]
        previous_types = state.get("uploaded_documents", [])
        legacy_types = [
            value for value in previous_types
            if value not in replaced_types or value == document_type or value in retained_types
        ]
        state["uploaded_documents"] = list(dict.fromkeys([
            *legacy_types,
            *[item.get("document_type") for item in retained_records if isinstance(item, dict)],
            document_type,
        ]))
        state["validated_documents"] = validate_documents(
            state["required_documents"], state["uploaded_documents"]
        )
        sessions[user_id] = state
        save_session(user_id, state)
        remove_uploaded_files({"uploaded_file_paths": files_to_remove})
        if is_new_session:
            add_audit_event(
                user_id,
                "USER",
                "SESSION_STARTED",
                {"service": service_id},
            )
        add_audit_event(
            user_id,
            "USER",
            "DOCUMENT_UPLOADED",
            {
                "filename": document_record["filename"],
                "document_type": document_type,
                "status": "READABLE",
            },
        )

    return {
        **document_record,
        "replaced_documents": [
            dict(item)
            for item in replaced_records
        ],
    }


@app.put("/application-form")
def update_application_form(request: FormUpdateRequest):
    with SESSIONS_LOCK:
        return _save_application_form(request)


def _save_application_form(request: FormUpdateRequest):
    state = load_session(request.user_id)
    if state:
        normalize_saved_form(state)
    form_data = state.get("form_data") if state else None
    if state and (
        state.get("current_step") == "SUBMITTED"
        or state.get("application_status") == "SUBMITTED"
    ):
        raise HTTPException(
            status_code=409,
            detail="Submitted demo applications are read-only. Start a new application to make changes.",
        )
    if not isinstance(form_data, dict) or not isinstance(form_data.get("fields"), dict):
        raise HTTPException(status_code=404, detail="Application form not found.")

    schema = get_form_schema(form_data.get("service", ""))
    allowed_fields = {
        field["key"] for field in schema.get("fields", [])
    }
    unknown_fields = set(request.fields) - allowed_fields
    if unknown_fields:
        raise HTTPException(status_code=422, detail="The form contains an unknown field.")

    for field_key, submitted_value in request.fields.items():
        if len(submitted_value) > 500:
            raise HTTPException(status_code=422, detail="Form values must be 500 characters or fewer.")
        field = form_data["fields"].get(field_key)
        if field is None:
            raise HTTPException(status_code=422, detail="The form contains an unknown field.")

        value = submitted_value.strip()
        old_value = str(field.get("value") or "").strip()
        field["value"] = value or None
        if not value:
            field["status"] = "MISSING"
        elif value != old_value:
            field["status"] = "USER_PROVIDED"

    missing_fields = [
        field["label"]
        for field in form_data["fields"].values()
        if field.get("required", True) and not str(field.get("value") or "").strip()
    ]
    if missing_fields:
        state["current_step"] = "FORM_INCOMPLETE"
        state["consent_granted"] = False
    else:
        state["current_step"] = "WAITING_CONSENT"
        state["consent_required"] = True
        state["consent_granted"] = False
    state["form_data"] = form_data
    sessions[request.user_id] = state
    save_session(request.user_id, state)
    add_audit_event(
        request.user_id,
        "USER",
        "FORM_SAVED",
        {
            "fields": list(request.fields),
            "missing_required_fields": len(missing_fields),
        },
    )

    return {
        "form_data": form_data,
        "current_step": state["current_step"],
        "missing_fields": missing_fields,
    }


@app.post("/chat")
def chat(
    request: ChatRequest
):

    with SESSIONS_LOCK:
        previous_state = load_session(request.user_id)
        requested_service = detect_requested_service(request.message)
        previous_service = (previous_state or {}).get("service")
        service_switched = bool(
            requested_service
            and requested_service in get_supported_services()
            and previous_service
            and requested_service != previous_service
        )
        state_previous = previous_state
        if service_switched:
            new_document_types = {
                document_type
                for requirement in check_requirements(requested_service)
                for document_type in requirement.get("accepted_documents", [])
            }
            previous_records = (previous_state or {}).get("uploaded_document_records", [])
            previous_paths = (previous_state or {}).get("uploaded_file_paths", [])
            if not isinstance(previous_records, list):
                previous_records = []
            if not isinstance(previous_paths, list):
                previous_paths = []
            paths_by_id = {
                item.get("document_id"): item
                for item in previous_paths
                if isinstance(item, dict) and item.get("document_id")
            }
            retained_records = [
                item
                for item in previous_records
                if isinstance(item, dict)
                and item.get("document_type") in new_document_types
                and item.get("id") in paths_by_id
            ]
            retained_ids = {item.get("id") for item in retained_records}
            retained_paths = [
                item for item in previous_paths
                if isinstance(item, dict) and item.get("document_id") in retained_ids
            ]
            remove_uploaded_files({
                "uploaded_file_paths": [
                    item for item in previous_paths
                    if item not in retained_paths
                ]
            })
            state_previous = {
                "conversation_history": (previous_state or {}).get("conversation_history", []),
                "mock_portal_mode": (previous_state or {}).get("mock_portal_mode"),
                "uploaded_documents": list(dict.fromkeys(
                    item.get("document_type") for item in retained_records
                )),
                "uploaded_document_records": retained_records,
                "uploaded_file_paths": retained_paths,
            }

        state = build_state(
            request,
            state_previous,
            service_override=requested_service,
        )

        if (
            not service_switched
            and
            previous_state
            and previous_state.get("current_step") == "WAITING_CONSENT"
            and request.message.strip().lower() in CONSENT_MESSAGES
        ):
            state["consent_granted"] = True
            add_audit_event(request.user_id, "USER", "CONSENT_GRANTED")

        intent = get_chat_intent(request.message)
        status_report = None
        direct_response = bool(intent)
        if service_switched:
            result = agent.invoke(state)
            direct_response = False
        elif intent == "review" and not state.get("form_data") and state.get("service") in get_supported_services():
            result = agent.invoke(state)
            direct_response = False
        elif intent:
            result, status_report = respond_to_chat_intent(state, intent)
        else:
            result = agent.invoke(state)

        if service_switched:
            old_name = (previous_state or {}).get("service_name") or get_service_name(previous_service)
            new_name = get_service_name(requested_service)
            message = result.get("response", "")
            retained_count = len(result.get("uploaded_document_records", []))
            retained_note = (
                f" I kept {retained_count} PDF(s) that also match this service's requirements."
                if retained_count else ""
            )
            if re.search(r"[\u0900-\u097f]", request.message):
                result["response"] = f"Theek hai, {old_name} se {new_name} par switch kar raha hoon.{retained_note} {message}".strip()
            else:
                result["response"] = f"Okay, switching from {old_name} to {new_name}.{retained_note} {message}".strip()

        conversation_history = result.get("conversation_history", [])
        response_message = result.get("response")
        if response_message and not direct_response:
            conversation_history = [
                *conversation_history,
                {"role": "assistant", "content": response_message},
            ][-8:]
        result["conversation_history"] = conversation_history
        sessions[request.user_id] = result
        save_session(request.user_id, result)

        previous_step = previous_state.get("current_step") if previous_state else None
        current_step = result.get("current_step")
        if not previous_state or service_switched:
            add_audit_event(
                request.user_id,
                "USER",
                "SESSION_STARTED",
                {"service": result.get("service")},
            )
        if service_switched:
            add_audit_event(
                request.user_id,
                "USER",
                "SERVICE_SWITCHED",
                {"from": previous_service, "to": requested_service},
            )
        if current_step and current_step != previous_step:
            add_audit_event(
                request.user_id,
                "SYSTEM",
                "WORKFLOW_STEP_CHANGED",
                {"from": previous_step, "to": current_step},
            )
        if result.get("application_status") == "SUBMITTED":
            add_audit_event(
                request.user_id,
                "PORTAL",
                "DEMO_SUBMISSION_COMPLETED",
                {"application_id": result.get("application_id")},
            )
        if result.get("escalated"):
            add_audit_event(request.user_id, "SYSTEM", "SUBMISSION_RETRY_LIMIT_REACHED")

    response_payload = {
        "message":
            result.get(
                "response",
                ""
            ),
        "service":
            result.get(
                "service"
            ),
        "service_name":
            result.get(
                "service_name"
            ),
        "current_step":
            result.get(
                "current_step"
            ),
        "application_status":
            result.get(
                "application_status"
            ),
        "application_id":
            result.get(
                "application_id"
            ),
        "submitted_at": result.get("submitted_at"),
        "required_documents":
            result.get(
                "required_documents",
                []
            ),
        "validated_documents":
            result.get(
                "validated_documents",
                {}
            ),
        "form_data":
            result.get(
                "form_data"
            ),
        "uploaded_documents": result.get("uploaded_document_records", []),
        "escalated":
            result.get(
                "escalated",
                False
            ),
        "service_switched": service_switched,
    }
    if status_report:
        response_payload["status_report"] = status_report
    return response_payload


@app.get(
    "/application-status/{application_id}"
)
def application_status(
    application_id: str
):

    record = get_application_status(
        application_id
    )

    if not record:

        return {
            "found":
                False,
            "application_id":
                application_id,
            "message":
                "Application not found."
        }

    return {
        "found":
            True,
        **record
    }


@app.patch(
    "/application-status/{application_id}"
)
def change_application_status(
    application_id: str,
    status: str
):

    record = update_application_status(
        application_id,
        status
    )

    if not record:

        return {
            "success":
                False,
            "message":
                "Application not found or invalid status."
        }

    return {
        "success":
            True,
        **record
    }


@app.delete(
    "/chat/{user_id}"
)
def clear_chat(
    user_id: str
):

    with SESSIONS_LOCK:
        previous_state = load_session(user_id)
        if previous_state:
            remove_uploaded_files(previous_state)
        sessions.pop(user_id, None)
        delete_session(user_id)
        add_audit_event(user_id, "SYSTEM", "SESSION_CLEARED")

    return {
        "message":
            "Conversation cleared."
    }
