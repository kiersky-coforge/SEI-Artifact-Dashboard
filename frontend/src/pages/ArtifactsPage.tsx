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
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        kicker="Global Schema Registry"
        title="Artifacts & Extraction Hub"
        subtitle="Repository of reusable multi-stage prompt pipelines, JSON schemas, and calibration datasets."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Artifact
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Published Artifacts"
          value={publishedCount}
          subtitle="Validated & production-ready"
          icon={<CheckCircle2 className="w-4 h-4 text-brand-green" />}
          delta="100% Validated"
          deltaType="positive"
        />
        <StatCard
          title="Draft Iterations"
          value={draftCount}
          subtitle="Work-in-progress pipelines"
          icon={<AlertCircle className="w-4 h-4 text-brand-coral" />}
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
          icon={<FolderKanban className="w-4 h-4 text-brand-navy dark:text-brand-blue" />}
          delta="Connected"
          deltaType="positive"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-level3 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="h-4 w-px bg-brand-navy/[0.08] dark:bg-white/10 mx-1" />

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-brand-navy/10 dark:border-white/15 text-brand-black dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-navy font-bold uppercase tracking-wider"
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
      <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-grey bg-brand-navy/[0.02] dark:bg-white/[0.02]">
                <th className="py-3.5 px-4">Artifact Name & Pipeline</th>
                <th className="py-3.5 px-4">Pipeline Stages</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Active Version</th>
                <th className="py-3.5 px-4">Attached Projects</th>
                <th className="py-3.5 px-4">Validation Health</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
              {filteredArtifacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-brand-grey">
                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-grey" />
                    <p className="font-bold uppercase tracking-wide text-xs">No artifacts found matching your criteria</p>
                    <p className="text-[11px] mt-1 text-brand-grey">Try broadening your search or create a new artifact</p>
                  </td>
                </tr>
              ) : (
                filteredArtifacts.map(art => {
                  const linkedProjects = projects.filter(p => art.projectIds.includes(p.id));

                  return (
                    <tr
                      key={art.id}
                      className="hover:bg-brand-navy/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-4 px-4 min-w-[220px]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-level2 bg-brand-navy/[0.04] dark:bg-white/5 border border-brand-navy/[0.08] dark:border-white/10 flex items-center justify-center text-brand-navy dark:text-brand-blue flex-shrink-0 mt-0.5">
                            <Cpu className="w-4 h-4 text-brand-coral" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/artifacts/${art.id}`}
                                className="font-bold text-brand-black dark:text-white text-xs group-hover:text-brand-coral transition-colors"
                              >
                                {art.name}
                              </Link>
                              <span className="font-mono text-[9px] text-brand-grey bg-brand-navy/[0.04] dark:bg-white/5 px-1.5 py-0.2 rounded border border-brand-navy/[0.06]">
                                {art.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-brand-grey line-clamp-1 mt-0.5 font-normal">
                              {art.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Pipeline Stage Coverage */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 font-mono text-[9px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              art.stage1Prompt
                                ? 'bg-brand-green/10 text-brand-green'
                                : 'bg-brand-navy/[0.04] text-brand-grey'
                            }`}
                            title="Stage 1 Extraction Prompt"
                          >
                            Stage 1
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              art.stage2Prompt
                                ? 'bg-brand-blue/10 text-brand-blue'
                                : 'bg-brand-navy/[0.04] text-brand-grey'
                            }`}
                            title="Stage 2 Refinement Prompt"
                          >
                            Stage 2
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              art.jsonSchema
                                ? 'bg-brand-coral/10 text-brand-coral'
                                : 'bg-brand-navy/[0.04] text-brand-grey'
                            }`}
                            title="JSON Validation Schema"
                          >
                            Schema
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <StatusBadge status={art.status} />
                      </td>

                      {/* Active Version */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-level1 bg-brand-navy/[0.04] dark:bg-white/5 border border-brand-navy/[0.08] text-brand-black dark:text-white tabular-nums">
                          {art.currentVersion}
                        </span>
                      </td>

                      {/* Attached Projects */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {linkedProjects.length === 0 ? (
                            <span className="text-[11px] text-brand-grey italic">Unassigned</span>
                          ) : (
                            linkedProjects.map(p => (
                              <Link
                                key={p.id}
                                to={`/projects/${p.id}`}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-level1 bg-brand-navy/[0.03] dark:bg-white/5 hover:bg-brand-navy/[0.08] text-brand-black dark:text-white border border-brand-navy/[0.06] transition-colors truncate max-w-[130px]"
                                title={p.name}
                              >
                                <FolderKanban className="w-2.5 h-2.5 text-brand-navy dark:text-brand-blue" />
                                <span className="truncate">{p.name}</span>
                              </Link>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Validation Health */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td className="py-4 px-4 text-brand-grey font-mono text-[11px] tabular-nums whitespace-nowrap">
                        {art.updatedAt.split('T')[0]}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/artifacts/${art.id}`}
                            className="px-3 py-1.5 rounded-level2 bg-brand-navy text-white hover:bg-brand-navy/90 transition-all font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 shadow-level1"
                          >
                            <span>Open Hub</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={e => handleDelete(e, art.id, art.name)}
                            className="p-1.5 rounded-level1 text-brand-grey/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Artifact Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule K-1 Partner Line Items"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the extraction target, data normalization goals, and required output structure..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Bind to Initial Project (Optional)
            </label>
            <select
              value={initialProject}
              onChange={e => setInitialProject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            >
              <option value="">-- Standalone (No project assigned yet) --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Create Artifact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
