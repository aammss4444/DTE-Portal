import logging
import os
import asyncio
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

OCR_SPACE_URL = "https://api.ocr.space/parse/image"


async def _ocr_space_extract(file_path: str) -> str:
    """Extract text from a file using the ocr.space API."""
    api_key = settings.OCR_SPACE_API_KEY
    if not api_key:
        raise RuntimeError("OCR_SPACE_API_KEY is not configured")

    ext = os.path.splitext(file_path)[1].lower()

    # Determine MIME type
    mime_map = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".tiff": "image/tiff",
        ".tif": "image/tiff",
        ".pdf": "application/pdf",
    }
    mime_type = mime_map.get(ext, "application/octet-stream")
    filename = os.path.basename(file_path)

    async with httpx.AsyncClient(timeout=60.0) as client:
        with open(file_path, "rb") as f:
            file_data = f.read()

        # Free tier limit is 1MB
        file_size_mb = len(file_data) / (1024 * 1024)
        if file_size_mb > 1.0:
            logger.warning(f"File {filename} is {file_size_mb:.1f}MB, may exceed ocr.space free tier limit of 1MB")

        response = await client.post(
            OCR_SPACE_URL,
            data={
                "apikey": api_key,
                "language": "eng",
                "isOverlayRequired": "false",
                "OCREngine": "2",  # Engine 2 is better for document OCR
                "scale": "true",
                "isTable": "true",
            },
            files={
                "file": (filename, file_data, mime_type),
            },
        )

        if response.status_code != 200:
            raise RuntimeError(f"ocr.space API returned status {response.status_code}: {response.text[:200]}")

        result = response.json()

        if result.get("IsErroredOnProcessing"):
            error_msg = result.get("ErrorMessage", ["Unknown error"])
            if isinstance(error_msg, list):
                error_msg = "; ".join(error_msg)
            raise RuntimeError(f"ocr.space processing error: {error_msg}")

        parsed_results = result.get("ParsedResults", [])
        if not parsed_results:
            logger.warning(f"ocr.space returned no parsed results for {filename}")
            return ""

        # Concatenate text from all pages
        all_text = []
        for page_result in parsed_results:
            text = page_result.get("ParsedText", "")
            if text:
                all_text.append(text.strip())

        return "\n".join(all_text)


async def extract_text(file_path: str, document_type: str | None = None) -> str:
    """
    Extracts text from an image or PDF using ocr.space API.
    Falls back to simulation if API key is not set and simulation is allowed.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found for OCR: {file_path}")
        return ""

    # Try ocr.space API first
    if settings.OCR_SPACE_API_KEY:
        try:
            text = await _ocr_space_extract(file_path)
            if text:
                logger.info(f"ocr.space extracted {len(text)} chars from {os.path.basename(file_path)}")
                return text
            else:
                logger.warning(f"ocr.space returned empty text for {os.path.basename(file_path)}")
        except Exception as e:
            logger.error(f"ocr.space OCR failed for {file_path}: {str(e)}")

    # Fallback to simulation if allowed
    if not settings.ALLOW_OCR_SIMULATION:
        logger.error("OCR extraction failed and simulation is disabled for file: %s", file_path)
        return ""

    # Simulation logic for development only
    doc_type = (document_type or "").upper()
    file_name = os.path.basename(file_path).lower()

    if doc_type in ("DEGREE_CERTIFICATE", "DEGREE") or "degree" in file_name or "certificate" in file_name:
        return "CERTIFICATE OF DEGREE: MASTER OF TECHNOLOGY (M.TECH) IN COMPUTER SCIENCE. SAVITRIBAI PHULE PUNE UNIVERSITY (SPPU). YEAR OF PASSING: 2022. GRADE: A+. CANDIDATE NAME: New Candidate. DATE OF BIRTH: 15-06-1998."
    elif doc_type == "MARKSHEET" or "marksheet" in file_name:
        return "TRANSCRIPT / MARKSHEET. SAVITRIBAI PHULE PUNE UNIVERSITY (SPPU). EXAMINATION: M.TECH SEMESTER IV - MAY 2022. CANDIDATE NAME: New Candidate. SEAT NO: 12345. TOTAL MARKS: 850/1000. PERCENTAGE: 85%. RESULT: FIRST CLASS WITH DISTINCTION."
    elif doc_type == "AADHAR" or "aadhaar" in file_name or "aadhar" in file_name or "id" in file_name:
        return "GOVERNMENT OF INDIA. AADHAAR CARD. NAME: New Candidate. DATE OF BIRTH: 15/06/1998. GENDER: Male. ADDRESS: 123, Shivaji Nagar, Pune, Maharashtra - 411005. AADHAAR NUMBER: XXXX-XXXX-XXXX."
    elif doc_type == "RESUME" or "resume" in file_name or "cv" in file_name:
        return "RESUME. NAME: New Candidate. EDUCATION: M.Tech in Computer Science, SPPU, 2022. B.Tech in Computer Science, SPPU, 2020. EXPERIENCE: Lecturer, ABC Polytechnic, 2022-Present. SKILLS: Python, Java, Data Structures."
    elif doc_type == "PHOTO" or "photo" in file_name or "pic" in file_name:
        return "[PHOTOGRAPH - No text content. This is a candidate passport-size photo.]"
    elif doc_type == "SIGNATURE" or "sign" in file_name:
        return "[SIGNATURE SPECIMEN - No text content. This is the candidate's signature.]"

    return "Sample extracted text from document."
