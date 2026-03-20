import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# ─── 1. API ROUTES (Must be first to avoid 405 errors) ───

@app.post("/api/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img = cv.imdecode(np_arr, cv.IMREAD_COLOR)
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        raw_text = pyt.image_to_string(gray).lower()
        
        valid_records = database.get_valid_degrees()
        status, student, uni = verify.check_if_fake(raw_text, valid_records)
        database.log_verification(file.filename, student, status)
        
        return {"status": status, "extractedData": {"name": student, "institution": uni}, "raw_text_preview": raw_text[:50]}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard-stats")
async def get_stats():
    return database.get_verification_logs()

# ─── 2. FRONTEND SERVING (Must be last) ───

# Mount the static assets (CSS/JS)
if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # This ensures that API calls don't accidentally return the HTML file
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
        
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    return FileResponse("dist/index.html")