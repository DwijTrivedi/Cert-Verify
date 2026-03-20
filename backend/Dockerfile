# # ─────────────────────────────────────────────────────────────
# # CertVerify Backend — Dockerfile
# # Base: python:3.12-slim (minimal Debian, fast build)
# # ─────────────────────────────────────────────────────────────

# FROM python:3.12-slim

# # System dependencies:
# #   tesseract-ocr     → OCR engine (required by pytesseract)
# #   libtesseract-dev  → Tesseract dev headers
# #   libgl1-mesa-glx   → OpenGL lib required by OpenCV even in headless mode
# #   libglib2.0-0      → GLib required by OpenCV
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     tesseract-ocr \
#     libtesseract-dev \
#     libgl1-mesa-glx \
#     libglib2.0-0 \
#     && rm -rf /var/lib/apt/lists/*

# # Set working directory inside the container
# WORKDIR /app

# # Copy and install Python dependencies first (Docker layer cache optimisation)
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy all backend source files
# COPY . .

# # Tell pytesseract where the tesseract binary lives inside the container
# ENV TESSERACT_CMD=/usr/bin/tesseract

# # Expose the port uvicorn will listen on
# EXPOSE 8000

# # Production: gunicorn manages multiple uvicorn worker processes
# # Adjust --workers based on your Railway plan (1 worker = free tier safe)
# # Using shell form for CMD to allow environment variable expansion (Railway sets $PORT)
# CMD gunicorn main:app \
#      --worker-class uvicorn.workers.UvicornWorker \
#      --workers 1 \
#      --bind 0.0.0.0:${PORT:-8000} \
#      --timeout 120


# 1. Use a lightweight Python image
FROM python:3.11-slim

# 2. Install SYSTEM dependencies (Tesseract and OpenCV helpers)
# This is the "secret sauce" that prevents the errors
# 1. Use stable Python (3.11 is great for library compatibility)
FROM python:3.11-slim

# 2. Install SYSTEM dependencies (The "Security Guard" for OCR/OpenCV)
# Updated Step 2: More robust installation
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Setup work directory
WORKDIR /app

# 4. Install Python dependencies (Caches the layer for faster future builds)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the code
COPY . .

# 6. Tell Pytesseract where to look
ENV TESSERACT_CMD=/usr/bin/tesseract

# 7. Start the engine with Gunicorn
# This handles multiple requests and binds to the Render port automatically
CMD gunicorn main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 1 \
    --bind 0.0.0.0:${PORT:-8000} \
    --timeout 120
