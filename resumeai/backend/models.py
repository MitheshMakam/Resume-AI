from sqlalchemy import Column, String, Integer
from db import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    job_id = Column(String)
    ats_score = Column(Integer)
    match_score = Column(Integer))
    gap_skills = Column(JSON)