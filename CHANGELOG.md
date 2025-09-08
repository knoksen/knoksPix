# Changelog

All notable changes to this project will be documented here.

## [0.1.0] - 2025-09-08
### Added
- Initial public release.
- React + Vite frontend with image editing workflow (crop, filters, adjustments, object cards).
- FastAPI backend (Starcoder2) with SSE streaming `/v1/chat/completions` & `/v1/generate`.
- OpenAI-compatible chat streaming format & simple generation SSE.
- Structured logging (structlog) & Prometheus metrics (`/metrics`).
- Rate limiting (slowapi) & health endpoint (`/healthz`).
- Mock generation mode `USE_MOCK_GENERATION=1` for CI / fast local dev.
- Electron desktop packaging and auto-update config.
- Android (Capacitor) mobile scaffold.
- Docker & docker-compose with GPU/CPU build profiles (TORCH_CHANNEL args).
- PR preview deployments (Surge) + GitHub Pages main deployment.
- Test suites: Jest (frontend) + Pytest (backend mock mode).
- Deployment buttons (Netlify, Vercel, Render, Railway) & README deployment matrix.
- MIT License & comprehensive README with architecture diagram.

### Notes
- Replace placeholder screenshots in `docs/` for better visual presentation.
- Large model downloads skipped when mock mode enabled.

---

## Unreleased
- (Add new changes here following Keep a Changelog style.)
