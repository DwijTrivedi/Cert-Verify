import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from dotenv import load_dotenv

load_dotenv()

# 1. DATABASE CONNECTION (Using the pooled 6543 port from Render Env)
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ─── MODELS ───

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # 'institution' or 'company'
    mfa_enabled = Column(Base.Boolean, default=False)

class ValidDegree(Base):
    """This table holds the data uploaded via your Excel logic"""
    __tablename__ = "valid_degrees"
    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String, index=True)
    roll_number = Column(String, unique=True, index=True)
    institution = Column(String)
    degree_name = Column(String)
    year = Column(String)

class VerificationLog(Base):
    """This table stores the history of scans"""
    __tablename__ = "verifications"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    student_name = Column(String)
    status = Column(String) # 'verified' or 'forged'
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# ─── FUNCTIONS ───

# ✅ FIXED: The missing log_verification attribute
def log_verification(filename: str, student_name: str, status: str):
    db = SessionLocal()
    try:
        new_log = VerificationLog(
            filename=filename,
            student_name=student_name,
            status=status
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return True
    except Exception as e:
        print(f"❌ Database Log Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def get_valid_degrees():
    """Returns all records to the OCR engine for matching"""
    db = SessionLocal()
    try:
        return db.query(ValidDegree).all()
    finally:
        db.close()

def get_verification_logs():
    """Feeds the Admin Dashboard"""
    db = SessionLocal()
    try:
        return db.query(VerificationLog).order_by(VerificationLog.verified_at.desc()).all()
    finally:
        db.close()

#logic for excel to sql
def sync_excel_to_db(data_list: list):
    """
    Expects a list of dicts: 
    [{'name': 'Dwij', 'roll': '123', 'uni': 'GTU', 'deg': 'B.Tech', 'year': '2026'}]
    """
    db = SessionLocal()
    try:
        for item in data_list:
            # Check if record already exists to avoid duplicates
            exists = db.query(ValidDegree).filter(ValidDegree.roll_number == item['roll']).first()
            if not exists:
                new_degree = ValidDegree(
                    student_name=item['name'],
                    roll_number=item['roll'],
                    institution=item['uni'],
                    degree_name=item['deg'],
                    year=item['year']
                )
                db.add(new_degree)
        db.commit()
        return True
    except Exception as e:
        print(f"❌ Excel Sync Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()