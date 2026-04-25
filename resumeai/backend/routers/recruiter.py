from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ml.resume_engine import parse_resume, score_ats, match_jobs_to_resume
from utils.job_store import get_all_jobs
from db import SessionLocal
from models import Candidate
import uuid

router = APIRouter()

# ---------------- REQUEST MODEL ----------------
class CandidateSubmit(BaseModel):
    resume_text: str
    job_id: str
    name: str
    email: str


# ---------------- SUBMIT ----------------
@router.post("/submit")
def submit_candidate(data: CandidateSubmit):
    db = SessionLocal()

    parsed = parse_resume(data.resume_text)
    scores = score_ats(parsed)
    jobs = get_all_jobs()
    matched = match_jobs_to_resume(data.resume_text, jobs)

    target_match = next((j for j in matched if j["id"] == data.job_id), None)

    candidate = Candidate(
        id=f"c_{uuid.uuid4()}",
        name=data.name,
        email=data.email,
        job_id=data.job_id,
        ats_score=scores["overall"],
        match_score=target_match["match_score"] if target_match else 0,
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    db.close()

    return candidate


# ---------------- DASHBOARD ----------------
@router.get("/dashboard")
def dashboard():
    db = SessionLocal()
    candidates = db.query(Candidate).all()

    total = len(candidates)
    qualified = [c for c in candidates if c.ats_score >= 70]
    high_match = [c for c in candidates if c.match_score >= 80]

    avg_score = round(
        sum(c.ats_score for c in candidates) / total, 1
    ) if total else 0

    db.close()

    return {
        "total_applicants": total,
        "ats_qualified": len(qualified),
        "high_match": len(high_match),
        "avg_ats_score": avg_score,
    }


# ---------------- LIST CANDIDATES ----------------
@router.get("/candidates")
def list_candidates(job_id: Optional[str] = None, min_ats: int = 0):
    db = SessionLocal()
    query = db.query(Candidate)

    if job_id:
        query = query.filter(Candidate.job_id == job_id)

    if min_ats:
        query = query.filter(Candidate.ats_score >= min_ats)

    candidates = query.order_by(Candidate.match_score.desc()).all()

    db.close()

    return candidates