Set-Location "E:\DevDoc"

@'
# DevDoc

DevDoc is a structured documentation and traceability platform for software projects. It helps users create, organize, validate, connect, review, and maintain project documentation and related software artefacts in one system.

The project is under active development toward the complete DevDoc product. The previous 30% implementation milestone is historical and no longer limits the project scope.

## Core Goals

DevDoc is designed to provide:

- Structured software-document creation.
- Profile-based templates and document sections.
- Rule-based documentation validation.
- Requirement and artefact traceability.
- Use-case, design-element, and test-case management.
- Project readiness and quality reporting.
- Search, activity, sharing, and project analytics.
- Future document export, version history, diagram management, and AI-assisted workflows.

## Current Implementation

The current application includes substantial working functionality rather than only interface mockups.

### Implemented Core Areas

- User registration and authentication.
- Protected project ownership and access control.
- Project creation, retrieval, update, and management.
- Standard, Academic, and Company documentation profiles.
- Structured document templates and fixed document sections.
- TipTap-based document editing.
- Business-objective registry.
- Requirement registry.
- Use-case registry.
- Design-element registry.
- Test-case registry.
- Linked artefacts and traceability relationships.
- Traceability matrix and graph-based views.
- Rule-based Doc-Linter validation.
- Readiness and coverage calculations.
- Validation history.
- Project search.
- Activity history.
- Analytics and dashboard views.
- Read-only project sharing.
- Generated project and traceability visualizations.

### Areas Still Under Development

The following areas require further implementation, integration, or hardening before DevDoc can be considered complete:

- Full DOCX and PDF export.
- Persistent export packages and export history.
- Document snapshots and version restoration.
- Complete user-authored diagram management.
- Diagram upload, editing, storage, and section linking.
- AI-assisted writing and documentation analysis.
- Reviewer, supervisor, and administrator workflows.
- Notification workflows.
- Expanded automated frontend testing.
- Security, usability, performance, and deployment hardening.

A screen, route, or placeholder file is not considered a completed feature unless its behavior, persistence, validation, authorization, and tests are implemented.

## Technology Stack

### Frontend

- React
- Vite
- TipTap
- React Router
- React Flow / XYFlow
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JSON Web Tokens
- bcrypt
- Helmet
- Express rate limiting

### Development and Analysis

- Git and GitHub
- PowerShell
- Graphify knowledge graph
- Claude Code
- Codex

The exact dependency versions in `package.json` and the lock files are the source of truth.

## Repository Structure

```text
DevDoc/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed files
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── docs/
│   ├── project-control/
│   ├── template-package/
│   └── devdoc-system-instruction-manual.md
│
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

Generated dependencies, build output, secrets, database dumps, and Graphify output are intentionally excluded from Git.

## Prerequisites

Install:

- Node.js
- npm
- PostgreSQL
- Git

Optional development tools:

- Prisma CLI through `npx`
- Graphify
- Claude Code
- Codex

## Initial Setup

Clone the repository and enter the project directory:

```powershell
git clone <repository-url>
Set-Location "DevDoc"
```

### Backend Setup

Enter the backend directory:

```powershell
Set-Location ".\backend"
```

Install the exact locked dependencies:

```powershell
npm ci
```

Create the local environment file:

```powershell
Copy-Item ".\.env.example" ".\.env"
```

Configure these variables in `backend/.env`:

```text
PORT
FRONTEND_URL
DATABASE_URL
JWT_SECRET
```

Example meanings:

| Variable | Purpose |
|---|---|
| `PORT` | Backend HTTP port |
| `FRONTEND_URL` | Allowed frontend origin |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |

Never commit the real `.env` file.

Generate the Prisma client:

```powershell
npx prisma generate
```

Apply the existing development migrations:

```powershell
npx prisma migrate dev
```

Start the backend development server:

```powershell
npm run dev
```

The production-style start command is:

```powershell
npm start
```

### Frontend Setup

Open another PowerShell terminal and enter the frontend directory:

```powershell
Set-Location "E:\DevDoc\frontend"
```

Use the correct path for your clone.

Install the locked dependencies:

```powershell
npm ci
```

Create the frontend environment file:

```powershell
Copy-Item ".\.env.example" ".\.env"
```

Configure:

```text
VITE_API_URL
```

`VITE_API_URL` must point to the backend API used by the frontend.

Start the frontend development server:

```powershell
npm run dev
```

## Available Commands

### Backend

Run from `backend/`:

```powershell
npm run dev
npm start
npm test
```

| Command | Purpose |
|---|---|
| `npm run dev` | Run the backend using Nodemon |
| `npm start` | Run the backend using Node |
| `npm test` | Run backend Jest tests |

### Frontend

Run from `frontend/`:

```powershell
npm run dev
npm run build
npm run preview
```

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend build |
| `npm run preview` | Preview the production build locally |

The frontend package currently does not define dedicated test or lint scripts. These quality gates should be added as the project is completed.

## Database and Prisma

Validate the Prisma schema:

```powershell
Set-Location ".\backend"
npx prisma validate
```

Generate the Prisma client:

```powershell
npx prisma generate
```

Inspect migration status:

```powershell
npx prisma migrate status
```

Do not run destructive database commands such as reset, force-reset, truncation, or destructive migrations against important data without creating a secure backup and receiving explicit approval.

## Graphify Knowledge Graph

Graphify is used as a shared project-understanding layer for Claude Code and Codex.

Query the existing graph:

```powershell
graphify query "What are the main DevDoc modules?"
```

Explain a concept:

```powershell
graphify explain "validationService"
```

Trace a relationship:

```powershell
graphify path "Requirement" "TestCase"
```

Rebuild the graph after substantial accepted project changes:

```powershell
graphify . --backend gemini
```

Code extraction is local. Semantic extraction for documentation and images requires a supported model API key.

Do not commit:

```text
graphify-out/
.secrets/
```

Graphify results are an orientation aid. Actual implementation behavior must still be confirmed in the source code.

## Development Agents

Claude Code and Codex are the primary development agents for DevDoc.

Their repository instructions are stored in:

```text
CLAUDE.md
AGENTS.md
```

Neither agent is permanently restricted to only planning, coding, or reviewing. The user selects the agent and task.

Gemini is used only for independent testing, review, and Graphify semantic extraction. Gemini findings remain advisory until verified and accepted.

DevDoc does not use persistent Ruflo, Claude Flow, swarm, RuVector, AgentDB, Antigravity, or Gemini control infrastructure.

## Documentation Direction

The SDS remains an important project reference, but it is not an unchangeable implementation baseline.

A separate complete-project baseline will later define the approved final product behavior, implementation expectations, architecture, completion criteria, and relationship between code and documentation.

Until that baseline is approved:

1. Current user-approved decisions take priority.
2. Current working code, Prisma schema, and migrations represent actual behavior.
3. Existing documentation and the SDS provide requirements and design context.
4. Older milestone documents are historical references only.

Conflicts between code and documentation should be reported rather than silently resolved.

## Security Rules

Never commit or distribute:

- Real `.env` files.
- `.secrets/`.
- API keys.
- JWT secrets.
- Database credentials.
- User data.
- PostgreSQL dumps containing real records.
- Password hashes.
- `node_modules/`.
- Frontend build output.
- Runtime logs.
- Local AI-agent databases.
- Graphify generated output.

Do not expose stack traces, secrets, password hashes, or unnecessary internal database information through API responses.

Project ownership and authorization must be checked for every protected project operation.

## Git Safety

Do not use destructive Git cleanup commands on an active working tree without reviewing exactly what they will delete.

Particularly dangerous commands include:

```powershell
git clean -fd
git clean -fdx
git reset --hard
git restore .
git checkout .
git push --force
```

Stage explicit files rather than using broad staging commands when unrelated work is present.

## Project Status

DevDoc has a meaningful working core but is not yet a finished production system.

Current development should focus on:

1. Correctness and security of the existing core.
2. Reliable validation and traceability semantics.
3. Complete diagram management.
4. Document versioning and restoration.
5. DOCX and PDF export.
6. Reviewer and administrative workflows.
7. AI assistance.
8. Automated testing and deployment readiness.

The goal is the complete DevDoc product, not a percentage-based milestone.

## License

Add the approved project license before public distribution.
'@ | Set-Content ".\README.md" -Encoding UTF8