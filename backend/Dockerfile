FROM python:3.10-slim

# Build arguments for PyTorch
ARG TORCH_CHANNEL=cu121
ARG TORCH_VERSION=2.3.1
ARG TORCHVISION_VERSION=0.18.1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install PyTorch with specified channel and version
RUN if [ "$TORCH_CHANNEL" = "cpu" ]; then \
        PYTORCH_URL="https://download.pytorch.org/whl/cpu"; \
    elif [ "$TORCH_CHANNEL" = "cu121" ]; then \
        PYTORCH_URL="https://download.pytorch.org/whl/cu121"; \
    elif [ "$TORCH_CHANNEL" = "cu118" ]; then \
        PYTORCH_URL="https://download.pytorch.org/whl/cu118"; \
    elif [ "$TORCH_CHANNEL" = "rocm6.0" ]; then \
        PYTORCH_URL="https://download.pytorch.org/whl/rocm6.0"; \
    else \
        PYTORCH_URL="https://download.pytorch.org/whl/cu121"; \
    fi && \
    pip install --no-cache-dir torch==${TORCH_VERSION}+${TORCH_CHANNEL} torchvision==${TORCHVISION_VERSION}+${TORCH_CHANNEL} --index-url ${PYTORCH_URL} && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "main:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
