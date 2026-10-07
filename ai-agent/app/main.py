from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.graph import agent
from app.tools.status import (
    get_application_status,
    update_application_status
)


app = FastAPI(
    title="Aavedan+ AI Agent",
    description="AI agent for end-to-end government service applications.",
    version="1.0.0"
)


sessions = {}


class ChatRequest(BaseModel):
    user_id: str
    message: str
    documents: list[str] = Field(
        default_factory=list
    )
    mock_portal_mode: str | None = None


def build_state(
    request,
    previous_state=None
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

    if request.documents:

        state[
            "uploaded_documents"
        ] = request.documents

    if request.mock_portal_mode:

        state[
            "mock_portal_mode"
        ] = request.mock_portal_mode

    state.setdefault(
        "uploaded_documents",
        []
    )

    state.setdefault(
        "completed_steps",
        []
    )

    return state


@app.get("/")
def root():

    return {
        "name":
            "Aavedan+ AI Agent",
        "status":
            "running",
        "model":
            "qwen3:1.7b"
    }


@app.get("/health")
def health():

    return {
        "status":
            "healthy",
        "model":
            "qwen3:1.7b",
        "ollama":
            "local"
    }


@app.post("/chat")
def chat(
    request: ChatRequest
):

    previous_state = sessions.get(
        request.user_id
    )

    state = build_state(
        request,
        previous_state
    )

    if (
        previous_state
        and request.message.strip().lower()
        in {
            "yes",
            "yes submit",
            "submit",
            "submit it",
            "go ahead",
            "approve",
            "approved"
        }
    ):

        state[
            "consent_granted"
        ] = True

    result = agent.invoke(
        state
    )

    sessions[
        request.user_id
    ] = result

    return {
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
        "escalated":
            result.get(
                "escalated",
                False
            )
    }


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

    sessions.pop(
        user_id,
        None
    )

    return {
        "message":
            "Conversation cleared."
    }