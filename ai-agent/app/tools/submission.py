import json
import os
from datetime import datetime


SERVICE_PREFIXES = {
    "income_certificate": "INC",
    "caste_certificate": "CAST",
    "residence_certificate": "RES",
    "ews_certificate": "EWS",
    "birth_certificate": "BIRTH",
    "scholarship": "SCH"
}


APPLICATION_DB = "application_records.json"


def generate_application_id(
    service: str,
    attempt: int
) -> str:

    prefix = SERVICE_PREFIXES.get(
        service,
        "APP"
    )

    year = datetime.now().year

    return f"{prefix}-{year}-{attempt:06d}"


def load_application_records() -> list:

    if not os.path.exists(
        APPLICATION_DB
    ):
        return []

    try:

        with open(
            APPLICATION_DB,
            "r",
            encoding="utf-8"
        ) as file:

            records = json.load(
                file
            )

            if isinstance(
                records,
                list
            ):

                return records

    except Exception:
        pass

    return []


def save_application_records(
    records: list
):

    with open(
        APPLICATION_DB,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            records,
            file,
            indent=4,
            ensure_ascii=False
        )


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

    """Simulate submission to a government portal."""

    service = form_data.get(
        "service",
        form_data.get(
            "service_id",
            "unknown"
        )
    )

    if mode == "success":

        application_id = (
            generate_application_id(
                service,
                attempt
            )
        )

        record = create_application_record(
            application_id,
            form_data,
            "SUBMITTED"
        )

        records = load_application_records()

        records.append(
            record
        )

        save_application_records(
            records
        )

        return {
            "success": True,
            "application_id":
                application_id,
            "status":
                "SUBMITTED",
            "message":
                "Application submitted successfully."
        }

    if mode == "fail_once":

        if attempt == 1:

            return {
                "success": False,
                "status":
                    "FAILED",
                "error":
                    "Government portal temporarily unavailable."
            }

        application_id = (
            generate_application_id(
                service,
                attempt
            )
        )

        record = create_application_record(
            application_id,
            form_data,
            "SUBMITTED"
        )

        records = load_application_records()

        records.append(
            record
        )

        save_application_records(
            records
        )

        return {
            "success": True,
            "application_id":
                application_id,
            "status":
                "SUBMITTED",
            "message":
                "Application submitted successfully after retry."
        }

    if mode == "always_fail":

        return {
            "success": False,
            "status":
                "FAILED",
            "error":
                "Government portal is unavailable."
        }

    return {
        "success": False,
        "status":
            "FAILED",
        "error":
            "Unknown portal error."
    }