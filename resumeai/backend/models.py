from sqlalchemy import Column, Integer, String, Float, JSON
from db import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    job_id = Column(String)

    ats_score = Column(Float)
    match_score = Column(Float)

    matched_skills = Column(JSON)
    gap_skills = Column(JSON)