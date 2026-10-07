from app.document_trust.validator import validate_document


result = validate_document(
    "test-data/mock_aadhaar.txt",
    application_name="Ankush Kumar Singh"
)

print(result)