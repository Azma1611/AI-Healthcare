# Use a slim Python 3.11 base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (needed for OpenCV, PyTorch, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them securely
COPY requirements.txt .

# Install dependencies. We add --no-cache-dir to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set PYTHONPATH so absolute imports work
ENV PYTHONPATH=/app

# Create a non-root user and switch to it
RUN useradd -m -s /bin/bash healthcare && \
    chown -R healthcare:healthcare /app
USER healthcare

# Expose ports for FastAPI (8000) and Streamlit (8501)
EXPOSE 8000 8501

# The CMD will be overridden by docker-compose for specific services,
# but we provide a default command to run the API.
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
