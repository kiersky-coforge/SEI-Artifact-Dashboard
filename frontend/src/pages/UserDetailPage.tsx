import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { SearchInput } from '../components/atoms/SearchInput';
import { Modal } from '../components/molecules/Modal';
import {
  ArrowLeft,
  Save,
  Trash2,
  UserX,
  UserCheck,
  FolderKanban,
  Check,
  Cpu,
  ExternalLink,
  ShieldAlert,
  Search,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import type { UserRole } from '../../../shared/types';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, projects, updateUser, deleteUser } = usePrototype();

  const user = users.find(u => u.id === id);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRoles(user.roles);
      setSelectedProjectIds(user.projectIds || []);
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold uppercase text-ink-primary font-display">User Not Found</h2>
        <Link
          to="/users"
          className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline mt-2 inline-block"
        >
          Return to User Directory
        </Link>
      </div>
    );
  }

  const allRoles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'admin', label: 'System Admin', desc: 'Full administrative access and user governance' },
    { id: 'author', label: 'Prompt Author', desc: 'Can author, edit, calibrate, and publish artifacts' },
    { id: 'developer', label: 'Integration Developer', desc: 'Can create projects and consume schema pipelines' },
  ];

  const filteredProjects = useMemo(() => {
    if (!projectSearchQuery.trim()) return projects;
    const q = projectSearchQuery.toLowerCase();
    return projects.filter(
      p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, projectSearchQuery]);

  const toggleRole = (role: UserRole) => {
    if (roles.includes(role)) {
      if (roles.length > 1) {
        setRoles(roles.filter(r => r !== role));
      }
    } else {
      setRoles([...roles, role]);
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds(prev =>
      prev.includes(projectId) ? prev.filter(pid => pid !== projectId) : [...prev, projectId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProjects.map(p => p.id);
    setSelectedProjectIds(prev => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = new Set(filteredProjects.map(p => p.id));
    setSelectedProjectIds(prev => prev.filter(pid => !filteredIds.has(pid)));
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    updateUser(user.id, {
      name,
      email,
      roles,
      projectIds: selectedProjectIds,
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleToggleStatus = () => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    updateUser(user.id, { status: nextStatus });
  };

  const handleDeleteConfirm = () => {
    deleteUser(user.id);
    setIsDeleteModalOpen(false);
    navigate('/users');
  };

  const assignedProjectsList = projects.filter(p => selectedProjectIds.includes(p.id));
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-4">
      {/* Top back navigation and destructive action */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant={user.status === 'active' ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleStatus}
            className={user.status === 'active' ? 'text-alert-coral hover:bg-alert-coral/10' : 'text-brand-green'}
            icon={user.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          >
            {user.status === 'active' ? 'Disable Account' : 'Enable Account'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-alert-coral hover:bg-alert-coral/10"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete User
          </Button>
        </div>
      </div>

      {/* Header Bar */}
      <HeaderBar
        title={user.name}
        subtitle={user.email}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} />
            <div className="flex items-center gap-1">
              {user.roles.map(r => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-navy/10 dark:bg-white/10 text-brand-navy dark:text-brand-blue border border-brand-navy/15"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        }
        actions={
          <Button variant="coral" size="sm" onClick={handleSave} icon={<Save className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        }
      />

      {/* Success Alert */}
      {isSavedAlert && (
        <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-level2 text-xs text-brand-green font-bold uppercase tracking-wide flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> User account and project assignments updated successfully.
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: User Profile & RBAC (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Profile Card */}
          <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-surface-border">
              <div className="w-12 h-12 rounded-level3 bg-brand-navy dark:bg-seic-blue text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-level1">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold uppercase text-ink-primary font-display truncate">{user.name}</h3>
                <p className="text-xs text-ink-secondary font-mono truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="user-fullname"
                  className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1"
                >
                  Full Name *
                </label>
                <Input
                  id="user-fullname"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="user-email-addr"
                  className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1"
                >
                  Email Address *
                </label>
                <Input
                  id="user-email-addr"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@seic.com"
                  required
                />
              </div>

              {/* Roles Selection */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-2">
                  Role-Based Access Control (RBAC) *
                </span>
                <div className="space-y-2">
                  {allRoles.map(roleItem => {
                    const isChecked = roles.includes(roleItem.id);
                    return (
                      <label
                        key={roleItem.id}
                        onClick={() => toggleRole(roleItem.id)}
                        className={`flex items-start gap-3 p-3 rounded-level2 border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-brand-navy/[0.04] dark:bg-white/[0.04] border-brand-navy/30 dark:border-brand-blue/40 shadow-sm'
                            : 'border-surface-border hover:bg-brand-navy/[0.02] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-brand-navy focus:ring-focus cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-ink-primary uppercase tracking-wide flex items-center gap-1.5">
                            {roleItem.label}
                            {isChecked && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-navy text-white font-bold">
                                Assigned
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-ink-secondary mt-0.5 leading-snug">{roleItem.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Account Metadata / Audit Card */}
          <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary border-b border-surface-border pb-2">
              Account Metadata & Security
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary font-medium">User Identifier:</span>
                <span className="font-mono text-ink-primary font-bold text-[11px]">{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary font-medium">Account Status:</span>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary font-medium">Created On:</span>
                <span className="font-mono text-ink-secondary text-[11px]">{user.createdAt.split('T')[0]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-secondary font-medium">Last Activity:</span>
                <span className="font-mono text-ink-secondary text-[11px]">
                  {user.lastLoginAt ? user.lastLoginAt.replace('T', ' ').slice(0, 16) : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Searchable Project Workspace Assignments (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-4">
            {/* Header & Assignment Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                  Workspace Governance
                </p>
                <h3 className="text-lg font-bold uppercase text-ink-primary font-display mt-0.5">
                  Assigned Projects ({selectedProjectIds.length} of {projects.length})
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2.5 py-1 rounded-level2 text-[10px] font-bold uppercase tracking-wider bg-brand-navy/[0.04] dark:bg-white/5 hover:bg-brand-navy hover:text-white text-brand-navy dark:text-white border border-surface-border transition-colors flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3" /> Select Filtered
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllFiltered}
                  className="px-2.5 py-1 rounded-level2 text-[10px] font-bold uppercase tracking-wider bg-surface hover:bg-alert-coral/10 hover:text-alert-coral text-ink-secondary border border-surface-border transition-colors flex items-center gap-1"
                >
                  <Square className="w-3 h-3" /> Clear Filtered
                </button>
              </div>
            </div>

            {/* Currently Selected Quick Chips */}
            {assignedProjectsList.length > 0 && (
              <div className="p-3 rounded-level2 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary block">
                  Active Project Access:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {assignedProjectsList.map(proj => (
                    <span
                      key={proj.id}
                      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-level1 bg-surface dark:bg-surface-elevated border border-surface-border text-xs text-ink-primary font-medium shadow-sm group"
                    >
                      <FolderKanban className="w-3 h-3 text-brand-navy dark:text-brand-blue flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{proj.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleProject(proj.id)}
                        className="p-0.5 rounded text-ink-muted hover:text-alert-coral hover:bg-alert-coral/10 transition-colors"
                        title={`Remove access to ${proj.name}`}
                        aria-label={`Remove access to ${proj.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Searchable Filter Box */}
            <div className="space-y-2">
              <label
                htmlFor="search-projects-input"
                className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary"
              >
                Search Project Directory ({projects.length} Total Projects)
              </label>
              <SearchInput
                id="search-projects-input"
                value={projectSearchQuery}
                onChange={setProjectSearchQuery}
                placeholder="Filter projects by title or description..."
                className="w-full"
              />
            </div>

            {/* Scrollable Searchable Projects Checklist */}
            <div className="border border-surface-border rounded-level3 overflow-hidden bg-brand-navy/[0.01] divide-y divide-surface-border max-h-[440px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-ink-secondary">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-bold uppercase tracking-wide">No matching projects found</p>
                  <p className="text-[11px] mt-1">Try adjusting your search query "{projectSearchQuery}"</p>
                </div>
              ) : (
                filteredProjects.map(proj => {
                  const isAssigned = selectedProjectIds.includes(proj.id);
                  const linkedArtCount = proj.artifactIds?.length || 0;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => toggleProject(proj.id)}
                      className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                        isAssigned
                          ? 'bg-brand-navy/[0.04] dark:bg-white/[0.04] hover:bg-brand-navy/[0.07]'
                          : 'hover:bg-brand-navy/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}}
                          className="mt-1 rounded text-brand-navy focus:ring-focus cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-ink-primary font-display">{proj.name}</span>
                            <StatusBadge status={proj.status} />
                            {linkedArtCount > 0 && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-secondary px-1.5 py-0.2 rounded bg-surface border border-surface-border">
                                <Cpu className="w-2.5 h-2.5 text-brand-coral" /> {linkedArtCount} artifacts
                              </span>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-[11px] text-ink-secondary line-clamp-1 mt-0.5">{proj.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <Link
                          to={`/projects/${proj.id}`}
                          className="p-1 rounded text-ink-muted hover:text-brand-navy dark:hover:text-white transition-colors"
                          title="Inspect Project Workspace"
                          aria-label={`Inspect ${proj.name}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Save Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-ink-secondary">
                Assigning projects grants the user authorization to view, link, and test pipeline artifacts.
              </span>
              <Button variant="coral" size="sm" onClick={handleSave} icon={<Save className="w-3.5 h-3.5" />}>
                Save Assignments
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm User Deletion"
        subtitle="Permanent administrative action"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-alert-coral/10 border border-alert-coral/20 rounded-level2 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-alert-coral flex-shrink-0 mt-0.5" />
            <div className="text-xs text-ink-primary space-y-1">
              <p className="font-bold">Are you sure you want to permanently delete {user.name}?</p>
              <p className="text-ink-secondary">
                This will remove their account credentials and detach them from {user.projectIds.length} assigned workspace
                projects. Created artifacts will remain safe in the library.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="coral"
              size="sm"
              onClick={handleDeleteConfirm}
              className="bg-alert-coral hover:bg-alert-coral/90 text-white"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
