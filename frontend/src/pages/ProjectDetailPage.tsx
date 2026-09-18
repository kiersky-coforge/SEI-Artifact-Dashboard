import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { Textarea } from '../components/atoms/Textarea';
import { SearchInput } from '../components/atoms/SearchInput';
import { DataTable, type ColumnDef } from '../components/organisms/DataTable';
import { ValidationHealthPill } from '../components/molecules/ValidationHealthPill';
import {
  ArrowLeft,
  Plus,
  Link2,
  Unlink,
  Cpu,
  Trash2,
  Users,
  UserPlus,
  ExternalLink,
  Search,
} from 'lucide-react';
import type { Artifact, User } from '../../../shared/types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects,
    artifacts,
    users,
    attachArtifactToProject,
    detachArtifactFromProject,
    assignUserToProject,
    detachUserFromProject,
    createArtifact,
    deleteProject,
  } = usePrototype();

  const project = projects.find(p => p.id === id);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [isCreateArtifactOpen, setIsCreateArtifactOpen] = useState(false);
  const [newArtName, setNewArtName] = useState('');
  const [newArtDesc, setNewArtDesc] = useState('');
  const [selectedToAttach, setSelectedToAttach] = useState<string[]>([]);
  const [selectedUsersToAssign, setSelectedUsersToAssign] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [artifactSearchQuery, setArtifactSearchQuery] = useState('');

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
  const assignedUsers = users.filter(u => (project.userIds || []).includes(u.id) || u.projectIds.includes(project.id));
  const unassignedUsers = users.filter(u => !(project.userIds || []).includes(u.id) && !u.projectIds.includes(project.id));

  const filteredUnlinkedArtifacts = useMemo(() => {
    if (!artifactSearchQuery.trim()) return unlinkedArtifacts;
    const q = artifactSearchQuery.toLowerCase();
    return unlinkedArtifacts.filter(
      a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );
  }, [unlinkedArtifacts, artifactSearchQuery]);

  const filteredUnassignedUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return unassignedUsers;
    const q = userSearchQuery.toLowerCase();
    return unassignedUsers.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some(r => r.toLowerCase().includes(q))
    );
  }, [unassignedUsers, userSearchQuery]);

  const handleAttachArtifacts = () => {
    selectedToAttach.forEach(aid => attachArtifactToProject(project.id, aid));
    setSelectedToAttach([]);
    setIsAttachOpen(false);
  };

  const handleAssignUsers = () => {
    selectedUsersToAssign.forEach(uid => assignUserToProject(project.id, uid));
    setSelectedUsersToAssign([]);
    setIsAssignUserOpen(false);
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
      header: 'Artifact Name',
      sortValue: art => art.name,
      hideable: false,
      searchable: true,
      searchValue: art => art.name,
      render: art => (
        <div className="font-bold text-ink-primary text-xs font-display">{art.name}</div>
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
      id: 'updated',
      header: 'Last Updated',
      sortValue: art => art.updatedAt,
      cellClassName: 'text-ink-secondary font-mono text-[11px] tabular-nums whitespace-nowrap',
      render: art => art.updatedAt.split('T')[0],
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

  const assignedUserColumns: ColumnDef<User>[] = [
    {
      id: 'user',
      header: 'Team Member',
      sortValue: u => u.name,
      hideable: false,
      searchable: true,
      searchValue: u => `${u.name} ${u.email}`,
      render: u => {
        const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return (
          <Link to={`/users/${u.id}`} className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded">
            <div className="w-8 h-8 rounded-level2 bg-brand-navy dark:bg-seic-blue text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 shadow-level1 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-ink-primary text-xs group-hover:text-brand-coral transition-colors">{u.name}</div>
              <div className="text-[11px] text-ink-secondary font-mono mt-0.5">{u.email}</div>
            </div>
          </Link>
        );
      },
    },
    {
      id: 'roles',
      header: 'RBAC Roles',
      render: u => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map(role => (
            <span
              key={role}
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                role === 'admin'
                  ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/25'
                  : role === 'author'
                  ? 'bg-brand-green/10 text-brand-green border-brand-green/25'
                  : 'bg-brand-navy/10 text-brand-navy dark:text-brand-blue border-input'
              }`}
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Account Status',
      sortValue: u => u.status,
      render: u => <StatusBadge status={u.status} />,
    },
    {
      id: 'lastActivity',
      header: 'Last Activity',
      cellClassName: 'text-ink-secondary font-mono text-[11px] tabular-nums whitespace-nowrap',
      render: u => (u.lastLoginAt ? u.lastLoginAt.split('T')[0] : 'Never'),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      cellClassName: 'whitespace-nowrap',
      render: u => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/users/${u.id}`}
            className="p-1.5 rounded-level1 text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            title="Manage User Permissions"
            aria-label={`Manage user ${u.name}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={e => { e.stopPropagation(); detachUserFromProject(project.id, u.id); }}
            className="p-1.5 rounded-level1 text-ink-secondary/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            title="Unassign User from Project"
            aria-label={`Unassign ${u.name} from project`}
          >
            <Unlink className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
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
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAssignUserOpen(true)}
              icon={<UserPlus className="w-3.5 h-3.5 text-brand-blue" />}
            >
              Assign Users
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAttachOpen(true)}
              icon={<Link2 className="w-3.5 h-3.5 text-brand-coral" />}
            >
              Attach Artifact
            </Button>
            <Button
              variant="coral"
              size="sm"
              onClick={() => setIsCreateArtifactOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Artifact
            </Button>
          </div>
        }
      />

      {/* SECTION 1: Associated Artifacts Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-coral" /> Attached Pipeline Artifacts ({linkedArtifacts.length})
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAttachOpen(true)}
            icon={<Plus className="w-3 h-3" />}
          >
            Attach Artifact
          </Button>
        </div>

        {linkedArtifacts.length === 0 ? (
          <div className="p-10 text-center rounded-level3 border border-dashed border-brand-navy/[0.1] bg-surface shadow-level1">
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

      {/* SECTION 2: Assigned Team Members Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue" /> Assigned Team Members ({assignedUsers.length})
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAssignUserOpen(true)}
            icon={<UserPlus className="w-3 h-3 text-brand-blue" />}
          >
            Assign User
          </Button>
        </div>

        {assignedUsers.length === 0 ? (
          <div className="p-10 text-center rounded-level3 border border-dashed border-brand-navy/[0.1] bg-surface shadow-level1">
            <Users className="w-8 h-8 text-ink-secondary mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold uppercase text-ink-primary">No Team Members Assigned</h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-sm mx-auto">
              Assign prompt authors and developers to collaborate on this workspace.
            </p>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => setIsAssignUserOpen(true)}>
                Assign Team Members
              </Button>
            </div>
          </div>
        ) : (
          <DataTable<User>
            columns={assignedUserColumns}
            data={assignedUsers}
            getRowKey={u => u.id}
            onRowClick={u => navigate(`/users/${u.id}`)}
          />
        )}
      </div>

      {/* Modal 1: Attach Existing Artifact */}
      <Modal
        isOpen={isAttachOpen}
        onClose={() => {
          setIsAttachOpen(false);
          setSelectedToAttach([]);
          setArtifactSearchQuery('');
        }}
        title="Attach Existing Artifacts"
        subtitle="Select pipelines from the global schema library to bind to this project."
      >
        <div className="space-y-4">
          {unlinkedArtifacts.length > 4 && (
            <SearchInput
              value={artifactSearchQuery}
              onChange={setArtifactSearchQuery}
              placeholder="Search available artifacts..."
              className="w-full"
            />
          )}

          {unlinkedArtifacts.length === 0 ? (
            <p className="text-xs text-ink-secondary text-center py-4">All available artifacts are already attached to this project.</p>
          ) : filteredUnlinkedArtifacts.length === 0 ? (
            <p className="text-xs text-ink-secondary text-center py-4">No artifacts match "{artifactSearchQuery}".</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border border-surface-border rounded-level2 p-2 bg-brand-navy/[0.02]">
              {filteredUnlinkedArtifacts.map(art => (
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
                setArtifactSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="coral"
              disabled={selectedToAttach.length === 0}
              onClick={handleAttachArtifacts}
            >
              Attach Selected ({selectedToAttach.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Assign Users to Project */}
      <Modal
        isOpen={isAssignUserOpen}
        onClose={() => {
          setIsAssignUserOpen(false);
          setSelectedUsersToAssign([]);
          setUserSearchQuery('');
        }}
        title="Assign Users to Project"
        subtitle={`Select team members to grant access to workspace ${project.name}.`}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <SearchInput
              value={userSearchQuery}
              onChange={setUserSearchQuery}
              placeholder="Search by name, email, or role..."
              className="w-full"
            />
          </div>

          {unassignedUsers.length === 0 ? (
            <p className="text-xs text-ink-secondary text-center py-4">All registered users are already assigned to this project.</p>
          ) : filteredUnassignedUsers.length === 0 ? (
            <div className="p-4 text-center text-xs text-ink-secondary">
              <Search className="w-4 h-4 mx-auto mb-1 opacity-50" />
              No unassigned users match "{userSearchQuery}".
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 border border-surface-border rounded-level2 p-2 bg-brand-navy/[0.02]">
              {filteredUnassignedUsers.map(u => {
                const isSelected = selectedUsersToAssign.includes(u.id);
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
                return (
                  <label
                    key={u.id}
                    className={`flex items-center justify-between p-2.5 rounded-level1 cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-navy/[0.05] dark:bg-white/10' : 'hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedUsersToAssign([...selectedUsersToAssign, u.id]);
                          } else {
                            setSelectedUsersToAssign(selectedUsersToAssign.filter(uid => uid !== u.id));
                          }
                        }}
                        className="rounded border-input text-brand-navy focus:ring-focus"
                      />
                      <div className="w-7 h-7 rounded-level2 bg-brand-navy dark:bg-seic-blue text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-ink-primary text-xs truncate">{u.name}</div>
                        <div className="text-[10px] text-ink-secondary font-mono truncate">{u.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {u.roles.map(r => (
                        <span key={r} className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-surface border border-surface-border text-ink-secondary">
                          {r}
                        </span>
                      ))}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAssignUserOpen(false);
                setSelectedUsersToAssign([]);
                setUserSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="coral"
              disabled={selectedUsersToAssign.length === 0}
              onClick={handleAssignUsers}
            >
              Assign Selected ({selectedUsersToAssign.length})
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Create New Artifact */}
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
