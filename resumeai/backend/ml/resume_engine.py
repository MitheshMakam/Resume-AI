import re
import pdfplumber
from docx import Document
import io
from typing import List, Dict, Any

# ---------------- SKILLS ----------------

SKILL_KEYWORDS = [
    "python","javascript","typescript","java","go","rust","c++","c#","ruby","php",
    "react","vue","angular","next.js","node.js","fastapi","django","flask","spring",
    "aws","gcp","azure","docker","kubernetes","terraform","jenkins","ci/cd",
    "sql","postgresql","mysql","mongodb","redis",
    "pandas","numpy","tensorflow","scikit-learn",
    "linux","git","rest api","microservices"
]

ATS_SECTIONS = ["summary","experience","education","skills","projects","certifications"]

ACTION_VERBS = [
    "led","built","designed","developed","implemented","optimized",
    "reduced","increased","improved","deployed","launched",
    "managed","created","automated","scaled"
]

# ---------------- SAFE HELPERS ----------------

def normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower())


# ---------------- FILE EXTRACTION ----------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    except Exception:
        return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs])
    except Exception:
        return ""


# ---------------- PARSE RESUME ----------------

def parse_resume(text: str) -> Dict[str, Any]:
    lower = text.lower()

    name = text.split("\n")[0].strip() if text else ""

    email = re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text)
    phone = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text)

    github = re.search(r"github\.com/[\w-]+", lower)
    linkedin = re.search(r"linkedin\.com/in/[\w-]+", lower)

    detected_skills = [s for s in SKILL_KEYWORDS if s in lower]
    sections_found = [s for s in ATS_SECTIONS if s in lower]

    action_count = sum(1 for v in ACTION_VERBS if v in lower)
    quantified = len(re.findall(r"\d+[%xX]|\$[\d,]+", text))

    return {
        "name": name,
        "email": email.group() if email else "",
        "phone": phone.group() if phone else "",
        "github": github.group() if github else "",
        "linkedin": linkedin.group() if linkedin else "",
        "skills": detected_skills,
        "sections": sections_found,
        "action_verb_count": action_count,
        "quantified_bullets": quantified,
        "word_count": len(text.split()) if text else 0,
        "raw_text": text
    }


# ---------------- ATS SCORING ----------------

def score_ats(parsed: Dict[str, Any]) -> Dict[str, int]:

    skills_score = min(100, len(parsed["skills"]) * 5)

    format_score = int(
        (len(parsed["sections"]) / max(1, len(ATS_SECTIONS))) * 100
    )

    readability_score = min(
        100,
        parsed["action_verb_count"] * 10 +
        (10 if 400 < parsed["word_count"] < 800 else 0)
    )

    completeness_items = [
        bool(parsed["email"]),
        bool(parsed["phone"]),
        bool(parsed["github"] or parsed["linkedin"]),
        "experience" in parsed["sections"],
        "education" in parsed["sections"],
        "skills" in parsed["sections"],
    ]

    completeness_score = int(
        sum(completeness_items) / len(completeness_items) * 100
    )

    overall = int(
        skills_score * 0.3 +
        format_score * 0.2 +
        skills_score * 0.2 +
        readability_score * 0.15 +
        completeness_score * 0.15
    )

    return {
        "keywords": skills_score,
        "format": format_score,
        "skills_match": skills_score,
        "readability": readability_score,
        "completeness": completeness_score,
        "overall": overall
    }


# ---------------- SUGGESTIONS ----------------

def generate_suggestions(parsed: Dict[str, Any]) -> List[str]:
    suggestions = []

    if parsed["quantified_bullets"] < 3:
        suggestions.append("Add measurable achievements (e.g. Improved performance by 40%)")

    if parsed["action_verb_count"] < 5:
        suggestions.append("Use strong action verbs like Built, Developed, Optimized")

    if "skills" not in parsed["sections"]:
        suggestions.append("Add a dedicated Skills section")

    if "summary" not in parsed["sections"]:
        suggestions.append("Add a short professional summary")

    if parsed["word_count"] > 900:
        suggestions.append("Reduce resume length to 1 page")

    if not parsed["github"] and not parsed["linkedin"]:
        suggestions.append("Add GitHub or LinkedIn profile")

    return suggestions


# ---------------- JOB MATCHING ----------------

def match_jobs_to_resume(resume_text: str, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:

    resume_words = set(normalize(resume_text).split())

    for job in jobs:
        required = " ".join(job.get("required_skills", []))
        job_words = set(normalize(required).split())

        match = len(resume_words & job_words)
        total = max(1, len(job_words))

        job["match_score"] = round((match / total) * 100, 1)

    return sorted(jobs, key=lambda x: x["match_score"], reverse=True)