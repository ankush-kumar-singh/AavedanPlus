import os

import fitz
import pytesseract
from PIL import Image


DOCUMENT_ALIASES = {
    "aadhaar": [
        "aadhaar",
        "aadhaar card",
        "aadhar",
        "aadhar card",
        "e-aadhaar",
        "e-aadhar"
    ],
    "voter_id": [
        "voter id",
        "voter card",
        "epic",
        "e-epic"
    ],
    "pan": [
        "pan",
        "pan card"
    ],
    "passport": [
        "passport"
    ],
    "driving_license": [
        "driving license",
        "driving licence",
        "dl"
    ],
    "ration_card": [
        "ration card"
    ],
    "electricity_bill": [
        "electricity bill",
        "power bill"
    ],
    "water_bill": [
        "water bill"
    ],
    "telephone_bill": [
        "telephone bill",
        "phone bill"
    ],
    "rent_agreement": [
        "rent agreement",
        "rental agreement"
    ],
    "salary_slip": [
        "salary slip",
        "salary certificate",
        "pay slip",
        "payslip"
    ],
    "pension_slip": [
        "pension slip",
        "pension certificate"
    ],
    "income_tax_return": [
        "income tax return",
        "itr"
    ],
    "form_16": [
        "form 16",
        "form16"
    ],
    "income_certificate": [
        "income certificate"
    ],
    "self_declaration": [
        "self declaration",
        "self-declaration",
        "declaration"
    ],
    "affidavit": [
        "affidavit"
    ],
    "residence_certificate": [
        "residence certificate"
    ],
    "domicile_certificate": [
        "domicile certificate",
        "domicile"
    ],
    "land_record": [
        "land record",
        "land document",
        "khatiyan",
        "revenue record"
    ],
    "property_tax_receipt": [
        "property tax receipt",
        "property tax"
    ],
    "property_document": [
        "property document",
        "property deed",
        "sale deed"
    ],
    "previous_caste_certificate": [
        "previous caste certificate",
        "old caste certificate"
    ],
    "parent_caste_certificate": [
        "parent caste certificate",
        "father caste certificate",
        "mother caste certificate"
    ],
    "government_record": [
        "government record",
        "government document"
    ],
    "hospital_birth_record": [
        "hospital birth record",
        "birth record",
        "hospital record"
    ],
    "birth_register_record": [
        "birth register",
        "birth register record"
    ],
    "hospital_discharge_summary": [
        "hospital discharge summary",
        "discharge summary"
    ],
    "marksheet": [
        "marksheet",
        "mark sheet",
        "marks"
    ],
    "degree_certificate": [
        "degree certificate",
        "degree"
    ],
    "school_certificate": [
        "school certificate",
        "school leaving certificate",
        "transfer certificate",
        "tc"
    ],
    "bonafide_certificate": [
        "bonafide",
        "bonafide certificate"
    ],
    "bank_passbook": [
        "bank passbook",
        "passbook"
    ],
    "bank_statement": [
        "bank statement",
        "account statement"
    ],
    "cancelled_cheque": [
        "cancelled cheque",
        "cancelled check"
    ],
    "caste_certificate": [
        "caste certificate"
    ],
    "ews_certificate": [
        "ews certificate"
    ]
}


def normalize_text(value: str) -> str:
    return value.strip().lower().replace("_", " ").replace("-", " ")


def normalize_document_type(document: str) -> str:
    normalized = normalize_text(document)

    for document_type, aliases in DOCUMENT_ALIASES.items():
        for alias in aliases:
            if normalize_text(alias) == normalized:
                return document_type

    return normalized.replace(" ", "_")


def extract_pdf_text(pdf_path: str) -> str:
    text = ""

    document = fitz.open(pdf_path)

    for page in document:
        text += page.get_text()

    document.close()

    return text.strip()


def extract_pdf_text_with_ocr(pdf_path: str) -> str:
    text = extract_pdf_text(pdf_path)

    if text:
        return text

    document = fitz.open(pdf_path)

    ocr_text = []

    for page in document:
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        image = Image.frombytes(
            "RGB",
            [pixmap.width, pixmap.height],
            pixmap.samples
        )

        ocr_text.append(
            pytesseract.image_to_string(image)
        )

    document.close()

    return "\n".join(ocr_text).strip()


def detect_document_type_from_text(text: str) -> str:
    normalized_text = normalize_text(text)

    matches = []

    for document_type, aliases in DOCUMENT_ALIASES.items():
        for alias in aliases:
            normalized_alias = normalize_text(alias)

            if normalized_alias in normalized_text:
                matches.append(document_type)
                break

    if not matches:
        return "unknown"

    priority = [
        "aadhaar",
        "salary_slip",
        "self_declaration",
        "affidavit",
        "income_certificate",
        "caste_certificate",
        "ews_certificate",
        "residence_certificate",
        "domicile_certificate",
        "electricity_bill",
        "water_bill",
        "voter_id",
        "pan",
        "passport",
        "driving_license",
        "ration_card",
        "marksheet",
        "bank_passbook",
        "bank_statement",
        "land_record"
    ]

    for document_type in priority:
        if document_type in matches:
            return document_type

    return matches[0]


def validate_pdf_document(pdf_path: str) -> dict:
    if not os.path.exists(pdf_path):
        return {
            "valid": False,
            "document_type": "unknown",
            "file": os.path.basename(pdf_path),
            "error": "File not found."
        }

    try:
        extracted_text = extract_pdf_text_with_ocr(pdf_path)

        if not extracted_text:
            return {
                "valid": False,
                "document_type": "unknown",
                "file": os.path.basename(pdf_path),
                "error": "No readable text found in document."
            }

        document_type = detect_document_type_from_text(
            extracted_text
        )

        if document_type == "unknown":
            return {
                "valid": False,
                "document_type": "unknown",
                "file": os.path.basename(pdf_path),
                "error": "Document type could not be identified."
            }

        return {
            "valid": True,
            "document_type": document_type,
            "file": os.path.basename(pdf_path),
            "text_preview": extracted_text[:500],
            "error": None
        }

    except Exception as error:
        return {
            "valid": False,
            "document_type": "unknown",
            "file": os.path.basename(pdf_path),
            "error": str(error)
        }


def validate_uploaded_files(file_paths: list) -> dict:
    detected_documents = []
    invalid_documents = []

    for file_path in file_paths:
        result = validate_pdf_document(file_path)

        if result["valid"]:
            detected_documents.append(result)
        else:
            invalid_documents.append(result)

    return {
        "detected_documents": detected_documents,
        "invalid_documents": invalid_documents,
        "all_readable": len(invalid_documents) == 0
    }


def validate_documents(
    required_documents: list,
    uploaded_documents: list
) -> dict:

    uploaded_types = {
        normalize_document_type(document)
        for document in uploaded_documents
    }

    matched_documents = {}
    missing_requirements = []
    missing_optional_requirements = []

    for requirement in required_documents:
        requirement_key = requirement["key"]
        accepted_documents = requirement["accepted_documents"]
        is_required = requirement.get("required", True)

        matched = None

        for document_type in accepted_documents:
            normalized_type = normalize_document_type(document_type)

            if normalized_type in uploaded_types:
                matched = normalized_type
                break

        if matched:
            matched_documents[requirement_key] = {
                "label": requirement["label"],
                "document": matched,
                "status": "VALID",
                "required": is_required
            }

        elif is_required:
            missing_requirements.append({
                "key": requirement_key,
                "label": requirement["label"],
                "accepted_documents": accepted_documents
            })

        else:
            missing_optional_requirements.append({
                "key": requirement_key,
                "label": requirement["label"],
                "accepted_documents": accepted_documents
            })

    return {
        "matched_documents": matched_documents,
        "missing_documents": missing_requirements,
        "missing_optional_documents": missing_optional_requirements,
        "all_valid": len(missing_requirements) == 0
    }