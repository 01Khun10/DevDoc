# DevDoc

DevDoc is a documentation consistency assistant for software projects. It helps users create structured documents from templates, write sections, manage requirements, link requirements to document sections, and run basic validation checks.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma

## Prerequisites

- Node.js 20+
- PostgreSQL
- npm

## Environment Setup

Create a local `backend/.env` file using this shape:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/devdoc_db?schema=public"
JWT_SECRET=replace-this-with-a-real-32-character-random-secret
```

Create a local `frontend/.env` file using this shape:

```env
VITE_API_URL=http://localhost:5000
```

Real `.env` files should stay local and should not be committed.

## Installation

Backend:

```powershell
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

Health check:

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

## 30% Milestone Completed Features

- Authentication
- Project workspace
- Template package seeded into database
- Template library
- Create document from template
- Structured document editor
- Requirements registry
- Traceability links between requirements and document sections
- Basic Doc-Linter validation engine
- Readiness score and validation results

## Demo Workflow

Use this exact demo script:

Step 1: Register or log in.
Step 2: Create a project named "Flight Booking API".
Step 3: Open the project workspace.
Step 4: Browse templates.
Step 5: Select a profile and create an SRS document from a template.
Step 6: Open the document editor.
Step 7: Write content in at least one required section and save it.
Step 8: Open Requirements Registry.
Step 9: Create one FR, for example "User Authentication".
Step 10: Open Traceability Matrix.
Step 11: Link FR-001 to a document section.
Step 12: Open Doc-Linter Validation.
Step 13: Run validation.
Step 14: Review readiness score and validation issues.

## Important Current Limitations

- No AI assistant yet.
- No export yet.
- No advanced validation rule builder yet.
- No full rich text editor yet.
- No design/test-case modules yet.
- No real-time collaboration yet.

## Git And Phase Note

DevDoc was implemented phase by phase up to the 30% milestone. This milestone proves the core workflow: a user can create structured documentation, edit document sections, manage requirements, link requirements to document sections, and run basic validation to see readiness results.
