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
import { Plus, FolderKanban, ArrowRight, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ArtifactStatus } from '../../../shared/types';

export const ArtifactsPage: React.FC = () => {
  const { artifacts, projects, createArtifact } = usePrototype();
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
      art.description.toLowerCase().includes(search.toLowerCase());
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <HeaderBar
        kicker="Global Schema Registry"
        title="Artifacts & Extraction Hub"
        subtitle="Repository of reusable multi-stage prompt pipelines, JSON schemas, and few-shot calibration datasets."
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
          icon={<Cpu className="w-4 h-4 text-blue-500" />}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface rounded-level2 border border-surface-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter artifacts by title, prompt keyword, or schema..."
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All"
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

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-full bg-surface border border-surface-border text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus font-medium"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArtifacts.map(art => {
          const linkedProjects = projects.filter(p => art.projectIds.includes(p.id));
          return (
            <Link
              key={art.id}
              to={`/artifacts/${art.id}`}
              className="group p-5 rounded-level2 border border-surface-border bg-surface hover:border-brand-navy dark:hover:border-action-primary hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-hover border border-surface-border text-ink-primary font-bold">
                    {art.currentVersion}
                  </span>
                  <StatusBadge status={art.status} />
                </div>

                <h3 className="text-base font-extrabold text-ink-primary group-hover:text-action-primary dark:group-hover:text-action-accent transition-colors">
                  {art.name}
                </h3>
                <p className="text-xs text-ink-secondary mt-1.5 line-clamp-2 leading-relaxed">
                  {art.description}
                </p>

                {linkedProjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {linkedProjects.map(p => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover text-ink-secondary border border-surface-border"
                      >
                        <FolderKanban className="w-2.5 h-2.5 text-action-primary" />
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-surface-border pt-4 mt-5 flex items-center justify-between text-xs text-ink-muted">
                <span>By {art.updatedBy.name}</span>
                <span className="flex items-center gap-1 text-action-primary dark:text-action-accent font-bold group-hover:translate-x-0.5 transition-transform">
                  Open Hub <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Artifact"
        description="Initialize a new prompt & schema artifact draft."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              Create Artifact
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Artifact Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. ESG Metrics Disclosure Normalizer"
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail what prompts and extraction outputs this artifact standardizes..."
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Attach to Project (Optional)
            </label>
            <select
              value={initialProject}
              onChange={e => setInitialProject(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            >
              <option value="">-- Standalone (No Project) --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
