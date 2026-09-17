# Proposed Application Architecture Map

*Note: This diagram represents the proposed route, workspace, and component architecture for the Artifact Dashboard prototype.*

```mermaid
flowchart TD
    subgraph RootGroup ["Root"]
        Root["App Shell / Router Root"]
    end

    subgraph ShellGroup ["Persistent Shell"]
        Header["Header Navigation"]
        UserMenu["User Profile & Prototype Tools"]
    end

    subgraph WorkspaceGroup ["Primary Workspaces"]
        W1["ProjectsListView (/projects)"]
        W2["ProjectDetailView (/projects/:id)"]
        W3["ArtifactsListView (/artifacts)"]
        W4["ArtifactDetailView (/artifacts/:id)"]
        W5["UserManagementView (/users)"]
    end

    subgraph ArtifactTabsGroup ["Artifact Detail Tabs"]
        T1["OverviewTab"]
        T2["EditorTab (Stage 1/2 Prompts, Schema, Examples)"]
        T3["VersionsTab (Lineage & Diffs)"]
        T4["ValidationTab (Syntax & Schema Checker)"]
    end

    subgraph ComponentGroup ["Shared UI Components"]
        C_Table["DataTable"]
        C_Modal["ModalDialog"]
        C_Badge["StatusBadge"]
        C_Editor["MonacoCodeEditor / PromptEditor"]
        C_Button["Button"]
        C_Search["SearchBar"]
        C_ValAlert["ValidationAlert"]
    end

    Root --> Header
    Header --> UserMenu

    Root --> W1
    Root --> W2
    Root --> W3
    Root --> W4
    Root --> W5

    W4 --> T1
    W4 --> T2
    W4 --> T3
    W4 --> T4

    W1 --> C_Table
    W1 --> C_Search
    W1 --> C_Modal
    W1 --> C_Button

    W2 --> C_Table
    W2 --> C_Modal
    W2 --> C_Badge
    W2 --> C_Button

    W3 --> C_Table
    W3 --> C_Search
    W3 --> C_Badge
    W3 --> C_Button

    T2 --> C_Editor
    T2 --> C_Button
    T4 --> C_ValAlert
    T3 --> C_Table

    W5 --> C_Table
    W5 --> C_Modal
    W5 --> C_Badge
    W5 --> C_Button
```

## Workspace Descriptions

1. **`ProjectsListView` (`/` or `/projects`)**: Catalog of active and archived projects with quick metrics on linked artifacts.
2. **`ProjectDetailView` (`/projects/:id`)**: Project dashboard showing attached artifacts, member assignments, and project actions (Attach / Detach / Create Artifact).
3. **`ArtifactsListView` (`/artifacts`)**: Global library of all multi-stage prompt & schema artifacts across all projects with search and filter capabilities.
4. **`ArtifactDetailView` (`/artifacts/:id`)**: Multi-tab workspace for artifact authoring and inspection:
   - **Overview**: Metadata, ownership, publish state.
   - **Editor**: Stage 1 Extraction Prompt, Stage 2 Refinement Prompt, JSON Schema, and Few-Shot examples.
   - **Versions**: Immutable version history, changelogs, and rollback options.
   - **Validation**: Real-time evaluation of syntax, JSON validity, and schema conformance.
5. **`UserManagementView` (`/users`)**: Administrator console for managing team members, roles, project assignments, and user statuses.
