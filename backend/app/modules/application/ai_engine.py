import json
import re
import logging
from typing import Any

from app.services.ocr_service import extract_text
from app.services.openai_client import analyze_documents, openai_ready

logger = logging.getLogger(__name__)


def _mask_sensitive(text: str) -> str:
    if not text:
        return text
    # Mask Aadhaar-like numbers
    return re.sub(r"\b\d{4}[- ]?\d{4}[- ]?\d{4}\b", "XXXX-XXXX-XXXX", text)


class DocumentAIEngine:
    @staticmethod
    def _normalized_result(result: dict[str, Any]) -> dict[str, Any]:
        normalized = {
            "document_analysis": result.get("document_analysis", []),
            "missing_documents": result.get("missing_documents", []),
            "mismatches": result.get("mismatches", []),
            "scrutiny_summary": result.get("scrutiny_summary", ""),
            "status": result.get("status", "REQUIRES_REVIEW"),
            "confidence_score": result.get("confidence_score", 0.5),
        }
        if normalized["status"] not in {"COMPLETE", "INCOMPLETE", "REQUIRES_REVIEW"}:
            normalized["status"] = "REQUIRES_REVIEW"
        try:
            normalized["confidence_score"] = float(normalized["confidence_score"])
        except Exception:
            normalized["confidence_score"] = 0.5
        normalized["confidence_score"] = max(0.0, min(1.0, normalized["confidence_score"]))
        return normalized

    async def analyze(self, documents, profile: dict[str, Any]) -> dict[str, Any]:
        logger.info(f"AI Scrutiny: Analyzing {len(documents)} documents for candidate {profile.get('name')}")
        extracted_docs: list[dict[str, Any]] = []
        images_payload = []
        for doc in documents:
            file_path = getattr(doc, "file_path", None) or doc.get("file_path") or doc.get("path")
            doc_type = getattr(doc, "document_type", None) or doc.get("document_type") or doc.get("type")
            
            from pathlib import Path
            backend_root = Path(__file__).resolve().parent.parent.parent.parent
            abs_file_path = str(backend_root / file_path) if file_path else ""
            
            logger.info(f"AI Scrutiny: Extracting text from {doc_type} ({abs_file_path})...")
            text = await extract_text(abs_file_path, document_type=doc_type)
            text = _mask_sensitive(text)
            
            snippet = text[:50].replace('\n', ' ') + "..." if text else "EMPTY"
            logger.info(f"AI Scrutiny: Extracted {len(text)} chars from {doc_type}. Snippet: {snippet}")
            
            extracted_docs.append({"type": doc_type, "text": text[:3000]})
            
            try:
                import os
                import base64
                
                abs_path_obj = Path(abs_file_path)
                if abs_path_obj.exists() and abs_file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                    with open(abs_file_path, "rb") as f:
                        b64_str = base64.b64encode(f.read()).decode('utf-8')
                    ext = abs_file_path.split('.')[-1].lower()
                    mime = f"image/{ext}" if ext != 'jpg' else "image/jpeg"
                    images_payload.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime};base64,{b64_str}",
                            "detail": "low"
                        }
                    })
            except Exception as e:
                logger.warning(f"Failed to read image {abs_file_path} for vision: {str(e)}")

        prompt = f"""
You are performing document scrutiny for a government recruitment application.

═══════════════════════════════════════════
CANDIDATE PROFILE (from application form):
═══════════════════════════════════════════
Name: {profile.get('name')}
Qualifications: {profile.get('qualifications')}
Experience: {profile.get('experience')}

═══════════════════════════════════════════
SUBMITTED DOCUMENTS (OCR-extracted text):
═══════════════════════════════════════════
{json.dumps(extracted_docs, ensure_ascii=False)}

═══════════════════════════════════════════
DOCUMENT-TYPE-AWARE ANALYSIS INSTRUCTIONS:
═══════════════════════════════════════════

CRITICAL: Each document type contains SPECIFIC fields. Only extract and verify fields that NATURALLY EXIST on that document type.

■ PHOTO:
  - Extract: Nothing textual. This is a photograph.
  - Verify: Visually compare with the photo embedded on the Aadhar card (if available). Flag ONLY if faces clearly do not match.
  - Do NOT flag: Anything about text, degree, year, etc.

■ SIGNATURE:
  - Extract: Nothing. This is a signature specimen.
  - Verify: Check if the image appears to contain a valid signature.
  - Do NOT flag: Anything about name matching, education, etc.

■ AADHAR / AADHAR CARD:
  - Extract: Name, Date of Birth, Gender, Address (if readable).
  - Verify against profile: Name match, DOB match (if profile has DOB).
  - Verify visually: Compare photo on Aadhar with the candidate's uploaded PHOTO.
  - Do NOT extract or flag: Degree, university, passing year, marks — Aadhar cards NEVER contain these.

■ DEGREE_CERTIFICATE:
  - Extract: Candidate Name, Degree name, University/Board, Year of Passing or Month/Year, sometimes DOB.
  - Verify against profile: Degree matches qualifications, University matches, Passing Year matches.
  - Verify against Aadhar: Name consistency.
  - Flag only if: A field IS present on the certificate but CONTRADICTS the profile, OR a critical field (degree, year) is genuinely unreadable/absent from the certificate.

■ MARKSHEET:
  - Extract: Candidate Name, Exam name, University/Board, Year/Month of passing, Marks/Percentage/Grade, Seat/Roll number.
  - Verify against profile: Degree and year consistency.
  - Verify against Degree Certificate: Year and University consistency.
  - Read carefully: Marksheets often show dates in headers, footers, exam session labels (e.g., "May 2019", "Examination held in June 2020"). Look thoroughly before claiming a date is missing.
  - Flag only if: Information is genuinely contradictory or a critical field is truly absent after thorough reading.

■ RESUME / CV:
  - Extract: Name, Qualifications (degree, university, year), Work Experience.
  - Verify against profile: All claimed qualifications and experience.
  - Verify against certificates: Cross-check degrees and years mentioned in resume vs. actual certificates.
  - Note: Resume is self-declared. Discrepancies between resume and official certificates are significant.

═══════════════════════════════════════════
ANTI-HALLUCINATION CHECKLIST (follow strictly):
═══════════════════════════════════════════
Before reporting ANY issue, ask yourself:
  1. Did I ACTUALLY see/read this information (or its absence) in the document? If NO → do not report.
  2. Is this field EXPECTED to exist on this document type? If NO → do not report its absence.
  3. Am I comparing fields that exist on BOTH documents? If NO → do not report a mismatch.
  4. Did I read the ENTIRE document text (headers, footers, stamps, seals) before claiming something is missing? If NO → re-read.
  5. NEVER state that an Aadhar card lacks educational details. It is NOT SUPPOSED to have them. This is a critical failure.

═══════════════════════════════════════════
MISSING DOCUMENTS RULES:
═══════════════════════════════════════════
Only report a document/field as "missing" if:
  - A required field (e.g., passing year) is genuinely NOT FOUND anywhere in the document text after thorough reading.
  - The candidate's profile claims a qualification but NO corresponding certificate was submitted.
Do NOT report: Fields missing from documents that never contain those fields (e.g., "passing year missing from Aadhar").

═══════════════════════════════════════════
OUTPUT FORMAT (strict JSON):
═══════════════════════════════════════════
Return ONLY this JSON structure:
{{
  "document_analysis": [
    {{
      "document_type": "AADHAR",
      "extracted_fields": {{
        "name": "value or null",
        "dob": "value or null",
        "address": "value or null"
      }},
      "issues": ["Only genuine issues as descriptive strings"]
    }},
    {{
      "document_type": "DEGREE_CERTIFICATE",
      "extracted_fields": {{
        "name": "value or null",
        "degree": "value or null",
        "university": "value or null",
        "year_of_passing": "value or null"
      }},
      "issues": ["Only genuine issues as descriptive strings"]
    }}
  ],
  "missing_documents": ["Only genuinely missing items as strings"],
  "mismatches": ["Only real cross-document contradictions as descriptive strings"],
  "scrutiny_summary": "Brief factual summary of verification findings",
  "status": "COMPLETE | INCOMPLETE | REQUIRES_REVIEW",
  "confidence_score": 0.0
}}

REMEMBER: Every issue you report must be FACTUALLY GROUNDED in the actual document content. Zero tolerance for assumptions.
"""

        try:
            if not openai_ready():
                raise RuntimeError("OPENAI_UNAVAILABLE")
            raw = await analyze_documents(prompt, images=images_payload)
            result = self._normalized_result(json.loads(raw))
        except Exception:
            result = self._normalized_result({
                "document_analysis": [],
                "missing_documents": [],
                "mismatches": [],
                "status": "REQUIRES_REVIEW",
                "scrutiny_summary": "AI parsing failed or unavailable; manual scrutiny required.",
                "confidence_score": 0.5,
            })
        return result
