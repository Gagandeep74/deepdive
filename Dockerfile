# ============================================================
# Deep Dive — Dockerfile
# ============================================================
# Builds a production image containing the FastAPI backend and
# the static frontend assets.
# ============================================================

# ============================================================
# Stage 1: Build the React frontend
# ============================================================
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY frontend_new/package*.json ./
RUN npm install
COPY frontend_new/ ./
RUN npm run build

# ============================================================
# Stage 2: Build the FastAPI backend
# ============================================================
FROM python:3.11-slim

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (for Docker layer caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app/ ./app/

# Copy frontend build from stage 1
COPY --from=frontend-build /app/dist/ ./static/

# Expose the API port
EXPOSE 8000

# Run with uvicorn (Render sets PORT dynamically)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
