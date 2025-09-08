# Deployment Reference

This document contains the extended deployment matrices and guidance moved out of the main `README.md` for brevity.

## Frontend Targets

| Target | Method | Notes |
|--------|--------|-------|
| GitHub Pages | GitHub Actions (`preview-gh-pages.yml`) | Automatic on `main` pushes |
| Netlify | Deploy Button | Add environment variables in UI if needed |
| Vercel | Deploy Button | Auto PR previews + analytics |
| Render (Static) | Deploy Button | Define build: `npm run build`, publish: `dist` |
| Railway (Static + Backend) | Deploy Button | Can co-host backend container |

## Backend Hosting (Container)

| Host | Type | Free Tier | Notes |
|------|------|----------|-------|
| Railway | Container | ✅ | Easiest multi-service setup |
| Render | Container | ✅ (limited) | Simple auto deploys |
| Fly.io | VM (Firecracker) | ✅ | Good for mock mode or small models |
| Local GPU | Bare Metal / WSL2 | ✅ | Full control, custom CUDA |

## One-Click Frontend Buttons

| Platform | Button | Free Tier Notes |
|----------|--------|-----------------|
| Netlify | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/knoksen/knoksPix) | Generous bandwidth |
| Vercel | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/knoksen/knoksPix) | Built‑in previews |
| Render | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy) | Static or service |
| Railway | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new) | Multi-service |

## Cost / Choice Matrix (Frontend Only)

| Requirement | Best Choice | Rationale |
|-------------|------------|-----------|
| Zero-config | Vercel | Fastest from repo |
| Headers / Redirects | Netlify | `_headers` & `_redirects` |
| FE + Simple Backend | Railway | One dashboard |
| Pure static | GitHub Pages | Native & free |

## Deployment Flow Examples

### Docker (Backend + Local Frontend)

```bash
cp backend/.env.sample backend/.env
# (optional) edit MODEL_ID, RATE_LIMIT etc.
docker compose up -d --build
# in another terminal
npm run dev
```

Set `VITE_API_BASE=http://localhost:8000` in `.env.local` for the frontend to call the backend.

### Railway

1. Click the Railway button.
2. Add a service from your repository for backend (path: `backend`).
3. Add environment variables (`STARCODER2_API_TOKEN`, optional `USE_MOCK_GENERATION=1`).
4. Add a static site service pointing to root with build `npm run build` and output `dist`.

### Netlify (Frontend)

1. Use the Deploy button.
2. (Optional) Add `VITE_API_BASE` in environment settings if consuming a remote backend.

### Vercel

1. Import project.
2. Set `VITE_API_BASE` and `GEMINI_API_KEY` (if needed) in project settings.
3. Redeploy.

### Fly.io (Backend)

Create a `fly.toml` (not included yet) and run `fly launch`. Suitable mainly for mock mode or lightweight models unless GPU add-on used.

## Production Hardening Checklist

- Enforce https / custom domain (frontend)
- Reverse proxy caching layer (CDN) for static assets
- Observability: Prometheus scrape + Grafana dashboard export
- Security headers (`Content-Security-Policy`, `X-Frame-Options`)
- Rotate API tokens (`STARCODER2_API_TOKEN`)
- Use mock mode for ephemeral preview environments

## Roadmap Ideas

- Add Terraform / Bicep IaC examples
- Add Helm chart for backend
- Add GPU optimized Docker image stage
