from datetime import datetime
from app.tools.record_store import (
    APPLICATION_DB,
    RECORDS_LOCK as SUBMISSION_LOCK,
    load_application_records,
    save_application_records,
)


SERVICE_PREFIXES = {
    "income_certificate": "INC",
    "caste_certificate": "CAST",
    "residence_certificate": "RES",
    "ews_certificate": "EWS",
    "birth_certificate": "BIRTH",
    "scholarship": "SCH"
}


def generate_application_id(
    service: str,
    sequence: int
) -> str:

    prefix = SERVICE_PREFIXES.get(
        service,
        "APP"
    )

    year = datetime.now().year

    return f"{prefix}-{year}-{sequence:06d}"


def save_successful_submission(
    form_data: dict,
    service: str
) -> str:
    """Allocate and persist a unique ID for this mock portal process."""
    with SUBMISSION_LOCK:
        records = load_application_records()
        year = datetime.now().year
        used_sequences = []

        for record in records:
            record_id = record.get("application_id", "")
            parts = record_id.split("-")
            if len(parts) == 3 and parts[1] == str(year):
                try:
                    used_sequences.append(int(parts[2]))
                except ValueError:
                    continue

        application_id = generate_application_id(
            service,
            max(used_sequences, default=0) + 1
        )
        records.append(
            create_application_record(
                application_id,
                form_data,
                "SUBMITTED"
            )
        )
        save_application_records(records)

    return application_id


def create_application_record(
    application_id: str,
    form_data: dict,
    status: str
) -> dict:

    service = form_data.get(
        "service",
        form_data.get(
            "service_id",
            "unknown"
        )
    )

    service_name = form_data.get(
        "service_name",
        service
    )

    fields = form_data.get(
        "fields",
        {}
    )

    applicant_name = None

    if "applicant_name" in fields:

        applicant_name = fields[
            "applicant_name"
        ].get(
            "value"
        )

    if not applicant_name:

        if "student_name" in fields:

            applicant_name = fields[
                "student_name"
            ].get(
                "value"
            )

    return {
        "application_id":
            application_id,
        "service":
            service,
        "service_name":
            service_name,
        "applicant_name":
            applicant_name,
        "submitted_at":
            datetime.now().isoformat(),
        "status":
            status,
        "status_history": [
            {
                "status":
                    status,
                "timestamp":
                    datetime.now().isoformat()
            }
        ]
    }


def submit_application(
    form_data: dict,
    attempt: int,
    mode: str = "success"
) -> dict:

    """Save or simulate failure for a local demo submission record."""

    service = form_data.get(
        "service",
        form_data.get(
            "service_id",
            "unknown"
        )
    )

    if mode == "success":
        application_id = save_successful_submission(
            form_data,
            service
        )
        record = next(
            (item for item in load_application_records()
             if item.get("application_id") == application_id),
            {},
        )

        return {
            "success": True,
            "application_id":
                application_id,
            "status":
                "SUBMITTED",
            "submitted_at":
                record.get("submitted_at"),
            "message":
                "Local demo record saved successfully."
        }

    if mode == "fail_once":

        if attempt == 1:

            return {
                "success": False,
                "status":
                    "FAILED",
                "error":
                    "The local demo portal simulated a temporary failure."
            }

        application_id = save_successful_submission(
            form_data,
            service
        )
        record = next(
            (item for item in load_application_records()
             if item.get("application_id") == application_id),
            {},
        )

        return {
            "success": True,
            "application_id":
                application_id,
            "status":
                "SUBMITTED",
            "submitted_at":
                record.get("submitted_at"),
            "message":
                "Local demo record saved successfully after retry."
        }

    if mode == "always_fail":

        return {
            "success": False,
            "status":
                "FAILED",
            "error":
                "The local demo portal is unavailable."
        }

    return {
        "success": False,
        "status":
            "FAILED",
        "error":
            "Unknown local demo portal error."
    }
