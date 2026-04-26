# ResumeAI – Smart Resume Analyzer & Job Matching Platform

ResumeAI is a full-stack web application that helps users **analyze resumes, improve ATS scores, and find relevant jobs using real-time APIs**. It also includes a **recruiter dashboard** to manage candidates and track hiring metrics.

---

## 🌐 Live Demo

🔗 Website:
https://resumetrack.vercel.app

🔗 Backend API:
https://resume-backend-1lqo.onrender.com

---

## 📌 Features

### 👤 Candidate Side

* 📄 Upload resume (PDF/Text)
* 🤖 AI-powered resume analysis
* 📊 ATS score calculation
* ✨ Resume improvement suggestions
* 💼 Real-time job listings (via API)
* 🎯 Job matching based on resume skills

---

### 🧑‍💼 Recruiter Side

* 📥 Candidate submission system
* 📊 Recruiter dashboard:

  * Total applicants
  * ATS-qualified candidates
  * High-match candidates
  * Average ATS score
* 📋 Candidate listing with scores

---

### 🔍 Job System

* 🔗 Integrated with Adzuna Job API
* 🔎 Search jobs by:

  * Role
  * Location
* 📈 Match score calculation between resume & job

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Python

### Database

* PostgreSQL

### Deployment

* Backend: Render (Docker)
* Frontend: Vercel

---

## ⚙️ API Endpoints

### Resume

* POST /api/resume/upload → Upload resume
* POST /api/resume/analyze-text → Analyze text
* POST /api/resume/improve → Improve resume

### Jobs

* GET /api/jobs/ → List jobs
* GET /api/jobs/search?q=keyword → Search jobs
* GET /api/jobs/{job_id} → Get job details

### Recruiter

* POST /api/recruiter/submit → Submit candidate
* GET /api/recruiter/dashboard → Dashboard stats
* GET /api/recruiter/candidates → List candidates

---

## 🔐 Environment Variables

Create environment variables in Render:

DATABASE_URL=your_database_url
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key

---

## 🚀 Installation & Setup

### 1. Clone the repo

git clone https://github.com/your-username/resume-ai.git
cd resume-ai

### 2. Backend setup

pip install -r requirements.txt
uvicorn main:app --reload

### 3. Frontend setup

cd frontend
npm install
npm run dev

---

## 📊 Example Workflow

1. User uploads resume
2. System extracts text & calculates ATS score
3. Jobs are fetched from API
4. Resume is matched with job descriptions
5. Recruiter views candidates & analytics

---

## 🧠 Future Improvements

* AI-based semantic job matching (embeddings)
* Resume parsing with NLP models
* Authentication system (User & Recruiter login)
* AI career assistant
* Advanced analytics dashboard
* Job caching in database

---

## 📬 Contact

Mithesh Makam
[mitheshmakam6@gmail.com](mailto:mitheshmakam6@gmail.com)

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
