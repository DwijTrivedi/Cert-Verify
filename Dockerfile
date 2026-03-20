# STAGE 1: Build React
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
# Adjust this path if your package.json is deeper
COPY frontend/verify-trust-shine/package*.json ./
RUN npm install
COPY frontend/verify-trust-shine/ ./
RUN npm run build

# STAGE 2: Python Monolith
FROM python:3.11-slim
WORKDIR /app

# Install Tesseract and OpenCV system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the BUILD folder from Stage 1 into the current directory
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy the rest of the backend code
COPY backend/ .

# Ensure Gunicorn handles the Monolith
ENV PORT=8000
CMD gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120