# # # fastapi is used 
# # # fitz is used for pdf reading and handling the pdf text
# # # OpenCV is used for text extraction 
# # # numpy is used for slicing the text
# # # pytesseract is used for OCR scanning
# # # bcrypt is used for password hashing
# # # pyotp is used for TOTP MFA (Google Authenticator)
# # # slowapi is used for rate limiting login attempts

# # from fastapi import FastAPI, File, UploadFile, HTTPException, Request
# # from fastapi.middleware.cors import CORSMiddleware
# # from slowapi import Limiter, _rate_limit_exceeded_handler
# # from slowapi.util import get_remote_address
# # from slowapi.errors import RateLimitExceeded
# # import fitz
# # import cv2 as cv
# # import numpy as np
# # import pytesseract as pyt
# # import pyotp
# # import os

# # import database
# # import verify
# # from models import (
# #     VerificationResponse, LoginRequest, LoginResponse,
# #     RegisterRequest, RegisterResponse,
# #     SetupMFAResponse, ConfirmMFARequest, VerifyMFARequest, MFAResponse
# # )

# # # Tesseract path: reads from env var (Docker sets /usr/bin/tesseract via Dockerfile)
# # # Falls back to Windows local dev path
# # pyt.pytesseract.tesseract_cmd = os.getenv(
# #     "TESSERACT_CMD",
# #     r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# # )


# # # App Setup + Rate Limiter
# # limiter = Limiter(key_func=get_remote_address)
# # app = FastAPI()
# # app.state.limiter = limiter
# # app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# # # CORS configuration: use ALLOWED_ORIGINS from env, fallback to "*" for dev
# # allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=allowed_origins,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # ──────────────────────────────────────────────────────────
# # # CERTIFICATE EXTRACTION & VERIFICATION
# # @app.post("/extract", response_model=VerificationResponse)
# # async def extract_text(file: UploadFile = File(...)):
# #     print(f"Scanning target: {file.filename}")

# #     file_bytes = await file.read()

# #     if file.filename.lower().endswith(".pdf"):
# #         pdf = fitz.open(stream=file_bytes, filetype="pdf")
# #         pix = pdf.load_page(0).get_pixmap(dpi=300)
# #         img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
# #         if pix.n == 4:
# #             img = cv.cvtColor(img, cv.COLOR_RGBA2BGR)
# #         elif pix.n == 3:
# #             img = cv.cvtColor(img, cv.COLOR_RGB2BGR)
# #     else:
# #         np_arr = np.frombuffer(file_bytes, np.uint8)
# #         img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

# #     gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
# #     raw_text = pyt.image_to_string(gray).lower()
# #     print("Reading complete. Checking the database...")

# #     valid_records = database.get_valid_degrees()
# #     status, student, uni = verify.check_if_fake(raw_text, valid_records)
# #     database.log_verification(file.filename, student, status)

# #     return {
# #         "status": status,
# #         "extractedData": {"name": student, "institution": uni},
# #         "raw_text_preview": raw_text[:50] + "..."
# #     }


# # # ──────────────────────────────────────────────────────────
# # # AUTHENTICATION
# # # ──────────────────────────────────────────────────────────
# # @app.post("/login", response_model=LoginResponse)
# # @limiter.limit("5/minute")   # Block brute-force: max 5 attempts per IP per minute
# # async def login(request: Request, credentials: LoginRequest):
# #     """
# #     Step 1 of login:
# #     - Verify email & bcrypt password
# #     - If MFA is enabled: return mfa_required=True (frontend goes to OTP page)
# #     - If MFA not enabled: log login and return role
# #     """
# #     user = database.get_user(credentials.email)
# #     if user is None:
# #         raise HTTPException(status_code=401, detail="Invalid email or password")

# #     if not database.verify_password(credentials.password, user["password"]):
# #         raise HTTPException(status_code=401, detail="Invalid email or password")

# #     role = user.get("role", "user")

# #     # If MFA is enabled for this account, don't grant access yet
# #     if user.get("mfa_enabled"):
# #         return LoginResponse(
# #             success=True,
# #             message="Password verified. Please enter your MFA code.",
# #             role=role,
# #             mfa_required=True
# #         )

# #     # No MFA — log the login and grant access
# #     database.log_login(credentials.email, role)
# #     return LoginResponse(success=True, message="Login successful", role=role, mfa_required=False)


# # @app.post("/register", response_model=RegisterResponse)
# # async def register(data: RegisterRequest):
# #     """Register a new institution or company account with bcrypt-hashed password."""
# #     if data.role not in ("institution", "company"):
# #         raise HTTPException(status_code=400, detail="Role must be 'institution' or 'company'")
# #     try:
# #         database.register_user(data.name, data.email, data.password, data.role)
# #     except ValueError as e:
# #         raise HTTPException(status_code=409, detail=str(e))
# #     return RegisterResponse(success=True, message="Account registered successfully", role=data.role)


# # # MFA SETUP (called after signup / from account settings)
# # @app.get("/setup-mfa/{email}", response_model=SetupMFAResponse)
# # async def setup_mfa(email: str):
# #     """
# #     Return the TOTP URI and secret for a user.
# #     Frontend renders this as a QR code using react-qr-code.
# #     The user scans it with Google Authenticator / Authy.
# #     """
# #     user = database.get_user(email)
# #     if not user:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     secret = user.get("mfa_secret")
# #     if not secret:
# #         raise HTTPException(status_code=400, detail="No MFA secret found for this user")

# #     totp = pyotp.TOTP(secret)
# #     # Generates: otpauth://totp/CertVerify:email?secret=XXX&issuer=CertVerify
# #     totp_uri = totp.provisioning_uri(name=email, issuer_name="CertVerify")

# #     return SetupMFAResponse(success=True, totp_uri=totp_uri, secret=secret)


# # @app.post("/confirm-mfa", response_model=MFAResponse)
# # async def confirm_mfa(data: ConfirmMFARequest):
# #     """
# #     The user scanned the QR code and entered their first 6-digit code.
# #     Verify it and activate MFA for their account.
# #     """
# #     if not database.verify_totp(data.email, data.code):
# #         raise HTTPException(status_code=400, detail="Invalid MFA code. Please try again.")
# #     database.enable_mfa(data.email)
# #     user = database.get_user(data.email)
# #     return MFAResponse(success=True, message="MFA activated successfully", role=user.get("role"))


# # # MFA VERIFY (step 2 of login when mfa_required=True)
# # @app.post("/verify-mfa", response_model=MFAResponse)
# # @limiter.limit("5/minute")   # Rate limit OTP guessing too
# # async def verify_mfa(request: Request, data: VerifyMFARequest):
# #     """
# #     Step 2 of login: verify the 6-digit TOTP code.
# #     Called only when /login returned mfa_required=True.
# #     """
# #     user = database.get_user(data.email)
# #     if not user:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     if not database.verify_totp(data.email, data.code):
# #         raise HTTPException(status_code=401, detail="Invalid or expired MFA code.")

# #     role = user.get("role", "user")
# #     database.log_login(data.email, role)  # Log login only after FULL auth
# #     return MFAResponse(success=True, message="MFA verified. Login successful.", role=role)

# # # DASHBOARD STATS
# # @app.get("/dashboard-stats")
# # async def get_stats():
# #     """Fetches the latest scan history for the React Dashboard."""
# #     connection = database.get_db_connection()
# #     try:
# #         with connection.cursor(dictionary=True) as cursor:
# #             cursor.execute("SELECT * FROM Verification_Log ORDER BY verified_at DESC LIMIT 10")
# #             history = cursor.fetchall()
# #             return history
# #     finally:
# #         connection.close()


# # @app.get("/login-history")
# # async def get_login_history():
# #     """Fetches recent login events for the Dashboard audit log."""
# #     connection = database.get_db_connection()
# #     try:
# #         with connection.cursor(dictionary=True) as cursor:
# #             cursor.execute("SELECT email, role, logged_in_at FROM Login_Log ORDER BY logged_in_at DESC LIMIT 20")
# #             return cursor.fetchall()
# #     finally:
# #         connection.close()


# # if __name__ == "__main__":
# #     import uvicorn
# #     uvicorn.run(app, host="127.0.0.1", port=8000)

# import os
# import uvicorn
# from fastapi import FastAPI, File, UploadFile, HTTPException, Request
# from fastapi.middleware.cors import CORSMiddleware
# from slowapi import Limiter, _rate_limit_exceeded_handler
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded
# import fitz
# import cv2 as cv
# import numpy as np
# import pytesseract as pyt
# import pyotp

# # Your local files
# import database
# import verify
# from models import (
#     VerificationResponse, LoginRequest, LoginResponse,
#     RegisterRequest, RegisterResponse,
#     SetupMFAResponse, ConfirmMFARequest, VerifyMFARequest, MFAResponse
# )

# # 1. CLOUD TESSERACT PATH
# # On Render (Linux), Tesseract is usually at /usr/bin/tesseract
# pyt.pytesseract.tesseract_cmd = os.getenv(
#     "TESSERACT_CMD", 
#     "/usr/bin/tesseract"
# )

# # App Setup + Rate Limiter
# limiter = Limiter(key_func=get_remote_address)
# app = FastAPI()
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# # 2. DYNAMIC CORS
# allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allowed_origins,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ... [Keep your /extract, /login, /register routes exactly as they are] ...

# # 3. FIXING DASHBOARD FOR POSTGRESQL (SUPABASE)
# # Note: MySQL uses 'dictionary=True', but psycopg2 (Postgres) uses RealDictCursor.
# # I've updated these to be more generic.
# @app.get("/dashboard-stats")
# async def get_stats():
#     connection = database.get_db_connection()
#     try:
#         # Check database.py to ensure it handles dictionary formatting for Postgres
#         history = database.get_verification_logs(limit=10)
#         return history
#     finally:
#         connection.close()

# @app.get("/login-history")
# async def get_login_history():
#     connection = database.get_db_connection()
#     try:
#         history = database.get_recent_logins(limit=20)
#         return history
#     finally:
#         connection.close()

# # 4. THE BIG CLOUD FIX: PORT & HOST
# if __name__ == "__main__":
#     # Render assigns a port dynamically. We MUST listen to 0.0.0.0.
#     port = int(os.environ.get("PORT", 8000))
#     uvicorn.run(app, host="0.0.0.0", port=port)

import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import fitz
import cv2 as cv
import numpy as np
import pytesseract as pyt
import pyotp

# Your local files
import database
import verify
from models import (
    VerificationResponse, LoginRequest, LoginResponse,
    RegisterRequest, RegisterResponse,
    SetupMFAResponse, ConfirmMFARequest, VerifyMFARequest, MFAResponse
)

# 1. CLOUD TESSERACT PATH
pyt.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", "/usr/bin/tesseract")

# App Setup + Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. DYNAMIC CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────
# YOUR ACTUAL PROJECT LOGIC (THE STUFF THAT WAS MISSING)
# ──────────────────────────────────────────────────────────

@app.post("/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if file.filename.lower().endswith(".pdf"):
        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        pix = pdf.load_page(0).get_pixmap(dpi=300)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        if pix.n == 4: img = cv.cvtColor(img, cv.COLOR_RGBA2BGR)
        elif pix.n == 3: img = cv.cvtColor(img, cv.COLOR_RGB2BGR)
    else:
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    raw_text = pyt.image_to_string(gray).lower()
    valid_records = database.get_valid_degrees()
    status, student, uni = verify.check_if_fake(raw_text, valid_records)
    database.log_verification(file.filename, student, status)
    return {"status": status, "extractedData": {"name": student, "institution": uni}, "raw_text_preview": raw_text[:50] + "..."}

@app.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    user = database.get_user(credentials.email)
    if user is None or not database.verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    role = user.get("role", "user")
    if user.get("mfa_enabled"):
        return LoginResponse(success=True, message="MFA code required.", role=role, mfa_required=True)
    database.log_login(credentials.email, role)
    return LoginResponse(success=True, message="Login successful", role=role, mfa_required=False)

@app.post("/register", response_model=RegisterResponse)
async def register(data: RegisterRequest):
    try:
        database.register_user(data.name, data.email, data.password, data.role)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return RegisterResponse(success=True, message="Registered successfully", role=data.role)

@app.get("/setup-mfa/{email}", response_model=SetupMFAResponse)
async def setup_mfa(email: str):
    user = database.get_user(email)
    secret = user.get("mfa_secret")
    totp = pyotp.TOTP(secret)
    totp_uri = totp.provisioning_uri(name=email, issuer_name="CertVerify")
    return SetupMFAResponse(success=True, totp_uri=totp_uri, secret=secret)

@app.post("/confirm-mfa", response_model=MFAResponse)
async def confirm_mfa(data: ConfirmMFARequest):
    if not database.verify_totp(data.email, data.code):
        raise HTTPException(status_code=400, detail="Invalid MFA code.")
    database.enable_mfa(data.email)
    user = database.get_user(data.email)
    return MFAResponse(success=True, message="MFA activated", role=user.get("role"))

# ──────────────────────────────────────────────────────────
# DASHBOARD STATS (THE STUFF THAT IS CURRENTLY SHOWING)
# ──────────────────────────────────────────────────────────

@app.get("/dashboard-stats")
async def get_stats():
    return database.get_valid_degrees() # Or your logging function

@app.get("/login-history")
async def get_login_history():
    return [{"email": "test@test.com", "role": "admin"}] # Placeholder

# 3. THE CLOUD ENGINE
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)