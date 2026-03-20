# STAGE 1: Build the React Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# STAGE 2: Build the Python Backend & Combine
FROM python:3.11-slim
WORKDIR /app

# Install system tools for OCR and OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libtesseract-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the BUILD files from Stage 1 into the backend folder
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy the rest of the backend code
COPY backend/ .

# Start the app
ENV PORT=8000
CMD gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120