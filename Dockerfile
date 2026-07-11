# -------------------------
# Stage 1: Build Frontend
# -------------------------
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend_new

# Copy package files and install dependencies
COPY frontend_new/package*.json ./
RUN npm install

# Pass frontend environment variables into the build process
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy source code and build
COPY frontend_new/ ./
RUN npm run build

# -------------------------
# Stage 2: Build Backend & Serve
# -------------------------
FROM python:3.11-slim
WORKDIR /app


# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets to the /app/static directory 
# (This matches the _static_dir logic in backend/app/main.py)
COPY --from=frontend-builder /app/frontend_new/dist ./static

# Set environment variables for production
ENV PYTHONUNBUFFERED=1


# Start the FastAPI server using the dynamically assigned $PORT (defaulting to 8000)
CMD ["sh", "-c", "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
