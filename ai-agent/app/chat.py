import os
import re

from app.graph import agent
from app.tools.audit import (
    add_audit_event,
    create_audit_log,
    print_audit_log,
    save_audit_log
)
from app.tools.documents import validate_uploaded_files
from app.tools.status import get_application_status


USER_ID = "terminal_user"


CONSENT_MESSAGES = {
    "yes",
    "yes submit",
    "submit",
    "submit it",
    "go ahead",
    "approve",
    "approved"
}


APPLICATION_ID_PATTERN = re.compile(
    r"\b(?:APP|INC|CAST|RES|EWS|BIRTH|SCH)-\d{4}-\d{6}\b",
    re.IGNORECASE
)


def clean_file_path(
    message: str
) -> str:

    path = message.strip()

    if (
        len(path) >= 2
        and path[0] == path[-1]
        and path[0] in {
            "\"",
            "'"
        }
    ):

        path = path[1:-1].strip()

    return path


def resolve_file_path(
    message: str
) -> str:

    path = clean_file_path(
        message
    )

    if os.path.isfile(
        path
    ):

        return os.path.abspath(
            path
        )

    project_relative = os.path.join(
        os.getcwd(),
        path
    )

    if os.path.isfile(
        project_relative
    ):

        return os.path.abspath(
            project_relative
        )

    documents_relative = os.path.join(
        os.getcwd(),
        "documents",
        os.path.basename(
            path
        )
    )

    if os.path.isfile(
        documents_relative
    ):

        return os.path.abspath(
            documents_relative
        )

    return ""


def is_file_path(
    message: str
) -> bool:

    return bool(
        resolve_file_path(
            message
        )
    )


def extract_application_id(
    message: str
) -> str | None:

    match = APPLICATION_ID_PATTERN.search(
        message
    )

    if not match:
        return None

    return match.group(
        0
    ).upper()


def print_application_status(
    application: dict
):

    print()
    print(
        "================================================="
    )
    print(
        "             APPLICATION STATUS"
    )
    print(
        "================================================="
    )

    print(
        "Application ID:",
        application.get(
            "application_id"
        )
    )

    print(
        "Service:",
        application.get(
            "service_name"
        )
    )

    print(
        "Applicant:",
        application.get(
            "applicant_name"
        )
    )

    print(
        "Submitted At:",
        application.get(
            "submitted_at"
        )
    )

    print(
        "Current Status:",
        application.get(
            "status"
        )
    )

    history = application.get(
        "status_history",
        []
    )

    if history:

        print()
        print(
            "Status History:"
        )

        for item in history:

            print(
                f"  {item.get('timestamp')} "
                f"→ {item.get('status')}"
            )

    print(
        "================================================="
    )
    print()


def check_status_request(
    message: str
) -> bool:

    message_lower = message.lower()

    return (
        "status" in message_lower
        or "track" in message_lower
        or "application" in message_lower
    )


def add_document(
    state: dict,
    file_path: str
) -> dict:

    file_path = resolve_file_path(
        file_path
    )

    if not file_path:

        return state

    result = validate_uploaded_files(
        [file_path]
    )

    if not result[
        "detected_documents"
    ]:

        invalid = result[
            "invalid_documents"
        ]

        if invalid:

            error = invalid[0].get(
                "error",
                "The document could not be validated."
            )

        else:

            error = (
                "The document could not be validated."
            )

        print()
        print(
            "Aavedan+: Document validation failed."
        )
        print(
            "Reason:",
            error
        )
        print()

        state[
            "audit_log"
        ] = add_audit_event(
            state.get(
                "audit_log",
                []
            ),
            "DOCUMENT_VALIDATION_FAILED",
            USER_ID,
            {
                "file":
                    os.path.basename(
                        file_path
                    ),
                "error":
                    error
            }
        )

        save_audit_log(
            USER_ID,
            state[
                "audit_log"
            ]
        )

        return state

    document = result[
        "detected_documents"
    ][0]

    document_type = document[
        "document_type"
    ]

    uploaded_documents = list(
        state.get(
            "uploaded_documents",
            []
        )
    )

    uploaded_file_paths = list(
        state.get(
            "uploaded_file_paths",
            []
        )
    )

    if document_type not in uploaded_documents:

        uploaded_documents.append(
            document_type
        )

    if file_path not in uploaded_file_paths:

        uploaded_file_paths.append(
            file_path
        )

    state[
        "uploaded_documents"
    ] = uploaded_documents

    state[
        "uploaded_file_paths"
    ] = uploaded_file_paths

    state[
        "audit_log"
    ] = add_audit_event(
        state.get(
            "audit_log",
            []
        ),
        "DOCUMENT_VALIDATED",
        USER_ID,
        {
            "file":
                document[
                    "file"
                ],
            "document_type":
                document_type
        }
    )

    save_audit_log(
        USER_ID,
        state[
            "audit_log"
        ]
    )

    return state


def invoke_agent(
    state: dict
) -> dict:

    audit_log = list(
        state.get(
            "audit_log",
            []
        )
    )

    result = agent.invoke(
        state
    )

    result[
        "audit_log"
    ] = audit_log

    return result


def print_form_preview(
    result: dict
):

    form_data = result.get(
        "form_data"
    )

    if not form_data:
        return

    fields = form_data.get(
        "fields",
        {}
    )

    if not fields:
        return

    print()
    print(
        "--------------- APPLICATION FORM ---------------"
    )

    for field in fields.values():

        label = field.get(
            "label",
            ""
        )

        value = field.get(
            "value"
        )

        status = field.get(
            "status",
            "MISSING"
        )

        if value:

            print(
                f"{label}: {value} [{status}]"
            )

        else:

            print(
                f"{label}: Not available [{status}]"
            )

    print(
        "-------------------------------------------------"
    )
    print()


def print_response(
    result: dict
):

    print()
    print(
        "Aavedan+:",
        result.get(
            "response",
            ""
        )
    )
    print()

    print_form_preview(
        result
    )

    if result.get(
        "application_id"
    ):

        print(
            "Application ID:",
            result[
                "application_id"
            ]
        )

    if result.get(
        "application_status"
    ):

        print(
            "Status:",
            result[
                "application_status"
            ]
        )

    print()


def main():

    state = {
        "user_id":
            USER_ID,
        "uploaded_documents":
            [],
        "uploaded_file_paths":
            [],
        "completed_steps":
            [],
        "audit_log":
            create_audit_log(
                USER_ID
            )
    }

    save_audit_log(
        USER_ID,
        state[
            "audit_log"
        ]
    )

    print(
        "=" * 50
    )

    print(
        "        AAVEDAN+ AI AGENT"
    )

    print(
        "=" * 50
    )

    print(
        "Type 'exit' to close."
    )

    print(
        "You can also check status using an Application ID."
    )

    print()

    while True:

        try:

            message = input(
                "You: "
            ).strip()

        except (
            KeyboardInterrupt,
            EOFError
        ):

            print(
                "\nExiting..."
            )

            break

        if not message:
            continue

        if message.lower() == "exit":

            print(
                "Aavedan+: Goodbye!"
            )

            break

        application_id = (
            extract_application_id(
                message
            )
        )

        if (
            application_id
            and check_status_request(
                message
            )
        ):

            application = get_application_status(
                application_id
            )

            if application:

                print_application_status(
                    application
                )

                state[
                    "audit_log"
                ] = add_audit_event(
                    state.get(
                        "audit_log",
                        []
                    ),
                    "APPLICATION_STATUS_VIEWED",
                    USER_ID,
                    {
                        "application_id":
                            application_id,
                        "status":
                            application.get(
                                "status"
                            )
                    }
                )

            else:

                print()
                print(
                    "Aavedan+: I could not find an application "
                    f"with ID {application_id}."
                )
                print()

            save_audit_log(
                USER_ID,
                state[
                    "audit_log"
                ]
            )

            continue

        if is_file_path(
            message
        ):

            previous_step = state.get(
                "current_step"
            )

            state = add_document(
                state,
                message
            )

            state[
                "user_message"
            ] = (
                "The user uploaded a document."
            )

            result = invoke_agent(
                state
            )

            state = result

            if (
                previous_step
                != result.get(
                    "current_step"
                )
            ):

                state[
                    "audit_log"
                ] = add_audit_event(
                    state.get(
                        "audit_log",
                        []
                    ),
                    "WORKFLOW_STEP_CHANGED",
                    USER_ID,
                    {
                        "previous_step":
                            previous_step,
                        "current_step":
                            result.get(
                                "current_step"
                            )
                    }
                )

            save_audit_log(
                USER_ID,
                state[
                    "audit_log"
                ]
            )

            file_name = os.path.basename(
                clean_file_path(
                    message
                )
            )

            document_type = None

            matched_documents = (
                result.get(
                    "validated_documents",
                    {}
                ).get(
                    "matched_documents",
                    {}
                )
            )

            for document in (
                matched_documents.values()
            ):

                if document.get(
                    "document"
                ):

                    document_type = (
                        document.get(
                            "document"
                        )
                    )

            if document_type:

                print()
                print(
                    f"Aavedan+: {file_name} "
                    f"received and identified as "
                    f"{document_type.replace('_', ' ').title()}."
                )

            print_response(
                result
            )

            continue

        state[
            "user_message"
        ] = message

        consent_given = (
            state.get(
                "current_step"
            ) == "WAITING_CONSENT"
            and message.lower()
            in CONSENT_MESSAGES
        )

        if consent_given:

            state[
                "consent_granted"
            ] = True

            state[
                "audit_log"
            ] = add_audit_event(
                state.get(
                    "audit_log",
                    []
                ),
                "USER_CONSENT_GRANTED",
                USER_ID,
                {
                    "action":
                        "SUBMIT_APPLICATION",
                    "service":
                        state.get(
                            "service_name",
                            "Government Service"
                        ),
                    "user_confirmation":
                        message
                }
            )

            save_audit_log(
                USER_ID,
                state[
                    "audit_log"
                ]
            )

        result = invoke_agent(
            state
        )

        state = result

        if (
            result.get(
                "application_status"
            ) == "SUBMITTED"
            and result.get(
                "application_id"
            )
        ):

            state[
                "audit_log"
            ] = add_audit_event(
                state.get(
                    "audit_log",
                    []
                ),
                "APPLICATION_SUBMITTED",
                USER_ID,
                {
                    "service":
                        result.get(
                            "service_name"
                        ),
                    "application_id":
                        result.get(
                            "application_id"
                        ),
                    "status":
                        result.get(
                            "application_status"
                        )
                }
            )

            save_audit_log(
                USER_ID,
                state[
                    "audit_log"
                ]
            )

            print_response(
                result
            )

            print_audit_log(
                state[
                    "audit_log"
                ]
            )

            continue

        save_audit_log(
            USER_ID,
            state[
                "audit_log"
            ]
        )

        print_response(
            result
        )


if __name__ == "__main__":
    main()