# ResumeAI — Smart Resume & Job Matching System

## Project Structure

```
resumeai/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routers/
│   │   ├── resume.py            # Upload, parse, score, suggest
│   │   ├── jobs.py              # Job search & filtering
│   │   └── recruiter.py        # Recruiter dashboard & candidates
│   ├── ml/
│   │   └── resume_engine.py    # NLP parsing, ATS scoring, embeddings, matching
│   └── utils/
│       └── job_store.py        # Job data store
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AnalyzerPage.jsx
│   │   │   ├── JobsPage.jsx
│   │   │   └── RecruiterPage.jsx
│   │   ├── components/
│   │   │   ├── AtsRing.jsx
│   │   │   ├── ScoreBar.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── SuggestionCard.jsx
│   │   │   └── JobCard.jsx
│   │   └── utils/api.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## ⚡ Quick Start (Docker — Recommended)

### Prerequisites
- Docker Desktop installed: https://www.docker.com/products/docker-desktop/
- Git installed

### Step 1 — Clone / download the project
```bash
# If using git
git clone <your-repo-url>
cd resumeai

# Or just place the project folder wherever you want
```

### Step 2 — Build and start everything
```bash
docker-compose up --build
```
This will:
- Install all Python dependencies
- Download the spaCy NLP model
- Download sentence-transformers model (~90MB, once only)
- Install all Node.js dependencies
- Start Elasticsearch, FastAPI, and React dev server

### Step 3 — Open in browser
```
Frontend:      http://localhost:3000
Backend API:   http://localhost:8000
API Docs:      http://localhost:8000/docs
Elasticsearch: http://localhost:9200
```

### Stop everything
```bash
docker-compose down
```

---

## 🛠 Manual Setup (Without Docker)

### Backend Setup

#### Step 1 — Install Python 3.11+
Download from https://www.python.org/downloads/

#### Step 2 — Create virtual environment
```bash
cd resumeai/backend
python -m venv venv

# Activate (Mac/Linux):
source venv/bin/activate

# Activate (Windows):
venv\Scripts\activate
```

#### Step 3 — Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Step 4 — Download NLP models
```bash
# spaCy English model (~12MB)
python -m spacy download en_core_web_sm

# sentence-transformers will auto-download on first run (~90MB)
```

#### Step 5 — Start the backend
```bash
uvicorn main:app --reload --port 8000
```
Backend is now running at http://localhost:8000
Interactive API docs: http://localhost:8000/docs

---

### Frontend Setup

#### Step 1 — Install Node.js 20+
Download from https://nodejs.org/

#### Step 2 — Install dependencies
```bash
cd resumeai/frontend
npm install
```

#### Step 3 — Start the dev server
```bash
npm run dev
```
Frontend is now running at http://localhost:3000

---

## 🚀 Deployment to Production

### Option A: Deploy to Render (Free tier available)

**Backend:**
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `PYTHON_VERSION=3.11.0`

**Frontend:**
1. New → Static Site
2. Root directory: `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`

---

### Option B: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

---

### Option C: Deploy to VPS (Ubuntu)

```bash
# Install Docker on server
curl -fsSL https://get.docker.com | sh

# Copy project to server
scp -r resumeai/ user@your-server:/opt/resumeai

# SSH in and start
ssh user@your-server
cd /opt/resumeai
docker-compose -f docker-compose.yml up -d --build

# Set up Nginx reverse proxy
sudo apt install nginx
```

Nginx config (`/etc/nginx/sites-available/resumeai`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

---

## 🔧 Configuration

### Environment Variables

**Backend** (create `backend/.env`):
```env
ENVIRONMENT=development
MAX_UPLOAD_SIZE_MB=5
```

**Frontend** (create `frontend/.env.local`):
```env
VITE_API_URL=http://localhost:8000
```

---

## 🧠 ML Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Resume Parser | spaCy `en_core_web_sm` | NER for name, email, org extraction |
| PDF Extraction | pdfplumber | Text + layout extraction from PDFs |
| DOCX Extraction | python-docx | Text extraction from Word files |
| Semantic Matching | `sentence-transformers` `all-MiniLM-L6-v2` | Cosine similarity for job matching |
| ATS Scoring | Rule-based + heuristics | 5-dimension weighted scoring |
| Skill Detection | Keyword matching + NLP | 50+ tech skill keywords |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload PDF/DOCX, get full analysis |
| POST | `/api/resume/analyze-text` | Analyze plain text resume |
| POST | `/api/resume/improve` | Get improvement suggestions |
| GET  | `/api/jobs` | List jobs with filters |
| GET  | `/api/jobs/search?q=` | Search jobs by keyword |
| GET  | `/api/jobs/{id}` | Get single job detail |
| POST | `/api/recruiter/submit` | Submit candidate with job target |
| GET  | `/api/recruiter/dashboard` | Dashboard stats + pipeline |
| GET  | `/api/recruiter/candidates` | List ranked candidates |

---

## 🔮 FAANG Upgrade Path

To add real-time suggestions while editing:
- Add WebSocket endpoint in FastAPI (`/ws/resume`)
- Debounce text input in frontend and stream suggestions

To add real job scraping:
- Install `scrapy` and `playwright`
- Create spiders for LinkedIn, Indeed, Greenhouse APIs
- Index jobs into Elasticsearch with embeddings

To add Elasticsearch semantic search:
- `pip install elasticsearch`
- Store job embeddings as `dense_vector` fields
- Use `script_score` queries for cosine similarity at scale

To add authentication:
- `pip install python-jose passlib[bcrypt] sqlalchemy`
- Add `/auth/register` and `/auth/login` JWT endpoints
- Add `Authorization` header to frontend API calls
