import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import fitz
import cv2 as cv
import numpy as np
import pytesseract as pyt
import pyotp

import database
import verify
from models import (
    VerificationResponse, LoginRequest, LoginResponse,
    RegisterRequest, RegisterResponse,
    SetupMFAResponse, ConfirmMFARequest, VerifyMFARequest, MFAResponse
)

# Tesseract Path for Cloud
pyt.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", "/usr/bin/tesseract")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS (Keep this for local testing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────
# API ROUTES (OCR, LOGIN, MFA)
# ──────────────────────────────────────────────────────────

@app.post("/api/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if file.filename.lower().endswith(".pdf"):
        pdf = fitz.open(stream=file_bytes, filetype="pdf")
        pix = pdf.load_page(0).get_pixmap(dpi=300)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        if pix.n == 4: img = cv.cvtColor(img, cv.COLOR_RGBA2BGR)
        else: img = cv.cvtColor(img, cv.COLOR_RGB2BGR)
    else:
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    raw_text = pyt.image_to_string(gray).lower()
    valid_records = database.get_valid_degrees()
    status, student, uni = verify.check_if_fake(raw_text, valid_records)
    database.log_verification(file.filename, student, status)
    return {"status": status, "extractedData": {"name": student, "institution": uni}, "raw_text_preview": raw_text[:50] + "..."}

@app.post("/api/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = database.get_user(credentials.email)
    if not user or not database.verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    role = user.get("role", "user")
    if user.get("mfa_enabled"):
        return LoginResponse(success=True, message="MFA required", role=role, mfa_required=True)
    return LoginResponse(success=True, message="Login successful", role=role, mfa_required=False)

# (Add your other /api/register and /api/setup-mfa routes here similarly...)

# ──────────────────────────────────────────────────────────
# FRONTEND SERVING (THE "PROPER WEBSITE" PART)
# ──────────────────────────────────────────────────────────

# 1. Serve the 'assets' folder (CSS/JS)
# We assume the React 'dist' folder is in the same directory as main.py
if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

# 2. Catch-all route to serve index.html for React Router
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # If the request isn't for an API, send the React HTML file
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    index_path = os.path.join("dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Backend is live, but frontend build (dist folder) is missing!"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)