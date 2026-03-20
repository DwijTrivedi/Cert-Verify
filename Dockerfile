# STAGE 1: Build React
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/verify-trust-shine/package*.json ./
RUN npm install
COPY frontend/verify-trust-shine/ ./
RUN npm run build

# STAGE 2: Python Monolith
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr libtesseract-dev libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend into root
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy backend logic
COPY backend/ .

ENV PORT=8000
CMD ["gunicorn", "main:app", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--timeout", "120"]