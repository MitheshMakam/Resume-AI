from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, jobs, recruiter

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

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(recruiter.router, prefix="/api/recruiter", tags=["recruiter"])

@app.get("/test-cors")
def test_cors():
    return {"msg": "cors working"}

@app.options("/{full_path:path}")
async def preflight_handler():
    return {"ok": True}
