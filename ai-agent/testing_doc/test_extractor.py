from app.document_trust.extractor import extract_fields


with open("test-data/mock_aadhaar.txt", "r", encoding="utf-8") as file:
    text = file.read()


result = extract_fields(text)

print(result)