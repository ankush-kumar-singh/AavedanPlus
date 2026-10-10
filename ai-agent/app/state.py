from typing import TypedDict


class AgentState(TypedDict, total=False):
    user_id: str
    user_message: str
    conversation_history: list

    service: str
    service_name: str

    application_id: str
    application_status: str

    required_documents: list
    uploaded_documents: list
    uploaded_document_records: list
    uploaded_file_paths: list
    validated_documents: dict

    extracted_data: dict

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

    audit_log: list

    response: str
