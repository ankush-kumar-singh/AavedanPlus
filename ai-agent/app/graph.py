import logging
import re

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
from app.tools.documents import DOCUMENT_ALIASES, normalize_text, validate_documents
from app.tools.submission import submit_application
from app.tools.forms import fill_form as build_form
from app.tools.document_extractor import (
    extract_data_from_documents
)


MAX_RETRIES = 2
logger = logging.getLogger(__name__)


def mentions_unconfigured_document(response: str, state: AgentState) -> bool:
    if state.get("current_step") != "DOCUMENTS_PENDING":
        return False

    validation = state.get("validated_documents", {})
    allowed_types = {
        document_type
        for item in validation.get("missing_documents", [])
        if isinstance(item, dict)
        for document_type in item.get("accepted_documents", [])
    }
    allowed_types.update(state.get("uploaded_documents", []))
    if state.get("service"):
        allowed_types.add(state["service"])

    normalized_response = re.sub(
        r"[^a-z0-9]+",
        " ",
        normalize_text(response),
    ).strip()
    padded_response = f" {normalized_response} "

    for document_type, aliases in DOCUMENT_ALIASES.items():
        if document_type in allowed_types:
            continue
        for alias in aliases:
            normalized_alias = re.sub(
                r"[^a-z0-9]+",
                " ",
                normalize_text(alias),
            ).strip()
            if len(normalized_alias) < 3:
                continue
            if f" {normalized_alias} " in padded_response:
                return True

    return False


def clean_llm_response(
    response: str
) -> str:

    response = response.strip()

    if (
        "<think>" in response
        and "</think>" in response
    ):

        response = response.split(
            "</think>",
            1
        )[1].strip()

    return response


def generate_natural_response(
    state: AgentState,
    fallback: str
) -> str:

    if state.get("current_step") == "FORM_INCOMPLETE":
        return fallback

    validation = state.get("validated_documents", {})
    missing_document_guidance = [
        {
            "requirement": item.get("label"),
            "choose_one_of": [
                document_type.replace("_", " ").title()
                for document_type in item.get("accepted_documents", [])
            ],
        }
        for item in validation.get("missing_documents", [])
        if isinstance(item, dict) and item.get("label")
    ]
    form_fields = state.get("form_data", {}).get("fields", {})
    missing_required_fields = [
        field.get("label", key.replace("_", " ").title())
        for key, field in form_fields.items()
        if field.get("required", True) and not str(field.get("value") or "").strip()
    ]

    state_summary = {
        "service": state.get(
            "service"
        ),
        "service_name": state.get(
            "service_name"
        ),
        "current_step": state.get(
            "current_step"
        ),
        "recent_conversation": state.get(
            "conversation_history",
            []
        )[-8:],
        "required_documents": state.get(
            "required_documents",
            []
        ),
        "validated_documents": state.get(
            "validated_documents",
            {}
        ),
        "missing_required_document_guidance": missing_document_guidance,
        "missing_required_fields": missing_required_fields,
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
    user_message=state.get(
        "user_message",
        ""
    )
)}

Use the verified state to answer the citizen's latest message directly.
Write a natural response in your own words; do not copy a canned template.
If the state does not answer the question, say what is unknown and ask a
useful follow-up instead of guessing.

Never invent government services, documents, requirements,
application IDs, statuses, or user information.
Only use information present in the verified state.
"""

    try:

        response = llm.invoke(
            prompt
        )

        content = clean_llm_response(
            response.content
        )

        if content:

            if mentions_unconfigured_document(content, state):
                logger.warning(
                    "Discarding a documents-pending response that mentioned an unconfigured document type"
                )
                return fallback

            return content

    except Exception:
        logger.exception("Natural-language response generation failed; using safe fallback")
        pass

    return fallback


def understand_request(
    state: AgentState
):

    existing_service = state.get(
        "service"
    )

    if existing_service in get_supported_services():

        return {
            "service":
                existing_service,

            "service_name":
                get_service_name(
                    existing_service
                ),

            "current_step":
                state.get(
                    "current_step",
                    "SERVICE_IDENTIFIED"
                ),

            "completed_steps":
                state.get(
                    "completed_steps",
                    []
                )
        }

    user_message = state.get(
        "user_message",
        ""
    )

    supported_services = "\n".join(
        f"- {service_id}: {name}"
        for service_id, name
        in get_supported_services().items()
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

        response = llm.invoke(
            prompt
        )

        service = clean_llm_response(
            response.content
        ).lower()

    except Exception:

        service = "unknown"

    for service_id in get_supported_services():

        if service_id in service:

            return {
                "service":
                    service_id,

                "service_name":
                    get_service_name(
                        service_id
                    ),

                "current_step":
                    "SERVICE_IDENTIFIED",

                "completed_steps": [
                    "UNDERSTAND_REQUEST"
                ]
            }

    return {
        "service":
            "unknown",

        "service_name":
            "Unknown Service",

        "current_step":
            "SERVICE_NOT_SUPPORTED",

        "completed_steps": [
            "UNDERSTAND_REQUEST"
        ]
    }


def route_after_understanding(
    state: AgentState
):

    if state.get("current_step") in {
        "SUBMITTED",
        "HUMAN_ESCALATION"
    }:

        return "terminal"

    if state.get(
        "service"
    ) == "unknown":

        return "unsupported"

    return "continue"


def get_requirements(
    state: AgentState
):

    service = state[
        "service"
    ]

    required_documents = check_requirements(
        service
    )

    return {
        "required_documents":
            required_documents,

        "current_step":
            "DOCUMENTS_PENDING",

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "CHECK_REQUIREMENTS"
            ]
        )
    }


def validate_documents_node(
    state: AgentState
):

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

    if validation[
        "all_valid"
    ]:

        current_step = (
            "FORM_READY"
        )

    else:

        current_step = (
            "DOCUMENTS_PENDING"
        )

    return {
        "validated_documents":
            validation,

        "current_step":
            current_step,

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "VALIDATE_DOCUMENTS"
            ]
        )
    }


def route_after_validation(
    state: AgentState
):

    if state.get(
        "current_step"
    ) == "FORM_READY":

        return "continue"

    return "waiting"


def extract_document_data_node(
    state: AgentState
):

    uploaded_file_paths = state.get(
        "uploaded_file_paths",
        []
    )

    if not uploaded_file_paths:

        return {
            "extracted_data": {}
        }

    extracted_data = (
        extract_data_from_documents(
            uploaded_file_paths
        )
    )

    return {
        "extracted_data":
            extracted_data,

        "current_step":
            "DATA_EXTRACTED",

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "EXTRACT_DOCUMENT_DATA"
            ]
        )
    }


def fill_form(
    state: AgentState
):

    service = state[
        "service"
    ]

    extracted_data = state.get(
        "extracted_data",
        {}
    )

    form_data = build_form(
        service,
        extracted_data
    )

    previous_form = state.get("form_data", {})
    if previous_form.get("service") == service:
        previous_fields = previous_form.get("fields", {})
        for field_key, field in form_data.get("fields", {}).items():
            previous_field = previous_fields.get(field_key, {})
            if previous_field.get("status") == "USER_PROVIDED":
                field["value"] = previous_field.get("value")
                field["status"] = "USER_PROVIDED"

    missing_required_fields = [
        field_key
        for field_key, field in form_data.get("fields", {}).items()
        if field.get("required", True) and not str(field.get("value") or "").strip()
    ]

    return {
        "form_data":
            form_data,

        "current_step":
            "FORM_INCOMPLETE" if missing_required_fields else "FORM_FILLED",

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "FILL_FORM"
            ]
        )
    }


def route_after_fill_form(state: AgentState):
    if state.get("current_step") == "FORM_INCOMPLETE":
        return "incomplete"
    return "consent"


def request_consent(
    state: AgentState
):

    if state.get(
        "consent_granted"
    ) is True:

        return {
            "current_step":
                "SUBMITTING",

            "completed_steps": (
                state.get(
                    "completed_steps",
                    []
                )
                + [
                    "CONSENT_GRANTED"
                ]
            )
        }

    return {
        "consent_required":
            True,

        "consent_action":
            "SUBMIT_APPLICATION",

        "consent_granted":
            False,

        "current_step":
            "WAITING_CONSENT",

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "CONSENT_REQUESTED"
            ]
        )
    }


def route_after_consent(
    state: AgentState
):

    if state.get(
        "consent_granted"
    ) is True:

        return "submit"

    return "wait"


def submit_to_portal(
    state: AgentState
):

    attempt = (
        state.get(
            "submission_attempts",
            0
        )
        + 1
    )

    mode = state.get(
        "mock_portal_mode",
        "success"
    )

    result = submit_application(
        state[
            "form_data"
        ],
        attempt,
        mode
    )

    if result[
        "success"
    ]:

        return {
            "application_id":
                result[
                    "application_id"
                ],

            "application_status":
                "SUBMITTED",

            "submitted_at":
                result.get("submitted_at"),

            "submission_attempts":
                attempt,

            "current_step":
                "SUBMITTED",

            "completed_steps": (
                state.get(
                    "completed_steps",
                    []
                )
                + [
                    "SUBMISSION_SUCCESS"
                ]
            )
        }

    return {
        "submission_attempts":
            attempt,

        "retry_count": (
            state.get(
                "retry_count",
                0
            )
            + 1
        ),

        "last_error":
            result[
                "error"
            ],

        "application_status":
            "FAILED",

        "current_step":
            "RETRYING",

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "SUBMISSION_FAILED"
            ]
        )
    }


def handle_retry(
    state: AgentState
):

    retry_count = state.get(
        "retry_count",
        0
    )

    if retry_count <= MAX_RETRIES:

        return {
            "current_step":
                "SUBMITTING"
        }

    return {
        "escalated":
            True,

        "escalation_reason":
            state.get(
                "last_error",
                "Application submission failed repeatedly."
            ),

        "current_step":
            "HUMAN_ESCALATION",

        "application_status":
            "HUMAN_ESCALATION",

        "completed_steps": (
            state.get(
                "completed_steps",
                []
            )
            + [
                "HUMAN_ESCALATION"
            ]
        )
    }


def route_after_submission(
    state: AgentState
):

    if state.get(
        "current_step"
    ) == "SUBMITTED":

        return "done"

    return "retry"


def route_after_retry(
    state: AgentState
):

    if state.get(
        "current_step"
    ) == "HUMAN_ESCALATION":

        return "escalate"

    return "submit"


def generate_response(
    state: AgentState
):

    current_step = state.get(
        "current_step"
    )

    service_name = state.get(
        "service_name",
        "application"
    )

    if current_step == (
        "SERVICE_NOT_SUPPORTED"
    ):

        fallback = (
            "I'm sorry, but I don't currently "
            "support that government service. "
            "I can currently help with Income "
            "Certificate, Caste Certificate, "
            "Residence/Domicile Certificate, "
            "EWS Certificate, Birth Certificate, "
            "and Scholarship applications."
        )

    elif current_step == (
        "DOCUMENTS_PENDING"
    ):

        missing = [
            item[
                "label"
            ]
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
                f"For your {service_name}, "
                "I still need: "
                + ", ".join(
                    missing
                )
                + ". "
                "Please provide the next document."
            )

        else:

            fallback = (
                f"For your {service_name}, "
                "some required documents are still "
                "missing. Please provide the next document."
            )

    elif current_step == (
        "WAITING_CONSENT"
    ):

        fallback = (
            f"All required documents for your "
            f"{service_name} match the example requirements. "
            "Your demo form is ready. If you approve, this prototype will save "
            "a local demo record; it will not contact a government agency. "
            "Reply YES if you want to continue."
        )

    elif current_step == (
        "SUBMITTED"
    ):

        fallback = (
            f"A local demo record for your {service_name} was saved. "
            "This is not an official application. Your demo reference is "
            f"{state.get('application_id')}."
        )

    elif current_step == (
        "RETRYING"
    ):

        fallback = (
            "The local demo portal simulated a temporary failure. I'll retry "
            "saving the demo record automatically. No government service was contacted."
        )

    elif current_step == (
        "HUMAN_ESCALATION"
    ):

        fallback = (
            "I couldn't save the demo record after multiple attempts. No "
            "government application was submitted and no human helper was contacted. "
            "You can review the form and try again later."
        )

    elif current_step == (
        "FORM_READY"
    ):

        fallback = (
            f"The uploaded PDFs for your {service_name} match the example "
            "document types and passed readability checks. "
            "I'm preparing your application form."
        )

    elif current_step == (
        "DATA_EXTRACTED"
    ):

        fallback = (
            f"I've extracted available information "
            f"from the uploaded documents for the "
            f"{service_name}. I'm preparing the form."
        )

    elif current_step == (
        "FORM_FILLED"
    ):

        fallback = (
            f"Your {service_name} demo form "
            "has been prepared and is ready for your review."
        )

    elif current_step == "FORM_INCOMPLETE":
        form_fields = state.get("form_data", {}).get("fields", {})
        missing_fields = [
            field.get("label", key.replace("_", " ").title())
            for key, field in form_fields.items()
            if field.get("required", True) and not str(field.get("value") or "").strip()
        ]
        if missing_fields:
            fallback = (
                f"I prepared your {service_name} form in this chat. I could not read "
                f"{missing_fields[0]} from the documents. Please tell me just that detail here. "
                "I will ask for another required detail only if one remains; optional fields can be left blank."
            )
        else:
            fallback = f"Your {service_name} form is ready to review in this chat."

    else:

        fallback = (
            f"I'm ready to continue preparing your "
            f"{service_name} demo application."
        )

    response = generate_natural_response(
        state,
        fallback
    )

    return {
        "response":
            response
    }


workflow = StateGraph(
    AgentState
)


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
    "extract_document_data",
    extract_document_data_node
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
        "continue":
            "get_requirements",

        "unsupported":
            "generate_response",

        "terminal":
            "generate_response"
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
        "continue":
            "extract_document_data",

        "waiting":
            "generate_response"
    }
)


workflow.add_edge(
    "extract_document_data",
    "fill_form"
)


workflow.add_conditional_edges(
    "fill_form",
    route_after_fill_form,
    {
        "consent": "request_consent",
        "incomplete": "generate_response",
    }
)


workflow.add_conditional_edges(
    "request_consent",
    route_after_consent,
    {
        "submit":
            "submit_to_portal",

        "wait":
            "generate_response"
    }
)


workflow.add_conditional_edges(
    "submit_to_portal",
    route_after_submission,
    {
        "done":
            "generate_response",

        "retry":
            "handle_retry"
    }
)


workflow.add_conditional_edges(
    "handle_retry",
    route_after_retry,
    {
        "submit":
            "submit_to_portal",

        "escalate":
            "generate_response"
    }
)


workflow.add_edge(
    "generate_response",
    END
)


agent = workflow.compile()
