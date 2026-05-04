from fastapi import APIRouter, Query
from typing import Optional, List
from utils.job_store import get_all_jobs

router = APIRouter()

# 🔥 Expanded keywords (multi-domain support)
KEYWORDS = [
    # Web / Backend
    'react','node','aws','docker','kubernetes',
    'sql','python','javascript','typescript',
    'mongodb','express','html','css','git',

    # Game Dev
    'unity','unreal','c++','opengl','shader','game',

    # General / Systems
    'java','go','c#','redis','spark'
]


def extract_skills(text: str) -> List[str]:
    text = (text or "").lower()
    return [k for k in KEYWORDS if k in text]


def calculate_match_data(resume_text: str, job_desc: str):
    resume_skills = extract_skills(resume_text) or ["general"]
    job_skills = extract_skills(job_desc)

    if not job_skills:
        return 10, [], []  # fallback

    matched = [s for s in job_skills if s in resume_skills]
    missing = [s for s in job_skills if s not in resume_skills]

    score = int((len(matched) / len(job_skills)) * 100)

    # minimum baseline
    score = max(score, 10)

    return score, matched, missing


@router.get("/")
def list_jobs(
    role: Optional[str] = Query("developer"),
    location: Optional[str] = Query("india"),
    resume: Optional[str] = Query("")
):
    jobs = get_all_jobs(role, location)

    for job in jobs:
        score, matched, missing = calculate_match_data(
            resume,
            job.get("description", "")
        )

        job["match_score"] = score
        job["matched_skills"] = matched
        job["gap_skills"] = missing

    # 🔥 Sort best matches first
    jobs.sort(key=lambda x: x["match_score"], reverse=True)

    return jobs