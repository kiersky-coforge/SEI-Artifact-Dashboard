import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import { ArtifactSearchSelect } from '../components/molecules/ArtifactSearchSelect';
import {
  Plus,
  FolderKanban,
  Cpu,
  Link2,
  X,
  Search,
} from 'lucide-react';
import type { Project, Artifact } from '../../../shared/types';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    artifacts,
    users,
    createProject,
    createArtifact,
    linkArtifactToProject,
    unlinkArtifactFromProject,
    assignUserToProject,
    detachUserFromProject,
  } = usePrototype();

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);

  const [linkingProjectId, setLinkingProjectId] = useState<string | null>(null);
  const [linkSelectionMode, setLinkSelectionMode] = useState<'none' | 'new' | 'existing'>('none');
  const [artifactToLink, setArtifactToLink] = useState<string>('');
  const [newArtifactName, setNewArtifactName] = useState('');
  const [newArtifactDesc, setNewArtifactDesc] = useState('');

  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);
  const [selectedUsersToAssign, setSelectedUsersToAssign] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenLinkModal = (projectId: string) => {
    setLinkingProjectId(projectId);
    const target = projects.find(p => p.id === projectId);
    const unlinked = target ? artifacts.filter(a => !target.artifactIds.includes(a.id)) : [];
    if (unlinked.length > 0) {
      setLinkSelectionMode('existing');
      setArtifactToLink(unlinked[0].id);
    } else {
      setLinkSelectionMode('new');
      setArtifactToLink('');
    }
    setNewArtifactName('');
    setNewArtifactDesc('');
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
    if (!linkingProjectId) return;

    if (linkSelectionMode === 'existing') {
      if (!artifactToLink) return;
      linkArtifactToProject(linkingProjectId, artifactToLink);
    } else if (linkSelectionMode === 'new') {
      if (!newArtifactName.trim()) return;
      createArtifact(newArtifactName, newArtifactDesc, linkingProjectId);
    }

    setLinkingProjectId(null);
    setArtifactToLink('');
    setNewArtifactName('');
    setNewArtifactDesc('');
    setLinkSelectionMode('none');
  };

  const handleAssignUsers = () => {
    if (!assigningProjectId) return;
    selectedUsersToAssign.forEach(uid => assignUserToProject(assigningProjectId, uid));
    setAssigningProjectId(null);
    setSelectedUsersToAssign([]);
    setUserSearchQuery('');
  };

  const targetProjectForLinking = projects.find(p => p.id === linkingProjectId);
  const unlinkedArtifacts = targetProjectForLinking
    ? artifacts.filter(a => !targetProjectForLinking.artifactIds.includes(a.id))
    : [];

  const targetProjectForAssigning = projects.find(p => p.id === assigningProjectId);
  const unassignedUsers = targetProjectForAssigning
    ? users.filter(
        u =>
          !(targetProjectForAssigning.userIds || []).includes(u.id) &&
          !u.projectIds.includes(targetProjectForAssigning.id)
      )
    : [];

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

  const getLinkedArtifactSubColumns = (projectId: string): ColumnDef<Artifact>[] => [
    {
      id: 'name',
      header: 'Artifact Name',
      sortValue: art => art.name,
      hideable: false,
      render: art => (
        <div className="font-bold text-ink-primary text-xs font-display">{art.name}</div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: art => art.status,
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
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/artifacts/${art.id}`}
            onClick={e => e.stopPropagation()}
            className="px-2.5 py-1 rounded-level1 text-[11px] font-bold uppercase tracking-wider text-brand-navy dark:text-brand-blue hover:bg-brand-navy/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Open
          </Link>
          <button
            onClick={e => {
              e.stopPropagation();
              unlinkArtifactFromProject(projectId, art.id);
            }}
            className="px-2.5 py-1 rounded-level1 text-[11px] font-bold uppercase tracking-wider text-alert-coral hover:bg-alert-coral/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            title="Unlink Artifact from Project"
            aria-label={`Unlink ${art.name} from project`}
          >
            Unlink
          </button>
        </div>
      ),
    },
  ];

  const projectColumns: ColumnDef<Project>[] = [
    {
      id: 'name',
      header: 'Project Name',
      sortValue: proj => proj.name,
      hideable: false,
      searchable: true,
      searchValue: proj => `${proj.name} ${proj.description}`,
      cellClassName: 'min-w-[200px]',
      render: proj => (
        <div className="min-w-0">
          <div className="font-bold text-ink-primary text-xs font-display flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue flex-shrink-0" />
            <span className="truncate">{proj.name}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'artifacts',
      header: 'Artifact Number',
      sortValue: proj => proj.artifactIds.length,
      align: 'center',
      cellClassName: 'tabular-nums',
      render: proj => (
        <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
          {proj.artifactIds.length}
        </span>
      ),
    },
    {
      id: 'owner',
      header: 'Owner',
      render: proj => {
        const owner = users.find(u => (proj.userIds || []).includes(u.id) || u.projectIds.includes(proj.id));
        if (!owner) {
          return <span className="text-ink-secondary text-xs italic">Unassigned</span>;
        }
        const initials = owner.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-brand-navy dark:bg-seic-blue text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 shadow-level1">
              {initials}
            </div>
            <span className="text-xs font-medium text-ink-primary truncate">{owner.name}</span>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: proj => proj.status,
      filterable: true,
      filter: { type: 'select-list', label: 'Status', options: ['active', 'archived'] },
      filterPredicate: (proj, val: string[]) => val.length === 0 || val.includes(proj.status),
      render: proj => <StatusBadge status={proj.status} />,
    },
    {
      id: 'updated',
      header: 'Last Updated',
      sortValue: proj => proj.updatedAt,
      cellClassName: 'text-ink-secondary font-mono text-[11px] tabular-nums whitespace-nowrap',
      render: proj => proj.updatedAt.split('T')[0],
    },
  ];

  const renderExpandedProject = (proj: Project) => {
    const linkedArts = artifacts.filter(a => proj.artifactIds.includes(a.id));
    const assignedUsers = users.filter(u => (proj.userIds || []).includes(u.id) || u.projectIds.includes(proj.id));

    return (
      <div className="px-6 py-5 bg-slate-100/80 dark:bg-slate-900/90 border-y-2 border-brand-navy/15 dark:border-brand-blue/30 shadow-inner space-y-4">
        {/* Sub-Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
              Project Workspace Bindings
            </p>
            <h4 className="text-lg font-bold uppercase text-ink-primary font-display mt-0.5">{proj.name}</h4>
            <p className="text-xs text-ink-secondary mt-1">
              {proj.description || 'No detailed project description recorded.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/projects/${proj.id}`}
              className="px-3.5 py-1.5 rounded-level2 bg-brand-navy text-white hover:bg-brand-navy/90 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-level1"
            >
              <span>Open</span>
            </Link>
          </div>
        </div>

        {/* Attached Artifacts Sub-Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-coral" /> Attached Artifact Pipelines ({linkedArts.length})
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenLinkModal(proj.id)}
              icon={<Link2 className="w-3.5 h-3.5 text-brand-coral" />}
            >
              Link Artifact
            </Button>
          </div>

          {linkedArts.length === 0 ? (
            <div className="p-6 rounded-level2 bg-surface dark:bg-surface-elevated border border-dashed border-brand-navy/[0.1] text-center space-y-2">
              <Cpu className="w-6 h-6 mx-auto text-ink-secondary opacity-50" />
              <p className="text-xs font-bold text-ink-secondary uppercase tracking-wide">
                No prompt pipelines currently linked to this project
              </p>
              <button
                onClick={() => handleOpenLinkModal(proj.id)}
                className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
              >
                <Plus className="w-3.5 h-3.5" /> Link artifact now
              </button>
            </div>
          ) : (
            <DataTable<Artifact>
              columns={getLinkedArtifactSubColumns(proj.id)}
              data={linkedArts}
              getRowKey={art => art.id}
            />
          )}
        </div>

        {/* Assigned Team Members Row */}
        <div className="pt-2 border-t border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-ink-secondary uppercase tracking-widest text-[10px]">Assigned Roster:</span>
            {assignedUsers.length === 0 ? (
              <span className="text-ink-secondary italic text-xs">No team members assigned</span>
            ) : (
              assignedUsers.map(u => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full bg-brand-navy/[0.04] dark:bg-white/5 border border-brand-navy/[0.08] text-ink-primary font-bold text-[10px] uppercase tracking-wider group"
                >
                  <Link to={`/users/${u.id}`} className="hover:underline flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-brand-navy dark:bg-seic-blue" />
                    {u.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => detachUserFromProject(proj.id, u.id)}
                    className="p-0.5 rounded-full hover:bg-alert-coral/10 hover:text-alert-coral text-ink-muted transition-colors"
                    title={`Unassign ${u.name}`}
                    aria-label={`Unassign ${u.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
            <button
              type="button"
              onClick={() => setAssigningProjectId(proj.id)}
              className="text-[10px] text-brand-blue font-bold uppercase tracking-wider hover:underline inline-flex items-center gap-1 ml-1"
            >
              <Plus className="w-3 h-3" /> Add User
            </button>
          </div>
          <span className="text-[10px] text-ink-secondary font-mono tabular-nums">
            Created: {proj.createdAt.split('T')[0]}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        title="Projects & Pipelines"
        subtitle="Manage client workspaces, extraction workflows, and shared schema bindings."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        }
      />

      {/* Expandable Projects Table (Stratos Table Style) */}
      <DataTable<Project>
        columns={projectColumns}
        data={projects}
        getRowKey={proj => proj.id}
        renderExpanded={renderExpandedProject}
        isRowExpanded={proj => !!expandedRows[proj.id]}
        onToggleExpand={proj => toggleRow(proj.id)}
        emptyState={
          <>
            <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-secondary" />
            <p className="font-bold uppercase tracking-wide text-xs">No workspaces configured yet</p>
          </>
        }
      />

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Workspace Project"
        subtitle="Initialize a new client workspace to bind extraction pipelines and schemas."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Project Name *
            </label>
            <Input
              id="project-name"
              type="text"
              required
              placeholder="e.g. Schedule K-1 Tax Parsing"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Description
            </label>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="Describe the business domain, client requirements, or processing target..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1.5">
              Attach Initial Artifacts (Optional)
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto border border-surface-border rounded-level2 p-2 bg-brand-navy/[0.02]">
              {artifacts.length === 0 ? (
                <div className="text-xs text-ink-secondary py-2 text-center">No artifacts registered yet</div>
              ) : (
                artifacts.map(a => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2.5 p-2 rounded-level1 hover:bg-surface-hover cursor-pointer text-xs transition-colors"
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
                      className="rounded border-input text-brand-navy focus:ring-focus"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink-primary">{a.name}</div>
                      <div className="text-[10px] text-ink-secondary font-mono">{a.currentVersion} • {a.status}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Link / Create Pipeline Artifact Modal */}
      <Modal
        isOpen={!!linkingProjectId}
        onClose={() => {
          setLinkingProjectId(null);
          setArtifactToLink('');
          setNewArtifactName('');
          setNewArtifactDesc('');
          setLinkSelectionMode('none');
        }}
        title="Link Pipeline Artifact"
        subtitle={`Bind an existing or newly created artifact pipeline to ${targetProjectForLinking?.name || 'this project'}.`}
      >
        <form onSubmit={handleLinkArtifact} className="space-y-4">
          <ArtifactSearchSelect
            artifacts={unlinkedArtifacts}
            selectedMode={linkSelectionMode}
            selectedArtifactId={artifactToLink}
            onSelectNew={(suggestedName) => {
              setLinkSelectionMode('new');
              setArtifactToLink('');
              if (suggestedName && !newArtifactName) {
                setNewArtifactName(suggestedName);
              }
            }}
            onSelectExisting={(artifactId) => {
              setLinkSelectionMode('existing');
              setArtifactToLink(artifactId);
            }}
            onClear={() => {
              setLinkSelectionMode('none');
              setArtifactToLink('');
            }}
            label="Select or Create Artifact"
          />

          {linkSelectionMode === 'new' && (
            <div className="space-y-3 pt-2 border-t border-surface-border animate-in fade-in duration-150">
              <div>
                <label htmlFor="new-artifact-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
                  Artifact Name *
                </label>
                <Input
                  id="new-artifact-name"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Schedule C Expense Normalizer"
                  value={newArtifactName}
                  onChange={e => setNewArtifactName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="new-artifact-desc" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  id="new-artifact-desc"
                  rows={2}
                  placeholder="Briefly describe what this extraction pipeline processes..."
                  value={newArtifactDesc}
                  onChange={e => setNewArtifactDesc(e.target.value)}
                />
              </div>

              <div className="p-3 bg-brand-navy/[0.03] dark:bg-white/[0.03] rounded-level2 border border-surface-border text-xs text-ink-secondary">
                <span className="font-bold text-ink-primary uppercase text-[10px] block mb-0.5">Initial Pipeline Setup:</span>
                Creates an empty draft pipeline (Stage 1 extraction, Stage 2 normalization, JSON schema template) bound directly to this project workspace.
              </div>
            </div>
          )}

          {linkSelectionMode === 'existing' && artifactToLink && (
            <div className="p-3 bg-brand-navy/[0.03] dark:bg-white/[0.03] rounded-level2 border border-surface-border text-xs text-ink-secondary space-y-1">
              <span className="font-bold text-ink-primary uppercase text-[10px] block">Artifact Details:</span>
              <p className="text-ink-secondary text-xs">
                {unlinkedArtifacts.find(a => a.id === artifactToLink)?.description || 'No description provided for this artifact.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button
              variant="secondary"
              onClick={() => {
                setLinkingProjectId(null);
                setArtifactToLink('');
                setNewArtifactName('');
                setNewArtifactDesc('');
                setLinkSelectionMode('none');
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="coral"
              type="submit"
              disabled={
                linkSelectionMode === 'none' ||
                (linkSelectionMode === 'existing' && !artifactToLink) ||
                (linkSelectionMode === 'new' && !newArtifactName.trim())
              }
            >
              {linkSelectionMode === 'new' ? 'Create & Link Artifact' : 'Link to Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Assign Users Modal */}
      <Modal
        isOpen={!!assigningProjectId}
        onClose={() => {
          setAssigningProjectId(null);
          setSelectedUsersToAssign([]);
          setUserSearchQuery('');
        }}
        title="Assign Team to Workspace"
        subtitle={`Grant workspace access to ${targetProjectForAssigning?.name || 'this project'}.`}
      >
        <div className="space-y-4">
          <SearchInput
            value={userSearchQuery}
            onChange={setUserSearchQuery}
            placeholder="Search by name, email, or role..."
            className="w-full"
          />

          {unassignedUsers.length === 0 ? (
            <p className="text-xs text-ink-secondary text-center py-4">All users are already assigned to this project.</p>
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
                    className={`flex items-center justify-between p-2 rounded-level1 cursor-pointer transition-colors ${
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
                setAssigningProjectId(null);
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
    </div>
  );
};
