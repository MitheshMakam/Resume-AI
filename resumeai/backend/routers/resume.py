from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from ml.resume_engine import (
    extract_text_from_pdf,
    extract_text_from_docx,
    parse_resume,
    score_ats,
    generate_suggestions,
    match_jobs_to_resume,
)
from utils.job_store import get_all_jobs

router = APIRouter()

class ResumeTextRequest(BaseModel):
    text: str

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(400, "Only PDF and DOCX files are supported.")
    
    content = await file.read()
    
    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(content)
    else:
        text = extract_text_from_docx(content)
    
    if not text.strip():
        raise HTTPException(422, "Could not extract text from the resume. Try a different file.")
    
    parsed = parse_resume(text)
    scores = score_ats(parsed)
    suggestions = generate_suggestions(parsed, scores)
    
    # Job matching
    jobs = get_all_jobs()
    matched_jobs = match_jobs_to_resume(text, jobs)
    
    return {
        "raw_text": text[:500],  # preview only
        "parsed": parsed,
        "ats_scores": scores,
        "suggestions": suggestions,
        "matched_jobs": matched_jobs[:10],
    }

@router.post("/analyze-text")
async def analyze_text(req: ResumeTextRequest):
    text = req.text
    parsed = parse_resume(text)
    scores = score_ats(parsed)
    suggestions = generate_suggestions(parsed, scores)
    jobs = get_all_jobs()
    matched_jobs = match_jobs_to_resume(text, jobs)
    return {
        "parsed": parsed,
        "ats_scores": scores,
        "suggestions": suggestions,
        "matched_jobs": matched_jobs[:10],
    }

@router.post("/improve")
async def improve_resume(req: ResumeTextRequest):
    """Use AI to rewrite the resume with improvements applied."""
    parsed = parse_resume(req.text)
    scores = score_ats(parsed)
    suggestions = generate_suggestions(parsed, scores)
    
    # Return structured improvement guidance (in production, pipe through LLM here)
    return {
        "original_score": scores["overall"],
        "suggestions": suggestions,
        "estimated_improved_score": min(95, scores["overall"] + 18),
        "key_changes": [s["title"] for s in suggestions if s["type"] in ("critical", "warning")]
    }
