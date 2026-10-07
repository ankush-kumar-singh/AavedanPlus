def submit_application(
    form_data: dict,
    attempt: int,
    mode: str = "success"
) -> dict:
    """Simulate submission to a government portal."""

    if mode == "success":
        return {
            "success": True,
            "application_id": "INC-2026-001001",
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
            "application_id": "INC-2026-001001",
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