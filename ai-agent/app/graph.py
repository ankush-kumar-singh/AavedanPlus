from langgraph.graph import StateGraph, START, END

from app.state import AgentState
from app.services.llm import llm
from app.prompts import (
    AGENT_SYSTEM_PROMPT,
    CONVERSATION_PROMPT
)
from app.tools.requirements import (
    check_requirements,
    get_service_name,
    get_supported_services
)
from app.tools.documents import validate_documents
from app.tools.submission import submit_application


MAX_RETRIES = 2


def clean_llm_response(response: str) -> str:
    response = response.strip()

    if "<think>" in response and "</think>" in response:
        response = response.split("</think>", 1)[1].strip()

    return response


def generate_natural_response(
    state: AgentState,
    fallback: str
) -> str:

    state_summary = {
        "service": state.get("service"),
        "service_name": state.get("service_name"),
        "current_step": state.get("current_step"),
        "required_documents": state.get("required_documents", []),
        "validated_documents": state.get(
            "validated_documents",
            {}
        ),
        "application_status": state.get(
            "application_status"
        ),
        "application_id": state.get(
            "application_id"
        ),
        "consent_required": state.get(
            "consent_required",
            False
        ),
        "consent_granted": state.get(
            "consent_granted",
            False
        ),
        "submission_attempts": state.get(
            "submission_attempts",
            0
        ),
        "retry_count": state.get(
            "retry_count",
            0
        ),
        "last_error": state.get(
            "last_error"
        ),
        "escalated": state.get(
            "escalated",
            False
        ),
        "escalation_reason": state.get(
            "escalation_reason"
        )
    }

    prompt = f"""
{AGENT_SYSTEM_PROMPT}

{CONVERSATION_PROMPT.format(
    state=state_summary,
    user_message=state.get("user_message", "")
)}

If the verified state is insufficient to safely generate a response,
use this fallback message:

{fallback}
"""

    try:
        response = llm.invoke(prompt)

        content = clean_llm_response(
            response.content
        )

        if content:
            return content

    except Exception:
        pass

    return fallback


def understand_request(state: AgentState):

    if state.get("service"):
        service = state["service"]

        if service in get_supported_services():
            return {
                "service": service,
                "service_name": get_service_name(service),
                "current_step": "SERVICE_IDENTIFIED",
                "completed_steps": [
                    "UNDERSTAND_REQUEST"
                ]
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

Return ONLY one service ID from the supported list.

If no supported service matches, return:

unknown
"""

    try:
        response = llm.invoke(prompt)

        service = clean_llm_response(
            response.content
        ).lower()

    except Exception:
        service = "unknown"

    for service_id in get_supported_services():
        if service_id in service:
            return {
                "service": service_id,
                "service_name": get_service_name(
                    service_id
                ),
                "current_step": "SERVICE_IDENTIFIED",
                "completed_steps": [
                    "UNDERSTAND_REQUEST"
                ]
            }

    return {
        "service": "unknown",
        "service_name": "Unknown Service",
        "current_step": "SERVICE_NOT_SUPPORTED",
        "completed_steps": [
            "UNDERSTAND_REQUEST"
        ]
    }


def route_after_understanding(state: AgentState):

    if state.get("service") == "unknown":
        return "unsupported"

    return "continue"


def get_requirements(state: AgentState):

    service = state["service"]

    required_documents = check_requirements(
        service
    )

    return {
        "required_documents": required_documents,
        "current_step": "DOCUMENTS_PENDING",
        "completed_steps": (
            state.get("completed_steps", [])
            + ["CHECK_REQUIREMENTS"]
        )
    }


def validate_documents_node(state: AgentState):

    required_documents = state.get(
        "required_documents",
        []
    )

    uploaded_documents = state.get(
        "uploaded_documents",
        []
    )

    validation = validate_documents(
        required_documents,
        uploaded_documents
    )

    if validation["all_valid"]:
        current_step = "FORM_READY"

    else:
        current_step = "DOCUMENTS_PENDING"

    return {
        "validated_documents": validation,
        "current_step": current_step,
        "completed_steps": (
            state.get("completed_steps", [])
            + ["VALIDATE_DOCUMENTS"]
        )
    }


def route_after_validation(state: AgentState):

    if state.get("current_step") == "FORM_READY":
        return "continue"

    return "waiting"


def fill_form(state: AgentState):

    service = state["service"]

    service_name = state.get(
        "service_name",
        get_service_name(service)
    )

    user_details = state.get(
        "user_details",
        {}
    )

    form_data = {
        "service_id": service,
        "service": service_name,
        **user_details
    }

    return {
        "form_data": form_data,
        "current_step": "FORM_FILLED",
        "completed_steps": (
            state.get("completed_steps", [])
            + ["FILL_FORM"]
        )
    }


def request_consent(state: AgentState):

    if state.get("consent_granted") is True:
        return {
            "current_step": "SUBMITTING",
            "completed_steps": (
                state.get("completed_steps", [])
                + ["CONSENT_GRANTED"]
            )
        }

    return {
        "consent_required": True,
        "consent_action": "SUBMIT_APPLICATION",
        "consent_granted": False,
        "current_step": "WAITING_CONSENT",
        "completed_steps": (
            state.get("completed_steps", [])
            + ["CONSENT_REQUESTED"]
        )
    }


def route_after_consent(state: AgentState):

    if state.get("consent_granted") is True:
        return "submit"

    return "wait"


def submit_to_portal(state: AgentState):

    attempt = (
        state.get("submission_attempts", 0)
        + 1
    )

    mode = state.get(
        "mock_portal_mode",
        "success"
    )

    result = submit_application(
        state["form_data"],
        attempt,
        mode
    )

    if result["success"]:

        return {
            "application_id": result[
                "application_id"
            ],
            "application_status": "SUBMITTED",
            "submission_attempts": attempt,
            "current_step": "SUBMITTED",
            "completed_steps": (
                state.get("completed_steps", [])
                + ["SUBMISSION_SUCCESS"]
            )
        }

    return {
        "submission_attempts": attempt,
        "retry_count": (
            state.get("retry_count", 0)
            + 1
        ),
        "last_error": result["error"],
        "application_status": "FAILED",
        "current_step": "RETRYING",
        "completed_steps": (
            state.get("completed_steps", [])
            + ["SUBMISSION_FAILED"]
        )
    }


def handle_retry(state: AgentState):

    retry_count = state.get(
        "retry_count",
        0
    )

    if retry_count <= MAX_RETRIES:
        return {
            "current_step": "SUBMITTING"
        }

    return {
        "escalated": True,
        "escalation_reason": state.get(
            "last_error",
            "Application submission failed repeatedly."
        ),
        "current_step": "HUMAN_ESCALATION",
        "application_status": "HUMAN_ESCALATION",
        "completed_steps": (
            state.get("completed_steps", [])
            + ["HUMAN_ESCALATION"]
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


def generate_response(state: AgentState):

    current_step = state.get(
        "current_step"
    )

    if current_step == "SERVICE_NOT_SUPPORTED":

        fallback = (
            "I'm sorry, but I don't currently support "
            "that government service. I can currently "
            "help with Income Certificate, Caste Certificate, "
            "Residence/Domicile Certificate, EWS Certificate, "
            "Birth Certificate, and Scholarship applications."
        )

    elif current_step == "DOCUMENTS_PENDING":

        missing = [
            item["label"]
            for item in state.get(
                "validated_documents",
                {}
            ).get(
                "missing_documents",
                []
            )
        ]

        if missing:
            fallback = (
                "Your application is not ready yet. "
                "I still need: "
                + ", ".join(missing)
                + "."
            )
        else:
            fallback = (
                "I still need some required documents "
                "before we can continue."
            )

    elif current_step == "WAITING_CONSENT":

        fallback = (
            f"I've checked your documents for the "
            f"{state.get('service_name', 'application')}. "
            "All required documents are available. "
            "Your application is ready for submission. "
            "Would you like me to submit it?"
        )

    elif current_step == "SUBMITTED":

        fallback = (
            f"Your {state.get('service_name', 'application')} "
            "has been submitted successfully. "
            f"Your application ID is "
            f"{state.get('application_id')}."
        )

    elif current_step == "RETRYING":

        fallback = (
            "The government portal is temporarily unavailable. "
            "I'll retry the submission automatically."
        )

    elif current_step == "HUMAN_ESCALATION":

        fallback = (
            "I couldn't complete the submission after "
            "multiple attempts. I'm escalating this "
            "application to a human helper."
        )

    else:

        fallback = (
            "I've processed your request and I'm ready "
            "to continue with your application."
        )

    response = generate_natural_response(
        state,
        fallback
    )

    return {
        "response": response
    }


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

workflow.add_node(
    "generate_response",
    generate_response
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
        "unsupported": "generate_response"
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
        "waiting": "generate_response"
    }
)


workflow.add_edge(
    "fill_form",
    "request_consent"
)


workflow.add_conditional_edges(
    "request_consent",
    route_after_consent,
    {
        "submit": "submit_to_portal",
        "wait": "generate_response"
    }
)


workflow.add_conditional_edges(
    "submit_to_portal",
    route_after_submission,
    {
        "done": "generate_response",
        "retry": "handle_retry"
    }
)


workflow.add_conditional_edges(
    "handle_retry",
    route_after_retry,
    {
        "submit": "submit_to_portal",
        "escalate": "generate_response"
    }
)


workflow.add_edge(
    "generate_response",
    END
)


agent = workflow.compile()