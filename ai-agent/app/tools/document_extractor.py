import json
import re

from app.services.llm import llm
from app.tools.documents import (
    extract_pdf_text_with_ocr,
    validate_uploaded_files
)


DOCUMENT_EXTRACTION_FIELDS = {
    "aadhaar": [
        "applicant_name",
        "date_of_birth",
        "gender",
        "address"
    ],
    "voter_id": [
        "applicant_name",
        "date_of_birth",
        "gender",
        "address"
    ],
    "pan": [
        "applicant_name",
        "date_of_birth"
    ],
    "passport": [
        "applicant_name",
        "date_of_birth",
        "gender",
        "address"
    ],
    "driving_license": [
        "applicant_name",
        "date_of_birth",
        "gender",
        "address"
    ],
    "salary_slip": [
        "applicant_name",
        "monthly_income",
        "income_source"
    ],
    "pension_slip": [
        "applicant_name",
        "monthly_income",
        "income_source"
    ],
    "form_16": [
        "applicant_name",
        "annual_income",
        "income_source"
    ],
    "income_tax_return": [
        "applicant_name",
        "annual_income",
        "income_source"
    ],
    "self_declaration": [
        "applicant_name",
        "declaration"
    ],
    "affidavit": [
        "applicant_name",
        "declaration"
    ],
    "caste_certificate": [
        "applicant_name",
        "caste",
        "address"
    ],
    "previous_caste_certificate": [
        "applicant_name",
        "caste",
        "address"
    ],
    "parent_caste_certificate": [
        "caste"
    ],
    "residence_certificate": [
        "applicant_name",
        "address"
    ],
    "domicile_certificate": [
        "applicant_name",
        "address"
    ],
    "birth_register_record": [
        "child_name",
        "date_of_birth",
        "place_of_birth",
        "parent_name"
    ],
    "hospital_birth_record": [
        "child_name",
        "date_of_birth",
        "place_of_birth",
        "parent_name"
    ],
    "birth_certificate": [
        "child_name",
        "date_of_birth",
        "place_of_birth",
        "parent_name"
    ],
    "hospital_discharge_summary": [
        "child_name",
        "date_of_birth",
        "place_of_birth",
        "parent_name"
    ],
    "marksheet": [
        "student_name",
        "education_details"
    ],
    "degree_certificate": [
        "student_name",
        "education_details"
    ],
    "school_certificate": [
        "student_name",
        "education_details"
    ],
    "bonafide_certificate": [
        "student_name",
        "education_details"
    ],
    "bank_passbook": [
        "applicant_name",
        "bank_account"
    ],
    "bank_statement": [
        "applicant_name",
        "bank_account"
    ]
}


def clean_response(
    response: str
) -> str:

    response = response.strip()

    if (
        "<think>" in response
        and "</think>" in response
    ):

        response = response.split(
            "</think>",
            1
        )[1].strip()

    return response


def extract_json(
    response: str
) -> dict:

    response = clean_response(
        response
    )

    if "```json" in response:

        response = response.split(
            "```json",
            1
        )[1]

        if "```" in response:

            response = response.split(
                "```",
                1
            )[0]

    elif "```" in response:

        response = response.split(
            "```",
            1
        )[1]

        if "```" in response:

            response = response.split(
                "```",
                1
            )[0]

    response = response.strip()

    try:

        result = json.loads(
            response
        )

        if isinstance(
            result,
            dict
        ):

            return result

    except Exception:
        pass

    match = re.search(
        r"\{.*\}",
        response,
        re.DOTALL
    )

    if not match:
        return {}

    try:

        result = json.loads(
            match.group(0)
        )

        if isinstance(
            result,
            dict
        ):

            return result

    except Exception:
        pass

    return {}


def normalize_space(
    value: str
) -> str:

    return re.sub(
        r"\s+",
        " ",
        value
    ).strip()


def extract_after_label(
    text: str,
    label: str
) -> str | None:

    pattern = (
        rf"{re.escape(label)}"
        rf"\s*[:\-]?\s*([^\n\r]+)"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE
    )

    if not match:
        return None

    value = normalize_space(
        match.group(1)
    )

    return value or None


def extract_salary_data(
    text: str,
    document_type: str,
) -> dict:

    data = {}

    employee_name = extract_after_label(
        text,
        "Employee Name"
    )

    if employee_name:
        data[
            "applicant_name"
        ] = employee_name

    if document_type in {"salary_slip", "pension_slip"}:
        gross_salary = extract_after_label(text, "Gross Salary")
        amount_text = gross_salary
        if not amount_text:
            amount_text = extract_after_label(text, "Net Salary")
        if not amount_text:
            amount_text = extract_after_label(text, "Monthly Pension")
        if amount_text:
            amount = re.search(r"\d[\d,]*(?:\.\d{1,2})?", amount_text)
            if amount:
                data["monthly_income"] = amount.group(0).replace(",", "")
    else:
        annual_amount = None
        for label in ("Total Income", "Gross Total Income", "Annual Income", "Gross Salary"):
            annual_amount = extract_after_label(text, label)
            if annual_amount:
                break
        if annual_amount:
            amount = re.search(r"\d[\d,]*(?:\.\d{1,2})?", annual_amount)
            if amount:
                data["annual_income"] = amount.group(0).replace(",", "")

    income_source = None

    if re.search(
        r"\bSalary\b|\bGross Salary\b|\bNet Salary\b",
        text,
        re.IGNORECASE
    ):

        income_source = (
            "Salary / Employment"
        )

    if income_source:
        data[
            "income_source"
        ] = income_source

    return data


def extract_self_declaration_data(
    text: str
) -> dict:

    data = {}

    applicant_name = extract_after_label(
        text,
        "Applicant Name"
    )

    if applicant_name:

        data[
            "applicant_name"
        ] = applicant_name

    declaration_match = re.search(
        r"(I,\s*.*?hereby declare that.*?"
        r"accuracy of the information provided\.)",
        text,
        re.IGNORECASE | re.DOTALL
    )

    if declaration_match:

        declaration = normalize_space(
            declaration_match.group(1)
        )

        data[
            "declaration"
        ] = declaration

    else:

        if re.search(
            r"\bSELF DECLARATION\b",
            text,
            re.IGNORECASE
        ):

            data[
                "declaration"
            ] = (
                "Self-declaration document provided "
                "and validated."
            )

    return data


def extract_identity_data(
    text: str
) -> dict:

    data = {}

    applicant_name = extract_after_label(
        text,
        "Name"
    )

    if applicant_name:

        data[
            "applicant_name"
        ] = applicant_name

    date_of_birth = extract_after_label(
        text,
        "Date of Birth"
    )

    if date_of_birth:

        data[
            "date_of_birth"
        ] = date_of_birth

    gender = extract_after_label(
        text,
        "Gender"
    )

    if gender:

        data[
            "gender"
        ] = gender

    address = extract_after_label(
        text,
        "Address"
    )

    if address:

        data[
            "address"
        ] = address

    return data


def extract_generic_llm_data(
    text: str,
    document_type: str,
    fields: list
) -> dict:

    field_list = "\n".join(
        f"- {field}"
        for field in fields
    )

    prompt = f"""
You are a document data extraction system.

Document type:
{document_type}

Extract ONLY information explicitly
present in the document.

Never guess.
Never calculate values.
Never invent missing information.

If a field is not clearly present,
return null.

Allowed fields:

{field_list}

Return ONLY valid JSON.

Example:

{{
    "applicant_name": null,
    "date_of_birth": null
}}

Document text:

{text[:12000]}
"""

    try:

        response = llm.invoke(
            prompt
        )

        data = extract_json(
            response.content
        )

    except Exception:

        return {}

    cleaned = {}

    for field in fields:

        value = data.get(
            field
        )

        if value in (
            None,
            "",
            "null",
            "None"
        ):
            continue

        cleaned[
            field
        ] = str(value).strip()

    return cleaned


def extract_document_data(
    file_path: str,
    document_type: str
) -> dict:

    try:

        text = extract_pdf_text_with_ocr(
            file_path
        )

    except Exception:

        return {}

    if not text:
        return {}

    if document_type in {
        "aadhaar",
        "voter_id",
        "passport",
        "driving_license"
    }:

        return extract_identity_data(
            text
        )

    if document_type in {
        "salary_slip",
        "pension_slip",
        "form_16",
        "income_tax_return"
    }:

        return extract_salary_data(text, document_type)

    if document_type in {
        "self_declaration",
        "affidavit"
    }:

        return extract_self_declaration_data(
            text
        )

    fields = DOCUMENT_EXTRACTION_FIELDS.get(
        document_type,
        []
    )

    if not fields:
        return {}

    return extract_generic_llm_data(
        text,
        document_type,
        fields
    )


def extract_data_from_documents(
    documents: list
) -> dict:

    extracted_data = {}

    for document in documents:

        if isinstance(
            document,
            str
        ):

            file_path = document

            validation = validate_uploaded_files(
                [file_path]
            )

            detected = validation.get(
                "detected_documents",
                []
            )

            if not detected:
                continue

            document_type = detected[0].get(
                "document_type"
            )

        else:

            file_path = document.get(
                "file_path"
            )

            document_type = document.get(
                "document_type"
            )

        if not file_path or not document_type:
            continue

        data = extract_document_data(
            file_path,
            document_type
        )

        for key, value in data.items():

            if value in (
                None,
                ""
            ):
                continue

            if key not in extracted_data:

                extracted_data[
                    key
                ] = value

    return extracted_data
