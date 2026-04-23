import re
import pdfplumber
from docx import Document
import numpy as np
from typing import Optional
import io

# ✅ ONLY LOAD LIGHT MODEL
nlp = spacy.load("en_core_web_sm")

SKILL_KEYWORDS = [
    "python","javascript","typescript","java","go","rust","c++","c#","ruby","php",
    "react","vue","angular","next.js","node.js","fastapi","django","flask","spring",
    "aws","gcp","azure","docker","kubernetes","terraform","ansible","jenkins","ci/cd",
    "sql","postgresql","mysql","mongodb","redis","elasticsearch","kafka","rabbitmq",
    "spark","hadoop","airflow","dbt","snowflake","bigquery","pandas","numpy","pytorch",
    "tensorflow","scikit-learn","mlflow","huggingface","langchain","graphql","grpc",
    "linux","git","rest api","microservices","system design","distributed systems"
]

ATS_SECTIONS = ["summary","experience","education","skills","projects","certifications"]

ACTION_VERBS = [
    "led","built","designed","architected","developed","implemented","optimized",
    "reduced","increased","improved","deployed","launched","delivered","managed",
    "created","automated","integrated","scaled","mentored","collaborated"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join([para.text for para in doc.paragraphs])

def parse_resume(text: str) -> dict:
    doc = nlp(text)
    lower = text.lower()

    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break
    if not name:
        name = text.split("\n")[0].strip()

    email_match = re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text)
    email = email_match.group() if email_match else ""

    phone_match = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text)
    phone = phone_match.group().strip() if phone_match else ""

    github = re.search(r"github\.com/[\w-]+", lower)
    linkedin = re.search(r"linkedin\.com/in/[\w-]+", lower)

    detected_skills = [s for s in SKILL_KEYWORDS if s in lower]
    sections_found = [s for s in ATS_SECTIONS if s in lower]

    date_pattern = re.compile(r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+\d{4}", re.I)
    experience_lines = [line.strip() for line in text.split("\n") if date_pattern.search(line)]

    action_count = sum(1 for verb in ACTION_VERBS if verb in lower)
    quantified = len(re.findall(r"\d+[%xX]|\$[\d,]+", text))

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "github": github.group() if github else "",
        "linkedin": linkedin.group() if linkedin else "",
        "skills": detected_skills,
        "sections": sections_found,
        "experience_entries": experience_lines[:5],
        "action_verb_count": action_count,
        "quantified_bullets": quantified,
        "word_count": len(text.split()),
        "char_count": len(text),
    }

def score_ats(parsed: dict) -> dict:
    scores = {}

    skill_score = min(100, len(parsed["skills"]) * 5)
    scores["keywords"] = skill_score

    format_score = int((len(parsed["sections"]) / len(ATS_SECTIONS)) * 100)
    scores["format"] = format_score

    scores["skills_match"] = max(0, skill_score - 10)

    readability = min(100, parsed["action_verb_count"] * 8)
    scores["readability"] = readability

    completeness_items = [
        bool(parsed["email"]),
        bool(parsed["phone"]),
        bool(parsed["github"] or parsed["linkedin"]),
        "experience" in parsed["sections"],
        "education" in parsed["sections"],
        "skills" in parsed["sections"],
    ]
    scores["completeness"] = int(sum(completeness_items) / len(completeness_items) * 100)

    overall = int(
        scores["keywords"] * 0.3 +
        scores["format"] * 0.2 +
        scores["skills_match"] * 0.2 +
        scores["readability"] * 0.15 +
        scores["completeness"] * 0.15
    )
    scores["overall"] = overall
    return scores

def generate_suggestions(parsed: dict, scores: dict) -> list:
    suggestions = []

    if parsed["quantified_bullets"] < 3:
        suggestions.append({
            "type": "critical",
            "title": "Quantify your impact",
            "body": "Add measurable results like 'Improved performance by 30%'"
        })

    if parsed["action_verb_count"] < 5:
        suggestions.append({
            "type": "critical",
            "title": "Use strong action verbs",
            "body": "Use words like Built, Led, Optimized"
        })

    if "skills" not in parsed["sections"]:
        suggestions.append({
            "type": "warning",
            "title": "Add Skills section",
            "body": "Improves ATS parsing"
        })

    return suggestions

# ✅ SIMPLE MATCHING (NO ML → NO CRASH)
def match_jobs_to_resume(resume_text: str, jobs: list) -> list:
    resume_lower = resume_text.lower()

    for job in jobs:
        required = [s.lower() for s in job.get("required_skills", [])]
        matched = [s for s in required if s in resume_lower]

        score = int((len(matched) / len(required)) * 100) if required else 50

        job["match_score"] = score
        job["matched_skills"] = matched
        job["gap_skills"] = [s for s in required if s not in matched]

    return sorted(jobs, key=lambda x: x["match_score"], reverse=True)