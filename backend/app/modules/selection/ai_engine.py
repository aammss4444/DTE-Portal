import json
import logging
from typing import Any, Dict, List

from app.services.openai_client import call_llm_selection

logger = logging.getLogger(__name__)


class SelectionAIEngine:
    async def generate_ai_rankings(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate candidate rankings from scratch using LLM.
        Expected keys in payload: 'candidates', 'vacancy_count'.
        """
        prompt = f"""
You are an expert HR Selection AI Engine for an enterprise faculty recruitment portal.
Your task is to rank the following candidates based on their data.

Available Vacancies: {payload.get('vacancy_count', 0)}

Candidates Data:
{json.dumps(payload.get('candidates', []), indent=2)}

Instructions for Ranking:
1. You MUST calculate a 'final_score' out of 100 for each candidate using EXACTLY this weighted mathematical formula:
   - 35% Weight: Interview Score (Use their raw interview score out of 100).
   - 20% Weight: Experience in Years (Score out of 100 where 10+ years is 100, e.g. 5 years = 50).
   - 15% Weight: Marks % (Use the percentage marks in their highest degree).
   - 15% Weight: Qualification Level (Score out of 100: e.g. PhD=100, M.Tech/Masters=80, B.Tech/Bachelors=60).
   - 15% Weight: Resume Evaluation (Score out of 100 based on relevance of skills, certifications, and domain expertise found in resume_summary).
2. Calculate the math carefully to compute the final_score out of 100.
3. Assign a 'rank' (integer, 1 being the best) to each candidate based strictly on the highest final_score. Do not use duplicate ranks.
4. Set 'result_status' to "SELECTED" if rank <= Vacancies, otherwise "WAITLISTED" (up to 3 places after vacancies), and "REJECTED" for the rest.
5. Provide a detailed, point-wise list of 'reasons' explaining exactly how the score was calculated for this candidate. You MUST provide at least 4 separate points:
    - Point 1: Their Interview performance (35% weight).
    - Point 2: Their Experience evaluation (20% weight).
    - Point 3: Their Degree marks percentage (15% weight).
    - Point 4: Their Qualification level evaluation (15% weight).
    - Point 5: Analyze the candidate's resume_summary and highlight relevant skills, certifications, domain expertise, or projects and explain the score given (15% weight).
    CRITICAL: Do NOT combine these into a single sentence. Output them as separate string elements in the "reasons" array.

Return STRICT JSON adhering to this exact schema (no markdown, no backticks, just JSON):
{{
  "rankings": [
    {{
      "application_id": "uuid-string-here",
      "candidate_id": "uuid-string-here",
      "final_score": 85.5,
      "rank": 1,
      "result_status": "SELECTED",
      "waitlist_position": null,
      "reasons": [
        "Candidate has the highest teaching experience of 8.5 years.",
        "Holds a Ph.D. which is superior to other candidates' qualifications.",
        "Secured an excellent interview score of 88/100."
      ]
    }}
  ]
}}
"""
        raw = await call_llm_selection(prompt)

        if not raw:
            logger.warning("AI Ranking failed to return content.")
            return {"rankings": []}

        try:
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
                
            parsed = json.loads(raw)
            return parsed
        except Exception as e:
            logger.error(f"Failed to parse AI Ranking JSON: {str(e)} | Raw: {raw}")
            return {"rankings": []}

    async def analyze(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze candidate selection data using LLM.
        Expected keys in payload: 'candidates', 'ranking'.
        """
        prompt = f"""
Candidates:
{json.dumps(payload.get('candidates', []), indent=2)}

System Ranking:
{json.dumps(payload.get('ranking', []), indent=2)}

Tasks:

1. Suggest ranking improvements based on qualifications and experience vs interview marks.
2. Detect bias:
   * uniform interview marks (all candidates getting same or very similar marks)
   * qualification vs rank mismatch (highly qualified but ranked very low)
   * reservation imbalance (reserved category candidates being overlooked despite scores)
3. Provide insights for the principal.

Return STRICT JSON:
{{
  "ranking_suggestions": [
    {{ "application_id": "CAND-001", "suggested_rank": 1, "reason": "Higher qualification score" }}
  ],
  "bias_flags": [
    {{ "type": "UNIFORM_INTERVIEW_MARKS", "severity": "HIGH", "description": "Suspicious uniformity in interview marks" }}
  ],
  "insights": ["Overall selection seems fair", "Candidate CAND-001 shows exceptional research background"],
  "confidence_score": 0.9
}}
"""
        raw = await call_llm_selection(prompt)

        if not raw:
            logger.warning("AI Analysis failed to return content, using fallback.")
            return self._fallback()

        try:
            # Clean possible markdown formatting if AI includes it
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
                
            parsed = json.loads(raw)
        except Exception as e:
            logger.error(f"Failed to parse AI Analysis JSON: {str(e)} | Raw: {raw}")
            return self._fallback()

        return self._validate(parsed)

    def _fallback(self) -> Dict[str, Any]:
        return {
            "ranking_suggestions": [],
            "bias_flags": [
                {
                    "type": "AI_FAILURE",
                    "severity": "LOW",
                    "description": "AI analysis unavailable, system defaults applied.",
                }
            ],
            "insights": ["System ranking used as the primary source of truth."],
            "confidence_score": 0.5,
        }

    def _validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Ensure all required keys exist and types are correct
        return {
            "ranking_suggestions": [
                {
                    "application_id": str(item.get("application_id", "")),
                    "suggested_rank": int(item.get("suggested_rank", 0)),
                    "reason": str(item.get("reason", "N/A")),
                }
                for item in data.get("ranking_suggestions", [])
                if item.get("application_id")
            ],
            "bias_flags": [
                {
                    "type": str(item.get("type", "UNKNOWN")),
                    "severity": str(item.get("severity", "LOW")),
                    "description": str(item.get("description", "N/A")),
                }
                for item in data.get("bias_flags", [])
            ],
            "insights": [str(i) for i in data.get("insights", [])],
            "confidence_score": float(data.get("confidence_score", 0.5)),
        }
