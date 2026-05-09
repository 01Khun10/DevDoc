# DevDoc

DevDoc is a web-based software documentation and project knowledge management platform. It will help users create, manage, validate, and connect software project documentation as structured project knowledge.

## Current Phase

This repository is currently at **Phase 0: Project Foundation** only.

Phase 0 provides:

- A runnable React + Vite + Tailwind CSS frontend foundation
- A runnable Node.js + Express backend foundation
- Basic backend health check endpoints
- Environment example files
- Clear local setup instructions

PostgreSQL and Prisma start in **Phase 1**, not Phase 0.

## Prerequisites

- Node.js >= 20
- npm

## Frontend

Install dependencies:

```powershell
cd frontend
npm install
```

Run the frontend:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Backend

Install dependencies:

```powershell
cd backend
npm install
```

Run the backend in development mode:

```powershell
npm run dev
```

Run the backend in production-style mode:

```powershell
npm start
```

Backend URL:

```text
http://localhost:5000
```

Health check URL:

```text
http://localhost:5000/health
```

Expected health response:

```json
{
  "status": "ok",
  "service": "DevDoc API"
}
```

## Environment Files

Only example environment files are included in Phase 0:

- `frontend/.env.example`
- `backend/.env.example`

Create local `.env` files from these examples when needed. Real `.env` files should not be committed.
