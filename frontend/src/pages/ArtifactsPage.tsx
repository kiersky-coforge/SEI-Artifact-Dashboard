import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { Textarea } from '../components/atoms/Textarea';
import { Select } from '../components/atoms/Select';
import { DataTable, type ColumnDef } from '../components/organisms/DataTable';
import { ValidationHealthPill } from '../components/molecules/ValidationHealthPill';
import {
  Plus,
  Cpu,
  Trash2,
  FolderKanban,
} from 'lucide-react';
import type { Artifact } from '../../../shared/types';

export const ArtifactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { artifacts, projects, createArtifact, deleteArtifact } = usePrototype();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialProject, setInitialProject] = useState('');

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

  const artifactColumns: ColumnDef<Artifact>[] = [
    {
      id: 'name',
      header: 'Artifact Name & Pipeline',
      sortValue: art => art.name,
      hideable: false,
      searchable: true,
      searchValue: art => `${art.name} ${art.description} ${art.id}`,
      cellClassName: 'min-w-[220px]',
      render: art => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-level2 bg-brand-navy/[0.04] dark:bg-white/5 border border-surface-border flex items-center justify-center text-brand-navy dark:text-brand-blue flex-shrink-0 mt-0.5">
            <Cpu className="w-4 h-4 text-brand-coral" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink-primary text-xs">{art.name}</span>
              <span className="font-mono text-[9px] text-ink-secondary bg-brand-navy/[0.04] dark:bg-white/5 px-1.5 py-0.2 rounded border border-brand-navy/[0.06]">
                {art.id}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary line-clamp-1 mt-0.5 font-normal">{art.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: art => art.status,
      filterable: true,
      filter: { type: 'select-list', label: 'Status', options: ['published', 'draft', 'archived'] },
      filterPredicate: (art, val: string[]) => val.length === 0 || val.includes(art.status),
      render: art => <StatusBadge status={art.status} />,
    },
    {
      id: 'version',
      header: 'Active Version',
      sortValue: art => art.currentVersion,
      cellClassName: 'font-mono text-xs font-bold text-ink-primary tabular-nums',
      render: art => art.currentVersion,
    },
    {
      id: 'projects',
      header: 'Attached Projects',
      filterable: true,
      filter: { type: 'select-list', label: 'Attached Projects', options: projects.map(p => p.name) },
      filterPredicate: (art, val: string[]) =>
        val.length === 0 || val.some(name => projects.find(p => p.name === name && art.projectIds.includes(p.id))),
      render: art => {
        const linkedProjects = projects.filter(p => art.projectIds.includes(p.id));
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {linkedProjects.length === 0 ? (
              <span className="text-[11px] text-ink-secondary italic">Unassigned</span>
            ) : (
              linkedProjects.map(p => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-level1 bg-brand-navy/[0.03] dark:bg-white/5 hover:bg-brand-navy/[0.08] text-ink-primary border border-brand-navy/[0.06] transition-colors truncate max-w-[130px]"
                  title={p.name}
                >
                  <FolderKanban className="w-2.5 h-2.5 text-brand-navy dark:text-brand-blue" />
                  <span className="truncate">{p.name}</span>
                </Link>
              ))
            )}
          </div>
        );
      },
    },
    {
      id: 'validation',
      header: 'Validation Health',
      cellClassName: 'whitespace-nowrap',
      render: () => <ValidationHealthPill />,
    },
    {
      id: 'updated',
      header: 'Last Updated',
      sortValue: art => art.updatedAt,
      cellClassName: 'text-ink-secondary font-mono text-[11px] tabular-nums whitespace-nowrap',
      render: art => art.updatedAt.split('T')[0],
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      cellClassName: 'whitespace-nowrap',
      render: art => (
        <button
          type="button"
          onClick={e => handleDelete(e, art.id, art.name)}
          className="p-1.5 rounded-level1 text-ink-secondary/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="Delete Artifact"
          aria-label={`Delete artifact ${art.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        title="Artifacts & Extraction Hub"
        subtitle="Repository of reusable multi-stage prompt pipelines, JSON schemas, and calibration datasets."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Artifact
          </Button>
        }
      />

      {/* Artifacts Table */}
      <DataTable<Artifact>
        columns={artifactColumns}
        data={artifacts}
        getRowKey={art => art.id}
        onRowClick={art => navigate(`/artifacts/${art.id}`)}
        emptyState={
          <>
            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-secondary" />
            <p className="font-bold uppercase tracking-wide text-xs">No artifacts registered yet</p>
            <p className="text-[11px] mt-1 text-ink-secondary">Create your first extraction pipeline to get started</p>
          </>
        }
      />

      {/* Create Artifact Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Artifact"
        subtitle="Initialize a reusable prompt pipeline, JSON schema definition, and test fixtures."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="artifact-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Artifact Name *
            </label>
            <Input
              id="artifact-name"
              type="text"
              required
              placeholder="e.g. Schedule K-1 Partner Line Items"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="artifact-description" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Description
            </label>
            <Textarea
              id="artifact-description"
              rows={3}
              placeholder="Describe the extraction target, data normalization goals, and required output structure..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="artifact-initial-project" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Bind to Initial Project (Optional)
            </label>
            <Select
              id="artifact-initial-project"
              value={initialProject}
              onChange={e => setInitialProject(e.target.value)}
            >
              <option value="">-- Standalone (No project assigned yet) --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
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
