import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { Textarea } from '../components/atoms/Textarea';
import { DataTable, type ColumnDef } from '../components/organisms/DataTable';
import { PipelineStageBadges } from '../components/molecules/PipelineStageBadges';
import { ValidationHealthPill } from '../components/molecules/ValidationHealthPill';
import { ArrowLeft, Plus, Link2, Unlink, Cpu, Trash2 } from 'lucide-react';
import type { Artifact } from '../../../shared/types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    artifacts,
    attachArtifactToProject,
    detachArtifactFromProject,
    createArtifact,
    deleteProject,
  } = usePrototype();

  const project = projects.find(p => p.id === id);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isCreateArtifactOpen, setIsCreateArtifactOpen] = useState(false);
  const [newArtName, setNewArtName] = useState('');
  const [newArtDesc, setNewArtDesc] = useState('');
  const [selectedToAttach, setSelectedToAttach] = useState<string[]>([]);

  if (!project) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold uppercase text-ink-primary font-display">Project Not Found</h2>
        <Link to="/projects" className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline mt-2 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  const linkedArtifacts = artifacts.filter(a => project.artifactIds.includes(a.id));
  const unlinkedArtifacts = artifacts.filter(a => !project.artifactIds.includes(a.id));

  const handleAttach = () => {
    selectedToAttach.forEach(aid => attachArtifactToProject(project.id, aid));
    setSelectedToAttach([]);
    setIsAttachOpen(false);
  };

  const handleCreateArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtName.trim()) return;
    const created = createArtifact(newArtName, newArtDesc, project.id);
    setNewArtName('');
    setNewArtDesc('');
    setIsCreateArtifactOpen(false);
    navigate(`/artifacts/${created.id}`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"? Attached artifacts will remain in the library.`)) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  const linkedArtifactColumns: ColumnDef<Artifact>[] = [
    {
      id: 'name',
      header: 'Artifact Pipeline',
      sortValue: art => art.name,
      hideable: false,
      searchable: true,
      searchValue: art => `${art.name} ${art.description}`,
      render: art => (
        <>
          <div className="font-bold text-ink-primary text-xs">{art.name}</div>
          <div className="text-[11px] text-ink-secondary line-clamp-1 mt-0.5">{art.description}</div>
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
      filterable: true,
      filter: { type: 'select-list', label: 'Status', options: ['published', 'draft', 'archived'] },
      filterPredicate: (art, val: string[]) => val.length === 0 || val.includes(art.status),
      render: art => <StatusBadge status={art.status} />,
    },
    {
      id: 'version',
      header: 'Active Version',
      cellClassName: 'font-mono text-xs font-bold text-brand-navy dark:text-brand-blue tabular-nums',
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
        <button
          onClick={e => { e.stopPropagation(); detachArtifactFromProject(project.id, art.id); }}
          className="p-1.5 rounded-level1 text-ink-secondary/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="Detach Artifact from Project"
          aria-label={`Detach ${art.name} from project`}
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-alert-coral hover:bg-alert-coral/10"
          icon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Project
        </Button>
      </div>

      {/* Header Bar */}
      <HeaderBar
        title={project.name}
        subtitle={project.description}
        badge={<StatusBadge status={project.status} />}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAttachOpen(true)}
              icon={<Link2 className="w-3.5 h-3.5 text-brand-coral" />}
            >
              Attach Existing
            </Button>
            <Button
              variant="coral"
              size="sm"
              onClick={() => setIsCreateArtifactOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Artifact
            </Button>
          </>
        }
      />

      {/* Associated Artifacts Table Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-coral" /> Attached Pipeline Artifacts ({linkedArtifacts.length})
          </p>
          <span className="text-[10px] font-mono text-ink-secondary">Multi-stage extraction & schema definitions</span>
        </div>

        {linkedArtifacts.length === 0 ? (
          <div className="p-12 text-center rounded-level3 border border-dashed border-brand-navy/[0.1] bg-surface shadow-level1">
            <Cpu className="w-8 h-8 text-ink-secondary mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold uppercase text-ink-primary">No Artifacts Attached</h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-sm mx-auto">
              Attach existing prompt & schema artifacts from the library or create a new dedicated pipeline.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setIsAttachOpen(true)}>
                Attach Existing
              </Button>
              <Button variant="coral" size="sm" onClick={() => setIsCreateArtifactOpen(true)}>
                Create New Artifact
              </Button>
            </div>
          </div>
        ) : (
          <DataTable<Artifact>
            columns={linkedArtifactColumns}
            data={linkedArtifacts}
            getRowKey={art => art.id}
            onRowClick={art => navigate(`/artifacts/${art.id}`)}
          />
        )}
      </div>

      {/* Attach Existing Artifact Modal */}
      <Modal
        isOpen={isAttachOpen}
        onClose={() => {
          setIsAttachOpen(false);
          setSelectedToAttach([]);
        }}
        title="Attach Existing Artifacts"
        subtitle="Select pipelines from the global schema library to bind to this project."
      >
        <div className="space-y-4">
          {unlinkedArtifacts.length === 0 ? (
            <p className="text-xs text-ink-secondary text-center py-4">All available artifacts are already attached.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border border-surface-border rounded-level2 p-2 bg-brand-navy/[0.02]">
              {unlinkedArtifacts.map(art => (
                <label
                  key={art.id}
                  className="flex items-center gap-2.5 p-2 rounded-level1 hover:bg-surface-hover cursor-pointer text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedToAttach.includes(art.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedToAttach([...selectedToAttach, art.id]);
                      } else {
                        setSelectedToAttach(selectedToAttach.filter(id => id !== art.id));
                      }
                    }}
                    className="rounded border-input text-brand-navy focus:ring-focus"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink-primary">{art.name}</div>
                    <div className="text-[10px] text-ink-secondary font-mono">{art.currentVersion} • {art.status}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAttachOpen(false);
                setSelectedToAttach([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="coral"
              disabled={selectedToAttach.length === 0}
              onClick={handleAttach}
            >
              Attach Selected ({selectedToAttach.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create New Artifact Modal */}
      <Modal
        isOpen={isCreateArtifactOpen}
        onClose={() => setIsCreateArtifactOpen(false)}
        title="Create & Attach Artifact"
        subtitle={`Initialize a new schema pipeline bound directly to ${project.name}.`}
      >
        <form onSubmit={handleCreateArtifact} className="space-y-4">
          <div>
            <label htmlFor="new-artifact-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Artifact Name *
            </label>
            <Input
              id="new-artifact-name"
              type="text"
              required
              placeholder="e.g. Schedule K-1 Partner Line Items"
              value={newArtName}
              onChange={e => setNewArtName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="new-artifact-description" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Description
            </label>
            <Textarea
              id="new-artifact-description"
              rows={3}
              placeholder="Extraction target, calibration parameters, and output constraints..."
              value={newArtDesc}
              onChange={e => setNewArtDesc(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsCreateArtifactOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Create & Open Hub
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
