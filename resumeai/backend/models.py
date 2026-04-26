from sqlalchemy import Column, String, Integer
from db import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)  # ✅ FIX
    name = Column(String)
    email = Column(String)
    job_id = Column(String)
    ats_score = Column(Integer)
    match_score = Column(Integer)