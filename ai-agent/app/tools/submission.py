from datetime import datetime


SERVICE_PREFIXES = {
    "income_certificate": "INC",
    "caste_certificate": "CAST",
    "residence_certificate": "RES",
    "ews_certificate": "EWS",
    "birth_certificate": "BIRTH",
    "scholarship": "SCH"
}


def generate_application_id(service: str, attempt: int) -> str:
    prefix = SERVICE_PREFIXES.get(service, "APP")
    year = datetime.now().year

    return f"{prefix}-{year}-{attempt:06d}"


def submit_application(
    form_data: dict,
    attempt: int,
    mode: str = "success"
) -> dict:
    """Simulate submission to a government portal."""

    service = form_data.get("service_id", "unknown")

    if mode == "success":
        return {
            "success": True,
            "application_id": generate_application_id(
                service,
                attempt
            ),
            "status": "SUBMITTED",
            "message": "Application submitted successfully."
        }

    if mode == "fail_once":
        if attempt == 1:
            return {
                "success": False,
                "status": "FAILED",
                "error": "Government portal temporarily unavailable."
            }

        return {
            "success": True,
            "application_id": generate_application_id(
                service,
                attempt
            ),
            "status": "SUBMITTED",
            "message": "Application submitted successfully after retry."
        }

    if mode == "always_fail":
        return {
            "success": False,
            "status": "FAILED",
            "error": "Government portal is unavailable."
        }

    return {
        "success": False,
        "status": "FAILED",
        "error": "Unknown portal error."
    }