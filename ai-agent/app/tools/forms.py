FORM_SCHEMAS = {
    "income_certificate": {
        "service_name": "Income Certificate",
        "fields": [
            {
                "key": "applicant_name",
                "label": "Applicant Name",
                "source": "identity"
            },
            {
                "key": "date_of_birth",
                "label": "Date of Birth",
                "source": "identity"
            },
            {
                "key": "gender",
                "label": "Gender",
                "source": "identity"
            },
            {
                "key": "address",
                "label": "Address",
                "source": "identity"
            },
            {
                "key": "annual_income",
                "label": "Annual Income",
                "source": "income"
            },
            {
                "key": "income_source",
                "label": "Income Source",
                "source": "income"
            },
            {
                "key": "declaration",
                "label": "Declaration",
                "source": "declaration"
            }
        ]
    },

    "caste_certificate": {
        "service_name": "Caste Certificate",
        "fields": [
            {
                "key": "applicant_name",
                "label": "Applicant Name",
                "source": "identity"
            },
            {
                "key": "date_of_birth",
                "label": "Date of Birth",
                "source": "identity"
            },
            {
                "key": "gender",
                "label": "Gender",
                "source": "identity"
            },
            {
                "key": "address",
                "label": "Address",
                "source": "identity"
            },
            {
                "key": "caste",
                "label": "Caste",
                "source": "caste"
            },
            {
                "key": "caste_document",
                "label": "Caste Supporting Document",
                "source": "caste"
            },
            {
                "key": "declaration",
                "label": "Declaration",
                "source": "declaration"
            }
        ]
    },

    "residence_certificate": {
        "service_name": "Residence / Domicile Certificate",
        "fields": [
            {
                "key": "applicant_name",
                "label": "Applicant Name",
                "source": "identity"
            },
            {
                "key": "date_of_birth",
                "label": "Date of Birth",
                "source": "identity"
            },
            {
                "key": "address",
                "label": "Residential Address",
                "source": "identity"
            },
            {
                "key": "residence_proof",
                "label": "Residence Proof",
                "source": "residence"
            },
            {
                "key": "declaration",
                "label": "Declaration",
                "source": "declaration"
            }
        ]
    },

    "ews_certificate": {
        "service_name": "EWS Certificate",
        "fields": [
            {
                "key": "applicant_name",
                "label": "Applicant Name",
                "source": "identity"
            },
            {
                "key": "date_of_birth",
                "label": "Date of Birth",
                "source": "identity"
            },
            {
                "key": "address",
                "label": "Address",
                "source": "identity"
            },
            {
                "key": "annual_income",
                "label": "Annual Income",
                "source": "income"
            },
            {
                "key": "asset_details",
                "label": "Asset Details",
                "source": "assets"
            },
            {
                "key": "declaration",
                "label": "Declaration",
                "source": "declaration"
            }
        ]
    },

    "birth_certificate": {
        "service_name": "Birth Certificate",
        "fields": [
            {
                "key": "child_name",
                "label": "Child Name",
                "source": "identity"
            },
            {
                "key": "date_of_birth",
                "label": "Date of Birth",
                "source": "birth"
            },
            {
                "key": "place_of_birth",
                "label": "Place of Birth",
                "source": "birth"
            },
            {
                "key": "parent_name",
                "label": "Parent / Guardian Name",
                "source": "birth"
            },
            {
                "key": "address",
                "label": "Address",
                "source": "identity"
            }
        ]
    },

    "scholarship": {
        "service_name": "Scholarship Application",
        "fields": [
            {
                "key": "student_name",
                "label": "Student Name",
                "source": "identity"
            },
            {
                "key": "date_of_birth",
                "label": "Date of Birth",
                "source": "identity"
            },
            {
                "key": "address",
                "label": "Address",
                "source": "identity"
            },
            {
                "key": "education_details",
                "label": "Education Details",
                "source": "education"
            },
            {
                "key": "annual_income",
                "label": "Annual Income",
                "source": "income"
            },
            {
                "key": "bank_account",
                "label": "Bank Account",
                "source": "bank"
            },
            {
                "key": "category",
                "label": "Category",
                "source": "category"
            }
        ]
    }
}


def get_form_schema(service: str) -> dict:
    return FORM_SCHEMAS.get(
        service,
        {
            "service_name": service,
            "fields": []
        }
    )


def create_empty_form(service: str) -> dict:
    schema = get_form_schema(service)

    form = {
        "service": service,
        "service_name": schema["service_name"],
        "fields": {}
    }

    for field in schema["fields"]:
        form["fields"][field["key"]] = {
            "label": field["label"],
            "value": None,
            "source": field["source"],
            "status": "MISSING"
        }

    return form


def fill_form(
    service: str,
    extracted_data: dict | None = None
) -> dict:

    extracted_data = extracted_data or {}

    form = create_empty_form(service)

    for field_key, field_data in form["fields"].items():

        if field_key in extracted_data:

            value = extracted_data[field_key]

            if value not in (None, ""):

                field_data["value"] = value
                field_data["status"] = "FILLED"

    return form