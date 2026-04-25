from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine

from routers.resume import router as resume_router
from routers.jobs import router as jobs_router
from routers.recruiter import router as recruiter_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResumeAI API", version="1.0.0")

origins = [
    "https://resumetrack.vercel.app",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router, prefix="/api/resume")
app.include_router(jobs_router, prefix="/api/jobs")          # ✅ THIS WAS MISSING
app.include_router(recruiter_router, prefix="/api/recruiter") # ✅ THIS WAS MISSING

@app.get("/")
def root():
    return {"status": "ok"}