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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);

  const [linkingProjectId, setLinkingProjectId] = useState<string | null>(null);
  const [artifactToLink, setArtifactToLink] = useState<string>('');

  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
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
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        kicker="SEI Institutional Command Center"
        title="Projects & Pipelines"
        subtitle="Manage client workspaces, extraction workflows, and shared schema bindings."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        }
      />

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          icon={<Cpu className="w-4 h-4 text-brand-coral" />}
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
      <div className="bg-white dark:bg-slate-900 rounded-level3 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          <div className="h-4 w-px bg-brand-navy/[0.08] dark:bg-white/10 mx-1" />

          <button
            onClick={expandAll}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-level2 bg-brand-navy/[0.03] dark:bg-white/5 hover:bg-brand-navy/[0.08] text-brand-grey hover:text-brand-navy dark:hover:text-white transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-level2 bg-brand-navy/[0.03] dark:bg-white/5 hover:bg-brand-navy/[0.08] text-brand-grey hover:text-brand-navy dark:hover:text-white transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Expandable Projects Table (Stratos Table Style) */}
      <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-grey bg-brand-navy/[0.02] dark:bg-white/[0.02]">
                <th className="py-3.5 px-4 w-10 text-center"></th>
                <th className="py-3.5 px-4">Project & Pipeline</th>
                <th className="py-3.5 px-4">Attached Artifacts</th>
                <th className="py-3.5 px-4">Assigned Team</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-grey">
                    <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-grey" />
                    <p className="font-bold uppercase tracking-wide text-xs">No projects match the selected criteria</p>
                    <p className="text-[11px] mt-1 text-brand-grey">Try resetting search filters or create a new project</p>
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
                        className={`hover:bg-brand-navy/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors ${
                          isExpanded ? 'bg-brand-navy/[0.015] dark:bg-white/[0.02]' : ''
                        }`}
                      >
                        {/* Chevron */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              toggleRow(proj.id);
                            }}
                            className="p-1 rounded text-brand-grey hover:text-brand-navy dark:hover:text-white transition-colors"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-brand-navy dark:text-brand-blue" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-brand-grey/60" />
                            )}
                          </button>
                        </td>

                        {/* Project Info */}
                        <td className="py-4 px-4 min-w-[240px]">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-level2 bg-brand-navy/[0.04] dark:bg-white/5 border border-brand-navy/[0.08] dark:border-white/10 flex items-center justify-center text-brand-navy dark:text-brand-blue flex-shrink-0 mt-0.5">
                              <FolderKanban className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-brand-black dark:text-white text-xs hover:text-brand-coral transition-colors">
                                  {proj.name}
                                </span>
                                <span className="font-mono text-[9px] text-brand-grey bg-brand-navy/[0.04] dark:bg-white/5 px-1.5 py-0.2 rounded border border-brand-navy/[0.06]">
                                  {proj.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-brand-grey line-clamp-1 mt-0.5 font-normal">
                                {proj.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Attached Artifacts Count & Preview */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-navy text-white shadow-level1 font-mono uppercase tracking-wider">
                              <Cpu className="w-3 h-3 text-brand-coral" />
                              {linkedArts.length} {linkedArts.length === 1 ? 'Artifact' : 'Artifacts'}
                            </span>
                            {linkedArts.slice(0, 2).map(a => (
                              <span
                                key={a.id}
                                className="hidden lg:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-level1 bg-brand-navy/[0.03] dark:bg-white/5 text-brand-grey border border-brand-navy/[0.06] truncate max-w-[120px]"
                                title={a.name}
                              >
                                {a.name}
                              </span>
                            ))}
                            {linkedArts.length > 2 && (
                              <span className="hidden lg:inline text-[10px] text-brand-grey font-mono font-bold">
                                +{linkedArts.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Assigned Team */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {assignedUsers.slice(0, 3).map(u => (
                                <div
                                  key={u.id}
                                  title={`${u.name} (${u.roles.join(', ')})`}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-brand-navy dark:bg-seic-blue text-white text-[9px] font-bold flex items-center justify-center uppercase shadow-level1"
                                >
                                  {u.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              ))}
                            </div>
                            <span className="text-[11px] text-brand-grey font-medium">
                              {assignedUsers.length} {assignedUsers.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={proj.status} />
                        </td>

                        {/* Updated */}
                        <td className="py-4 px-4 text-brand-grey font-mono text-[11px] tabular-nums whitespace-nowrap">
                          {proj.updatedAt.split('T')[0]}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setLinkingProjectId(proj.id)}
                              className="px-2.5 py-1 rounded-level2 text-brand-grey hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/[0.05] border border-brand-navy/10 dark:border-white/10 transition-colors text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                              title="Link Artifact"
                            >
                              <Link2 className="w-3 h-3 text-brand-coral" />
                              <span className="hidden xl:inline">Link</span>
                            </button>

                            <Link
                              to={`/projects/${proj.id}`}
                              className="px-3 py-1 rounded-level2 bg-brand-navy text-white hover:bg-brand-navy/90 transition-all text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-level1"
                            >
                              <span>Workspace</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                              type="button"
                              onClick={e => handleDeleteProject(e, proj.id, proj.name)}
                              className="p-1.5 rounded-level1 text-brand-grey/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-Panel Drawer */}
                      {isExpanded && (
                        <tr className="bg-brand-navy/[0.015] dark:bg-white/[0.02] border-b border-brand-navy/[0.06] dark:border-white/10">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="rounded-level3 bg-white dark:bg-slate-900 border border-brand-navy/[0.06] dark:border-white/10 p-5 space-y-4 shadow-level1">
                              {/* Sub-Panel Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-navy/[0.06] dark:border-white/10">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                                    Project Workspace Bindings
                                  </p>
                                  <h4 className="text-xl font-bold uppercase text-brand-black dark:text-white font-display mt-0.5">
                                    {proj.name}
                                  </h4>
                                  <p className="text-xs text-brand-grey mt-1">
                                    {proj.description || 'No detailed project description recorded.'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setLinkingProjectId(proj.id)}
                                    className="px-3 py-1.5 rounded-level2 bg-white dark:bg-slate-800 hover:bg-brand-navy/[0.04] text-brand-navy dark:text-white font-bold text-xs uppercase tracking-wider border border-brand-navy/15 dark:border-white/15 flex items-center gap-1.5 transition-colors"
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
                                </div>
                              </div>

                              {/* Attached Artifacts Sub-Table */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey flex items-center gap-1.5">
                                    <Cpu className="w-3.5 h-3.5 text-brand-coral" /> Attached Artifact Pipelines ({linkedArts.length})
                                  </p>
                                  <span className="text-[10px] font-mono text-brand-grey">
                                    Reusable Prompt Schemas
                                  </span>
                                </div>

                                {linkedArts.length === 0 ? (
                                  <div className="p-6 rounded-level2 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-dashed border-brand-navy/[0.1] text-center space-y-2">
                                    <Cpu className="w-6 h-6 mx-auto text-brand-grey opacity-50" />
                                    <p className="text-xs font-bold text-brand-grey uppercase tracking-wide">
                                      No prompt pipelines currently linked to this project
                                    </p>
                                    <button
                                      onClick={() => setLinkingProjectId(proj.id)}
                                      className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Link existing artifact now
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border border-brand-navy/[0.06] dark:border-white/10 rounded-level3 overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-brand-navy/[0.02] dark:bg-white/[0.02] border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase text-brand-grey tracking-widest">
                                          <th className="py-2.5 px-4">Artifact Pipeline</th>
                                          <th className="py-2.5 px-4">Stage Coverage</th>
                                          <th className="py-2.5 px-4">Status</th>
                                          <th className="py-2.5 px-4">Active Version</th>
                                          <th className="py-2.5 px-4">Validation Health</th>
                                          <th className="py-2.5 px-4 text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
                                        {linkedArts.map(art => {
                                          return (
                                            <tr key={art.id} className="hover:bg-brand-navy/[0.02]">
                                              <td className="py-3 px-4">
                                                <div className="font-bold text-brand-black dark:text-white">
                                                  {art.name}
                                                </div>
                                                <div className="text-[10px] text-brand-grey line-clamp-1 font-normal">
                                                  {art.description}
                                                </div>
                                              </td>

                                              <td className="py-3 px-4">
                                                <div className="flex items-center gap-1 font-mono text-[9px]">
                                                  <span
                                                    className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                                      art.stage1Prompt
                                                        ? 'bg-brand-green/10 text-brand-green'
                                                        : 'bg-brand-navy/[0.04] text-brand-grey'
                                                    }`}
                                                  >
                                                    Stage 1
                                                  </span>
                                                  <span
                                                    className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                                      art.stage2Prompt
                                                        ? 'bg-brand-blue/10 text-brand-blue'
                                                        : 'bg-brand-navy/[0.04] text-brand-grey'
                                                    }`}
                                                  >
                                                    Stage 2
                                                  </span>
                                                  <span
                                                    className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                                      art.jsonSchema
                                                        ? 'bg-brand-coral/10 text-brand-coral'
                                                        : 'bg-brand-navy/[0.04] text-brand-grey'
                                                    }`}
                                                  >
                                                    Schema
                                                  </span>
                                                </div>
                                              </td>

                                              <td className="py-3 px-4">
                                                <StatusBadge status={art.status} />
                                              </td>

                                              <td className="py-3 px-4 font-mono text-[11px] font-bold text-brand-navy dark:text-brand-blue tabular-nums">
                                                {art.currentVersion}
                                              </td>

                                              <td className="py-3 px-4">
                                                <span className="inline-flex items-center gap-1 text-[10px] text-brand-green font-bold font-mono uppercase tracking-wider">
                                                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
                                                </span>
                                              </td>

                                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                  <Link
                                                    to={`/artifacts/${art.id}`}
                                                    className="px-2.5 py-1 rounded-level2 bg-brand-navy/[0.04] hover:bg-brand-navy hover:text-white text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                                                  >
                                                    <span>Open Hub</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                  </Link>
                                                  <button
                                                    onClick={() => unlinkArtifactFromProject(proj.id, art.id)}
                                                    className="p-1 rounded text-brand-grey/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"
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
                              <div className="pt-2 border-t border-brand-navy/[0.06] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-brand-grey uppercase tracking-widest text-[10px]">
                                    Assigned Roster:
                                  </span>
                                  {assignedUsers.map(u => (
                                    <span
                                      key={u.id}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-navy/[0.04] dark:bg-white/5 border border-brand-navy/[0.08] text-brand-black dark:text-white font-bold text-[10px] uppercase tracking-wider"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-brand-navy dark:bg-seic-blue" />
                                      {u.name}
                                      <span className="text-[9px] text-brand-grey">({u.roles.join(', ')})</span>
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[10px] text-brand-grey font-mono tabular-nums">
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule K-1 Tax Parsing"
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
              placeholder="Describe the business domain, client requirements, or processing target..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1.5">
              Attach Initial Artifacts (Optional)
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto border border-brand-navy/[0.08] dark:border-white/10 rounded-level2 p-2 bg-brand-navy/[0.02]">
              {artifacts.length === 0 ? (
                <div className="text-xs text-brand-grey py-2 text-center">No artifacts registered yet</div>
              ) : (
                artifacts.map(a => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2.5 p-2 rounded-level1 hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
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
                      className="rounded border-brand-navy/20 text-brand-navy focus:ring-brand-navy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-brand-black dark:text-white">{a.name}</div>
                      <div className="text-[10px] text-brand-grey font-mono">{a.currentVersion} • {a.status}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Select Artifact *
            </label>
            {unlinkedArtifacts.length === 0 ? (
              <div className="p-4 rounded-level2 bg-brand-navy/[0.02] text-xs text-brand-grey text-center font-semibold">
                All existing artifacts are already attached to this project.
              </div>
            ) : (
              <select
                required
                value={artifactToLink}
                onChange={e => setArtifactToLink(e.target.value)}
                className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
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

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
