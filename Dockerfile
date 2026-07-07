# ============================================================
# Deep Dive — Dockerfile
# ============================================================
# Builds a production image containing the FastAPI backend and
# the static frontend assets.
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

# Copy frontend into static/ (served by FastAPI)
COPY frontend/ ./static/

# Expose the API port
EXPOSE 8000

# Run with uvicorn (Render sets PORT dynamically)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
