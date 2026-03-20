# STAGE 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/verify-trust-shine/package*.json ./
RUN npm install
COPY frontend/verify-trust-shine/ ./
RUN npm run build

# STAGE 2: Build the Python Backend & Combine
FROM python:3.11-slim
WORKDIR /app

# Install Tesseract, OpenCV dependencies, and Poppler (for PDFs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the BUILD folder from the React stage
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy the backend code
COPY backend/ .

# Ensure Gunicorn serves the Monolith on Port 8000
ENV PORT=8000
CMD gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120