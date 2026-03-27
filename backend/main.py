import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import fitz  # PyMuPDF
import cv2 as cv
import numpy as np
import pytesseract as pyt
import pandas as pd
import io

# Project modules
import database
import verify
from models import (
    VerificationResponse, LoginRequest, LoginResponse, 
    RegisterRequest, RegisterResponse, SetupMFAResponse, 
    ConfirmMFARequest, VerifyMFARequest, MFAResponse
)

app = FastAPI()

# 1. Tesseract Configuration
pyt.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", "/usr/bin/tesseract")

# 2. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── 3. CORE OCR & VERIFICATION ───

@app.post("/api/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        if file.filename.lower().endswith(".pdf"):
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            pix = pdf.load_page(0).get_pixmap(dpi=300)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
            img = cv.cvtColor(img, cv.COLOR_RGBA2BGR if pix.n == 4 else cv.COLOR_RGB2BGR)
        else:
            np_arr = np.frombuffer(file_bytes, np.uint8)
            img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image or PDF.")

        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        raw_text = pyt.image_to_string(gray).lower()
        
        valid_records = database.get_valid_degrees()
        status, student, uni = verify.check_if_fake(raw_text, valid_records)
        
        # This was the missing function we fixed!
        database.log_verification(file.filename, student, status)
        
        return {
            "status": status, 
            "extractedData": {"name": student, "institution": uni},
            "raw_text_preview": raw_text[:50]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 4. INSTITUTION EXCEL UPLOAD (Your Alternative Solution) ───

@app.post("/api/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Please upload a valid Excel file.")
    
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Convert DataFrame to list of dicts for our DB function
        # Expects columns: name, roll, uni, deg, year
        data_to_sync = df.to_dict(orient='records')
        
        success = database.sync_excel_to_db(data_to_sync)
        if success:
            return {"message": f"Successfully synced {len(data_to_sync)} records to the database."}
        raise Exception("Database sync failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel processing error: {str(e)}")

# ─── 5. AUTHENTICATION & MFA ───

@app.post("/api/register", response_model=RegisterResponse)
async def register(user: RegisterRequest):
    return database.register_user(user)

@app.post("/api/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    return database.login_user(credentials)

@app.get("/api/setup-mfa/{email}")
async def setup_mfa(email: str):
    return database.get_mfa_setup(email)

@app.post("/api/verify-mfa", response_model=MFAResponse)
async def verify_mfa(request: VerifyMFARequest):
    return database.verify_mfa_code(request)

@app.get("/api/dashboard-stats")
async def get_stats():
    return database.get_verification_logs()

# ─── 6. FRONTEND SERVING (FALLBACK) ───

if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    return FileResponse("dist/index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)