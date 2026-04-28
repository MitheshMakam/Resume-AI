from fastapi import APIRouter, Query
from typing import Optional
from utils.job_store import get_all_jobs

router = APIRouter()

def calculate_match_score(resume_text, job_desc):
    if not resume_text:
        return 50  # default

    resume_text = resume_text.lower()
    job_desc = (job_desc or "").lower()

    keywords = ['react','node','aws','docker','kubernetes','sql','python']

    score = 0
    for k in keywords:
        if k in resume_text and k in job_desc:
            score += 15

    return min(score, 100)


@router.get("/")
def list_jobs(
    role: Optional[str] = Query("developer"),
    location: Optional[str] = Query("india"),
    resume: Optional[str] = Query("")
):
    jobs = get_all_jobs(role, location)

    for job in jobs:
        job["match_score"] = calculate_match_score(resume, job.get("description"))
        job["matched_skills"] = []
        job["gap_skills"] = []

    return jobs