import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { StatCard } from '../components/molecules/StatCard';
import { ArrowLeft, Plus, Link2, Unlink, Cpu, Trash2, Users, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

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
        <h2 className="text-xl font-bold uppercase text-brand-black dark:text-white font-display">Project Not Found</h2>
        <Link to="/projects" className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline mt-2 inline-block">
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
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-grey hover:text-brand-navy dark:hover:text-white transition-colors"
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
        kicker="Project Workspace"
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Bound Pipelines"
          value={linkedArtifacts.length}
          subtitle="Active extraction schemas"
          icon={<Cpu className="w-4 h-4 text-brand-coral" />}
          delta="Shared"
          deltaType="positive"
        />
        <StatCard
          title="Assigned Team"
          value={assignedUsers.length}
          subtitle={assignedUsers.map(u => u.name).join(', ') || 'None'}
          icon={<Users className="w-4 h-4 text-brand-green" />}
          delta="Collaborators"
          deltaType="neutral"
        />
        <StatCard
          title="Created Date"
          value={project.createdAt.split('T')[0]}
          subtitle="Project initiation"
          icon={<Calendar className="w-4 h-4 text-brand-blue" />}
          delta="Active"
          deltaType="positive"
        />
      </div>

      {/* Associated Artifacts Table Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-coral" /> Attached Pipeline Artifacts ({linkedArtifacts.length})
          </p>
          <span className="text-[10px] font-mono text-brand-grey">Multi-stage extraction & schema definitions</span>
        </div>

        {linkedArtifacts.length === 0 ? (
          <div className="p-12 text-center rounded-level3 border border-dashed border-brand-navy/[0.1] bg-white dark:bg-slate-900 shadow-level1">
            <Cpu className="w-8 h-8 text-brand-grey mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold uppercase text-brand-black dark:text-white">No Artifacts Attached</h3>
            <p className="text-xs text-brand-grey mt-1 max-w-sm mx-auto">
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
          <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-grey bg-brand-navy/[0.02] dark:bg-white/[0.02]">
                  <th className="py-3.5 px-4">Artifact Pipeline</th>
                  <th className="py-3.5 px-4">Stage Coverage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Active Version</th>
                  <th className="py-3.5 px-4">Validation Health</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
                {linkedArtifacts.map(art => (
                  <tr key={art.id} className="hover:bg-brand-navy/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-brand-black dark:text-white text-xs">{art.name}</div>
                      <div className="text-[11px] text-brand-grey line-clamp-1 mt-0.5">{art.description}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            art.stage1Prompt ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-navy/[0.04] text-brand-grey'
                          }`}
                        >
                          Stage 1
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            art.stage2Prompt ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-navy/[0.04] text-brand-grey'
                          }`}
                        >
                          Stage 2
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            art.jsonSchema ? 'bg-brand-coral/10 text-brand-coral' : 'bg-brand-navy/[0.04] text-brand-grey'
                          }`}
                        >
                          Schema
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={art.status} />
                    </td>

                    <td className="py-4 px-4 font-mono text-xs font-bold text-brand-navy dark:text-brand-blue tabular-nums">
                      {art.currentVersion}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] text-brand-green font-bold font-mono uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Valid
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/artifacts/${art.id}`}
                          className="px-3 py-1.5 rounded-level2 bg-brand-navy text-white hover:bg-brand-navy/90 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 shadow-level1 transition-all"
                        >
                          <span>Open Hub</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => detachArtifactFromProject(project.id, art.id)}
                          className="p-1.5 rounded-level1 text-brand-grey/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"
                          title="Detach Artifact from Project"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <p className="text-xs text-brand-grey text-center py-4">All available artifacts are already attached.</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border border-brand-navy/[0.08] dark:border-white/10 rounded-level2 p-2 bg-brand-navy/[0.02]">
              {unlinkedArtifacts.map(art => (
                <label
                  key={art.id}
                  className="flex items-center gap-2.5 p-2 rounded-level1 hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
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
                    className="rounded border-brand-navy/20 text-brand-navy focus:ring-brand-navy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-brand-black dark:text-white">{art.name}</div>
                    <div className="text-[10px] text-brand-grey font-mono">{art.currentVersion} • {art.status}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Artifact Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule K-1 Partner Line Items"
              value={newArtName}
              onChange={e => setNewArtName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Extraction target, calibration parameters, and output constraints..."
              value={newArtDesc}
              onChange={e => setNewArtDesc(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
