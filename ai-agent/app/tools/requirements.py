SERVICE_REQUIREMENTS = {
    "income_certificate": {
        "name": "Income Certificate",
        "requirements": [
            {
                "key": "identity_proof",
                "label": "Identity Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "pan",
                    "passport",
                    "driving_license"
                ]
            },
            {
                "key": "address_proof",
                "label": "Address Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "ration_card",
                    "electricity_bill",
                    "water_bill",
                    "telephone_bill",
                    "rent_agreement"
                ]
            },
            {
                "key": "income_proof",
                "label": "Income Proof",
                "accepted_documents": [
                    "salary_slip",
                    "pension_slip",
                    "income_tax_return",
                    "form_16",
                    "income_certificate"
                ]
            },
            {
                "key": "declaration",
                "label": "Self Declaration / Affidavit",
                "accepted_documents": [
                    "self_declaration",
                    "affidavit"
                ]
            }
        ]
    },

    "caste_certificate": {
        "name": "Caste Certificate",
        "requirements": [
            {
                "key": "identity_proof",
                "label": "Identity Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "pan",
                    "passport",
                    "driving_license"
                ]
            },
            {
                "key": "address_proof",
                "label": "Address / Residence Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "ration_card",
                    "residence_certificate",
                    "domicile_certificate",
                    "electricity_bill",
                    "land_record"
                ]
            },
            {
                "key": "caste_proof",
                "label": "Caste Supporting Document",
                "accepted_documents": [
                    "previous_caste_certificate",
                    "parent_caste_certificate",
                    "land_record",
                    "government_record"
                ]
            },
            {
                "key": "declaration",
                "label": "Self Declaration / Affidavit",
                "accepted_documents": [
                    "self_declaration",
                    "affidavit"
                ]
            }
        ]
    },

    "residence_certificate": {
        "name": "Residence / Domicile Certificate",
        "requirements": [
            {
                "key": "identity_proof",
                "label": "Identity Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "pan",
                    "passport",
                    "driving_license"
                ]
            },
            {
                "key": "residence_proof",
                "label": "Residence Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "ration_card",
                    "electricity_bill",
                    "water_bill",
                    "telephone_bill",
                    "rent_agreement",
                    "land_record"
                ]
            },
            {
                "key": "supporting_document",
                "label": "Supporting Residence Document",
                "accepted_documents": [
                    "land_record",
                    "property_tax_receipt",
                    "residence_certificate",
                    "domicile_certificate"
                ]
            }
        ]
    },

    "ews_certificate": {
        "name": "EWS Certificate",
        "requirements": [
            {
                "key": "identity_proof",
                "label": "Identity Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "pan",
                    "passport",
                    "driving_license"
                ]
            },
            {
                "key": "address_proof",
                "label": "Address Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "ration_card",
                    "electricity_bill",
                    "water_bill",
                    "rent_agreement"
                ]
            },
            {
                "key": "income_proof",
                "label": "Income Proof",
                "accepted_documents": [
                    "salary_slip",
                    "income_tax_return",
                    "form_16",
                    "income_certificate"
                ]
            },
            {
                "key": "asset_proof",
                "label": "Asset / Property Proof",
                "accepted_documents": [
                    "land_record",
                    "property_document",
                    "property_tax_receipt"
                ]
            },
            {
                "key": "declaration",
                "label": "Self Declaration / Affidavit",
                "accepted_documents": [
                    "self_declaration",
                    "affidavit"
                ]
            }
        ]
    },

    "birth_certificate": {
        "name": "Birth Certificate",
        "requirements": [
            {
                "key": "identity_proof",
                "label": "Parent / Applicant Identity Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "passport",
                    "driving_license"
                ]
            },
            {
                "key": "birth_proof",
                "label": "Birth / Hospital Record",
                "accepted_documents": [
                    "hospital_birth_record",
                    "birth_register_record",
                    "hospital_discharge_summary"
                ]
            },
            {
                "key": "address_proof",
                "label": "Address Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "ration_card",
                    "electricity_bill"
                ]
            }
        ]
    },

    "scholarship": {
        "name": "Scholarship Application",
        "requirements": [
            {
                "key": "identity_proof",
                "label": "Identity Proof",
                "accepted_documents": [
                    "aadhaar",
                    "voter_id",
                    "passport"
                ]
            },
            {
                "key": "education_proof",
                "label": "Education / Marks Document",
                "accepted_documents": [
                    "marksheet",
                    "degree_certificate",
                    "school_certificate",
                    "bonafide_certificate"
                ]
            },
            {
                "key": "income_proof",
                "label": "Income Proof",
                "accepted_documents": [
                    "income_certificate",
                    "salary_slip",
                    "income_tax_return"
                ]
            },
            {
                "key": "bank_proof",
                "label": "Bank Account Proof",
                "accepted_documents": [
                    "bank_passbook",
                    "bank_statement",
                    "cancelled_cheque"
                ]
            },
            {
                "key": "category_proof",
                "label": "Category Certificate if applicable",
                "accepted_documents": [
                    "caste_certificate",
                    "ews_certificate"
                ],
                "required": False
            }
        ]
    }
}


def get_service_config(service: str) -> dict:
    return SERVICE_REQUIREMENTS.get(service, {})


def check_requirements(service: str) -> list:
    config = get_service_config(service)
    return config.get("requirements", [])


def get_service_name(service: str) -> str:
    config = get_service_config(service)
    return config.get("name", "Unknown Service")


def get_supported_services() -> dict:
    return {
        service_id: config["name"]
        for service_id, config in SERVICE_REQUIREMENTS.items()
    }