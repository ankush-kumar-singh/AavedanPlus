from pathlib import Path

import fitz  # PyMuPDF
import pytesseract
from PIL import Image


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from an image using Tesseract OCR.
    """

    image = Image.open(file_path)

    text = pytesseract.image_to_string(image)

    return text.strip()


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF.

    First tries normal PDF text extraction.
    If the PDF contains scanned pages, OCR will be added later.
    """

    document = fitz.open(file_path)

    extracted_text = []

    for page in document:
        text = page.get_text()

        if text:
            extracted_text.append(text)

    document.close()

    return "\n".join(extracted_text).strip()


def extract_text(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()

    if extension == ".txt":
        return Path(file_path).read_text(encoding="utf-8").strip()

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    if extension in [".jpg", ".jpeg", ".png", ".webp"]:
        return extract_text_from_image(file_path)

    raise ValueError(f"Unsupported file type: {extension}")