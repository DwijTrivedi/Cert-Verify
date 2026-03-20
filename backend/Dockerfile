# ─────────────────────────────────────────────────────────────
# CertVerify Backend — Dockerfile
# Base: python:3.12-slim (minimal Debian, fast build)
# ─────────────────────────────────────────────────────────────

FROM python:3.12-slim

# System dependencies:
#   tesseract-ocr     → OCR engine (required by pytesseract)
#   libtesseract-dev  → Tesseract dev headers
#   libgl1-mesa-glx   → OpenGL lib required by OpenCV even in headless mode
#   libglib2.0-0      → GLib required by OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy and install Python dependencies first (Docker layer cache optimisation)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend source files
COPY . .

# Tell pytesseract where the tesseract binary lives inside the container
ENV TESSERACT_CMD=/usr/bin/tesseract

# Expose the port uvicorn will listen on
EXPOSE 8000

# Production: gunicorn manages multiple uvicorn worker processes
# Adjust --workers based on your Render/Railway plan (1 worker = free tier safe)
CMD ["gunicorn", "main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--workers", "1", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120"]
