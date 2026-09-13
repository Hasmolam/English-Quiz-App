# ------------------------------------------------------------------------------
# Production Dockerfile using Astral uv (Modern Python Packaging Standard)
# ------------------------------------------------------------------------------
FROM python:3.12-slim

# Copy uv and uvx binaries directly from the official Astral image
COPY --from=ghcr.io/astral-sh/uv:0.12.5 /uv /uvx /bin/

WORKDIR /app

# Enable bytecode compilation and optimize uv performance
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV PYTHONUNBUFFERED=1

# Install system dependencies (needed for compiling psycopg2 and C extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications first for optimal Docker layer caching
COPY pyproject.toml uv.lock ./

# Synchronize dependencies with uv using deterministic frozen lockfile
RUN uv sync --frozen --no-install-project --no-dev

# Copy application source code
COPY . .

# Ensure app is synced and place virtualenv on PATH
RUN uv sync --frozen --no-dev
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

