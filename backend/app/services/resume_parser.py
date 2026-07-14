import logging
from pathlib import Path

from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text content from a PDF file using PyPDF2.

    Returns the concatenated text of all pages, or an empty string on failure.
    """
    try:
        path = Path(file_path)
        if not path.exists():
            logger.warning(f"Resume PDF not found at {file_path}")
            return ""

        reader = PdfReader(str(path))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())

        full_text = "\n".join(pages_text)
        # Truncate to ~4000 chars to keep LLM context manageable
        if len(full_text) > 4000:
            full_text = full_text[:4000] + "..."
        return full_text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF {file_path}: {e}")
        return ""

import io

def extract_text_from_bytes(pdf_bytes: bytes) -> str:
    """Extract all text content from raw PDF bytes."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())

        full_text = "\n".join(pages_text)
        if len(full_text) > 4000:
            full_text = full_text[:4000] + "..."
        return full_text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF bytes: {e}")
        return ""
