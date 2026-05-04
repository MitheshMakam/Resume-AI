import requests
import os

APP_ID = os.getenv("ADZUNA_APP_ID")
APP_KEY = os.getenv("ADZUNA_APP_KEY")

BASE_URL = "https://api.adzuna.com/v1/api/jobs"


def get_all_jobs(role="developer", location="india"):
    url = f"{BASE_URL}/in/search/1"

    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "what": role,
        "where": location,
        "results_per_page": 20,
    }

    try:
        res = requests.get(url, params=params)
        data = res.json()
    except Exception as e:
        print("Job API error:", e)
        return []

    jobs = []

    for job in data.get("results", []):
        jobs.append({
            "id": job.get("id"),
            "title": job.get("title"),
            "company": job.get("company", {}).get("display_name"),
            "location": job.get("location", {}).get("display_name"),
            "description": job.get("description"),
            "url": job.get("redirect_url"),

            # ❌ REMOVE FAKE LOGIC
            # these will be filled in jobs.py
            "match_score": 0,
            "matched_skills": [],
            "gap_skills": [],

            "salary": "Not specified",
            "posted": "Recently"
        })

    return jobs