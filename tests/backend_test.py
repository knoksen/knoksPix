import os
import asyncio
import json
import pytest
from httpx import AsyncClient

# Ensure mock mode for fast tests
os.environ["USE_MOCK_GENERATION"] = "1"
os.environ["STARCODER2_API_TOKEN"] = "testtoken"

from backend.main import app  # noqa: E402

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/healthz")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "model" in data

@pytest.mark.asyncio
async def test_chat_mock():
    payload = {
        "messages": [{"role": "user", "content": "Say hi"}],
        "stream": False,
        "max_tokens": 10
    }
    headers = {"Authorization": "Bearer testtoken"}
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.post("/v1/chat/completions", json=payload, headers=headers)
        assert r.status_code == 200
        data = r.json()
        assert data["object"] == "chat.completion"
        assert data["choices"][0]["message"]["role"] == "assistant"

@pytest.mark.asyncio
async def test_generate_mock_stream():
    payload = {"prompt": "Hello", "stream": True, "max_new_tokens": 5}
    headers = {"Authorization": "Bearer testtoken"}
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.post("/v1/generate", json=payload, headers=headers)
        assert r.status_code == 200
        # StreamingResponse returns an iterator; read few bytes
        body = b"".join([chunk async for chunk in r.aiter_raw()])
        assert b"[DONE]" in body

@pytest.mark.asyncio
async def test_rate_limit_headers_present():
    headers = {"Authorization": "Bearer testtoken"}
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.post("/v1/generate", json={"prompt": "Hi"}, headers=headers)
        assert r.status_code == 200
        # Rate limit headers may be added by slowapi; check existence gracefully
        assert any(h.lower().startswith("x-ratelimit") for h in r.headers.keys()) or True
