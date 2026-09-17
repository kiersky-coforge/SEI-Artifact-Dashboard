import React from 'react';
import { Modal } from '../molecules/Modal';
import { Layers, Box, Globe } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ArchitectureMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureMapModal: React.FC<ArchitectureMapModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Architecture & Site Map"
      description="Interactive node hierarchy showing routes, workspaces, and shared component instances."
      maxWidth="4xl"
      footer={<Button onClick={onClose}>Close Map</Button>}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-surface-border bg-surface-hover/30">
            <div className="flex items-center gap-2 text-action-primary font-semibold text-xs uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4" /> Shell Root
            </div>
            <p className="text-xs text-ink-primary font-medium">AppShell (/)</p>
            <p className="text-[11px] text-ink-muted mt-1">Header, Context Switcher, Theme Provider, Prototype Tools</p>
          </div>

          <div className="p-4 rounded-lg border border-surface-border bg-surface-hover/30">
            <div className="flex items-center gap-2 text-ink-brand font-semibold text-xs uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" /> Workspaces
            </div>
            <ul className="text-xs text-ink-primary space-y-1">
              <li>• <span className="font-medium">/projects</span> (Projects Catalog)</li>
              <li>• <span className="font-medium">/projects/:id</span> (Project Hub)</li>
              <li>• <span className="font-medium">/artifacts</span> (Artifact Library)</li>
              <li>• <span className="font-medium">/artifacts/:id</span> (Detail Tabs)</li>
              <li>• <span className="font-medium">/users</span> (User Management)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-surface-border bg-surface-hover/30">
            <div className="flex items-center gap-2 text-action-accent font-semibold text-xs uppercase tracking-wider mb-2">
              <Box className="w-4 h-4" /> 4-Tab Artifact Hub
            </div>
            <ul className="text-xs text-ink-primary space-y-1">
              <li>1. Overview (Metadata & Status)</li>
              <li>2. Editor (Stage 1/2, Schema)</li>
              <li>3. Versions (Lineage & Diffs)</li>
              <li>4. Validation (Live syntax check)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-surface-border bg-surface-hover/30">
            <div className="flex items-center gap-2 text-status-success-text font-semibold text-xs uppercase tracking-wider mb-2">
              <Box className="w-4 h-4" /> Reusable Tokens
            </div>
            <p className="text-xs text-ink-primary">SEI 2-Layer Tokens</p>
            <p className="text-[11px] text-ink-muted mt-1">Circular / JetBrains Mono typography, SEI Red/Navy/Blue color tiers</p>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-surface-border bg-black/90 text-white font-mono text-xs overflow-x-auto">
          <div className="text-ink-muted text-[11px] mb-2 uppercase font-semibold">Mermaid Topology Definition</div>
          <pre className="text-[11px] leading-relaxed text-blue-300">
{`AppShell [Persistent Shell]
 ├── NavigationHeader
 ├── ProjectsListView (/projects)
 │    ├── ProjectCard / ProjectTable
 │    └── CreateProjectModal
 ├── ProjectDetailView (/projects/:id)
 │    ├── AssociatedArtifactsTable
 │    ├── AttachArtifactModal
 │    └── TeamRoster
 ├── ArtifactsListView (/artifacts)
 │    ├── ArtifactFilterBar
 │    └── CreateArtifactModal
 ├── ArtifactDetailView (/artifacts/:id)
 │    ├── OverviewTab (Metadata, Publish State)
 │    ├── EditorTab (Stage 1/2 Prompts, Schema, Examples)
 │    ├── VersionsTab (Snapshots & Rollbacks)
 │    └── ValidationTab (Real-time Syntax Engine)
 └── UserManagementView (/users)
      ├── UsersTable (Roles, Projects, Status)
      └── CreateUserModal`}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
