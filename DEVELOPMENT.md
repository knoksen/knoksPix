# Development Guide

## Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd <repository-name>
```

2. **Set up environment variables**
```bash
cp backend/.env.sample backend/.env
# Edit .env with your configuration
```

3. **Start the services**
```bash
docker compose up --build
```

## Available Services

- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Metrics: http://localhost:8000/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## API Endpoints

### Chat Completions (OpenAI-style)

```bash
curl -N \
  -H "Authorization: Bearer $STARCODER2_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "bigcode/starcoder2-3b",
    "messages": [{"role":"user","content":"Write a Python hello world"}],
    "stream": true
  }' \
  http://localhost:8000/v1/chat/completions
```

### Generate (Simple SSE)

```bash
curl -N \
  -H "Authorization: Bearer $STARCODER2_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "def add(a,b):\n    return a+b",
    "max_new_tokens": 64,
    "stream": true
  }' \
  http://localhost:8000/generate
```

## Features

- **Hugging Face Integration**
  - Supports streaming via Server-Sent Events (SSE)
  - Compatible with OpenAI-style chat completion API
  - Simple generation endpoint for direct prompts

- **Structured Logging & Rate Limiting**
  - JSON logging with structlog
  - Request details logged: method, path, status, duration
  - Configurable rate limiting with slowapi

- **Prometheus Metrics**
  - Endpoint: `/metrics`
  - Metrics collected:
    - Latency
    - Throughput
    - Error counts
    - Token usage counters

- **GPU/CPU Profiles**
  - Configurable PyTorch installation via build args
  - Supported channels:
    - CPU: `TORCH_CHANNEL=cpu`
    - NVIDIA CUDA 12.1: `TORCH_CHANNEL=cu121`
    - NVIDIA CUDA 11.8: `TORCH_CHANNEL=cu118`
    - AMD ROCm 6.x: `TORCH_CHANNEL=rocm6.0`

## Build Examples

CPU-only build:
```bash
docker build -t starcoder2:cpu ./backend \
  --build-arg TORCH_CHANNEL=cpu \
  --build-arg TORCH_VERSION=2.3.1 \
  --build-arg TORCHVISION_VERSION=0.18.1
```

CUDA 12.1 build:
```bash
docker build -t starcoder2:cu121 ./backend \
  --build-arg TORCH_CHANNEL=cu121 \
  --build-arg TORCH_VERSION=2.3.1 \
  --build-arg TORCHVISION_VERSION=0.18.1
```

## Development Mode

For CI/development environments, set `USE_MOCK_GENERATION=1` to avoid downloading large models.

## Python Helper Client

```python
from starcoder2_client import ChatClient

client = ChatClient(base_url="http://localhost:8000", token="changeme")
response = client.chat([
    {"role": "user", "content": "Write a Python function add(a,b)."}
])
print(response["choices"][0]["message"]["content"])
```

## Environment Variables

See `.env.sample` for all available configuration options.
