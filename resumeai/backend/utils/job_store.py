JOBS = [
    {
        "id": "job_001",
        "title": "Staff Software Engineer",
        "company": "Stripe",
        "location": "Remote",
        "salary": "$220K–$280K",
        "type": "Full-time",
        "posted": "2 days ago",
        "description": "Lead distributed systems engineering for Stripe's core payments infrastructure. Design and build systems handling billions of transactions.",
        "required_skills": ["Python", "AWS", "Docker", "SQL", "Kafka", "Distributed Systems", "Go"],
        "nice_to_have": ["Kubernetes", "gRPC", "Rust"],
        "level": "Staff",
    },
    {
        "id": "job_002",
        "title": "Senior Backend Engineer",
        "company": "OpenAI",
        "location": "San Francisco / Remote",
        "salary": "$200K–$260K",
        "type": "Full-time",
        "posted": "5 days ago",
        "description": "Build the infrastructure powering the world's leading AI systems. Work on API platform, model serving, and developer tools.",
        "required_skills": ["Python", "React", "Kubernetes", "Docker", "PostgreSQL", "FastAPI"],
        "nice_to_have": ["PyTorch", "CUDA", "Rust"],
        "level": "Senior",
    },
    {
        "id": "job_003",
        "title": "Platform Engineer",
        "company": "Databricks",
        "location": "Remote",
        "salary": "$190K–$240K",
        "type": "Full-time",
        "posted": "1 week ago",
        "description": "Build and scale the Databricks Lakehouse platform. Work with Spark, Delta Lake, and cloud-native infrastructure.",
        "required_skills": ["Python", "Spark", "Kafka", "AWS", "Scala", "Terraform"],
        "nice_to_have": ["Delta Lake", "dbt", "Kubernetes"],
        "level": "Senior",
    },
    {
        "id": "job_004",
        "title": "Software Engineer, Infrastructure",
        "company": "Figma",
        "location": "San Francisco",
        "salary": "$185K–$230K",
        "type": "Full-time",
        "posted": "3 days ago",
        "description": "Scale Figma's real-time collaboration infrastructure to millions of users. Work on WebSocket servers, CRDT systems, and edge computing.",
        "required_skills": ["React", "SQL", "Kubernetes", "Terraform", "TypeScript", "Node.js"],
        "nice_to_have": ["Rust", "WebAssembly", "Redis"],
        "level": "Mid-Senior",
    },
    {
        "id": "job_005",
        "title": "Senior Engineer, Payments",
        "company": "Shopify",
        "location": "Remote",
        "salary": "$175K–$220K",
        "type": "Full-time",
        "posted": "1 week ago",
        "description": "Own Shopify Payments backend, processing $200B+ GMV annually. Build fraud detection, payout systems, and financial reporting.",
        "required_skills": ["Python", "SQL", "Kafka", "gRPC", "Ruby", "Docker"],
        "nice_to_have": ["Temporal", "Flink", "Kubernetes"],
        "level": "Senior",
    },
    {
        "id": "job_006",
        "title": "ML Platform Engineer",
        "company": "Anthropic",
        "location": "San Francisco",
        "salary": "$210K–$270K",
        "type": "Full-time",
        "posted": "4 days ago",
        "description": "Build ML training and inference infrastructure for frontier AI models. Work on distributed training, model serving, and evaluation pipelines.",
        "required_skills": ["Python", "Kubernetes", "Spark", "Terraform", "PyTorch", "CUDA"],
        "nice_to_have": ["JAX", "Triton", "Ray"],
        "level": "Senior-Staff",
    },
    {
        "id": "job_007",
        "title": "Senior Full Stack Engineer",
        "company": "Linear",
        "location": "Remote",
        "salary": "$160K–$200K",
        "type": "Full-time",
        "posted": "2 days ago",
        "description": "Build the product used by engineering teams at thousands of companies. Work across our React frontend, GraphQL API, and PostgreSQL backend.",
        "required_skills": ["React", "TypeScript", "GraphQL", "Node.js", "PostgreSQL", "Docker"],
        "nice_to_have": ["Electron", "WebSockets", "Redis"],
        "level": "Senior",
    },
    {
        "id": "job_008",
        "title": "Data Engineer",
        "company": "Airbnb",
        "location": "San Francisco / Remote",
        "salary": "$170K–$220K",
        "type": "Full-time",
        "posted": "6 days ago",
        "description": "Build and maintain Airbnb's data infrastructure. Work on pipelines processing billions of events daily using Spark, Airflow, and dbt.",
        "required_skills": ["Python", "SQL", "Spark", "Airflow", "AWS", "dbt"],
        "nice_to_have": ["Flink", "Trino", "Iceberg"],
        "level": "Senior",
    },
]

def get_all_jobs():
    return [job.copy() for job in JOBS]

def search_jobs(query: str):
    q = query.lower()
    return [
        job for job in JOBS
        if q in job["title"].lower()
        or q in job["company"].lower()
        or any(q in s.lower() for s in job["required_skills"])
        or q in job["description"].lower()
    ]
