# AGENTS.md

This prototype is built with UX Atlas. Docs folder: `artifact-dashboard-docs/`.

Doc ownership:
- `artifact-dashboard-docs/UNKNOWNS.md` — appended to by any skill; cleared as questions resolve
- `artifact-dashboard-docs/PRODUCT_BRIEF.md` — owned by `brief`
- `artifact-dashboard-docs/COMPETITIVE_ANALYSIS.md` — owned by `competitors`
- `artifact-dashboard-docs/PERSONA_WALKTHROUGH.md` — owned by `persona`
- `artifact-dashboard-docs/JOURNEY_MAP.md` — owned by `journey`
- `artifact-dashboard-docs/OKR.md` — owned by `metrics`
- `artifact-dashboard-docs/OOUX_OBJECT_MAP.md` — owned by `map`'s `objects` mode
- `DESIGN.md` — owned by `styleguide`, regenerated from `index.css`, never hand-edited out of sync
- `artifact-dashboard-docs/adr/` — owned by `decisions`
- `artifact-dashboard-docs/USER_GUIDE.md` — owned by `guide`
- `artifact-dashboard-docs/REQUIREMENTS.md` — owned by `requirements`
- `artifact-dashboard-docs/repo/` — relative symlinks to the repo's root-level docs (`README.md`, `AGENTS.md`, `CLAUDE.md`/`CONTEXT.md` when present) so they're readable from inside the docs vault; edit the originals at the root, not here
- `artifact-dashboard-docs/notes/` — general notes home, safe to open directly in Obsidian or any other markdown editor; use it for **all** project notes. `artifact-dashboard-docs/notes/my-notes/` inside it is the raw capture zone (fed by `wiki`'s `note` mode quick captures, or typed by hand); `artifact-dashboard-docs/notes/wiki/` next to it is owned by `wiki`'s default `compile` mode, which compiles `my-notes/` plus any other document dropped into `artifact-dashboard-docs/` (specs, client feedback, research) into an interlinked knowledge base

## Working Agreements

- **Capture decisions as they happen.** A non-obvious call made while working in this repo doesn't wait for someone to ask "why did we do it this way?" later: write it up with `decisions` if it's a real tradeoff with a rejected alternative, or with `wiki`'s `note` mode if it's smaller than that but still worth keeping.
- **Don't let a thought evaporate at the end of a session.** Anything worth remembering that doesn't have an obvious home yet, an idea, a risk, an observation, goes through `wiki`'s `note` mode immediately. It lands in `artifact-dashboard-docs/notes/my-notes/` and folds into `artifact-dashboard-docs/notes/wiki/` on its own; nothing needs a separate pass to not get lost.
- **Use `artifact-dashboard-docs/notes/` for all project notes.** Meeting notes, scratch thoughts, research, anything a teammate, PM, client, or user hands over, belongs there (or elsewhere under `artifact-dashboard-docs/` if it's a standalone document someone else maintains) rather than scattered across the repo or left outside version control entirely. `wiki` picks up anything placed there.
- **Defer to `artifact-dashboard-docs/UNKNOWNS.md` instead of guessing.** If a decision genuinely needs input this session doesn't have, log it there rather than inventing a plausible-sounding answer (see the suite's own AGENTS.md §2.6).
- **Suggest next steps at natural checkpoints.** After finishing a skill's work, or whenever a session looks like it's wrapping up, briefly state what `help` would recommend next, don't wait to be asked "what now?"
