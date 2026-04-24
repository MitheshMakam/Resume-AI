from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ import ALL routers
from routers.resume import router as resume_router
from routers.jobs import router as jobs_router
from routers.recruiter import router as recruiter_router

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

# ✅ INCLUDE ALL ROUTES
app.include_router(resume_router, prefix="/api/resume", tags=["resume"])
app.include_router(jobs_router, prefix="/api/jobs", tags=["jobs"])
app.include_router(recruiter_router, prefix="/api/recruiter", tags=["recruiter"])

@app.get("/")
def root():
    return {"status": "ok"}