from .ocr import extract_text
from .extractor import extract_fields
from .matcher import names_match


def validate_document(
    file_path: str,
    application_name: str | None = None
) -> dict:

    # 1. OCR
    raw_text = extract_text(file_path)

    if not raw_text:
        return {
            "status": "INVALID",
            "reason": "Could not extract readable text from document"
        }

    # 2. Extract fields
    extracted_data = extract_fields(raw_text)

    # 3. Basic validation
    document_type = extracted_data["document_type"]

    if document_type == "UNKNOWN":
        return {
            "status": "INVALID",
            "reason": "Unknown document type",
            "extracted_data": extracted_data
        }

    # 4. Name matching
    name_match = None

    if application_name:
        name_match = names_match(
            extracted_data.get("name"),
            application_name
        )

    # 5. Final validation
    valid = True

    if name_match is False:
        valid = False

    return {
        "status": "VALID" if valid else "INVALID",
        "document_type": document_type,
        "extracted_data": extracted_data,
        "validation": {
            "readable": True,
            "name_match": name_match,
            "required_fields_present": bool(
                extracted_data.get("name")
            )
        }
    }