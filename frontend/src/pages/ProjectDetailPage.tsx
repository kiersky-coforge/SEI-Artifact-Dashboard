import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { StatCard } from '../components/molecules/StatCard';
import { ArrowLeft, Plus, Link2, Unlink, Cpu, Trash2, Users, Calendar } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    artifacts,
    users,
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
        <h2 className="text-lg font-bold text-ink-primary">Project Not Found</h2>
        <Link to="/projects" className="text-xs text-action-primary hover:underline mt-2 inline-block">
          Return to Projects
        </Link>
      </div>
    );
  }

  const linkedArtifacts = artifacts.filter(a => project.artifactIds.includes(a.id));
  const unlinkedArtifacts = artifacts.filter(a => !project.artifactIds.includes(a.id));
  const assignedUsers = users.filter(u => project.userIds.includes(u.id));

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-status-error-text hover:bg-status-error/10"
          icon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Project
        </Button>
      </div>

      {/* Header Bar */}
      <HeaderBar
        kicker="Project Workspace"
        title={project.name}
        subtitle={project.description}
        badge={<StatusBadge status={project.status} />}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAttachOpen(true)}
              icon={<Link2 className="w-3.5 h-3.5" />}
            >
              Attach Existing
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateArtifactOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Artifact
            </Button>
          </>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Bound Pipelines"
          value={linkedArtifacts.length}
          subtitle="Active extraction schemas"
          icon={<Cpu className="w-4 h-4" />}
          delta="Shared"
          deltaType="positive"
        />
        <StatCard
          title="Assigned Team"
          value={assignedUsers.length}
          subtitle={assignedUsers.map(u => u.name).join(', ') || 'None'}
          icon={<Users className="w-4 h-4" />}
          delta="Collaborators"
          deltaType="neutral"
        />
        <StatCard
          title="Created Date"
          value={new Date(project.createdAt).toLocaleDateString()}
          subtitle="Project initiation"
          icon={<Calendar className="w-4 h-4" />}
          delta="Active"
          deltaType="positive"
        />
      </div>

      {/* Associated Artifacts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink-primary flex items-center gap-2">
            <Cpu className="w-4 h-4 text-action-primary dark:text-action-accent" /> Attached Artifacts ({linkedArtifacts.length})
          </h2>
          <span className="text-xs text-ink-muted">Reusable multi-stage extraction & refinement pipelines</span>
        </div>

        {linkedArtifacts.length === 0 ? (
          <div className="p-12 text-center rounded-level2 border border-dashed border-surface-border bg-surface">
            <Cpu className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-ink-primary">No Artifacts Attached</h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-sm mx-auto">
              Attach existing prompt & schema artifacts from the library or create a new dedicated pipeline.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button size="sm" variant="outline" onClick={() => setIsAttachOpen(true)}>
                Attach Existing
              </Button>
              <Button size="sm" onClick={() => setIsCreateArtifactOpen(true)}>
                Create New
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedArtifacts.map(art => (
              <div
                key={art.id}
                className="p-5 rounded-level2 border border-surface-border bg-surface hover:border-brand-navy dark:hover:border-action-primary hover:shadow-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-surface-hover border border-surface-border text-ink-primary font-bold">
                      {art.currentVersion}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={art.status} />
                      <button
                        onClick={() => detachArtifactFromProject(project.id, art.id)}
                        className="p-1 rounded text-ink-muted hover:text-status-error-text hover:bg-status-error/10 transition-colors"
                        title="Detach from project"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/artifacts/${art.id}`} className="block group">
                    <h3 className="text-sm font-extrabold text-ink-primary group-hover:text-action-primary dark:group-hover:text-action-accent transition-colors">
                      {art.name}
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
                      {art.description}
                    </p>
                  </Link>
                </div>

                <div className="border-t border-surface-border pt-3 mt-4 flex items-center justify-between text-xs text-ink-muted">
                  <span>Updated {new Date(art.updatedAt).toLocaleDateString()}</span>
                  <Link
                    to={`/artifacts/${art.id}`}
                    className="font-bold text-action-primary dark:text-action-accent hover:underline text-xs"
                  >
                    Open Hub →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attach Modal */}
      <Modal
        isOpen={isAttachOpen}
        onClose={() => setIsAttachOpen(false)}
        title="Attach Existing Artifacts"
        description="Select shared artifacts from the global library to link with this project."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAttachOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAttach} disabled={selectedToAttach.length === 0}>
              Attach Selected ({selectedToAttach.length})
            </Button>
          </>
        }
      >
        {unlinkedArtifacts.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-6">All available artifacts are already attached to this project.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unlinkedArtifacts.map(art => (
              <label
                key={art.id}
                className="flex items-center gap-3 p-3 rounded-level1 border border-surface-border hover:bg-surface-hover cursor-pointer"
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
                  className="rounded border-input text-action-primary focus:ring-focus"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-primary">{art.name}</span>
                    <span className="font-mono text-[11px] text-ink-muted">{art.currentVersion}</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary mt-0.5">{art.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Modal>

      {/* Create Artifact Modal */}
      <Modal
        isOpen={isCreateArtifactOpen}
        onClose={() => setIsCreateArtifactOpen(false)}
        title="Create & Attach Artifact"
        description="Define a new multi-stage prompt & schema artifact and link it directly to this project."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateArtifactOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateArtifact} disabled={!newArtName.trim()}>
              Create & Open Editor
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateArtifact} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Artifact Name *
            </label>
            <input
              type="text"
              required
              value={newArtName}
              onChange={e => setNewArtName(e.target.value)}
              placeholder="e.g. Schedule K-1 Tax Allocator"
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newArtDesc}
              onChange={e => setNewArtDesc(e.target.value)}
              placeholder="What does this extraction pipeline normalize and extract?"
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
