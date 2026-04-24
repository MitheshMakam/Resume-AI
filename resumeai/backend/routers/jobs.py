from fastapi import APIRouter, Query
from typing import Optional
from utils.job_store import get_all_jobs, search_jobs  # ✅ REQUIRED

router = APIRouter()

@router.get("/")
def list_jobs(
    role: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_match: Optional[float] = Query(None),
    limit: int = Query(20),
):
    jobs = get_all_jobs()

    if role:
        jobs = [
            j for j in jobs
            if role.lower() in j["title"].lower()
            or role.lower() in j.get("type", "").lower()
        ]

    if location and location != "all":
        jobs = [j for j in jobs if location.lower() in j["location"].lower()]

    if min_match is not None:
        jobs = [j for j in jobs if j.get("match_score", 100) >= min_match]

    return jobs[:limit]


@router.get("/search")
def search(q: str = Query(...)):
    return search_jobs(q)


@router.get("/{job_id}")
def get_job(job_id: str):
    jobs = get_all_jobs()
    for job in jobs:
        if job["id"] == job_id:
            return job
    return {"error": "Job not found"}