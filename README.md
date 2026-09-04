# Flex-Student-NU-EDU-Backend

Backend API for Flex Student Portal (Node.js, Express, MongoDB).

## Local Run

1. Install dependencies:
   - `npm install`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Start server:
   - `npm run dev` (development)
   - `npm run start` (production mode)

Health checks:
- `GET /api/health`
- `GET /health`

## Railway Deployment (Easy Steps)

This project is Railway-ready using `railway.json`.

### 1) Push code to GitHub
- Repository should contain the `backend` project files.

### 2) Create project on Railway
- Go to [Railway](https://railway.app/)
- New Project -> Deploy from GitHub repo
- Select this backend repository

### 3) Set Environment Variables in Railway
Add these from `.env.example`:

- `MONGO_URI`
- `JWT_SECRET`
- `HOST` (optional; `0.0.0.0` default is fine)
- `PORT` (Railway provides this automatically, no need to set manually)
- `CLOUDINARY_CLOUD_NAME` (if profile uploads are used)
- `CLOUDINARY_API_KEY` (if profile uploads are used)
- `CLOUDINARY_API_SECRET` (if profile uploads are used)

### 4) Deploy
- Railway auto-installs dependencies and runs:
  - `npm run start`
- Health check path:
  - `/health`

### 5) Use Public URL
- After deploy, Railway gives a public domain
- Use that as frontend API base URL (for example `VITE_API_BASE_URL`)
