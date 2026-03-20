import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import fitz
import cv2 as cv
import numpy as np
import pytesseract as pyt
import pyotp

# Your Logic Modules
import database
import verify
from models import (
    VerificationResponse, LoginRequest, LoginResponse,
    RegisterRequest, RegisterResponse,
    SetupMFAResponse, ConfirmMFARequest, VerifyMFARequest, MFAResponse
)

# Cloud Tesseract Configuration
pyt.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", "/usr/bin/tesseract")

app = FastAPI()

# Wide-open CORS for the demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── CORE LOGIC ROUTES (No "/api" prefix to match your frontend) ───

@app.post("/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    file_bytes = await file.read()
    try:
        if file.filename.lower().endswith(".pdf"):
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            pix = pdf.load_page(0).get_pixmap(dpi=300)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
            img = cv.cvtColor(img, cv.COLOR_RGBA2BGR if pix.n == 4 else cv.COLOR_RGB2BGR)
        else:
            np_arr = np.frombuffer(file_bytes, np.uint8)
            img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        raw_text = pyt.image_to_string(gray).lower()
        
        valid_records = database.get_valid_degrees()
        status, student, uni = verify.check_if_fake(raw_text, valid_records)
        database.log_verification(file.filename, student, status)
        
        return {
            "status": status, 
            "extractedData": {"name": student, "institution": uni},
            "raw_text_preview": raw_text[:50]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = database.get_user(credentials.email)
    if not user or not database.verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    role = user.get("role", "user")
    mfa_enabled = user.get("mfa_enabled", False)
    
    return LoginResponse(
        success=True, 
        message="Login processing", 
        role=role, 
        mfa_required=mfa_enabled
    )

@app.get("/dashboard-stats")
async def get_stats():
    return database.get_verification_logs()

# ─── FRONTEND SERVING (The "Proper Website" Logic) ───

# Mount the static assets (CSS/JS) created by Vite/React
if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # If the file exists in dist (like favicon, etc), serve it
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise, serve index.html (React Router handles the rest)
    index_path = os.path.join("dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend build not found in /dist folder"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)