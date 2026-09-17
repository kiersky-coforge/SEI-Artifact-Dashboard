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
  ArrowRight,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { ArtifactStatus } from '../../../shared/types';

export const ArtifactsPage: React.FC = () => {
  const { artifacts, projects, createArtifact, deleteArtifact } = usePrototype();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArtifactStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialProject, setInitialProject] = useState('');

  const filteredArtifacts = artifacts.filter(art => {
    const matchesSearch =
      art.name.toLowerCase().includes(search.toLowerCase()) ||
      art.description.toLowerCase().includes(search.toLowerCase()) ||
      art.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchesProject = projectFilter === 'all' || art.projectIds.includes(projectFilter);
    return matchesSearch && matchesStatus && matchesProject;
  });

  const publishedCount = artifacts.filter(a => a.status === 'published').length;
  const draftCount = artifacts.filter(a => a.status === 'draft').length;
  const totalVersions = artifacts.reduce((acc, a) => acc + (a.versions?.length || 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createArtifact(name, description, initialProject || undefined);
    setName('');
    setDescription('');
    setInitialProject('');
    setIsCreateOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string, artName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete artifact "${artName}"?`)) {
      deleteArtifact(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <HeaderBar
        kicker="Global Schema Registry"
        title="Artifacts & Extraction Hub"
        subtitle="Repository of reusable multi-stage prompt pipelines, JSON schemas, and calibration datasets."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Artifact
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Published Artifacts"
          value={publishedCount}
          subtitle="Validated & production-ready"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          delta="100% Validated"
          deltaType="positive"
        />
        <StatCard
          title="Draft Iterations"
          value={draftCount}
          subtitle="Work-in-progress pipelines"
          icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
          delta="In Authoring"
          deltaType="neutral"
        />
        <StatCard
          title="Version Snapshots"
          value={totalVersions}
          subtitle="Immutable release history"
          icon={<Cpu className="w-4 h-4 text-brand-blue" />}
          delta="Audited"
          deltaType="positive"
        />
        <StatCard
          title="Project Associations"
          value={projects.length}
          subtitle="Target host workspaces"
          icon={<FolderKanban className="w-4 h-4 text-action-primary" />}
          delta="Connected"
          deltaType="positive"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface rounded-level2 border border-surface-border shadow-xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter artifacts by name, description, or id..."
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All Artifacts"
            count={artifacts.length}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <FilterChip
            label="Published"
            count={publishedCount}
            active={statusFilter === 'published'}
            onClick={() => setStatusFilter('published')}
          />
          <FilterChip
            label="Drafts"
            count={draftCount}
            active={statusFilter === 'draft'}
            onClick={() => setStatusFilter('draft')}
          />
          <FilterChip
            label="Archived"
            count={artifacts.length - publishedCount - draftCount}
            active={statusFilter === 'archived'}
            onClick={() => setStatusFilter('archived')}
          />

          <div className="h-4 w-px bg-surface-border mx-1" />

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-level1 bg-surface border border-surface-border text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus font-medium"
          >
            <option value="all">All Linked Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Artifacts Table */}
      <div className="bg-surface rounded-level2 border border-surface-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover/80 border-b border-surface-border text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="py-3 px-4">Artifact Name & Pipeline</th>
                <th className="py-3 px-4">Pipeline Stages</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Version</th>
                <th className="py-3 px-4">Attached Projects</th>
                <th className="py-3 px-4">Validation Health</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs">
              {filteredArtifacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-muted">
                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-muted" />
                    <p className="font-semibold">No artifacts found matching your criteria</p>
                    <p className="text-xs mt-1">Try broadening your search or create a new artifact</p>
                  </td>
                </tr>
              ) : (
                filteredArtifacts.map(art => {
                  const linkedProjects = projects.filter(p => art.projectIds.includes(p.id));

                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-surface-hover/50 transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-level1 bg-action-accent/10 border border-action-accent/20 flex items-center justify-center text-action-accent flex-shrink-0 mt-0.5">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/artifacts/${art.id}`}
                                className="font-bold text-ink-primary text-sm group-hover:text-action-primary dark:group-hover:text-action-accent transition-colors"
                              >
                                {art.name}
                              </Link>
                              <span className="font-mono text-[10px] text-ink-muted bg-surface-hover px-1.5 py-0.2 rounded border border-surface-border">
                                {art.id}
                              </span>
                            </div>
                            <p className="text-xs text-ink-secondary line-clamp-1 mt-0.5">
                              {art.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Pipeline Stage Coverage */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded border ${
                              art.stage1Prompt
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold'
                                : 'bg-surface-hover text-ink-muted border-surface-border'
                            }`}
                            title="Stage 1 Extraction Prompt"
                          >
                            Stage 1
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded border ${
                              art.stage2Prompt
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold'
                                : 'bg-surface-hover text-ink-muted border-surface-border'
                            }`}
                            title="Stage 2 Refinement Prompt"
                          >
                            Stage 2
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded border ${
                              art.jsonSchema
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold'
                                : 'bg-surface-hover text-ink-muted border-surface-border'
                            }`}
                            title="JSON Validation Schema"
                          >
                            Schema
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={art.status} />
                      </td>

                      {/* Active Version */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-hover border border-surface-border text-ink-primary">
                          {art.currentVersion}
                        </span>
                      </td>

                      {/* Attached Projects */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {linkedProjects.length === 0 ? (
                            <span className="text-[11px] text-ink-muted italic">Unassigned</span>
                          ) : (
                            linkedProjects.map(p => (
                              <Link
                                key={p.id}
                                to={`/projects/${p.id}`}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-surface-hover hover:bg-surface-border text-ink-secondary hover:text-ink-primary border border-surface-border transition-colors truncate max-w-[130px]"
                                title={p.name}
                              >
                                <FolderKanban className="w-2.5 h-2.5 text-action-primary" />
                                <span className="truncate">{p.name}</span>
                              </Link>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Validation Health */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                        {art.updatedAt.split('T')[0]}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/artifacts/${art.id}`}
                            className="px-2.5 py-1.5 rounded-level1 bg-action-primary text-white hover:bg-action-primary-hover transition-colors font-semibold text-xs inline-flex items-center gap-1"
                          >
                            <span>Open Hub</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={e => handleDelete(e, art.id, art.name)}
                            className="p-1.5 rounded-level1 text-ink-muted hover:text-status-error hover:bg-status-error/10 transition-colors"
                            title="Delete Artifact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Artifact Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Artifact"
        subtitle="Initialize a reusable prompt pipeline, JSON schema definition, and test fixtures."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-primary mb-1">
              Artifact Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule K-1 Partner Line Items"
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
              placeholder="Describe the extraction target, data normalization goals, and required output structure..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-level1 bg-surface border border-surface-border text-ink-primary text-xs focus:outline-none focus:ring-2 focus:ring-focus font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-primary mb-1">
              Bind to Initial Project (Optional)
            </label>
            <select
              value={initialProject}
              onChange={e => setInitialProject(e.target.value)}
              className="w-full px-3 py-2 rounded-level1 bg-surface border border-surface-border text-ink-primary text-xs focus:outline-none focus:ring-2 focus:ring-focus font-medium"
            >
              <option value="">-- Standalone (No project assigned yet) --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Artifact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
