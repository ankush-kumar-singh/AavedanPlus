from app.graph import agent


def run_test(name, state):
    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    result = agent.invoke(state)

    print("\nService:")
    print(result.get("service"))

    print("\nService Name:")
    print(result.get("service_name"))

    print("\nCurrent Step:")
    print(result.get("current_step"))

    print("\nRequired Documents:")
    print(result.get("required_documents"))

    print("\nValidated Documents:")
    print(result.get("validated_documents"))

    print("\nApplication Status:")
    print(result.get("application_status"))

    print("\nApplication ID:")
    print(result.get("application_id"))

    print("\nResponse:")
    print(result.get("response"))


run_test(
    "TEST 1 - Income Certificate",
    {
        "user_id": "user_001",
        "service": "income_certificate",
        "user_message": "I want to apply for an income certificate.",
        "uploaded_documents": [
            "Aadhaar Card",
            "Salary Slip",
            "Self Declaration"
        ],
        "consent_granted": True,
        "mock_portal_mode": "success",
        "completed_steps": []
    }
)


run_test(
    "TEST 2 - Caste Certificate",
    {
        "user_id": "user_002",
        "service": "caste_certificate",
        "user_message": "I want to apply for a caste certificate.",
        "uploaded_documents": [
            "Aadhaar Card",
            "Residence Certificate",
            "Previous Caste Certificate",
            "Self Declaration"
        ],
        "consent_granted": True,
        "mock_portal_mode": "success",
        "completed_steps": []
    }
)


run_test(
    "TEST 3 - EWS Certificate",
    {
        "user_id": "user_003",
        "service": "ews_certificate",
        "user_message": "I want an EWS certificate.",
        "uploaded_documents": [
            "Aadhaar",
            "Electricity Bill",
            "Salary Slip",
            "Land Record",
            "Affidavit"
        ],
        "consent_granted": True,
        "mock_portal_mode": "success",
        "completed_steps": []
    }
)


run_test(
    "TEST 4 - Scholarship",
    {
        "user_id": "user_004",
        "service": "scholarship",
        "user_message": "I want to apply for a scholarship.",
        "uploaded_documents": [
            "Aadhaar",
            "Marksheet",
            "Income Certificate",
            "Bank Passbook",
            "Caste Certificate"
        ],
        "consent_granted": True,
        "mock_portal_mode": "success",
        "completed_steps": []
    }
)


run_test(
    "TEST 5 - Missing Documents",
    {
        "user_id": "user_005",
        "service": "income_certificate",
        "user_message": "I want an income certificate.",
        "uploaded_documents": [
            "Aadhaar Card"
        ],
        "consent_granted": True,
        "mock_portal_mode": "success",
        "completed_steps": []
    }
)


run_test(
    "TEST 6 - Unsupported Service",
    {
        "user_id": "user_006",
        "user_message": "I want to apply for a driving licence.",
        "uploaded_documents": [],
        "consent_granted": True,
        "mock_portal_mode": "success",
        "completed_steps": []
    }
)