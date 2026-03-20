import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import fitz
import cv2 as cv
import numpy as np
import pytesseract as pyt

import database
import verify
from models import VerificationResponse

# Config
pyt.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", "/usr/bin/tesseract")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API ROUTES (MUST COME FIRST) ───

@app.post("/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    file_bytes = await file.read()
    try:
        # OCR logic here...
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img = cv.imdecode(np_arr, cv.IMREAD_COLOR)
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        raw_text = pyt.image_to_string(gray).lower()
        
        valid_records = database.get_valid_degrees()
        status, student, uni = verify.check_if_fake(raw_text, valid_records)
        database.log_verification(file.filename, student, status)
        
        return {"status": status, "extractedData": {"name": student, "institution": uni}, "raw_text_preview": raw_text[:50]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard-stats")
async def get_stats():
    return database.get_verification_logs()

# ─── FRONTEND SERVING (MUST COME LAST) ───

if os.path.exists("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # This prevents the catch-all from breaking direct file requests (like favicon)
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    return FileResponse("dist/index.html")