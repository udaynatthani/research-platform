# Research Workflow & Insight Intelligence Platform — Frontend

## Stack
- **React 18** + **Vite 6**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router DOM v7**
- **Axios** with JWT interceptors + refresh token rotation
- **React Hook Form** + **Zod**
- **D3.js** for force-directed concept graphs
- **Lucide React** for icons

## Setup

```bash
npm install
npm run dev
```

The app connects to the Express backend at `http://localhost:5000`.

## Features
| Route | Feature |
|---|---|
| `/dashboard` | Stats overview, activity feed, search history |
| `/projects` | Create and switch research projects |
| `/papers` | Search local + Semantic Scholar, save papers, add notes & tags |
| `/collections` | Curated paper collections |
| `/workflow` | Kanban board with drag-and-drop |
| `/experiments` | Experiment tracking with iterations and JSON metrics |
| `/concept-map` | D3 force-directed knowledge graph |
| `/insights` | Research insights with lineage tracing |
| `/visualization` | Concept graph, workflow timeline, insight network |
| `/ai` | AI summarize, extract insights, chat |
| `/activity` | Audit log feed + search history |

## Authentication
JWT access token stored in localStorage. Refresh token auto-rotated via Axios interceptor. On 401, retries once after refreshing. On second failure, logs out and redirects to `/login`.
