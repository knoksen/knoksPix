"""Starcoder2 backend with streaming, metrics, structured logging & rate limiting.

Endpoints:
  POST /v1/chat/completions  (OpenAI compatible, SSE when {"stream": true})
  POST /v1/generate          (Simple generation + SSE parity)
  GET  /metrics              (Prometheus metrics)
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os
import time
import structlog
from prometheus_fastapi_instrumentator import Instrumentator, metrics
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import json

# ---------------------------------------------------------------------------
# Environment configuration
# ---------------------------------------------------------------------------
MODEL_ID = os.getenv("MODEL_ID", "bigcode/starcoder2-3b")
HF_TOKEN = os.getenv("HF_TOKEN")
API_TOKEN = os.getenv("STARCODER2_API_TOKEN", "changeme")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS_LIMIT", "512"))
RATE_LIMIT = os.getenv("RATE_LIMIT", "100/minute")
USE_MOCK_GENERATION = os.getenv("USE_MOCK_GENERATION", "0") == "1"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

# ---------------------------------------------------------------------------
# App & Middleware
# ---------------------------------------------------------------------------
app = FastAPI(title="Starcoder2 API", version="1.0.0")
security = HTTPBearer(auto_error=True)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------
instrumentator = Instrumentator()
instrumentator.add(metrics.latency())
instrumentator.add(metrics.requests())
instrumentator.add(metrics.request_size())
instrumentator.add(metrics.response_size())
instrumentator.add(metrics.requests_in_progress())

GEN_TOKENS = metrics.Counter(
    "starcoder2_tokens_generated_total",
    "Total tokens generated",
    labelnames=("endpoint",)
)
instrumentator.add(GEN_TOKENS)

# ---------------------------------------------------------------------------
# Model loading (skipped in mock mode)
# ---------------------------------------------------------------------------
tokenizer = None
model = None
if not USE_MOCK_GENERATION:
    log.info("loading_model", model_id=MODEL_ID, mock=USE_MOCK_GENERATION)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        token=HF_TOKEN,
        torch_dtype=torch.float16,
        device_map="auto"
    )

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: Optional[int] = 256
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: Optional[str] = MODEL_ID
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False
    max_tokens: Optional[int] = 256

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if API_TOKEN != "changeme" and token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return token

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _enforce_limit(requested: int, limit: int, field: str):
    if requested > limit:
        raise HTTPException(status_code=400, detail=f"{field} exceeds limit of {limit}")

def _build_chat_prompt(messages: List[ChatMessage]) -> str:
    prompt = []
    for m in messages:
        prompt.append(f"{m.role}: {m.content}\n")
    prompt.append("assistant: ")
    return "".join(prompt)

def _count_tokens(text: str) -> int:
    if tokenizer is None:
        return len(text.split())
    return len(tokenizer.encode(text))

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.post("/v1/generate")
@limiter.limit(RATE_LIMIT)
async def generate(req: GenerateRequest, request: Request, token: str = Depends(verify_token)):
    _enforce_limit(req.max_new_tokens, MAX_NEW_TOKENS, "max_new_tokens")
    start = time.time()
    logger_ctx = log.bind(endpoint="generate", stream=req.stream)

    if USE_MOCK_GENERATION:
        if req.stream:
            async def mock_stream():
                yield "data: {\"text\": \"This is a mock token.\"}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(mock_stream(), media_type="text/event-stream")
        return {"generated_text": "This is a mock response."}

    inputs = tokenizer(req.prompt, return_tensors="pt").to(model.device)

    if req.stream:
        def stream_fn():
            generated_tokens = 0
            with torch.no_grad():
                output_ids = model.generate(
                    **inputs,
                    max_new_tokens=req.max_new_tokens,
                    temperature=req.temperature,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )[0]
            full_text = tokenizer.decode(output_ids, skip_special_tokens=True)
            gen_part = full_text[len(req.prompt):]
            for ch in gen_part.split():
                generated_tokens += 1
                yield f"data: {{\"text\": \"{ch}\"}}\n\n"
            GEN_TOKENS.inc(generated_tokens, labelnames=("generate",))
            logger_ctx.info("generation_complete", tokens=generated_tokens, duration=time.time() - start)
            yield "data: [DONE]\n\n"
        return StreamingResponse(stream_fn(), media_type="text/event-stream")

    output_ids = model.generate(
        **inputs,
        max_new_tokens=req.max_new_tokens,
        temperature=req.temperature,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )[0]
    text = tokenizer.decode(output_ids, skip_special_tokens=True)
    gen_part = text[len(req.prompt):]
    tok_count = _count_tokens(gen_part)
    GEN_TOKENS.inc(tok_count, labelnames=("generate",))
    logger_ctx.info("generation_complete", tokens=tok_count, duration=time.time() - start)
    return {"generated_text": gen_part}

@app.post("/v1/chat/completions")
@limiter.limit(RATE_LIMIT)
async def chat_completions(req: ChatRequest, request: Request, token: str = Depends(verify_token)):
    _enforce_limit(req.max_tokens, MAX_NEW_TOKENS, "max_tokens")
    start = time.time()
    logger_ctx = log.bind(endpoint="chat", stream=req.stream)
    prompt = _build_chat_prompt(req.messages)

    if USE_MOCK_GENERATION:
        if req.stream:
            async def mock_stream():
                chunk = {
                    "id": "chatcmpl-mock",
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": req.model,
                    "choices": [{
                        "index": 0,
                        "delta": {"role": "assistant", "content": "Mock"},
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(chunk)}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(mock_stream(), media_type="text/event-stream")
        return {
            "id": "chatcmpl-mock",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": req.model,
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": "This is a mock response"},
                "finish_reason": "stop"
            }]
        }

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    if req.stream:
        def stream_fn():
            generated_tokens = 0
            with torch.no_grad():
                output_ids = model.generate(
                    **inputs,
                    max_new_tokens=req.max_tokens,
                    temperature=req.temperature,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )[0]
            full_text = tokenizer.decode(output_ids, skip_special_tokens=True)
            gen_part = full_text[len(prompt):]
            # Emit word-wise chunks in OpenAI-style envelopes
            buffer = []
            for word in gen_part.split():
                generated_tokens += 1
                chunk = {
                    "id": f"chatcmpl-{int(time.time())}",
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": req.model,
                    "choices": [{
                        "index": 0,
                        "delta": {"content": word + " "},
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(chunk)}\n\n"
            GEN_TOKENS.inc(generated_tokens, labelnames=("chat",))
            logger_ctx.info("chat_complete", tokens=generated_tokens, duration=time.time() - start)
            yield "data: [DONE]\n\n"
        return StreamingResponse(stream_fn(), media_type="text/event-stream")

    output_ids = model.generate(
        **inputs,
        max_new_tokens=req.max_tokens,
        temperature=req.temperature,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )[0]
    full_text = tokenizer.decode(output_ids, skip_special_tokens=True)
    gen_part = full_text[len(prompt):]
    tok_count = _count_tokens(gen_part)
    GEN_TOKENS.inc(tok_count, labelnames=("chat",))
    logger_ctx.info("chat_complete", tokens=tok_count, duration=time.time() - start)
    return {
        "id": f"chatcmpl-{int(time.time())}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": gen_part},
            "finish_reason": "stop"
        }]
    }

# ---------------------------------------------------------------------------
# Metrics exposure
# ---------------------------------------------------------------------------
instrumentator.instrument(app).expose(app)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "model": MODEL_ID, "mock": USE_MOCK_GENERATION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=os.getenv("HOST", "0.0.0.0"), port=int(os.getenv("PORT", "8000")), reload=True)
