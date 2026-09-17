# Artifact Dashboard

Artifact Dashboard is an interactive web prototype for managing, authoring, validating, and sharing structured prompt pipelines and JSON schemas across SEI projects (designed to align with Stratos and DataVision).

## Features

- **Projects Management**: Catalog of workspaces with many-to-many shared artifact associations.
- **4-Tab Artifact Detail Workspace**:
  - **Overview**: Metadata, ownership, and project links.
  - **Editor**: Stage 1 Extraction prompt (markdown/plaintext), Stage 2 Refinement prompt, JSON Schema, and Few-shot JSON examples.
  - **Versions**: Immutable version history, changelogs, snapshot inspection, and instant rollback.
  - **Validation**: Real-time syntax and schema validation engine with actionable error/warning highlights.
- **User Management**: Admin view to manage team members, roles (`Admin`, `Author`, `Developer`), project access, and account states.
- **SEI Corporate Branding**: 2-Layer design token architecture (Circular/JetBrains typography, SEI Red/Navy/Blue color tiers, dark mode).
- **Prototype Tools**: Integrated persona switcher (`Admin`, `Author`, `Developer`), Architecture Map modal, and mock store data reset.

## Quick Start

```bash
# Install dependencies
npm install --prefix frontend

# Start development server
npm run dev
```

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3 with SEI Design System tokens
- React Router v7
- Lucide Icons
- In-memory & LocalStorage mock data store with rich seed fixtures
