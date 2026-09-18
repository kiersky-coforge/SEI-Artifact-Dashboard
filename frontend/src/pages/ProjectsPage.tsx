import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { Textarea } from '../components/atoms/Textarea';
import { Select } from '../components/atoms/Select';
import { DataTable, type ColumnDef } from '../components/organisms/DataTable';
import { PipelineStageBadges } from '../components/molecules/PipelineStageBadges';
import { ValidationHealthPill } from '../components/molecules/ValidationHealthPill';
import {
  Plus,
  FolderKanban,
  Cpu,
  Link2,
  Unlink,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import type { Project, Artifact } from '../../../shared/types';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    artifacts,
    users,
    createProject,
    linkArtifactToProject,
    unlinkArtifactFromProject,
    deleteProject,
  } = usePrototype();

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);

  const [linkingProjectId, setLinkingProjectId] = useState<string | null>(null);
  const [artifactToLink, setArtifactToLink] = useState<string>('');

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    projects.forEach(p => {
      allExpanded[p.id] = true;
    });
    setExpandedRows(allExpanded);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject(name, description, selectedArtifacts);
    setName('');
    setDescription('');
    setSelectedArtifacts([]);
    setIsCreateOpen(false);
  };

  const handleLinkArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingProjectId || !artifactToLink) return;
    linkArtifactToProject(linkingProjectId, artifactToLink);
    setLinkingProjectId(null);
    setArtifactToLink('');
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string, projName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete project "${projName}"?`)) {
      deleteProject(id);
    }
  };

  const targetProjectForLinking = projects.find(p => p.id === linkingProjectId);
  const unlinkedArtifacts = targetProjectForLinking
    ? artifacts.filter(a => !targetProjectForLinking.artifactIds.includes(a.id))
    : [];

  const getLinkedArtifactSubColumns = (projectId: string): ColumnDef<Artifact>[] => [
    {
      id: 'name',
      header: 'Artifact Pipeline',
      sortValue: art => art.name,
      hideable: false,
      render: art => (
        <>
          <div className="font-bold text-ink-primary">{art.name}</div>
          <div className="text-[10px] text-ink-secondary line-clamp-1 font-normal">{art.description}</div>
        </>
      ),
    },
    {
      id: 'stages',
      header: 'Stage Coverage',
      render: art => <PipelineStageBadges artifact={art} />,
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: art => art.status,
      render: art => <StatusBadge status={art.status} />,
    },
    {
      id: 'version',
      header: 'Active Version',
      cellClassName: 'font-mono text-[11px] font-bold text-brand-navy dark:text-brand-blue tabular-nums',
      render: art => art.currentVersion,
    },
    {
      id: 'validation',
      header: 'Validation Health',
      render: () => <ValidationHealthPill />,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      cellClassName: 'whitespace-nowrap',
      render: art => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/artifacts/${art.id}`}
            onClick={e => e.stopPropagation()}
            className="px-2.5 py-1 rounded-level2 bg-brand-navy/[0.04] hover:bg-brand-navy hover:text-white text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
          >
            <span>Open Hub</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={e => { e.stopPropagation(); unlinkArtifactFromProject(projectId, art.id); }}
            className="p-1 rounded text-ink-secondary/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            title="Unlink Artifact from Project"
            aria-label={`Unlink ${art.name} from project`}
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const projectColumns: ColumnDef<Project>[] = [
    {
      id: 'name',
      header: 'Project Name',
      sortValue: proj => proj.name,
      hideable: false,
      searchable: true,
      searchValue: proj => `${proj.name} ${proj.description} ${proj.id}`,
      cellClassName: 'min-w-[200px]',
      render: proj => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-level2 bg-brand-navy/[0.04] dark:bg-white/5 border border-surface-border flex items-center justify-center text-brand-navy dark:text-brand-blue flex-shrink-0">
            <FolderKanban className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-ink-primary text-xs truncate">{proj.name}</span>
            <span className="font-mono text-[9px] text-ink-secondary bg-brand-navy/[0.04] dark:bg-white/5 px-1.5 py-0.2 rounded border border-brand-navy/[0.06] flex-shrink-0">
              {proj.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'artifacts',
      header: 'Artifacts',
      sortValue: proj => proj.artifactIds.length,
      render: proj => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-navy text-white shadow-level1 font-mono uppercase tracking-wider">
          <Cpu className="w-3 h-3 text-brand-coral" />
          {proj.artifactIds.length}
        </span>
      ),
    },
    {
      id: 'owner',
      header: 'Owner',
      sortValue: proj => {
        const u = users.find(user => user.projectIds.includes(proj.id));
        return u?.name || 'Unassigned';
      },
      render: proj => {
        const assignedUsers = users.filter(u => u.projectIds.includes(proj.id));
        const owner = assignedUsers[0];
        if (!owner) {
          return <span className="text-ink-secondary text-xs italic">Unassigned</span>;
        }
        const initials = owner.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-brand-navy dark:bg-seic-blue text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 shadow-level1">
              {initials}
            </div>
            <span className="text-xs font-medium text-ink-primary truncate">{owner.name}</span>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: proj => proj.status,
      filterable: true,
      filter: { type: 'select-list', label: 'Status', options: ['active', 'archived'] },
      filterPredicate: (proj, val: string[]) => val.length === 0 || val.includes(proj.status),
      render: proj => <StatusBadge status={proj.status} />,
    },
    {
      id: 'updated',
      header: 'Last Updated',
      sortValue: proj => proj.updatedAt,
      cellClassName: 'text-ink-secondary font-mono text-[11px] tabular-nums whitespace-nowrap',
      render: proj => proj.updatedAt.split('T')[0],
    },
  ];

  const renderExpandedProject = (proj: Project) => {
    const linkedArts = artifacts.filter(a => proj.artifactIds.includes(a.id));
    const assignedUsers = users.filter(u => u.projectIds.includes(proj.id));

    return (
      <div className="bg-brand-navy/[0.015] dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="rounded-level3 bg-surface border border-surface-border p-5 space-y-4 shadow-level1">
          {/* Sub-Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                Project Workspace Bindings
              </p>
              <h4 className="text-xl font-bold uppercase text-ink-primary font-display mt-0.5">{proj.name}</h4>
              <p className="text-xs text-ink-secondary mt-1">
                {proj.description || 'No detailed project description recorded.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLinkingProjectId(proj.id)}
                className="px-3 py-1.5 rounded-level2 bg-surface hover:bg-brand-navy/[0.04] text-brand-navy dark:text-white font-bold text-xs uppercase tracking-wider border border-input flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Link2 className="w-3.5 h-3.5 text-brand-coral" />
                <span>Attach Artifact</span>
              </button>
              <Link
                to={`/projects/${proj.id}`}
                className="px-3.5 py-1.5 rounded-level2 bg-brand-navy text-white hover:bg-brand-navy/90 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-level1"
              >
                <span>Open Full Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={e => handleDeleteProject(e, proj.id, proj.name)}
                className="p-1.5 rounded-level2 text-ink-secondary/60 hover:text-alert-coral hover:bg-alert-coral/10 border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                title="Delete Project"
                aria-label={`Delete project ${proj.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Attached Artifacts Sub-Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-coral" /> Attached Artifact Pipelines ({linkedArts.length})
              </p>
              <span className="text-[10px] font-mono text-ink-secondary">Reusable Prompt Schemas</span>
            </div>

            {linkedArts.length === 0 ? (
              <div className="p-6 rounded-level2 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-dashed border-brand-navy/[0.1] text-center space-y-2">
                <Cpu className="w-6 h-6 mx-auto text-ink-secondary opacity-50" />
                <p className="text-xs font-bold text-ink-secondary uppercase tracking-wide">
                  No prompt pipelines currently linked to this project
                </p>
                <button
                  onClick={() => setLinkingProjectId(proj.id)}
                  className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
                >
                  <Plus className="w-3.5 h-3.5" /> Link existing artifact now
                </button>
              </div>
            ) : (
              <DataTable<Artifact>
                columns={getLinkedArtifactSubColumns(proj.id)}
                data={linkedArts}
                getRowKey={art => art.id}
              />
            )}
          </div>

          {/* Assigned Team Members Row */}
          <div className="pt-2 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-ink-secondary uppercase tracking-widest text-[10px]">Assigned Roster:</span>
              {assignedUsers.map(u => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-navy/[0.04] dark:bg-white/5 border border-brand-navy/[0.08] text-ink-primary font-bold text-[10px] uppercase tracking-wider"
                >
                  <span className="w-2 h-2 rounded-full bg-brand-navy dark:bg-seic-blue" />
                  {u.name}
                  <span className="text-[9px] text-ink-secondary">({u.roles.join(', ')})</span>
                </span>
              ))}
            </div>
            <span className="text-[10px] text-ink-secondary font-mono tabular-nums">
              Created: {proj.createdAt.split('T')[0]}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        title="Projects & Pipelines"
        subtitle="Manage client workspaces, extraction workflows, and shared schema bindings."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        }
      />

      {/* Expandable Projects Table (Stratos Table Style) */}
      <DataTable<Project>
        columns={projectColumns}
        data={projects}
        getRowKey={proj => proj.id}
        renderExpanded={renderExpandedProject}
        isRowExpanded={proj => !!expandedRows[proj.id]}
        onToggleExpand={proj => toggleRow(proj.id)}
        tableCta={
          <>
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </>
        }
        emptyState={
          <>
            <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-secondary" />
            <p className="font-bold uppercase tracking-wide text-xs">No projects yet</p>
            <p className="text-[11px] mt-1 text-ink-secondary">Create your first client workspace to get started</p>
          </>
        }
      />

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        subtitle="Initialize a new client workspace to bind artifact pipelines and assign users."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Project Name *
            </label>
            <Input
              id="project-name"
              type="text"
              required
              placeholder="e.g. Schedule K-1 Tax Parsing"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Description
            </label>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="Describe the business domain, client requirements, or processing target..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1.5">
              Attach Initial Artifacts (Optional)
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto border border-surface-border rounded-level2 p-2 bg-brand-navy/[0.02]">
              {artifacts.length === 0 ? (
                <div className="text-xs text-ink-secondary py-2 text-center">No artifacts registered yet</div>
              ) : (
                artifacts.map(a => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2.5 p-2 rounded-level1 hover:bg-surface-hover cursor-pointer text-xs transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedArtifacts.includes(a.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedArtifacts([...selectedArtifacts, a.id]);
                        } else {
                          setSelectedArtifacts(selectedArtifacts.filter(id => id !== a.id));
                        }
                      }}
                      className="rounded border-input text-brand-navy focus:ring-focus"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink-primary">{a.name}</div>
                      <div className="text-[10px] text-ink-secondary font-mono">{a.currentVersion} • {a.status}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Link Artifact Modal */}
      <Modal
        isOpen={!!linkingProjectId}
        onClose={() => {
          setLinkingProjectId(null);
          setArtifactToLink('');
        }}
        title="Attach Pipeline Artifact"
        subtitle={`Select a reusable artifact to bind to ${targetProjectForLinking?.name || 'this project'}.`}
      >
        <form onSubmit={handleLinkArtifact} className="space-y-4">
          <div>
            <label htmlFor="link-artifact-select" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Select Artifact *
            </label>
            {unlinkedArtifacts.length === 0 ? (
              <div className="p-4 rounded-level2 bg-brand-navy/[0.02] text-xs text-ink-secondary text-center font-semibold">
                All existing artifacts are already attached to this project.
              </div>
            ) : (
              <Select
                id="link-artifact-select"
                required
                value={artifactToLink}
                onChange={e => setArtifactToLink(e.target.value)}
              >
                <option value="">-- Choose an artifact --</option>
                {unlinkedArtifacts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currentVersion} • {a.status})
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button
              variant="secondary"
              onClick={() => {
                setLinkingProjectId(null);
                setArtifactToLink('');
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button variant="coral" type="submit" disabled={!artifactToLink || unlinkedArtifacts.length === 0}>
              Attach to Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
