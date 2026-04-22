📄 ResumeAI — Smart Resume & Job Matching SystemAn intelligent, AI-powered application that analyzes resumes, calculates ATS scores, and matches candidates to jobs using Python (FastAPI), Elasticsearch, and React.🚀 Live DemoCheck out the frontend live here: Visit ResumeAI on Vercel📂 Project StructurePlaintextresumeai/
├── backend/            # FastAPI, NLP parsing, & Dockerfile
├── frontend/           # React/Vite UI & Vercel deployment root
├── docker-compose.yml  # Local orchestration (Backend + ES)
└── README.md           # You are here
⚡ Quick Start (Local Development)1. Start the Backend & Database (Docker)This starts the Python API and Elasticsearch.Bashdocker-compose up --build -d
2. Start the Frontend (Manual)Since the frontend is deployed on Vercel, you can run it locally like this:Bashcd frontend
npm install
npm run dev
Frontend will be live at http://localhost:5173 (or 3000).🚀 DeploymentFrontend (Vercel)This project is optimized for Vercel.Root Directory: frontendBuild Command: npm run buildOutput Directory: distBackend (Render/Railway/VPS)The backend is dockerized. To deploy the API:Use the backend/Dockerfile.Ensure Elasticsearch is accessible via environment variables.🧠 ML Architecture & Tech StackComponentTechnologyPurposeFrontendReact / ViteInteractive UI & Real-time scoringBackendFastAPI (Python)High-performance async APISearch EngineElasticsearchVector storage & Job indexingNLP ParserspaCyNER for name, email, and org extractionEmbeddingsall-MiniLM-L6-v2Semantic matching via Sentence-TransformersATS ScoringRule-based5-dimension weighted scoring📡 Key API EndpointsMethodEndpointDescriptionPOST/api/resume/uploadUpload PDF/DOCX, get full analysisPOST/api/resume/improveGet AI-driven improvement suggestionsGET/api/jobsList and filter available jobsGET/api/recruiter/dashboardRecruiter stats & candidate pipeline🔧 Local ConfigurationFrontend Env (frontend/.env.local):Code snippetVITE_API_URL=http://localhost:8000
Backend Env (backend/.env):Code snippetENVIRONMENT=development
MAX_UPLOAD_SIZE_MB=5
🔮 Roadmap & Upgrades[ ] WebSockets: Real-time feedback while typing.[ ] Job Scraping: Scrapy integration for LinkedIn/Indeed.[ ] Auth: JWT-based authentication for candidates and recruiters.