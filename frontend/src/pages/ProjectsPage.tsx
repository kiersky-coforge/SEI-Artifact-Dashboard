import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { StatCard } from '../components/molecules/StatCard';
import { SearchInput } from '../components/atoms/SearchInput';
import { FilterChip } from '../components/atoms/FilterChip';
import {
  Plus,
  FolderKanban,
  Cpu,
  ArrowRight,
  Layers,
  Users,
  ChevronRight,
  ChevronDown,
  Link2,
  Unlink,
  ExternalLink,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

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

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);

  // Quick Link Modal State
  const [linkingProjectId, setLinkingProjectId] = useState<string | null>(null);
  const [artifactToLink, setArtifactToLink] = useState<string>('');

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = projects.filter(p => p.status === 'active').length;
  const totalArtifactLinks = projects.reduce((acc, p) => acc + p.artifactIds.length, 0);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    filteredProjects.forEach(p => {
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <HeaderBar
        kicker="SEI Workspace Command Center"
        title="Projects & Pipelines"
        subtitle="Manage client workspaces, extraction workflows, and shared schema bindings."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        }
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={activeCount}
          subtitle="Operating in production"
          icon={<FolderKanban className="w-4 h-4 text-action-primary" />}
          delta="100% Online"
          deltaType="positive"
        />
        <StatCard
          title="Registered Artifacts"
          value={artifacts.length}
          subtitle="Reusable prompt pipelines"
          icon={<Cpu className="w-4 h-4 text-action-accent" />}
          delta="+2 this month"
          deltaType="positive"
        />
        <StatCard
          title="Pipeline Bindings"
          value={totalArtifactLinks}
          subtitle="Cross-project attachments"
          icon={<Layers className="w-4 h-4 text-brand-blue" />}
          delta="Many-to-Many"
          deltaType="neutral"
        />
        <StatCard
          title="Team Members"
          value={users.length}
          subtitle="Admins, Authors, Devs"
          icon={<Users className="w-4 h-4 text-brand-green" />}
          delta="RBAC Active"
          deltaType="positive"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface rounded-level2 border border-surface-border shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter projects by title, description, or id..."
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All Projects"
            count={projects.length}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <FilterChip
            label="Active"
            count={activeCount}
            active={statusFilter === 'active'}
            onClick={() => setStatusFilter('active')}
          />
          <FilterChip
            label="Archived"
            count={projects.length - activeCount}
            active={statusFilter === 'archived'}
            onClick={() => setStatusFilter('archived')}
          />

          <div className="h-4 w-px bg-surface-border mx-1" />

          <button
            onClick={expandAll}
            className="text-xs px-2.5 py-1 rounded-level1 bg-surface-hover hover:bg-surface-border text-ink-secondary hover:text-ink-primary transition-colors font-medium"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs px-2.5 py-1 rounded-level1 bg-surface-hover hover:bg-surface-border text-ink-secondary hover:text-ink-primary transition-colors font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Expandable Projects Table */}
      <div className="bg-surface rounded-level2 border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover/80 border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-3 w-10 text-center"></th>
                <th className="py-3 px-4">Project & Pipeline</th>
                <th className="py-3 px-4">Attached Artifacts</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-muted" />
                    <p className="font-semibold">No projects match the selected criteria</p>
                    <p className="text-xs mt-1">Try resetting search filters or create a new project</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map(proj => {
                  const isExpanded = !!expandedRows[proj.id];
                  const linkedArts = artifacts.filter(a => proj.artifactIds.includes(a.id));
                  const assignedUsers = users.filter(u => u.projectIds.includes(proj.id));

                  return (
                    <React.Fragment key={proj.id}>
                      {/* Main Table Row */}
                      <tr
                        onClick={() => toggleRow(proj.id)}
                        className={`hover:bg-surface-hover/50 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-surface-hover/30' : ''
                        }`}
                      >
                        {/* Expand Toggle Column */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleRow(proj.id);
                            }}
                            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
                            title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-action-primary" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-ink-muted" />
                            )}
                          </button>
                        </td>

                        {/* Project Info */}
                        <td className="py-3.5 px-4 min-w-[240px]">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-level1 bg-brand-navy/5 dark:bg-white/5 border border-brand-navy/10 dark:border-white/10 flex items-center justify-center text-brand-navy dark:text-action-primary flex-shrink-0 mt-0.5">
                              <FolderKanban className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-ink-primary text-sm hover:text-action-primary transition-colors">
                                  {proj.name}
                                </span>
                                <span className="font-mono text-[10px] text-ink-muted bg-surface-hover px-1.5 py-0.2 rounded border border-surface-border">
                                  {proj.id}
                                </span>
                              </div>
                              <p className="text-xs text-ink-secondary line-clamp-1 mt-0.5">
                                {proj.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Attached Artifacts Count & Preview */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-action-primary/10 text-action-primary font-mono border border-action-primary/20">
                              <Cpu className="w-3 h-3" />
                              {linkedArts.length} {linkedArts.length === 1 ? 'Artifact' : 'Artifacts'}
                            </span>
                            {linkedArts.slice(0, 2).map(a => (
                              <span
                                key={a.id}
                                className="hidden lg:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover text-ink-muted border border-surface-border truncate max-w-[120px]"
                                title={a.name}
                              >
                                {a.name}
                              </span>
                            ))}
                            {linkedArts.length > 2 && (
                              <span className="hidden lg:inline text-[10px] text-ink-muted font-mono">
                                +{linkedArts.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Assigned Team */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {assignedUsers.slice(0, 3).map(u => (
                                <div
                                  key={u.id}
                                  title={`${u.name} (${u.roles.join(', ')})`}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-surface bg-brand-navy dark:bg-seic-blue text-white text-[10px] font-bold flex items-center justify-center uppercase shadow-xs"
                                >
                                  {u.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] text-ink-secondary">
                              {assignedUsers.length} {assignedUsers.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={proj.status} />
                        </td>

                        {/* Updated */}
                        <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                          {proj.updatedAt.split('T')[0]}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setLinkingProjectId(proj.id)}
                              className="p-1.5 rounded-level1 text-ink-secondary hover:text-action-primary hover:bg-surface-hover border border-surface-border transition-colors text-xs inline-flex items-center gap-1"
                              title="Link Artifact to Project"
                            >
                              <Link2 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Link</span>
                            </button>

                            <Link
                              to={`/projects/${proj.id}`}
                              className="p-1.5 rounded-level1 bg-action-primary text-white hover:bg-action-primary-hover transition-colors text-xs inline-flex items-center gap-1 font-semibold"
                            >
                              <span>Workspace</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={e => handleDeleteProject(e, proj.id, proj.name)}
                              className="p-1.5 rounded-level1 text-ink-muted hover:text-status-error hover:bg-status-error/10 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Panel Drawer */}
                      {isExpanded && (
                        <tr className="bg-surface-hover/20 border-b border-surface-border">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="rounded-level2 bg-surface border border-surface-border p-5 space-y-5 shadow-xs">
                              {/* Sub-Panel Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-action-primary font-mono">
                                    Project Details & Bindings
                                  </span>
                                  <h4 className="text-base font-bold text-ink-primary mt-0.5">
                                    {proj.name}
                                  </h4>
                                  <p className="text-xs text-ink-secondary mt-1">
                                    {proj.description || 'No detailed project description recorded.'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setLinkingProjectId(proj.id)}
                                    className="px-3 py-1.5 rounded-level1 bg-surface-hover hover:bg-surface-border text-ink-primary font-semibold text-xs border border-surface-border flex items-center gap-1.5 transition-colors"
                                  >
                                    <Link2 className="w-3.5 h-3.5 text-action-accent" />
                                    <span>Attach Artifact</span>
                                  </button>
                                  <Link
                                    to={`/projects/${proj.id}`}
                                    className="px-3 py-1.5 rounded-level1 bg-action-primary text-white hover:bg-action-primary-hover font-semibold text-xs flex items-center gap-1.5 transition-colors"
                                  >
                                    <span>Open Full Workspace</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>

                              {/* Attached Artifacts Sub-Table */}
                              <div>
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-xs font-bold uppercase tracking-wider text-ink-primary flex items-center gap-1.5">
                                    <Cpu className="w-3.5 h-3.5 text-action-accent" /> Attached Artifact Pipelines ({linkedArts.length})
                                  </span>
                                  <span className="text-[11px] text-ink-muted">
                                    Reusable across workspaces
                                  </span>
                                </div>

                                {linkedArts.length === 0 ? (
                                  <div className="p-6 rounded-level1 bg-surface-hover/50 border border-dashed border-surface-border text-center space-y-2">
                                    <Cpu className="w-6 h-6 mx-auto text-ink-muted opacity-50" />
                                    <p className="text-xs font-semibold text-ink-secondary">
                                      No prompt pipelines currently linked to this project
                                    </p>
                                    <button
                                      onClick={() => setLinkingProjectId(proj.id)}
                                      className="text-xs text-action-primary font-bold hover:underline inline-flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Link existing artifact now
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border border-surface-border rounded-level1 overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-surface-hover/60 border-b border-surface-border text-[10px] font-bold uppercase text-ink-muted tracking-wider">
                                          <th className="py-2 px-3">Artifact Pipeline</th>
                                          <th className="py-2 px-3">Stage Coverage</th>
                                          <th className="py-2 px-3">Status</th>
                                          <th className="py-2 px-3">Active Version</th>
                                          <th className="py-2 px-3">Validation Health</th>
                                          <th className="py-2 px-3 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-surface-border">
                                        {linkedArts.map(art => {
                                          return (
                                            <tr key={art.id} className="hover:bg-surface-hover/30">
                                              <td className="py-2.5 px-3">
                                                <div className="font-semibold text-ink-primary">
                                                  {art.name}
                                                </div>
                                                <div className="text-[11px] text-ink-muted line-clamp-1">
                                                  {art.description}
                                                </div>
                                              </td>

                                              <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1 font-mono text-[10px]">
                                                  <span
                                                    className={`px-1.5 py-0.2 rounded border ${
                                                      art.stage1Prompt
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                        : 'bg-surface-hover text-ink-muted border-surface-border'
                                                    }`}
                                                  >
                                                    Stage 1
                                                  </span>
                                                  <span
                                                    className={`px-1.5 py-0.2 rounded border ${
                                                      art.stage2Prompt
                                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                                        : 'bg-surface-hover text-ink-muted border-surface-border'
                                                    }`}
                                                  >
                                                    Stage 2
                                                  </span>
                                                  <span
                                                    className={`px-1.5 py-0.2 rounded border ${
                                                      art.jsonSchema
                                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                                        : 'bg-surface-hover text-ink-muted border-surface-border'
                                                    }`}
                                                  >
                                                    JSON Schema
                                                  </span>
                                                </div>
                                              </td>

                                              <td className="py-2.5 px-3">
                                                <StatusBadge status={art.status} />
                                              </td>

                                              <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-ink-primary">
                                                {art.currentVersion}
                                              </td>

                                              <td className="py-2.5 px-3">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                                                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
                                                </span>
                                              </td>

                                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                  <Link
                                                    to={`/artifacts/${art.id}`}
                                                    className="px-2 py-1 rounded bg-surface-hover hover:bg-action-primary hover:text-white text-ink-primary font-semibold text-xs border border-surface-border transition-colors inline-flex items-center gap-1"
                                                  >
                                                    <span>Open Hub</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                  </Link>
                                                  <button
                                                    onClick={() => unlinkArtifactFromProject(proj.id, art.id)}
                                                    className="p-1 rounded text-ink-muted hover:text-status-error hover:bg-status-error/10 transition-colors"
                                                    title="Unlink Artifact from Project"
                                                  >
                                                    <Unlink className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Assigned Team Members Row */}
                              <div className="pt-2 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-ink-muted uppercase tracking-wider text-[10px]">
                                    Assigned Roster:
                                  </span>
                                  {assignedUsers.map(u => (
                                    <span
                                      key={u.id}
                                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-hover border border-surface-border text-ink-primary font-medium"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-action-primary" />
                                      {u.name}
                                      <span className="text-[10px] text-ink-muted">({u.roles.join(', ')})</span>
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[11px] text-ink-muted font-mono">
                                  Created: {proj.createdAt.split('T')[0]}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        subtitle="Initialize a new client workspace to bind artifact pipelines and assign users."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-primary mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule K-1 Tax Parsing"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-level1 bg-surface border border-surface-border text-ink-primary text-xs focus:outline-none focus:ring-2 focus:ring-focus font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-primary mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the business domain, client requirements, or processing target..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-level1 bg-surface border border-surface-border text-ink-primary text-xs focus:outline-none focus:ring-2 focus:ring-focus font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Attach Initial Artifacts (Optional)
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto border border-surface-border rounded-level1 p-2 bg-surface-hover/30">
              {artifacts.length === 0 ? (
                <div className="text-xs text-ink-muted py-2 text-center">No artifacts registered yet</div>
              ) : (
                artifacts.map(a => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-surface cursor-pointer text-xs"
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
                      className="rounded border-surface-border text-action-primary focus:ring-focus"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-primary">{a.name}</div>
                      <div className="text-[10px] text-ink-muted font-mono">{a.currentVersion} • {a.status}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-primary mb-1">
              Select Artifact *
            </label>
            {unlinkedArtifacts.length === 0 ? (
              <div className="p-4 rounded bg-surface-hover text-xs text-ink-muted text-center">
                All existing artifacts are already attached to this project.
              </div>
            ) : (
              <select
                required
                value={artifactToLink}
                onChange={e => setArtifactToLink(e.target.value)}
                className="w-full px-3 py-2 rounded-level1 bg-surface border border-surface-border text-ink-primary text-xs focus:outline-none focus:ring-2 focus:ring-focus font-medium"
              >
                <option value="">-- Choose an artifact --</option>
                {unlinkedArtifacts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currentVersion} • {a.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
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
            <Button variant="primary" type="submit" disabled={!artifactToLink || unlinkedArtifacts.length === 0}>
              Attach to Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
