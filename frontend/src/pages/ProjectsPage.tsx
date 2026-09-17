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
import { Plus, FolderKanban, Cpu, ArrowRight, Layers, Users } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, artifacts, users, createProject } = usePrototype();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = projects.filter(p => p.status === 'active').length;
  const totalArtifactLinks = projects.reduce((acc, p) => acc + p.artifactIds.length, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject(name, description, selectedArtifacts);
    setName('');
    setDescription('');
    setSelectedArtifacts([]);
    setIsCreateOpen(false);
  };

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
          icon={<FolderKanban className="w-4 h-4" />}
          delta="100% Online"
          deltaType="positive"
        />
        <StatCard
          title="Registered Artifacts"
          value={artifacts.length}
          subtitle="Reusable prompt pipelines"
          icon={<Cpu className="w-4 h-4" />}
          delta="+2 this month"
          deltaType="positive"
        />
        <StatCard
          title="Cross-Project Links"
          value={totalArtifactLinks}
          subtitle="Active pipeline bindings"
          icon={<Layers className="w-4 h-4" />}
          delta="Many-to-Many"
          deltaType="neutral"
        />
        <StatCard
          title="Team Members"
          value={users.length}
          subtitle="Admins, Authors, Devs"
          icon={<Users className="w-4 h-4" />}
          delta="RBAC Active"
          deltaType="positive"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface rounded-level2 border border-surface-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter projects by title, pipeline, or description..."
        />

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map(proj => {
          const linkedArts = artifacts.filter(a => proj.artifactIds.includes(a.id));
          return (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="group p-5 rounded-level2 border border-surface-border bg-surface hover:border-brand-navy dark:hover:border-action-primary hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-level1 bg-brand-navy/5 dark:bg-white/5 border border-brand-navy/10 dark:border-white/10 flex items-center justify-center text-brand-navy dark:text-action-primary">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <StatusBadge status={proj.status} />
                </div>

                <h3 className="text-base font-extrabold text-ink-primary group-hover:text-action-primary dark:group-hover:text-action-accent transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-ink-secondary mt-1.5 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {linkedArts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {linkedArts.map(a => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover text-ink-secondary border border-surface-border"
                      >
                        <Cpu className="w-2.5 h-2.5 text-action-accent" />
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-surface-border pt-4 mt-5 flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-action-accent" />
                  <strong className="text-ink-primary">{linkedArts.length}</strong> Pipelines
                </span>
                <span className="flex items-center gap-1 text-action-primary dark:text-action-accent font-bold group-hover:translate-x-0.5 transition-transform">
                  Open Project <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        description="Initialize a project workspace and attach shared extraction/normalization artifacts."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Stratos Wealth Extraction Engine"
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
              placeholder="Summary of the project purpose and target data workflows..."
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Attach Initial Artifacts (Optional)
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 border border-surface-border rounded-level1 p-2 bg-surface-hover/30">
              {artifacts.map(art => (
                <label
                  key={art.id}
                  className="flex items-center gap-2 p-2 rounded-level1 hover:bg-surface text-xs text-ink-primary cursor-pointer border border-transparent hover:border-surface-border"
                >
                  <input
                    type="checkbox"
                    checked={selectedArtifacts.includes(art.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedArtifacts([...selectedArtifacts, art.id]);
                      } else {
                        setSelectedArtifacts(selectedArtifacts.filter(id => id !== art.id));
                      }
                    }}
                    className="rounded border-input text-action-primary focus:ring-focus"
                  />
                  <span className="font-semibold">{art.name}</span>
                  <span className="text-[10px] text-ink-muted ml-auto font-mono">{art.currentVersion}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
