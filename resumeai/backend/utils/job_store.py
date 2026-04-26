import requests

def get_all_jobs():
    url = "https://remotive.com/api/remote-jobs"

    try:
        res = requests.get(url)
        data = res.json()

        jobs = []
        for job in data["jobs"][:20]:
            jobs.append({
                "id": job["id"],
                "title": job["title"],
                "company": job["company_name"],
                "location": job["candidate_required_location"],
                "description": job["description"],
                "url": job["url"],
                "match_score": 0  # we calculate later
            })

        return jobs

    except Exception as e:
        print("Job API failed:", e)
        return []
