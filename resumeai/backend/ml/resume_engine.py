import re
import pdfplumber
from docx import Document
import numpy as np
from typing import Optional
import io

# ❌ REMOVE HEAVY MODELS (spacy + sentence_transformers)

# Lightweight keyword-based approach instead

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


# ---------------- FILE EXTRACTION ----------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])


# ---------------- PARSER ----------------

def parse_resume(text: str) -> dict:
    lower = text.lower()

    # Name (first line fallback)
    name = text.split("\n")[0].strip()

    # Email
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text)
    email = email_match.group() if email_match else ""

    # Phone
    phone_match = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text)
    phone = phone_match.group().strip() if phone_match else ""

    # Links
    github = re.search(r"github\.com/[\w-]+", lower)
    linkedin = re.search(r"linkedin\.com/in/[\w-]+", lower)

    # Skills
    detected_skills = [s for s in SKILL_KEYWORDS if s in lower]

    # Sections
    sections_found = [s for s in ATS_SECTIONS if s in lower]

    # Action verbs
    action_count = sum(1 for verb in ACTION_VERBS if verb in lower)

    # Quantified bullets
    quantified = len(re.findall(r"\d+[%xX]|\$[\d,]+", text))

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "github": github.group() if github else "",
        "linkedin": linkedin.group() if linkedin else "",
        "skills": detected_skills,
        "sections": sections_found,
        "action_verb_count": action_count,
        "quantified_bullets": quantified,
        "word_count": len(text.split()),
    }


# ---------------- ATS SCORE ----------------

def score_ats(parsed: dict) -> dict:
    scores = {}

    scores["keywords"] = min(100, len(parsed["skills"]) * 5)

    scores["format"] = int((len(parsed["sections"]) / len(ATS_SECTIONS)) * 100)

    scores["skills_match"] = scores["keywords"]

    scores["readability"] = min(
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

    scores["completeness"] = int(sum(completeness_items) / len(completeness_items) * 100)

    scores["overall"] = int(
        scores["keywords"] * 0.3 +
        scores["format"] * 0.2 +
        scores["skills_match"] * 0.2 +
        scores["readability"] * 0.15 +
        scores["completeness"] * 0.15
    )

    return scores


# ---------------- SUGGESTIONS ----------------

def generate_suggestions(parsed: dict) -> list:
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


# ---------------- JOB MATCHING (LIGHTWEIGHT) ----------------

def match_jobs_to_resume(resume_text: str, jobs: list) -> list:
    resume_words = set(resume_text.lower().split())

    for job in jobs:
        job_words = set(" ".join(job["required_skills"]).lower().split())

        match = len(resume_words & job_words)
        total = len(job_words) if job_words else 1

        job["match_score"] = round((match / total) * 100, 1)

    return sorted(jobs, key=lambda x: x["match_score"], reverse=True)