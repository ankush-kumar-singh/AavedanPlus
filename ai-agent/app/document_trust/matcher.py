def normalize_name(name: str | None) -> str:
    if not name:
        return ""

    return " ".join(name.upper().split())


def names_match(
    document_name: str | None,
    application_name: str | None
) -> bool:

    document_name = normalize_name(document_name)
    application_name = normalize_name(application_name)

    if not document_name or not application_name:
        return False

    return document_name == application_name