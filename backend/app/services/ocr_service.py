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
    OCR is totally removed as requested.
    """
    return ""
