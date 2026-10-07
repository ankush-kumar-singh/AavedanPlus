from langgraph.graph import StateGraph, START, END

from app.state import AgentState
from app.services.llm import llm
from app.prompts import AGENT_SYSTEM_PROMPT
from app.tools.requirements import (
    check_requirements,
    get_service_name,
    get_supported_services
)
from app.tools.documents import validate_documents
from app.tools.submission import submit_application


MAX_RETRIES = 2


def understand_request(state: AgentState):
    if state.get("service"):
        service = state["service"]

        if service in get_supported_services():
            return {
                "service": service,
                "service_name": get_service_name(service),
                "current_step": "SERVICE_IDENTIFIED",
                "completed_steps": ["UNDERSTAND_REQUEST"]
            }

    user_message = state["user_message"]

    supported_services = "\n".join(
        f"- {service_id}: {name}"
        for service_id, name in get_supported_services().items()
    )

    prompt = f"""
{AGENT_SYSTEM_PROMPT}

Supported services:

{supported_services}

Citizen's message:
{user_message}

Identify the service requested by the citizen.

Return only one service ID from the supported list.
If no service matches, return:
unknown
"""

    response = llm.invoke(prompt)

    service = response.content.strip().lower()

    for service_id in get_supported_services():
        if service_id in service:
            return {
                "service": service_id,
                "service_name": get_service_name(service_id),
                "current_step": "SERVICE_IDENTIFIED",
                "completed_steps": ["UNDERSTAND_REQUEST"]
            }

    return {
        "service": "unknown",
        "service_name": "Unknown Service",
        "current_step": "SERVICE_NOT_SUPPORTED",
        "completed_steps": ["UNDERSTAND_REQUEST"],
        "response": (
            "I currently support Income Certificate, Caste Certificate, "
            "Residence/Domicile Certificate, EWS Certificate, "
            "Birth Certificate and Scholarship Application."
        )
    }


def route_after_understanding(state: AgentState):
    if state.get("service") == "unknown":
        return "unsupported"

    return "continue"


def get_requirements(state: AgentState):
    service = state["service"]

    required_documents = check_requirements(service)

    return {
        "required_documents": required_documents,
        "current_step": "DOCUMENTS_PENDING",
        "completed_steps": state.get("completed_steps", []) + [
            "CHECK_REQUIREMENTS"
        ],
        "response": (
            f"Required document categories for "
            f"{get_service_name(service)} have been identified."
        )
    }


def validate_documents_node(state: AgentState):
    required_documents = state.get("required_documents", [])
    uploaded_documents = state.get("uploaded_documents", [])

    validation = validate_documents(
        required_documents,
        uploaded_documents
    )

    if validation["all_valid"]:
        current_step = "FORM_READY"

        response = (
            "All required document categories are satisfied. "
            "The application form is ready."
        )
    else:
        current_step = "DOCUMENTS_PENDING"

        missing = [
            item["label"]
            for item in validation["missing_documents"]
        ]

        response = (
            "The following documents are still required: "
            + ", ".join(missing)
        )

    return {
        "validated_documents": validation,
        "current_step": current_step,
        "completed_steps": state.get("completed_steps", []) + [
            "VALIDATE_DOCUMENTS"
        ],
        "response": response
    }


def route_after_validation(state: AgentState):
    if state.get("current_step") == "FORM_READY":
        return "continue"

    return "waiting"


def fill_form(state: AgentState):
    service_name = state.get(
        "service_name",
        get_service_name(state["service"])
    )

    user_details = state.get("user_details", {})

    form_data = {
        "service": service_name,
        **user_details
    }

    return {
        "form_data": form_data,
        "current_step": "FORM_FILLED",
        "completed_steps": state.get("completed_steps", []) + [
            "FILL_FORM"
        ],
        "response": (
            f"The {service_name} application form has been prepared. "
            "Your approval is required before submission."
        )
    }


def request_consent(state: AgentState):
    if state.get("consent_granted") is True:
        return {
            "current_step": "SUBMITTING",
            "completed_steps": state.get("completed_steps", []) + [
                "CONSENT_GRANTED"
            ],
            "response": (
                "Consent received. Submitting the application."
            )
        }

    return {
        "consent_required": True,
        "consent_action": "SUBMIT_APPLICATION",
        "consent_granted": False,
        "current_step": "WAITING_CONSENT",
        "completed_steps": state.get("completed_steps", []) + [
            "CONSENT_REQUESTED"
        ],
        "response": (
            "The application is ready for submission. "
            "Please explicitly approve the submission."
        )
    }


def submit_to_portal(state: AgentState):
    attempt = state.get("submission_attempts", 0) + 1
    mode = state.get("mock_portal_mode", "success")

    result = submit_application(
        state["form_data"],
        attempt,
        mode
    )

    if result["success"]:
        return {
            "application_id": result["application_id"],
            "application_status": "SUBMITTED",
            "submission_attempts": attempt,
            "current_step": "SUBMITTED",
            "completed_steps": state.get("completed_steps", []) + [
                "SUBMISSION_SUCCESS"
            ],
            "response": result["message"]
        }

    return {
        "submission_attempts": attempt,
        "retry_count": state.get("retry_count", 0) + 1,
        "last_error": result["error"],
        "application_status": "FAILED",
        "current_step": "RETRYING",
        "completed_steps": state.get("completed_steps", []) + [
            "SUBMISSION_FAILED"
        ],
        "response": (
            f"Submission failed: {result['error']}"
        )
    }


def handle_retry(state: AgentState):
    retry_count = state.get("retry_count", 0)

    if retry_count <= MAX_RETRIES:
        return {
            "current_step": "SUBMITTING",
            "response": (
                f"Retrying application submission "
                f"(attempt {retry_count + 1})."
            )
        }

    return {
        "escalated": True,
        "escalation_reason": state.get(
            "last_error",
            "Application submission failed repeatedly."
        ),
        "current_step": "HUMAN_ESCALATION",
        "application_status": "HUMAN_ESCALATION",
        "completed_steps": state.get("completed_steps", []) + [
            "HUMAN_ESCALATION"
        ],
        "response": (
            "The application could not be submitted after "
            "multiple attempts. A human helper is required."
        )
    }


def route_after_submission(state: AgentState):
    if state.get("current_step") == "SUBMITTED":
        return "done"

    return "retry"


def route_after_retry(state: AgentState):
    if state.get("current_step") == "HUMAN_ESCALATION":
        return "escalate"

    return "submit"


workflow = StateGraph(AgentState)

workflow.add_node(
    "understand_request",
    understand_request
)

workflow.add_node(
    "get_requirements",
    get_requirements
)

workflow.add_node(
    "validate_documents",
    validate_documents_node
)

workflow.add_node(
    "fill_form",
    fill_form
)

workflow.add_node(
    "request_consent",
    request_consent
)

workflow.add_node(
    "submit_to_portal",
    submit_to_portal
)

workflow.add_node(
    "handle_retry",
    handle_retry
)

workflow.add_edge(
    START,
    "understand_request"
)

workflow.add_conditional_edges(
    "understand_request",
    route_after_understanding,
    {
        "continue": "get_requirements",
        "unsupported": END
    }
)

workflow.add_edge(
    "get_requirements",
    "validate_documents"
)

workflow.add_conditional_edges(
    "validate_documents",
    route_after_validation,
    {
        "continue": "fill_form",
        "waiting": END
    }
)

workflow.add_edge(
    "fill_form",
    "request_consent"
)

workflow.add_conditional_edges(
    "request_consent",
    lambda state: (
        "submit"
        if state.get("consent_granted") is True
        else "wait"
    ),
    {
        "submit": "submit_to_portal",
        "wait": END
    }
)

workflow.add_conditional_edges(
    "submit_to_portal",
    route_after_submission,
    {
        "done": END,
        "retry": "handle_retry"
    }
)

workflow.add_conditional_edges(
    "handle_retry",
    route_after_retry,
    {
        "submit": "submit_to_portal",
        "escalate": END
    }
)

agent = workflow.compile()