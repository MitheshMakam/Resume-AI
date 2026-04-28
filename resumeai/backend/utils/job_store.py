import requests
import os
import re

APP_ID = os.getenv("ADZUNA_APP_ID")
APP_KEY = os.getenv("ADZUNA_APP_KEY")

BASE_URL = "https://api.adzuna.com/v1/api/jobs"

# 🔥 simple skill list
SKILLS = ["python", "react", "node", "aws", "docker", "kubernetes", "sql"]

def extract_skills(text: str):
    text = text.lower()
    return [s for s in SKILLS if s in text]


def get_all_jobs(role="developer", location="india", resume_text: str = ""):
    url = f"{BASE_URL}/in/search/1"

    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "what": role,
        "where": location,
        "results_per_page": 20,
    }

    res = requests.get(url, params=params)
    data = res.json()

    resume_skills = extract_skills(resume_text)

    jobs = []

    for job in data.get("results", []):
        desc = job.get("description", "")
        job_skills = extract_skills(desc)

        # 🔥 matching logic
        matched = [s for s in job_skills if s in resume_skills]
        gaps = [s for s in job_skills if s not in resume_skills]

        match_score = int((len(matched) / len(job_skills)) * 100) if job_skills else 0

        jobs.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "company": job.get("company", {}).get("display_name"),
            "location": job.get("location", {}).get("display_name"),
            "description": desc,
            "url": job.get("redirect_url"),

            # ✅ IMPORTANT
            "match_score": match_score,
            "matched_skills": matched,
            "gap_skills": gaps,
        })

    return jobs