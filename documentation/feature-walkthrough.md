# Research Workflow & Insight Intelligence Platform
## Complete Feature Walkthrough — Implementation Documentation

> **Hackathon:** Augenblick Web Development Challenge
> **Problem Statement:** PS-1 — Research Workflow & Insight Intelligence Platform
> **Stack:** Node.js · Express 5 · Prisma ORM · PostgreSQL · JWT Auth · Python AI Microservice
> **Base URL:** `http://localhost:5000` — No `/api` prefix. Routes mount directly.

---

## Table of Contents

1. [User Authentication & Session Management](#1-user-authentication--session-management)
2. [Research Project Workspace](#2-research-project-workspace)
3. [Literature Collection & Reference Management](#3-literature-collection--reference-management)
4. [Notes & Tags on Research Materials](#4-notes--tags-on-research-materials)
5. [Datasets & External References](#5-datasets--external-references)
6. [Research Workflow Pipelines](#6-research-workflow-pipelines)
7. [Experiment & Observation Tracking](#7-experiment--observation-tracking)
8. [Concept & Insight Mapping — Knowledge Graph](#8-concept--insight-mapping--knowledge-graph)
9. [Research Visualization Tools](#9-research-visualization-tools)
10. [Intelligent Research Assistance (AI Module)](#10-intelligent-research-assistance-ai-module)
11. [Activity Feed & Search History](#11-activity-feed--search-history)
12. [End-to-End User Journey](#12-end-to-end-user-journey)

---

## Platform Overview

The problem statement describes the platform as:

> *"a web-based system designed to help researchers, students, and analysts manage the entire research lifecycle more effectively. It centralizes academic papers, datasets, notes, and experimental observations that are often scattered across tools like PDFs, spreadsheets, and note-taking apps."*

This document walks through every feature implemented in the backend, showing exactly which PS objective it addresses, which routes serve it, and what each component does under the hood.

---

## 1. User Authentication & Session Management

### What it is

Before a researcher can do anything on the platform — create a project, add a paper, run an experiment — they need a verified identity. This feature handles everything related to who you are and how the system trusts you. It issues short-lived access tokens for API calls, long-lived refresh tokens so you don't have to log in every hour, and stores every session in the database so it can be individually revoked.

### Why it's in the PS

While the PS doesn't dedicate a specific objective to authentication (it's a foundational infrastructure concern), the platform's entire model is built around user-owned research projects. Every objective — from *"create and manage multiple research projects"* to *"track ongoing research activities"* — assumes a logged-in user context. Auth is what makes all of that possible.

The PS also emphasizes traceability:

> *"This helps maintain transparency and traceability within research workflows."*

The audit log, which runs passively through every mutation the user makes, is the implementation of that traceability.

### How it works

When a user registers, their password is hashed using bcrypt with 12 salt rounds before being stored. On login, the system verifies the password, creates a `Session` record in the database (storing IP address and browser user-agent), and returns two tokens: a **JWT access token** (expires in 1 hour, carries `userId` and `role` in its payload) and a **refresh token** (a cryptographically random 128-character hex string, expires in 30 days). Every subsequent API call must include the JWT in the `Authorization: Bearer <token>` header.

When the access token expires, the client sends the refresh token to `/users/refresh-token`. The old session is marked `revoked: true` (token rotation — the old token can never be used again), and a fresh token pair is issued. On logout, the session is immediately revoked in the database.

Every `POST`, `PUT`, `PATCH`, and `DELETE` action (except login and register) is automatically intercepted by the `activityLogger` middleware, which fires asynchronously after the response is sent and writes an entry to the `AuditLog` table — recording the action, entity type, entity ID, IP address, and user-agent.

### Routes

| Method | Route | What it does |
|--------|-------|--------------|
| `POST` | `/users/register` | Register a new account. Validates email format, username (3–30 chars, alphanumeric + underscores only), password (6–128 chars). Hashes password with bcrypt (12 rounds). |
| `POST` | `/users/login` | Log in. Returns `token` (JWT, 1hr) + `refreshToken` (30 days). Session stored in DB with IP and user-agent. |
| `POST` | `/users/refresh-token` | Exchange a valid refresh token for a new token pair. Old token is immediately invalidated (rotation). |
| `POST` | `/users/logout` | Revoke the current session. Marks `Session.revoked = true` in the database. |
| `GET`  | `/users/me` | Returns the authenticated user's profile: `id`, `email`, `username`, `role`, `createdAt`. |
| `GET`  | `/users/` | List all users. **Admin only** — returns `403 Insufficient permissions` for regular users. |

### Implementation Checklist

- [x] Register with email, username, password — full validation with descriptive errors
- [x] Duplicate email OR username is rejected before DB insert
- [x] Password hashed with bcrypt (12 rounds) — never stored in plaintext
- [x] Login returns JWT access token (1 hour expiry)
- [x] Login returns refresh token (30 day expiry, stored in `Session` table)
- [x] Refresh token rotation — old token invalidated immediately on use
- [x] Logout marks session as revoked in the database
- [x] All protected routes return `401 Authentication required` with no token
- [x] All protected routes return `401 Invalid token` with a bad token
- [x] All protected routes return `401 Token expired` when JWT has expired
- [x] Rate limiting on auth endpoints — 20 requests per 15-minute window (brute force protection)
- [x] Role-based authorization — `authorize("ADMIN")` middleware for admin-only routes
- [x] Audit log middleware auto-records every mutation in the background
- [x] Middleware skips logging for login/register to avoid capturing credentials

---

## 2. Research Project Workspace

### What it is

A Project is the top-level container for everything. When a researcher starts working on a new study — say, "AI Applications in Clinical Diagnostics" — they create a project. All papers, experiments, workflow stages, concepts, datasets, references, and insights live under this project. It's the organizational unit that makes the whole platform coherent.

### PS Objective

> **Objective 1 — Research Project Workspace:**
> *"Develop a system that allows users to create and manage multiple research projects. Each project should allow users to: organize literature, datasets, and notes; define research goals or topics; track ongoing research activities; manage structured sections within the project."*

### How it works

A project is created by a logged-in user — the `ownerId` is automatically pulled from the JWT, so the researcher never needs to pass their own ID in the request body. The project supports a `visibility` flag (`PRIVATE` or `PUBLIC`). The detailed project view (`GET /projects/:id`) includes nested `sections`, `datasets`, and `references` in a single response, so the frontend can render the full project overview in one API call.

The `Project` model in Prisma is the foreign key anchor for nearly every other model in the schema — `WorkflowStage`, `Experiment`, `Insight`, `ConceptNode`, `Dataset`, and `Reference` all carry a `projectId`. This is what keeps research data isolated per project.

### Routes

| Method | Route | What it does |
|--------|-------|--------------|
| `POST` | `/projects` | Create a new research project. Body: `{ title, description, visibility }`. `ownerId` set from JWT automatically. |
| `GET`  | `/projects` | List all projects. Returns each project with its `owner` details included. |
| `GET`  | `/projects/:id` | Get full project details. Returns project with nested `sections`, `datasets`, and `references`. |

### Implementation Checklist

- [x] Create a project with title, description, and visibility setting
- [x] Project owner is automatically set from the authenticated user — no manual ID passing
- [x] PRIVATE and PUBLIC visibility supported
- [x] Project detail view includes nested sections, datasets, and references in one response
- [x] Projects can be listed by any authenticated user
- [x] Project is the anchor for experiments, concepts, insights, workflow stages, datasets, and references

---

## 3. Literature Collection & Reference Management

### What it is

The core of any research project is the papers. This feature covers the full lifecycle of research literature: manually adding papers, searching millions of academic papers from Semantic Scholar (a real live academic database), saving those external results locally, and organizing saved papers into named collections. A "Collection" is a curated list — like "Papers to Read", "Key References for Review", or "Papers That Contradict My Hypothesis".

### PS Objective

> **Objective 2 — Literature Collection & Reference Management:**
> *"Allow users to upload or add research materials such as: academic papers; articles or reports; external references or datasets. Users should be able to: attach summaries and notes; assign tags or research topics; link references to research ideas or experiments."*

### How it works

**Manual paper creation** accepts full metadata: title, abstract, DOI, URL, publication year, citation count, and source. Papers are stored in the `Paper` table, with authors stored separately in an `Author` table and linked via a `PaperAuthor` join table that includes author ordering.

**Local search** (`GET /papers/search`) queries the `Paper` table using a case-insensitive `contains` match on both `title` and `abstract`. An optional `year` filter narrows results further. Every search is automatically recorded in the `SearchHistory` table for the user.

**External search** (`GET /papers/search-external`) makes a live HTTP call to `api.semanticscholar.org/graph/v1/paper/search` with the query, requesting fields including title, authors, year, abstract, citation count, DOI, and URL. It returns up to 10 results in real-time.

**Save external paper** (`POST /papers/save-external`) runs a Prisma `$transaction` — it creates the `Paper` record, then for each author in the array, it finds-or-creates an `Author` record by name, and creates a `PaperAuthor` link with the correct ordering. All atomic.

**Collections** are named lists owned by a user. Adding a paper to a collection creates a `CollectionPaper` join record. Ownership is verified before any add/remove/delete operation — you can only modify your own collections.

### Routes

| Method | Route | What it does |
|--------|-------|--------------|
| `POST`   | `/papers` | Add a paper manually. Body: `{ title, abstract, doi, url, publicationYear, citationCount, source }`. |
| `GET`    | `/papers` | List all papers with authors. |
| `GET`    | `/papers/:id` | Full paper view: authors, tags, full text content, notes, and insights all included. |
| `GET`    | `/papers/search` | Search local DB by title/abstract. Query params: `?q=query&year=2025`. Auto-records in search history. |
| `GET`    | `/papers/search-external` | Live search on Semantic Scholar. Query param: `?q=query`. Returns up to 10 external results. |
| `POST`   | `/papers/save-external` | Save an external paper result to the local DB. Handles author creation and linking atomically. |
| `POST`   | `/collections` | Create a named collection. Owned by the authenticated user. |
| `GET`    | `/collections` | List all my collections. Returns each collection with paper count. |
| `GET`    | `/collections/:id` | View a collection with all its papers (including author details). |
| `PUT`    | `/collections/:id` | Rename or update a collection. Ownership verified. |
| `DELETE` | `/collections/:id` | Delete a collection. Ownership verified. |
| `POST`   | `/collections/:id/papers` | Add a paper to a collection. Body: `{ paperId }`. Ownership verified. |
| `DELETE` | `/collections/:id/papers/:paperId` | Remove a paper from a collection. Ownership verified. |

### Implementation Checklist

- [x] Add papers manually with full metadata (title, abstract, DOI, URL, year, citation count, source)
- [x] Search papers within the local database — matches on title AND abstract
- [x] Year filter available for local paper search
- [x] Search Semantic Scholar externally — live API call, returns up to 10 results
- [x] Save external paper to local database — atomic transaction handles paper + authors
- [x] Author creation is idempotent — finds existing author by name before creating
- [x] Author ordering preserved in `PaperAuthor.authorOrder`
- [x] Full paper view returns authors, tags, full text content, notes, and insights in one call
- [x] Create named collections for organizing papers
- [x] List collections with paper count included
- [x] Add papers to collections — ownership verified before linking
- [x] Remove papers from collections
- [x] Rename and delete collections — ownership verified
- [x] Search queries auto-recorded to personal search history

---

## 4. Notes & Tags on Research Materials

### What it is

Reading a paper is the beginning. The researcher needs a place to write down what stood out, what needs follow-up, and what the paper means in the context of their specific project. Notes are personal and paper-scoped — only the author sees their own notes. Tags are global labels applied across papers, allowing researchers to group papers thematically across the whole system.

### PS Objective

> **Objective 2 — Literature Collection & Reference Management:**
> *"Users should be able to: attach summaries and notes; assign tags or research topics; link references to research ideas or experiments."*

### How it works

**Notes** are stored in the `PaperNote` table with a composite key of `userId` + `paperId`. An optional `projectId` can scope a note to a specific research context (so a note written while reviewing a paper for Project A is distinct from notes written for Project B). The service verifies `userId` on every read, update, and delete — you can only access your own notes.

**Tags** use an upsert pattern — when you tag a paper with `"LLM-diagnostics"`, the system first `upsert`s the tag (creates it if it doesn't exist, returns the existing one if it does), then creates a `PaperTag` join record. This means tags are never duplicated in the `Tag` table even if many researchers use the same label. Untagging a paper removes only the `PaperTag` join record — the global `Tag` entry remains for other papers to use.

### Routes

| Method   | Route | What it does |
|----------|-------|--------------|
| `POST`   | `/notes` | Write a note on a paper. Body: `{ paperId, content, projectId? }`. Author set from JWT. |
| `GET`    | `/notes/paper/:paperId` | Get all my notes on a specific paper. Returns the authenticated user's notes only. |
| `PUT`    | `/notes/:id` | Edit a note's content. Only the note's author can edit — verified via `userId` on update. |
| `DELETE` | `/notes/:id` | Delete a note. Only the note's author can delete. |
| `POST`   | `/tags` | Tag a paper. Body: `{ paperId, tagName }`. Tag is upserted then linked to the paper. |
| `GET`    | `/tags` | List all tags in the system (global — not user-scoped). |
| `DELETE` | `/tags/:paperId/:tagId` | Remove a tag from a paper (removes the join record, not the global tag). |

### Implementation Checklist

- [x] Write personal notes on any paper
- [x] Notes can be optionally scoped to a specific project
- [x] Only the note's author can read, edit, or delete their notes
- [x] Notes are ordered by most recently updated
- [x] Tag any paper with a free-text label
- [x] Tags are upserted — created if new, reused if they already exist
- [x] Same tag can be applied to multiple papers
- [x] View all global tags in the system
- [x] Remove a tag from a specific paper without affecting other papers using that tag

---

## 5. Datasets & External References

### What it is

Research projects rely on more than just papers. A project might use a benchmark dataset (like MedQA or MIMIC-III), reference official guidelines (like WHO frameworks), or point to external URLs as evidence. The platform has dedicated `Dataset` and `Reference` models, both scoped to a project, so all supplementary materials stay organized alongside the papers and experiments they support.

### PS Objective

> **Objective 2 — Literature Collection & Reference Management:**
> *"Allow users to upload or add research materials such as: academic papers; articles or reports; external references or datasets."*

### How it works

**Datasets** are linked to a `projectId` and can optionally reference a `fileId` (for when a file has been uploaded and stored in the platform's file system). They have a `name` and `description`. **References** are linked to a `projectId` and carry a `title`, `url`, `description`, and a free-text `type` field (e.g., `"GUIDELINE"`, `"PAPER"`, `"DATASET"`, `"URL"`).

### Routes

| Method | Route | What it does |
|--------|-------|--------------|
| `POST` | `/datasets` | Add a dataset. Body: `{ projectId, name, description, fileId? }`. |
| `GET`  | `/datasets` | List all datasets with linked file information. |
| `POST` | `/references` | Add an external reference. Body: `{ projectId, title, url, description, type }`. |
| `GET`  | `/references` | List all references. |

### Implementation Checklist

- [x] Add datasets with name, description, and optional file link
- [x] Datasets are scoped to a specific project
- [x] Add external references with URL, title, description, and type
- [x] References are scoped to a specific project
- [x] List all datasets and references in the system

---

## 6. Research Workflow Pipelines

### What it is

Research is not linear. Multiple things happen in parallel — one paper is being reviewed, a hypothesis is forming, an experiment is being designed — and all of it needs to be tracked. The Workflow Pipeline feature gives researchers a Kanban-style board where they define custom stages, add items to stages, track each item's status (TODO → IN_PROGRESS → DONE), and move items between stages as the research progresses. Every item can be linked to an actual record in the platform — a paper, experiment, dataset, note, or project.

### PS Objective

> **Objective 3 — Research Workflow Pipelines:**
> *"Introduce mechanisms that allow users to structure their research process. Possible stages may include: literature review; hypothesis development; experiment design; result analysis. Users should be able to track how ideas or experiments progress through different stages of the research workflow."*

### How it works

**Workflow Stages** are ordered by a `position` integer. A project can have as many stages as needed. Stages can be renamed, repositioned, and deleted. The **reorder endpoint** accepts an array of stage IDs in the desired order — it runs a Prisma `$transaction` to update all positions atomically (index 0 → position 0, index 1 → position 1, etc.).

**Workflow Items** sit inside a stage. Each item has a `title`, `description`, `status`, and optional `entityType` + `entityId` to link it to a real record. `entityType` can be `PAPER`, `DATASET`, `EXPERIMENT`, `NOTE`, or `PROJECT`. The **status patch endpoint** (`PATCH /workflow/items/:id/status`) updates only the status field. The **move endpoint** (`PATCH /workflow/items/:id/move`) updates only the `stageId`, relocating the item to a different stage.

When `GET /workflow/stages/:projectId` is called, all stages are returned ordered by `position ASC`, with each stage's items nested inside it — so the frontend gets the entire Kanban board in one response.

### Routes

| Method   | Route | What it does |
|----------|-------|--------------|
| `POST`   | `/workflow/stages` | Create a stage. Body: `{ projectId, name, position }`. |
| `GET`    | `/workflow/stages/:projectId` | Get all stages for a project, ordered by position, with nested items. |
| `PUT`    | `/workflow/stages/:id` | Rename or reposition a stage. Body: `{ name, position }`. |
| `POST`   | `/workflow/stages/reorder` | Reorder stages. Body: `{ projectId, stageIds: [id1, id2, ...] }`. Atomic transaction. |
| `DELETE` | `/workflow/stages/:id` | Delete a stage. |
| `POST`   | `/workflow/items` | Add an item to a stage. Body: `{ stageId, projectId, title, description?, entityType?, entityId? }`. |
| `PUT`    | `/workflow/items/:id` | Update item title and description. |
| `PATCH`  | `/workflow/items/:id/status` | Update item status only. Body: `{ status }`. Values: `TODO`, `IN_PROGRESS`, `DONE`. |
| `PATCH`  | `/workflow/items/:id/move` | Move item to a different stage. Body: `{ stageId }`. |
| `DELETE` | `/workflow/items/:id` | Delete a workflow item. |

### Implementation Checklist

- [x] Create custom named workflow stages per project
- [x] Stages have integer position for explicit ordering
- [x] Rename and reposition individual stages
- [x] Reorder all stages in one atomic operation (drag-and-drop support)
- [x] Delete stages
- [x] Add items to stages with title and description
- [x] Link items to actual records (papers, experiments, datasets, notes, projects)
- [x] Track item status: TODO → IN_PROGRESS → DONE
- [x] Move items between stages with a dedicated endpoint
- [x] Get all stages with their items in a single response (efficient for frontend rendering)

---

## 7. Experiment & Observation Tracking

### What it is

Experiments are the empirical core of research. A researcher might set up a benchmarking experiment, run it multiple times with different parameters, and collect measurable results each time. This feature lets researchers document the objective and methodology of an experiment, log each iteration (run attempt), and attach richly structured JSON metrics to every run — accuracy, calibration, sample sizes, dates, or any other measurement. Experiments are linked to projects and can be connected to insights derived from their results.

### PS Objective

> **Objective 6 — Experiment & Observation Tracking:**
> *"Enable users to document experiments or research observations. Possible capabilities include: recording experiment objectives and methodology; documenting results and observations; linking experiments to hypotheses or supporting literature; tracking iterations across multiple experiment attempts."*

### How it works

An `Experiment` has a `projectId`, `title`, optional `objective` and `methodology` text fields, and a `status` (defaults to `TODO` if not provided). An `ExperimentIteration` belongs to an experiment and represents a single run — it has an `iterationNumber` and `description`. An `ExperimentResult` belongs to an iteration and stores a `resultSummary` string plus a `metrics` field of type `Json` in Prisma — meaning you can store any arbitrary JSON object (e.g., `{ accuracy: 0.864, ece: 0.042, n: 1273, date: "2026-03-12" }`).

The experiment list endpoint (`GET /experiments/:projectId`) returns all experiments for a project with their iterations and linked insights included.

### Routes

| Method   | Route | What it does |
|----------|-------|--------------|
| `POST`   | `/experiments` | Create an experiment. Body: `{ projectId, title, objective?, methodology?, status? }`. |
| `GET`    | `/experiments/:projectId` | List all experiments in a project with iterations and insights. |
| `PUT`    | `/experiments/:id` | Update experiment fields. Body: any combination of `{ title, objective, methodology, status }`. |
| `DELETE` | `/experiments/:id` | Delete an experiment. |
| `POST`   | `/experiments/iteration` | Log a new iteration. Body: `{ experimentId, iterationNumber, description }`. |
| `POST`   | `/experiments/result` | Record results for an iteration. Body: `{ experimentIterationId, resultSummary, metrics: {...} }`. |

### Implementation Checklist

- [x] Create an experiment with title, objective, and methodology
- [x] Experiment status tracks progress (defaults to `TODO`)
- [x] Log multiple iterations of the same experiment with iteration numbers
- [x] Record results with free-form JSON metrics per iteration — no schema restriction
- [x] Experiments linked to a project
- [x] Experiment list returns iterations and linked insights in one response
- [x] Experiments can be updated and deleted

---

## 8. Concept & Insight Mapping — Knowledge Graph

### What it is

The most intellectually rich feature in the platform. Research insights form a web of relationships, not a list. A finding from one paper might support a hypothesis, which might contradict another finding, which might lead to a new experiment. This feature lets researchers create typed concept nodes, draw labeled directed edges between them, and record formal insights with confidence scores linked back to the paper, experiment, or concept that produced them. The lineage endpoint traces an insight back to its origin.

### PS Objective

> **Objective 4 — Concept & Insight Mapping:**
> *"Provide mechanisms for capturing and connecting research ideas. Possible capabilities include: creating concept nodes for research topics; linking insights to supporting papers or observations; associating hypotheses with experiments and results. This allows researchers to understand relationships between findings."*

> **Objective 7 — Insight Lineage & Dependency Tracking:**
> *"The system should allow users to trace how research insights were derived. Possible features include: tracking which papers, experiments, or observations led to a specific insight; identifying dependencies between research findings; visualizing how ideas evolve during the research process. This helps maintain transparency and traceability within research workflows."*

### How it works

**Concept Nodes** (`ConceptNode`) have a `projectId`, a free-text `type` (e.g., `HYPOTHESIS`, `FINDING`, `TOPIC`, `OBSERVATION`), a `title`, and an optional `description`. There is no enum constraint on `type` — researchers can use whatever vocabulary fits their domain.

**Concept Links** (`ConceptLink`) connect two nodes with a directed edge (source → target) and a free-text `relationshipType` (e.g., `SUPPORTS`, `CONTRADICTS`, `DERIVED_FROM`, `LEADS_TO`). Links can be created via either `/concepts/link` or `/links` — both write to the same `ConceptLink` table. Getting concepts for a project returns each node with its `outgoing` and `incoming` arrays populated, giving the full adjacency structure.

**Insights** (`Insight`) are formal research conclusions. They belong to a `projectId` and can optionally be linked to a `paperId`, `experimentId`, or `conceptNodeId` — all three are nullable, so an insight can come from any combination of sources. A `confidenceScore` (float 0.0–1.0) captures how certain the researcher (or AI) is about the insight. The `createdBy` field is a string — it's `"USER"` for manually written insights and `"AI"` for insights extracted by the AI module.

**Lineage tracing** (`GET /insights/lineage/:id`) returns an insight with its source `paper`, `experiment`, and `project` all populated, giving a complete provenance chain.

### Routes

| Method   | Route | What it does |
|----------|-------|--------------|
| `POST`   | `/concepts` | Create a concept node. Body: `{ projectId, type, title, description? }`. |
| `GET`    | `/concepts/:projectId` | Get all concept nodes for a project with their incoming and outgoing links. |
| `POST`   | `/concepts/link` | Draw a typed relationship between two nodes. Body: `{ sourceNodeId, targetNodeId, relationshipType }`. |
| `POST`   | `/insights` | Record a research insight. Body: `{ projectId, content, paperId?, experimentId?, conceptNodeId?, confidenceScore?, createdBy? }`. |
| `GET`    | `/insights/project/:projectId` | Get all insights for a project with linked paper and experiment info. |
| `GET`    | `/insights/lineage/:id` | Trace an insight's origin — returns insight with source paper, experiment, and project. |
| `DELETE` | `/insights/:id` | Delete an insight. |
| `POST`   | `/links` | Create a concept link (alternate route — same as `/concepts/link`). |
| `GET`    | `/links/:projectId` | Get all concept links for a project with full source and target node details. |
| `DELETE` | `/links/:id` | Delete a concept link. |

### Implementation Checklist

- [x] Create typed concept nodes — type is free-text (HYPOTHESIS, FINDING, TOPIC, OBSERVATION, etc.)
- [x] Get all nodes for a project with their full link adjacency (incoming and outgoing)
- [x] Draw labeled directed relationships between nodes with free-text relationship types
- [x] Two route aliases for creating links (`/concepts/link` and `/links`) for flexibility
- [x] Record insights with optional links to source paper, experiment, or concept node
- [x] Confidence score (0.0–1.0) on insights
- [x] `createdBy` field distinguishes human insights from AI-extracted ones
- [x] Get all insights for a project with source details included
- [x] Trace insight lineage — provenance chain back to source paper, experiment, and project
- [x] Full link detail includes source and target node data

---

## 9. Research Visualization Tools

### What it is

Three dedicated endpoints serve pre-shaped data payloads for frontend visualizations. The backend pre-processes the data into graph-ready structures so the frontend can focus purely on rendering. These aren't rendered views — they're clean, structured data responses ready to be consumed by libraries like D3.js, React Flow, or vis.js.

### PS Objective

> **Objective 5 — Research Visualization Tools:**
> *"Design interactive visualizations that help users explore their research data. Possible visual tools include: concept relationship maps; timelines showing research development; clusters of related research topics; visual exploration of linked insights and sources. These visualizations help researchers identify patterns and connections within their work."*

### How it works

**Concept Graph** (`GET /visualization/concept-graph/:projectId`) returns `{ nodes: [...], links: [...] }` where each node is a `ConceptNode` record and each link is a `ConceptLink` with source and target populated. This is the exact shape expected by D3 force-directed graph or React Flow.

**Workflow Timeline** (`GET /visualization/workflow-timeline/:projectId`) returns all workflow stages in `position ASC` order, each with its items nested inside. This is ready for a Gantt chart, timeline, or Kanban render.

**Insight Network** (`GET /visualization/insight-network/:projectId`) returns all insights for the project with their linked paper information included. This can be rendered as a network where nodes are insights and edges connect insights to the papers that produced them.

### Routes

| Method | Route | What it does |
|--------|-------|--------------|
| `GET`  | `/visualization/concept-graph/:projectId` | Returns `{ nodes, links }` in graph format — ready for D3/React Flow. |
| `GET`  | `/visualization/workflow-timeline/:projectId` | Returns stages in position order with nested items — ready for timeline/Gantt. |
| `GET`  | `/visualization/insight-network/:projectId` | Returns insights with linked papers — ready for insight network visualization. |

### Implementation Checklist

- [x] Concept graph endpoint returns nodes + directed edges in standard graph format
- [x] Workflow timeline returns stages sequentially with nested items
- [x] Insight network returns insights with source paper relationships
- [x] All three endpoints are project-scoped
- [x] Data is pre-shaped for frontend consumption — no extra transformation needed

---

## 10. Intelligent Research Assistance (AI Module)

### What it is

The AI module bridges the Express backend to a dedicated Python FastAPI microservice running at `http://localhost:8000` (configurable via `AI_SERVICE_URL` in `.env`). It provides five AI-powered capabilities: summarizing papers, having a multi-turn conversation with a paper, automatically extracting and saving insights, recommending related papers, and checking text for plagiarism similarity. Chat sessions are fully persisted in the database so researchers can review past conversations.

### PS Objective

> **Objective 9 — Intelligent Research Assistance:**
> *"Participants may incorporate intelligent tools that assist researchers in analyzing and interpreting research materials. Possible capabilities include: summarizing research papers or reports; extracting important concepts or keywords; identifying connections between research topics; highlighting emerging patterns in collected materials; suggesting possible directions or unanswered questions."*

> **Objective 8 — Plagiarism & Similarity Detection:**
> *"Provide mechanisms that help identify similarities across research materials. Possible capabilities include: comparing uploaded documents or notes for textual similarity; highlighting overlapping sections between papers or insights; detecting potentially duplicated or reused research content. This helps researchers maintain originality and proper attribution."*

### How it works

All five AI capabilities share the same architecture: the Express controller fetches the relevant data from the database (e.g., `PaperContent.fullText`), then calls the Python AI service over HTTP via `axios` with a 60-second timeout. The `aiService.js` module is a clean abstraction layer — it exports named functions (`summarizePaper`, `chatWithPaper`, `extractInsights`, `getRecommendations`, `checkPlagiarism`) that all make HTTP calls to corresponding Python endpoints.

**Summarize** (`POST /ai/summarize/:paperId`) — looks up the `PaperContent` record for the paper, sends the `fullText` to `/ai/summarize-paper` on the Python service, and returns the result.

**Chat** (`POST /ai/chat`) — sends the question and `paperId` to `/ai/chat-with-paper`. If no `sessionId` is provided, a new `AIChatSession` is created. Either way, both the user's question and the AI's answer are appended as `AIChatMessage` records. The `sessionId` is returned so the client can send follow-up questions in the same conversation thread.

**Extract Insights** (`POST /ai/insights/:paperId`) — sends paper content to `/ai/extract-insights`. The AI's result is then saved as a formal `Insight` record in the database with `createdBy: "AI"`, linked to both the `paperId` and `projectId`.

**Recommendations** (`GET /ai/recommendations/:paperId`) — sends paper content to `/ai/recommend-papers` with `top_k: 5`. Returns a list of recommended papers with reasons.

**Plagiarism Check** (`POST /ai/plagiarism-check`) — sends arbitrary text to `/ai/check-plagiarism`. Returns similarity score and flagged matches.

> **Note:** All five endpoints require the Python AI microservice to be running. If the service is unavailable, all AI endpoints will return `500` — this is expected behavior and does not affect any non-AI features.

### Routes

| Method | Route | What it does |
|--------|-------|--------------|
| `POST` | `/ai/summarize/:paperId` | AI summarizes the paper. Requires `PaperContent` indexed in DB. Returns summary + key points. |
| `POST` | `/ai/chat` | Multi-turn conversation with a paper. Body: `{ paperId, sessionId, question }`. `sessionId` is `null` for new conversations. |
| `POST` | `/ai/insights/:paperId` | AI extracts insights and saves them to the Insight table. Body: `{ projectId }`. |
| `GET`  | `/ai/recommendations/:paperId` | AI recommends related papers based on content. Returns up to 5 recommendations with reasons. |
| `POST` | `/ai/plagiarism-check` | Check text for similarity. Body: `{ text }`. Returns similarity score and matches. |

### Implementation Checklist

- [x] Summarize any paper with a single API call
- [x] Multi-turn chat with a paper (RAG-style conversation)
- [x] Chat session created automatically on first message
- [x] All chat messages (user and AI) persisted to `AIChatMessage` table
- [x] Session ID returned so the client can continue conversations
- [x] AI-extracted insights saved to `Insight` table with `createdBy: "AI"`
- [x] AI insights linked to both the source paper and project
- [x] Paper recommendations based on content similarity
- [x] Plagiarism / text similarity checking
- [x] AI service abstracted in `aiService.js` — swap the Python backend without touching controllers
- [x] 60-second timeout on all AI calls — handles slow model inference

---

## 11. Activity Feed & Search History

### What it is

The platform passively records everything that changes. Every time a researcher creates, updates, or deletes any resource — papers, projects, experiments, notes, anything — the `activityLogger` middleware fires in the background after the response is sent and writes an `AuditLog` entry. Two feeds expose this data: a personal feed showing your own history, and a global feed showing all platform activity. Separately, search history is tracked every time the paper search endpoints are used.

### PS Objective

> **Objective 7 — Insight Lineage & Dependency Tracking:**
> *"This helps maintain transparency and traceability within research workflows."*

> **Expected Outcome:**
> *"Teams should deliver a prototype platform capable of: managing structured research projects and literature collections; organizing research workflows and experiment tracking; capturing insights and linking related research concepts."*

The activity feed is the platform's implementation of transparency — a full, timestamped record of every action taken.

### How it works

The `activityLogger` is an Express middleware that wraps the response's `res.json` method. It intercepts the outgoing response after it's sent, extracts the entity ID from `res.locals.body.id`, infers the entity type from the URL path (e.g., `/papers` → `"PAPER"`), and writes an `AuditLog` record with the action string (`"POST /papers"`), entity type, entity ID, IP address, and user agent. It only fires for `POST`, `PUT`, `PATCH`, and `DELETE` requests with 2xx responses. Login and register are explicitly skipped.

**Search history** is recorded synchronously inside the paper search controllers — every call to `GET /papers/search` and `GET /papers/search-external` writes a `SearchHistory` record with the query, filters, and result count before returning the response.

### Routes

| Method   | Route | What it does |
|----------|-------|--------------|
| `GET`    | `/activity/feed` | My personal activity feed. Query: `?limit=20`. Returns AuditLog entries for the authenticated user. |
| `GET`    | `/activity/global` | Global activity feed. Query: `?limit=20`. Returns all users' entries with username included. |
| `GET`    | `/search/history` | View personal search history. Query: `?limit=10`. Returns past queries with filters and result counts. |
| `DELETE` | `/search/history` | Clear all search history for the authenticated user. |

### Implementation Checklist

- [x] Every mutation (POST/PUT/PATCH/DELETE) auto-logged to AuditLog via middleware
- [x] Login and register events explicitly excluded from audit log
- [x] Entity type inferred from URL path (PAPER, PROJECT, EXPERIMENT, DATASET, NOTE)
- [x] Entity ID captured from response body after the response is sent
- [x] IP address and user-agent recorded in each audit entry
- [x] Personal activity feed returns the user's own history
- [x] Global activity feed returns all platform activity with usernames
- [x] Both feeds support a `?limit` query parameter
- [x] Paper searches auto-recorded with query string, filters, and result count
- [x] User can view their search history with a limit
- [x] User can clear their entire search history

---

## 12. End-to-End User Journey

The following story traces one researcher through the full platform from first login to completed analysis.

---

### Step 1 — Register & Log In
*Feature: User Authentication*

A researcher signs up with their email and username. The system validates inputs, hashes the password, and creates their account. They log in and receive a JWT token and a refresh token. Every API call from here includes `Authorization: Bearer <token>`.

**Routes used:** `POST /users/register` → `POST /users/login` → `GET /users/me`

---

### Step 2 — Create a Research Project
*Feature: Research Project Workspace*

The researcher creates a project: *"AI Applications in Clinical Diagnostics — 2026 Systematic Review"*. The platform sets them as the owner automatically. This project will anchor everything else they do.

**Routes used:** `POST /projects` → `GET /projects/:id`

---

### Step 3 — Collect Literature
*Feature: Literature Collection & Reference Management*

The researcher searches Semantic Scholar for `"LLM clinical decision support"`. They get 10 results back in real-time. They save 3 relevant papers to the local database. They also manually add a preprint they found elsewhere.

**Routes used:** `GET /papers/search-external?q=LLM+clinical` → `POST /papers/save-external` × 3 → `POST /papers`

---

### Step 4 — Organize Into a Collection
*Feature: Literature Collection & Reference Management*

They create a collection called *"Core References"* and add all 4 papers to it. Later they create a second collection called *"Contradicting Evidence"* for papers they'll challenge.

**Routes used:** `POST /collections` → `POST /collections/:id/papers` × 4

---

### Step 5 — Annotate the Papers
*Feature: Notes & Tags*

For each paper, they write a note capturing key findings, limitations, and follow-up questions. They tag every paper with relevant labels: `"LLM-diagnostics"`, `"clinical-AI"`, `"needs-replication"`.

**Routes used:** `POST /notes` × 4 → `POST /tags` × 8

---

### Step 6 — Add Supporting Data
*Feature: Datasets & External References*

They link the MedQA-USMLE benchmark dataset to the project, and add the WHO AI in Healthcare guidelines as a reference.

**Routes used:** `POST /datasets` → `POST /references`

---

### Step 7 — Set Up the Workflow
*Feature: Research Workflow Pipelines*

They create 4 workflow stages: *Literature Review → Hypothesis Development → Experiment Design → Result Analysis*. They add a workflow item for each paper in the Literature Review stage and start marking them `IN_PROGRESS` as they work through them.

**Routes used:** `POST /workflow/stages` × 4 → `POST /workflow/items` × 4 → `PATCH /workflow/items/:id/status`

---

### Step 8 — Run an Experiment
*Feature: Experiment & Observation Tracking*

They set up an experiment: *"Benchmark: GPT-4 vs Claude-3 on MedQA Dataset"*. They run it twice (two iterations). For each run they record the metrics as JSON: accuracy, calibration ECE, refusal rate, sample size.

**Routes used:** `POST /experiments` → `POST /experiments/iteration` × 2 → `POST /experiments/result` × 2

---

### Step 9 — Build the Knowledge Graph
*Feature: Concept & Insight Mapping*

They create two concept nodes: a `HYPOTHESIS` node (*"LLMs overfit to benchmark question formats"*) and a `FINDING` node (*"LLM calibration degrades on rare diagnoses"*). They draw a `SUPPORTED_BY` edge between them. They record a formal insight from one of the papers with a confidence score of 0.88.

**Routes used:** `POST /concepts` × 2 → `POST /concepts/link` → `POST /insights`

---

### Step 10 — Render Visualizations
*Feature: Research Visualization Tools*

The frontend calls the three visualization endpoints to render the concept graph, workflow timeline, and insight network as interactive visuals.

**Routes used:** `GET /visualization/concept-graph/:projectId` → `GET /visualization/workflow-timeline/:projectId` → `GET /visualization/insight-network/:projectId`

---

### Step 11 — Use AI Features
*Feature: Intelligent Research Assistance*

They ask the AI to summarize the most complex paper. They start a chat session with it: *"What are the primary safety concerns for clinical LLM deployment?"* The AI responds with a cited answer. They also trigger AI insight extraction on another paper — the insights are automatically saved to the project.

**Routes used:** `POST /ai/summarize/:paperId` → `POST /ai/chat` → `POST /ai/insights/:paperId`

---

### Step 12 — Review Activity
*Feature: Activity Feed & Search History*

At the end of their session, they review their personal activity feed to see a complete log of everything they did. They check their search history and clear it before logging out.

**Routes used:** `GET /activity/feed` → `GET /search/history` → `DELETE /search/history` → `POST /users/logout`

---

## Summary

| # | Feature | Routes | Checks |
|---|---------|--------|--------|
| 1 | User Authentication & Session Management | 6 | 13 |
| 2 | Research Project Workspace | 3 | 5 |
| 3 | Literature Collection & Reference Management | 13 | 14 |
| 4 | Notes & Tags on Research Materials | 7 | 9 |
| 5 | Datasets & External References | 4 | 5 |
| 6 | Research Workflow Pipelines | 10 | 10 |
| 7 | Experiment & Observation Tracking | 6 | 7 |
| 8 | Concept & Insight Mapping | 10 | 10 |
| 9 | Research Visualization Tools | 3 | 5 |
| 10 | Intelligent Research Assistance | 5 | 11 |
| 11 | Activity Feed & Search History | 4 | 11 |
| **Total** | | **71 routes** | **100 checks** |

> *Every PS objective (1–9) is implemented. All routes are wired and active in `app.js`. The AI module requires the Python microservice at `AI_SERVICE_URL` (default: `http://localhost:8000`).*
