import asyncio
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    from openai import AsyncOpenAI  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    AsyncOpenAI = None  # type: ignore

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if AsyncOpenAI and settings.OPENAI_API_KEY else None

SYSTEM_PROMPT = """
You are an AI assistant for a Government Education System (DTE CHB Portal).

Generate official recruitment advertisements for Clock Hour Basis (CHB) lecturers.

STRICT RULES:

* Follow formal government tone
* Ensure completeness (institution, course, vacancies, qualification, reservation, deadline, documents)
* Maintain consistency between English and Marathi versions
* Do NOT hallucinate unknown data
* Output STRICT JSON only
"""

DOCUMENT_SYSTEM_PROMPT = """
You are a senior document verification officer for a government recruitment system (DTE CHB Portal).
Your job is to meticulously analyze candidate-submitted documents using multimodal capabilities.

ABSOLUTE RULES — VIOLATION IS UNACCEPTABLE:

1. ONLY report information that you can DIRECTLY SEE or READ in the provided documents and images.
   - If text is blurry, unreadable, or partially visible, say "unreadable" — do NOT guess.
   - If a field is not present in a document, say "not found in document" — do NOT fabricate.

2. UNDERSTAND WHAT EACH DOCUMENT TYPE CONTAINS:
   - AADHAR CARD: Contains ONLY — Name, Date of Birth, Gender, Address, Photo, Aadhaar Number. 
     It NEVER contains educational details (degree, university, passing year). Do NOT flag Aadhar for missing educational info.
   - DEGREE CERTIFICATE / MARKSHEET: Contains — Candidate Name, Degree, University/Board, Year/Month of Passing, Marks/Grade, sometimes Date of Birth.
   - RESUME / CV: Contains — Personal details, Educational qualifications, Work experience, Skills. This is self-declared and should be cross-checked against certificates.
   - PHOTO: A passport-style photo of the candidate for identity verification.
   - SIGNATURE: The candidate's signature specimen.

3. CROSS-VERIFICATION RULES:
   - Compare Name across: Profile ↔ Aadhar ↔ Degree Certificate. Only flag if names are actually different.
   - Compare Photo across: Uploaded Photo ↔ Photo on Aadhar card. Only flag if faces visually differ.
   - Compare Educational details across: Profile ↔ Degree Certificate ↔ Marksheet ↔ Resume.
   - Compare Date of Birth across: Profile ↔ Aadhar ↔ Degree Certificate (if DOB is present on certificate).
   - Do NOT compare fields across documents where those fields don't naturally exist.

4. REPORTING:
   - Each issue MUST cite the specific document and the specific value seen (or "not found").
   - Example: "Degree certificate shows passing year '2019', but candidate profile states '2020'."
   - Example: "Name on Aadhar reads 'Rajesh Kumar' but profile name is 'Rajesh K. Kumar'."
   - Do NOT report obvious non-issues (e.g., "Aadhar does not contain degree information" — that is EXPECTED).

5. Output STRICT JSON only. All issues and mismatches must be arrays of descriptive strings, NOT objects.
"""


SELECTION_SYSTEM_PROMPT = """
You are an AI assistant for a Government recruitment system.

Analyze candidate rankings and detect bias.

STRICT RULES:

* Do NOT modify system scores
* Only provide suggestions
* Detect bias objectively
* Output STRICT JSON only
"""


def _safe(text: str | None, limit: int = 500) -> str:
    if not text:
        return ""
    return text if len(text) <= limit else text[:limit] + "...<truncated>"


async def generate_ad(prompt: str) -> str:
    if client is None:
        raise RuntimeError("OpenAI client unavailable. Install `openai` and set OPENAI_API_KEY.")

    timeout_seconds = min(max(settings.LLM_TIMEOUT_SECONDS, 1), 30)
    logger.info("OpenAI ad prompt (truncated): %s", _safe(prompt))

    resp = await asyncio.wait_for(
        client.chat.completions.create(
            model=settings.OPENAI_MODEL or "gpt-4o-mini",
            temperature=0.2,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        ),
        timeout=timeout_seconds,
    )
    content = (resp.choices[0].message.content or "").strip()
    logger.info("OpenAI ad response (truncated): %s", _safe(content))
    return content


def openai_ready() -> bool:
    return client is not None


async def analyze_documents(prompt: str, images: list[dict] | None = None) -> str:
    if client is None:
        raise RuntimeError("OpenAI client unavailable. Install `openai` and set OPENAI_API_KEY.")

    timeout_seconds = min(max(settings.LLM_TIMEOUT_SECONDS, 1), 60)
    logger.info("OpenAI document prompt (truncated): %s", _safe(prompt))
    
    user_content = [{"type": "text", "text": prompt}]
    if images:
        user_content.extend(images)

    resp = await asyncio.wait_for(
        client.chat.completions.create(
            model=settings.OPENAI_MODEL or "gpt-4o",  # Prefer gpt-4o for vision tasks
            temperature=0.1,
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": DOCUMENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
        ),
        timeout=timeout_seconds,
    )
    content = (resp.choices[0].message.content or "").strip()
    logger.info("OpenAI document response (truncated): %s", _safe(content))
    return content


async def call_llm_selection(prompt: str) -> str | None:
    if client is None:
        logger.error("OpenAI client unavailable for selection analysis.")
        return None

    try:
        timeout_seconds = 30  # Increased timeout to prevent TimeoutError
        resp = await asyncio.wait_for(
            client.chat.completions.create(
                model=settings.OPENAI_MODEL or "gpt-4o-mini",
                temperature=0.1,
                response_format={ "type": "json_object" },
                messages=[
                    {"role": "system", "content": SELECTION_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            ),
            timeout=timeout_seconds,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        logger.error(f"Error calling OpenAI for selection: {str(e)}")
        return None

async def call_llm_attendance(prompt: str) -> str | None:
    if client is None:
        logger.error("OpenAI client unavailable for attendance analysis.")
        return None

    timeout_seconds = 5
    
    for attempt in range(2): # max 1 retry
        try:
            resp = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.OPENAI_MODEL or "gpt-4o-mini",
                    temperature=0.1,
                    response_format={ "type": "json_object" },
                    messages=[
                        {"role": "system", "content": "You are an AI analyzing faculty attendance logs. Return strict JSON."},
                        {"role": "user", "content": prompt},
                    ],
                ),
                timeout=timeout_seconds,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:
            logger.warning(f"Error calling OpenAI for attendance (attempt {attempt+1}): {str(e)}")
            if attempt == 1:
                return None
    return None

async def call_llm_billing(prompt: str) -> str | None:
    if client is None:
        logger.error("OpenAI client unavailable for billing validation.")
        return None

    timeout_seconds = 5
    
    for attempt in range(2): # max 1 retry
        try:
            resp = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.OPENAI_MODEL or "gpt-4o-mini",
                    temperature=0.1,
                    response_format={ "type": "json_object" },
                    messages=[
                        {"role": "system", "content": "You are validating a faculty bill in a government system. Output strict JSON."},
                        {"role": "user", "content": prompt},
                    ],
                ),
                timeout=timeout_seconds,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:
            logger.warning(f"Error calling OpenAI for billing (attempt {attempt+1}): {str(e)}")
            if attempt == 1:
                return None
    return None

async def call_llm_count_faces(base64_image: str) -> int | None:
    if client is None:
        logger.error("OpenAI client unavailable for face counting.")
        return None

    try:
        resp = await asyncio.wait_for(
            client.chat.completions.create(
                model=settings.OPENAI_MODEL or "gpt-4o",
                temperature=0.0,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Count the exact number of human faces/students visible in this image. Return STRICTLY a single integer representing the count, and absolutely nothing else."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
            ),
            timeout=15,
        )
        content = (resp.choices[0].message.content or "").strip()
        import re
        match = re.search(r'\d+', content)
        if match:
            return int(match.group())
        return None
    except Exception as e:
        logger.error(f"Error calling OpenAI for face counting: {str(e)}")
        return None


RESUME_PARSE_SYSTEM_PROMPT = """
You are an AI that extracts structured candidate profile data from resumes.
STRICT RULES:
* Extract ONLY information that is explicitly stated in the resume.
* Do NOT hallucinate or assume any data.
* Output STRICT JSON only.
"""


async def call_llm_parse_resume(resume_text: str) -> str | None:
    if client is None:
        logger.error("OpenAI client unavailable for resume parsing.")
        return None

    prompt = f"""
Extract structured candidate details from the following resume text. 
Only extract fields that are clearly mentioned.

Resume Text:
{resume_text}

Return STRICT JSON with this exact schema (use null for fields not found):
{{
  "full_name": "string or null",
  "father_name": "string or null",
  "date_of_birth": "YYYY-MM-DD or null",
  "gender": "Male/Female/Other or null",
  "address": "string or null",
  "district": "string or null",
  "state": "string or null",
  "pincode": "string or null",
  "qualifications": [
    {{
      "degree": "e.g. B.Tech, M.Tech, PhD",
      "specialization": "e.g. Computer Engineering",
      "university": "e.g. Mumbai University",
      "year_of_passing": 2020,
      "percentage": 75.5
    }}
  ],
  "experiences": [
    {{
      "institution_name": "e.g. AVS Polytechnic",
      "designation": "e.g. Lecturer",
      "from_date": "YYYY-MM-DD or null",
      "to_date": "YYYY-MM-DD or null (null if current)",
      "is_current": true,
      "experience_type": "TEACHING or INDUSTRY"
    }}
  ],
  "skills": ["skill1", "skill2"]
}}
"""
    try:
        resp = await asyncio.wait_for(
            client.chat.completions.create(
                model=settings.OPENAI_MODEL or "gpt-4o-mini",
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": RESUME_PARSE_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            ),
            timeout=30,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        logger.error(f"Error calling OpenAI for resume parsing: {str(e)}")
        return None

