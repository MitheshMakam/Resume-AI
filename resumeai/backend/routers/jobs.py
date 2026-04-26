from fastapi import APIRouter, Query
from typing import Optional
from utils.job_store import get_all_jobs

router = APIRouter()

@router.get("/")
def list_jobs(
    role: Optional[str] = Query("developer"),
    location: Optional[str] = Query("india"),
):
    return get_all_jobs(role, location)


@router.get("/search")
def search(q: str = Query(...)):
    return get_all_jobs(q)


@router.get("/{job_id}")
def get_job(job_id: str):
    jobs = get_all_jobs()
    for job in jobs:
        if str(job["id"]) == job_id:
            return job
    return {"error": "Job not found"}