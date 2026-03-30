import os
import hashlib
import traceback
import jwt
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from dotenv import load_dotenv

load_dotenv()

# 1. DATABASE CONNECTION
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Check Render dashboard.")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 2. JWT SECRET
JWT_SECRET = os.getenv("JWT_SECRET", "certverify-default-secret-change-in-prod")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def hash_password(password: str) -> str:
    """Simple SHA-256 password hashing."""
    return hashlib.sha256(password.encode()).hexdigest()

# ─── MODELS ───

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # 'institution' or 'company'
    mfa_enabled = Column(Boolean, default=False)

class DeletionRequest(Base):
    """Institution submits a request to delete a record; admin approves."""
    __tablename__ = "deletion_requests"
    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String, index=True)       # which record to delete
    requested_by = Column(String)                  # institution email
    status = Column(String, default="pending")     # pending / approved / rejected
    reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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

def run_migrations():
    """Safely add any missing columns to existing tables (handles schema drift)."""
    with engine.connect() as conn:
        # Add 'name' column to users if it doesn't exist yet
        conn.execute(text("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
        """))
        conn.commit()
        print("✅ Migrations applied successfully.")

try:
    run_migrations()
except Exception as e:
    print(f"⚠️ Migration warning (non-fatal): {e}")

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

# ─── AUTH FUNCTIONS ───

def register_user(user):
    """Register a new company or institution account."""
    db = SessionLocal()
    try:
        # Check if email already exists
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            return {"success": False, "message": "An account with this email already exists.", "role": None}

        new_user = User(
            name=user.name,
            email=user.email,
            password=hash_password(user.password),
            role=user.role,
            mfa_enabled=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"success": True, "message": "Registration successful!", "role": user.role}
    except Exception as e:
        # Print full traceback so the real DB error is visible in logs
        print(f"❌ Registration Error: {e}")
        print(traceback.format_exc())
        db.rollback()
        return {"success": False, "message": f"Registration failed: {str(e)}", "role": None}
    finally:
        db.close()

# ─── JWT ───

def create_access_token(email: str, role: str) -> str:
    """Generate a signed JWT token valid for 24 hours."""
    payload = {
        "sub": email,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def login_user(credentials):
    """Verify login credentials and return a JWT token."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user:
            return {"success": False, "message": "Invalid email or password.", "token": None, "role": None}

        if user.password != hash_password(credentials.password):
            return {"success": False, "message": "Invalid email or password.", "token": None, "role": None}

        token = create_access_token(user.email, user.role)
        return {"success": True, "message": "Login successful!", "role": user.role, "token": token}
    except Exception as e:
        print(f"❌ Login Error: {e}")
        print(traceback.format_exc())
        return {"success": False, "message": f"Login failed: {str(e)}", "token": None, "role": None}
    finally:
        db.close()


# ─── INSTITUTION DELETION WORKFLOW ───

def request_deletion(roll_number: str, requested_by: str, reason: str = ""):
    """Institution submits a deletion request. Cannot delete directly."""
    db = SessionLocal()
    try:
        record = db.query(ValidDegree).filter(ValidDegree.roll_number == roll_number).first()
        if not record:
            return {"success": False, "message": "Record not found."}
        existing = db.query(DeletionRequest).filter(
            DeletionRequest.roll_number == roll_number,
            DeletionRequest.status == "pending"
        ).first()
        if existing:
            return {"success": False, "message": "A deletion request for this record is already pending."}
        req = DeletionRequest(roll_number=roll_number, requested_by=requested_by, reason=reason)
        db.add(req)
        db.commit()
        return {"success": True, "message": "Deletion request submitted. Awaiting admin approval."}
    except Exception as e:
        print(traceback.format_exc())
        db.rollback()
        return {"success": False, "message": str(e)}
    finally:
        db.close()

def get_pending_deletions():
    """Admin: view all pending deletion requests."""
    db = SessionLocal()
    try:
        rows = db.query(DeletionRequest).filter(DeletionRequest.status == "pending").all()
        return [{"id": r.id, "roll_number": r.roll_number, "requested_by": r.requested_by,
                 "reason": r.reason, "created_at": str(r.created_at)} for r in rows]
    finally:
        db.close()

def test_db_connection():
    """Diagnostic: checks DB connection and lists existing tables."""
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
        tables = [row[0] for row in result]
        return {"success": True, "tables": tables}
    except Exception as e:
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}
    finally:
        db.close()