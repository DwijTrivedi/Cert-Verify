# STAGE 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/verify-trust-shine/package*.json ./
RUN npm install

COPY frontend/verify-trust-shine/ ./

# VITE_API_URL must be baked in at build time (Vite compiles env vars into the JS bundle)
# Pass this via Render's "Build environment variables" or docker build --build-arg
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# STAGE 2: Build the Python Backend & Combine
FROM python:3.11-slim
WORKDIR /app

# Install Tesseract and OpenCV runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built React app from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./dist

# Copy the backend code
COPY backend/ .

# Render sets its own $PORT — this is a fallback for local docker run
ENV PORT=8000

CMD gunicorn main:app --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120 --workers 1