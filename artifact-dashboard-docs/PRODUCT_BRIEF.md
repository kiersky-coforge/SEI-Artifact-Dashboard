# Product Brief: Artifact Dashboard

## What & Why

Artifact Dashboard is a centralized web application for managing, authoring, and sharing structured prompt pipelines and schemas across multiple projects. Modern AI and data extraction workflows require reusable, validated multi-stage prompts (extraction and refinement), strict JSON schemas, and few-shot examples. Instead of storing these assets across fragmented repositories or spreadsheets, Artifact Dashboard provides a unified workspace to organize projects, link shared artifacts in a many-to-many relationship, validate schema and prompt payloads, manage immutable versions, and govern user access using established SEI design standards (mirroring Stratos and DataVision).

## Audience & User Types

| User Type | Primary Goal | Notes |
|---|---|---|
| **Admin** | Manage user access, assign project permissions, and govern platform settings | Creates users, updates roles, assigns projects, disables/deletes accounts |
| **Artifact Author / Prompt Engineer** | Author, test, validate, and version multi-stage prompt pipelines and schemas | Primary user of the 4-tab Artifact Detail view (Editor, Validation, Versions, Overview) |
| **Project Contributor / Developer** | Create projects, link shared artifacts, and consume published schemas | Associates existing artifacts across multiple projects, inspects schemas and prompt versions |

## Core Tasks

Per user type, in priority order, with what "done" looks like:

### Artifact Author / Prompt Engineer
1. **Author Prompt Pipeline & Schema**: Draft Stage 1 extraction prompt, Stage 2 refinement prompt, JSON Schema, and few-shot JSON examples in the Editor tab.  
   *Done when:* Prompts and JSON structures are filled and saved.
2. **Validate Artifact Payload**: Run validation against editor content to verify JSON syntax, schema validity, and prompt completeness.  
   *Done when:* Validation passes with clean status or highlights specific syntax/structural errors.
3. **Version & Publish Artifact**: Commit changes to generate a new immutable version and toggle publish state.  
   *Done when:* New entry appears in the Versions tab and status reflects `Published`.

### Project Contributor / Developer
1. **Create & Manage Projects**: Set up a project with name and description.  
   *Done when:* Project is listed in the dashboard workspace list.
2. **Associate Shared Artifacts**: Search and attach/detach existing artifacts to one or multiple projects.  
   *Done when:* Project displays all linked artifacts and relationship counts update.
3. **Inspect & Consume Artifacts**: View schema details, copy prompt templates, and inspect version diffs.  
   *Done when:* Developer extracts the required schema/prompt for downstream implementation.

### Admin
1. **User Onboarding**: Create users with email, name, role, and project assignments.  
   *Done when:* User record is created in User Management.
2. **Access & Lifecycle Management**: Change user roles, reassign projects, disable, or delete users.  
   *Done when:* User status and access levels are updated.

## Devices & Context of Use

- **Devices**: Desktop-first (optimized for multi-tab code/prompt drafting, schema inspection, and data tables; responsive for laptop/tablet review).
- **Primary environment**: Office desk / engineering & data science workstations.
- **Known accessibility needs**: WCAG 2.1 AA compliance, accessible monospaced editor contrast, clear non-color-only status indicators for validation states, and full keyboard navigation.

## Competitive Landscape

| Competitor / Alternative | Strengths | Weaknesses | Gap This Product Fills |
|---|---|---|---|
| **Ad-hoc Git Repos / Spreadsheets / Files** | Low barrier to entry, familiar to individual engineers | Disjointed, no cross-project reuse tracking, lacks integrated live JSON/prompt validation | Centralized, searchable repository with live validation and many-to-many project links |
| **External LLMOps Registries (Langfuse, PromptLayer)** | Runtime tracing, API proxies | External SaaS dependency, lacks SEI-specific multi-stage extraction/normalization pipelines | Tailored internal workflow for two-stage extraction/refinement prompts with native SEI UX |
| **Internal Tools (Stratos, DataVision)** | Familiar design patterns and mental models | Dedicated to other domain workflows, not specialized for artifact lifecycle | Serves as the dedicated sibling application within the SEI ecosystem |

## Constraints & Non-Negotiables

- **Brand & Design Language**: Must adhere to SEI corporate design standards and UI patterns (mirroring Stratos and DataVision).
- **Relationship Model**: Many-to-many association between Projects and Artifacts (an artifact can be attached to multiple projects; projects contain artifact lists).
- **Artifact Architecture**: Fixed 4-tab model:
  1. *Overview*: Status, description, version, created by/date, updated by/date, publish state.
  2. *Editor*: Stage 1 Prompt (Extraction - markdown/plaintext), Stage 2 Prompt (Refinement/normalization - markdown/plaintext), JSON Schema, Few-shot examples (JSON array).
  3. *Versions*: Immutable version history and audit log.
  4. *Validation*: Real-time validation engine checking prompt and JSON schema validity.
- **User Management**: Integrated admin page with email, name, roles, project assignments, and disable/delete actions.

## Success Looks Like

1. **Reusable Asset Hub**: Elimination of duplicated prompt/schema definitions through seamless discovery and cross-project artifact sharing.
2. **Authoring & Validation Velocity**: Instant validation and authoring of multi-stage prompts and JSON schemas within a single screen.
3. **Auditable Lineage**: Clear version history and stable published releases for downstream project consumption.
4. **SEI Design Cohesion**: Flawless visual and interactive alignment with sister tools like Stratos and DataVision.

## Open Questions

Mirrors what's been pushed to `docs/UNKNOWNS.md`. See that file for the live, resolvable list rather than duplicating it here.
