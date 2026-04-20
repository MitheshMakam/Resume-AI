import re
import spacy
import pdfplumber
from docx import Document
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import Optional
import io

# Load models once at startup
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

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

    # Extract name (first PERSON entity or first line)
    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break
    if not name:
        name = text.split("\n")[0].strip()

    # Extract email
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", text)
    email = email_match.group() if email_match else ""

    # Extract phone
    phone_match = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", text)
    phone = phone_match.group().strip() if phone_match else ""

    # Extract GitHub / LinkedIn
    github = re.search(r"github\.com/[\w-]+", lower)
    linkedin = re.search(r"linkedin\.com/in/[\w-]+", lower)

    # Detect skills
    detected_skills = [s for s in SKILL_KEYWORDS if s in lower]

    # Detect sections present
    sections_found = [s for s in ATS_SECTIONS if s in lower]

    # Extract experience entries (rough heuristic: lines with dates)
    date_pattern = re.compile(r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+\d{4}", re.I)
    experience_lines = [line.strip() for line in text.split("\n") if date_pattern.search(line) and len(line) > 10]

    # Count action verbs
    action_count = sum(1 for verb in ACTION_VERBS if verb in lower)

    # Count bullet points with numbers (impact quantification)
    quantified = len(re.findall(r"\d+[%xX]|\$[\d,]+|[\d,]+\s*(users|requests|rps|ms|hrs)", text))

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

    # Keywords / Skills score
    skill_score = min(100, len(parsed["skills"]) * 5)
    scores["keywords"] = skill_score

    # Format score: sections present
    format_score = int((len(parsed["sections"]) / len(ATS_SECTIONS)) * 100)
    scores["format"] = format_score

    # Skills match (placeholder: ideally compared against a target JD)
    scores["skills_match"] = min(100, skill_score - 10)

    # Readability: action verbs + word count
    readability = min(100, parsed["action_verb_count"] * 8 + (5 if 400 < parsed["word_count"] < 800 else 0))
    scores["readability"] = readability

    # Completeness: contact info + sections
    completeness_items = [
        bool(parsed["email"]),
        bool(parsed["phone"]),
        bool(parsed["github"] or parsed["linkedin"]),
        "experience" in parsed["sections"],
        "education" in parsed["sections"],
        "skills" in parsed["sections"],
        parsed["quantified_bullets"] > 0,
    ]
    scores["completeness"] = int(sum(completeness_items) / len(completeness_items) * 100)

    # Overall weighted ATS
    overall = int(
        scores["keywords"] * 0.25 +
        scores["format"] * 0.20 +
        scores["skills_match"] * 0.25 +
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
            "body": f"Only {parsed['quantified_bullets']} bullets have measurable outcomes. Replace vague phrases with metrics like 'Reduced latency by 40%' or 'Scaled to 2M users'."
        })

    if parsed["action_verb_count"] < 5:
        suggestions.append({
            "type": "critical",
            "title": "Add strong action verbs",
            "body": "ATS scores 'Responsible for' 60% lower than verbs like Led, Architected, Delivered, Optimized. Rewrite passive bullet points."
        })

    if "skills" not in parsed["sections"]:
        suggestions.append({
            "type": "warning",
            "title": "Add a dedicated Skills section",
            "body": "A standalone Skills section boosts ATS parsing by ~18 points. List technical skills in a clear, scannable format."
        })

    if "summary" not in parsed["sections"]:
        suggestions.append({
            "type": "warning",
            "title": "Missing professional summary",
            "body": "Add a 2-3 sentence summary tailored to your target role. Include your years of experience and top 2-3 skills."
        })

    if parsed["word_count"] > 900:
        suggestions.append({
            "type": "warning",
            "title": "Resume is too long",
            "body": f"At {parsed['word_count']} words, your resume exceeds the 1-page sweet spot for engineers with <10 years experience. Trim older roles."
        })

    if not parsed["github"] and not parsed["linkedin"]:
        suggestions.append({
            "type": "tip",
            "title": "Add a GitHub or LinkedIn profile",
            "body": "Recruiters at tech companies look for GitHub profiles. Add a link to your profile with pinned projects showcasing key skills."
        })

    if parsed["email"]:
        suggestions.append({
            "type": "positive",
            "title": "Contact information detected",
            "body": f"Email {parsed['email']} was parsed correctly. Ensure your phone number is also present."
        })

    return suggestions

def get_resume_embedding(text: str) -> np.ndarray:
    return embedder.encode([text])[0]

def match_jobs_to_resume(resume_text: str, jobs: list) -> list:
    resume_emb = embedder.encode([resume_text])[0]
    job_texts = [f"{j['title']} {j['company']} {' '.join(j['required_skills'])}" for j in jobs]
    job_embs = embedder.encode(job_texts)
    sims = cosine_similarity([resume_emb], job_embs)[0]
    for i, job in enumerate(jobs):
        job["match_score"] = round(float(sims[i]) * 100, 1)
        # Skill gap analysis
        resume_skills = set(resume_text.lower().split())
        job["matched_skills"] = [s for s in job["required_skills"] if s.lower() in resume_text.lower()]
        job["gap_skills"] = [s for s in job["required_skills"] if s.lower() not in resume_text.lower()]
    return sorted(jobs, key=lambda x: x["match_score"], reverse=True)
