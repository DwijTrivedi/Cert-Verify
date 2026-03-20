import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import fitz  # PyMuPDF for PDF support
import cv2 as cv
import numpy as np
import pytesseract as pyt

# Internal project modules
import database
import verify
from models import VerificationResponse

# Initialize FastAPI
app = FastAPI()

# 1. Tesseract Configuration (Cloud-ready)
pyt.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", "/usr/bin/tesseract")

# 2. CORS - Wide open for the demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── 3. API ROUTES (MUST BE DEFINED BEFORE THE CATCH-ALL) ───

@app.post("/api/extract", response_model=VerificationResponse)
async def extract_text(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        
        # Handle PDF conversion if necessary
        if file.filename.lower().endswith(".pdf"):
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            pix = pdf.load_page(0).get_pixmap(dpi=300)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
            img = cv.cvtColor(img, cv.COLOR_RGBA2BGR if pix.n == 4 else cv.COLOR_RGB2BGR)
        else:
            # Handle standard images
            np_arr = np.frombuffer(file_bytes, np.uint8)
            img = cv.imdecode(np_arr, cv.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image or PDF file.")

        # Process OCR
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        raw_text = pyt.image_to_string(gray).lower()
        
        # Verification logic
        valid_records = database.get_valid_degrees()
        status, student, uni = verify.check_if_fake(raw_text, valid_records)
        
        # Log to Supabase
        database.log_verification(file.filename, student, status)
        
        return {
            "status": status, 
            "extractedData": {"name": student, "institution": uni},
            "raw_text_preview": raw_text[:50]
        }
    except Exception as e:
        print(f"Deployment Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/dashboard-stats")
async def get_stats():
    return database.get_verification_logs()

# ─── 4. FRONTEND SERVING (THE CATCH-ALL) ───

# Mount static assets (Vite builds them into dist/assets)
if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # If the path looks like a real file (favicon, logo, etc), serve it
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise, return index.html so React Router can take over
    index_path = os.path.join("dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend build (dist folder) missing on server."}