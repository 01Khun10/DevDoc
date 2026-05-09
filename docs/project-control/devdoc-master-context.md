# DevDoc Master Context

## Project Name

DevDoc

## Project Type

Web-based software documentation and project knowledge management platform.

## Main Idea

DevDoc is a platform that helps users create, manage, validate, and connect software project documentation.

It is not just a normal document editor. It stores project information as structured data so the system can understand relationships between documents, requirements, design, testing, and validation results.

## Main Purpose

The purpose of DevDoc is to make software documentation easier to create, easier to organize, and easier to check.

Many teams write documentation in separate files. Requirements may be written in one document, diagrams in another file, and test cases somewhere else. This causes missing links, weak traceability, repeated work, and confusion during review.

DevDoc solves this by giving users a structured workspace where project documents, requirements, design elements, test cases, validation results, and traceability links can stay connected.

## Core Problem

Software project documentation is often scattered across different files and tools.

This creates problems such as:

- Missing required sections
- Weak requirement quality
- Requirements not linked to design
- Requirements not linked to test cases
- Diagrams and documents not matching
- Manual checking taking too much time
- Review problems discovered too late

## Proposed Solution

DevDoc provides a web-based workspace where users can:

- Create projects
- Select documentation profiles
- Use structured templates
- Write documents section by section
- Manage requirements
- Create traceability links
- Run basic validation checks
- View missing sections and broken links
- Prepare documentation for review

## Main Traceability Chain

The main traceability chain is:

```text
Business Objective → Use Case → Requirement → Design Element → Code Module/File → Test Case
```

For the first implementation, Code Module/File can remain optional or represented as a placeholder.

## Approved Profiles

DevDoc Template Package v1 includes three profiles:

1. Standard Software Documentation Profile
2. Academic Project Profile
3. Company Software Documentation Profile

These names must not be changed without approval.

## Approved Document Types

DevDoc uses four document types:

1. SCOPE
2. SRS
3. SDS
4. STP

## Approved Template Package

The official template package is:

```text
docs/template-package/devdoc-template-package-v1.md
```

Agents must follow this file as the source of truth for profiles, templates, template codes, section lists, required/optional flags, validation tags, and ERD placement.

## Main Technology Stack

Frontend:

- React
- Vite
- Tailwind CSS

Backend:

- Node.js
- Express.js
- Prisma
- PostgreSQL

Authentication:

- JWT
- bcrypt

Testing and tools:

- Thunder Client or Postman
- pgAdmin
- Git / GitHub
- Brave Browser

## Important Scope Decisions

The first implementation should not include:

- Full AI document generation
- Custom rule builder
- Real-time collaboration
- Full GitHub repository scanning
- Marketplace
- Enterprise permission system
- Full IEEE/ISO compliance engine
- AI-generated UML from code
- Full export package generation

These can be future enhancements.

## Core First Workflow

The first strong workflow should be:

```text
User registers/logs in
→ creates a project
→ selects documentation profile
→ opens template library
→ previews a template
→ creates document from template
→ edits document sections
→ creates requirements
→ links requirements to artefacts
→ runs validation
→ views validation result
```

## Main Modules

### 1. User and Project Workspace Management

Handles account access and project workspaces.

### 2. Documentation Template Library

Stores profiles, templates, and template sections.

### 3. Structured Document Editor

Allows users to write documents section by section.

### 4. Requirements and Artefact Structuring

Allows users to create requirements, use cases, design elements, and test cases.

### 5. Traceability System

Allows users to connect project artefacts.

### 6. Basic Doc-Linter Validation

Checks missing required sections, weak requirements, and broken traceability links.

### 7. Export and Reporting

Prepares documents and reports for review. This can be basic or future work in the first implementation.

## Data Direction

DevDoc should store structured project data, including:

- Users
- Projects
- Validation profiles
- Templates
- Template sections
- Documents
- Document sections
- Business objectives
- Use cases
- Requirements
- Design elements
- Test cases
- Traceability links
- Validation rules
- Validation runs
- Validation results
- Activity logs

## UI Direction

The UI should be simple, clean, and easy to understand.

The structured editor should use this layout:

```text
Left Panel:
Document sections and completion status

Center Panel:
Editor area

Right Panel:
Description, Guidance, Example, validation issues, and linked artefacts
```

Normal users should not see backend fields such as:

```text
validationTag
ruleCode
templateCode
profileCode
database IDs
```

## Agent Rule

All agents must treat this file, AGENTS.md, the implementation roadmap, the 30 percent implementation plan, and the template package as project truth before editing code.
