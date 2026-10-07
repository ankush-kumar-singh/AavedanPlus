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

    for requirement in required_documents:
        requirement_key = requirement["key"]
        accepted_documents = requirement["accepted_documents"]

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
                "status": "VALID"
            }
        else:
            missing_requirements.append({
                "key": requirement_key,
                "label": requirement["label"],
                "accepted_documents": accepted_documents
            })

    return {
        "matched_documents": matched_documents,
        "missing_documents": missing_requirements,
        "all_valid": len(missing_requirements) == 0
    }