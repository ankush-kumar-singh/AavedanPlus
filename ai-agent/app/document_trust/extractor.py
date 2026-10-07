import re


def extract_name(text: str) -> str | None:
    match = re.search(
        r"(?:Name|नाम)\s*[:\-]\s*(.+)",
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return None


def extract_dob(text: str) -> str | None:
    match = re.search(
        r"(?:DOB|Date of Birth|जन्म तिथि)\s*[:\-]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return None


def extract_address(text: str) -> str | None:
    match = re.search(
        r"(?:Address|पता)\s*[:\-]\s*(.+)",
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return None


def detect_document_type(text: str) -> str:
    text_upper = text.upper()

    if "AADHAAR" in text_upper or "UIDAI" in text_upper:
        return "AADHAAR"

    if "PAN" in text_upper or "INCOME TAX DEPARTMENT" in text_upper:
        return "PAN"

    if "INCOME CERTIFICATE" in text_upper:
        return "INCOME_CERTIFICATE"

    if "RESIDENCE CERTIFICATE" in text_upper:
        return "RESIDENCE_CERTIFICATE"

    return "UNKNOWN"


def extract_fields(text: str) -> dict:
    return {
        "document_type": detect_document_type(text),
        "name": extract_name(text),
        "dob": extract_dob(text),
        "address": extract_address(text),
    }