from app.document_trust.matcher import names_match


document_name = "Ankush Kumar Singh"
application_name = "Ankush Kumar Singh"

result = names_match(document_name, application_name)

print("Names match:", result)
