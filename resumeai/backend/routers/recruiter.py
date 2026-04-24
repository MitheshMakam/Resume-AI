from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from ml.resume_engine import parse_resume, score_ats, match_jobs_to_resume
from utils.job_store import get_all_jobs

router = APIRouter()

candidate_store = []


class CandidateSubmit(BaseModel):
    resume_text: str
    job_id: str
    name: str
    email: str


@router.post("/submit")
def submit_candidate(data: CandidateSubmit):
    parsed = parse_resume(data.resume_text)
    scores = score_ats(parsed)
    jobs = get_all_jobs()

    matched = match_jobs_to_resume(data.resume_text, jobs)
    target_match = next((j for j in matched if j["id"] == data.job_id), None)

    candidate = {
        "id": f"c_{len(candidate_store)+1:04d}",
        "name": data.name,
        "email": data.email,
        "job_id": data.job_id,
        "ats_score": scores["overall"],
        "match_score": target_match["match_score"] if target_match else 0,
        "matched_skills": target_match.get("matched_skills", []) if target_match else [],
        "gap_skills": target_match.get("gap_skills", []) if target_match else [],
        "parsed": parsed,
        "scores": scores,
    }

    candidate_store.append(candidate)
    return candidate


@router.get("/dashboard")
def dashboard():
    total = len(candidate_store)

    qualified = [c for c in candidate_store if c["ats_score"] >= 70]
    high_match = [c for c in candidate_store if c["match_score"] >= 80]

    avg_score = round(
        sum(c["ats_score"] for c in candidate_store) / total, 1
    ) if total else 0

    # skill frequency
    skill_freq = {}
    for c in candidate_store:
        for s in c["parsed"].get("skills", []):
            skill_freq[s] = skill_freq.get(s, 0) + 1

    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "total_applicants": total,
        "ats_qualified": len(qualified),
        "high_match": len(high_match),
        "avg_ats_score": avg_score,
        "top_candidates": sorted(candidate_store, key=lambda x: x["match_score"], reverse=True)[:10],
        "skill_frequency": [
            {"skill": s, "count": c, "pct": round(c / total * 100) if total else 0}
            for s, c in top_skills
        ],
        "pipeline": {
            "all": total,
            "ats_pass": len(qualified),
            "phone_screen": max(0, len(qualified) - 10),
            "onsite": max(0, len(qualified) - 20),
            "offer": max(0, len(qualified) - 30),
        }
    }


@router.get("/candidates")
def list_candidates(job_id: Optional[str] = None, min_ats: int = 0):
    result = candidate_store

    if job_id:
        result = [c for c in result if c["job_id"] == job_id]

    if min_ats:
        result = [c for c in result if c["ats_score"] >= min_ats]

    return sorted(result, key=lambda x: x["match_score"], reverse=True)