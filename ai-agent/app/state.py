from typing import TypedDict


class AgentState(TypedDict, total=False):
    user_id: str
    user_message: str

    service: str
    service_name: str

    application_id: str
    application_status: str

    required_documents: list
    uploaded_documents: list
    validated_documents: dict

    form_data: dict
    user_details: dict

    consent_required: bool
    consent_action: str
    consent_granted: bool

    current_step: str
    completed_steps: list

    retry_count: int
    submission_attempts: int
    last_error: str

    escalated: bool
    escalation_reason: str

    mock_portal_mode: str

    response: str