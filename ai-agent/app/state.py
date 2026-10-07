from typing import TypedDict


class AgentState(TypedDict, total=False):
    # User input
    user_id: str
    user_message: str

    # Government service
    service: str

    # Application details
    application_id: str
    application_status: str

    # Document tracking
    required_documents: list[str]
    uploaded_documents: list[str]
    validated_documents: dict

    # Data extracted for the application form
    form_data: dict

    # User approval for sensitive actions
    consent_required: bool
    consent_action: str
    consent_granted: bool

    # Current position in the agent workflow
    current_step: str
    completed_steps: list[str]

    # Retry and error handling
    retry_count: int
    last_error: str

    # Human assistance when the agent cannot continue
    escalated: bool
    escalation_reason: str

    # Final message returned to the user
    response: str