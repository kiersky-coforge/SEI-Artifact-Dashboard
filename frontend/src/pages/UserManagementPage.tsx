import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { SearchInput } from '../components/atoms/SearchInput';
import { DataTable, type ColumnDef } from '../components/organisms/DataTable';
import { RoleEditorModal } from '../components/molecules/RoleEditorModal';
import {
  Plus,
  Users,
  Search,
  Shield,
  Edit,
  Trash2,
  Lock,
  Globe,
} from 'lucide-react';
import type { User, Role } from '../../../shared/types';

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    users,
    projects,
    roles,
    createUser,
    createRole,
    updateRole,
    deleteRole,
  } = usePrototype();

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // New User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>(['developer']);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [modalProjectSearch, setModalProjectSearch] = useState('');

  const filteredModalProjects = useMemo(() => {
    if (!modalProjectSearch.trim()) return projects;
    const q = modalProjectSearch.toLowerCase();
    return projects.filter(
      p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, modalProjectSearch]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;
    const created = createUser(userName, userEmail, selectedUserRoles, selectedProjects);
    setUserName('');
    setUserEmail('');
    setSelectedUserRoles(['developer']);
    setSelectedProjects([]);
    setModalProjectSearch('');
    setIsCreateUserOpen(false);
    navigate(`/users/${created.id}`);
  };

  const handleSaveRole = (roleData: Omit<Role, 'id' | 'createdAt'>, roleId?: string) => {
    if (roleId) {
      updateRole(roleId, roleData);
    } else {
      createRole(roleData);
    }
    setIsRoleEditorOpen(false);
    setEditingRole(null);
  };

  const handleDeleteRoleConfirm = () => {
    if (!deletingRole) return;
    deleteRole(deletingRole.id);
    setDeletingRole(null);
  };

  const userColumns: ColumnDef<User>[] = [
    {
      id: 'user',
      header: 'User & Contact',
      sortValue: user => user.name,
      hideable: false,
      searchable: true,
      searchValue: user => `${user.name} ${user.email}`,
      cellClassName: 'min-w-[200px]',
      render: user => {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        return (
          <Link to={`/users/${user.id}`} className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded">
            <div className="w-9 h-9 rounded-level3 bg-brand-navy dark:bg-seic-blue text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-level1 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-ink-primary text-xs group-hover:text-brand-coral transition-colors font-display">{user.name}</div>
              <div className="text-[11px] text-ink-secondary font-mono mt-0.5">{user.email}</div>
            </div>
          </Link>
        );
      },
    },
    {
      id: 'roles',
      header: 'Assigned Roles',
      filterable: true,
      filter: { type: 'select-list', label: 'Roles', options: roles.map(r => r.name) },
      filterPredicate: (user, val: string[]) => {
        if (val.length === 0) return true;
        return val.some(roleName => {
          const matchedRole = roles.find(r => r.name === roleName);
          return matchedRole && user.roles.includes(matchedRole.id);
        });
      },
      render: user => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map(roleId => {
            const roleObj = roles.find(r => r.id === roleId);
            const roleName = roleObj ? roleObj.name : roleId;
            const isCoral = roleId === 'admin' || roleObj?.color === 'coral';
            const isGreen = roleId === 'author' || roleObj?.color === 'green';
            return (
              <span
                key={roleId}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                  isCoral
                    ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/25'
                    : isGreen
                    ? 'bg-brand-green/10 text-brand-green border-brand-green/25'
                    : 'bg-brand-navy/10 text-brand-navy dark:text-brand-blue border-input'
                }`}
              >
                {roleName}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      id: 'workspaces',
      header: 'Workspaces',
      sortValue: user => (user.projectIds || []).length,
      align: 'center',
      cellClassName: 'tabular-nums',
      render: user => (
        <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
          {(user.projectIds || []).length}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: user => user.status,
      filterable: true,
      filter: { type: 'select-list', label: 'Status', options: ['active', 'disabled'] },
      filterPredicate: (user, val: string[]) => val.length === 0 || val.includes(user.status),
      render: user => <StatusBadge status={user.status} />,
    },
    {
      id: 'lastActivity',
      header: 'Last Activity',
      sortValue: user => user.lastLoginAt || '',
      cellClassName: 'text-ink-secondary font-mono text-[11px] tabular-nums whitespace-nowrap',
      render: user => (user.lastLoginAt ? user.lastLoginAt.split('T')[0] : 'Never'),
    },
  ];

  const roleColumns: ColumnDef<Role>[] = [
    {
      id: 'name',
      header: 'Role & Identity',
      sortValue: role => role.name,
      hideable: false,
      searchable: true,
      searchValue: role => `${role.name} ${role.description}`,
      cellClassName: 'min-w-[220px]',
      render: role => {
        const isCoral = role.color === 'coral' || role.id === 'admin';
        const isGreen = role.color === 'green' || role.id === 'author';
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCoral ? 'bg-brand-coral' : isGreen ? 'bg-brand-green' : 'bg-brand-navy dark:bg-brand-blue'
                }`}
              />
              <span className="font-bold text-ink-primary text-xs font-display">{role.name}</span>
              {role.isSystem && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-brand-navy/10 text-brand-navy dark:text-white border border-brand-navy/15">
                  System
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-secondary line-clamp-1">{role.description}</p>
          </div>
        );
      },
    },
    {
      id: 'users',
      header: 'Active Users',
      sortValue: role => users.filter(u => u.roles.includes(role.id)).length,
      align: 'center',
      cellClassName: 'tabular-nums',
      render: role => {
        const count = users.filter(u => u.roles.includes(role.id)).length;
        return (
          <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
            {count}
          </span>
        );
      },
    },
    {
      id: 'pageAccess',
      header: 'Page Access',
      render: role => {
        const pages = [];
        if (role.permissions.canAccessProjects) pages.push('Projects');
        if (role.permissions.canAccessArtifacts) pages.push('Artifacts');
        if (role.permissions.canAccessUsers) pages.push('Users');
        if (role.permissions.canAccessRoles) pages.push('Roles');

        return (
          <div className="flex flex-wrap gap-1">
            {pages.map(p => (
              <span
                key={p}
                className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-brand-navy/[0.03] dark:bg-white/5 border border-brand-navy/[0.08] text-ink-secondary"
              >
                {p}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'projectScope',
      header: 'Project Scope',
      render: role => (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-primary">
          {role.permissions.canViewAllProjects ? (
            <>
              <Globe className="w-3 h-3 text-brand-green" />
              <span>All Workspaces</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-brand-navy dark:text-brand-blue" />
              <span>Assigned Only</span>
            </>
          )}
        </span>
      ),
    },
    {
      id: 'artifactLevel',
      header: 'Artifact Rights',
      render: role => (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-level1 border ${
            role.permissions.artifactAccessLevel === 'edit'
              ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/25'
              : role.permissions.artifactAccessLevel === 'view'
              ? 'bg-brand-green/10 text-brand-green border-brand-green/25'
              : 'bg-surface-border text-ink-muted'
          }`}
        >
          {role.permissions.artifactAccessLevel === 'edit'
            ? 'Author & Publish'
            : role.permissions.artifactAccessLevel === 'view'
            ? 'Read-Only'
            : 'None'}
        </span>
      ),
    },
    {
      id: 'governance',
      header: 'Governance',
      render: role => {
        const caps = [];
        if (role.permissions.canAssignUsersToProjects) caps.push('Assign Team');
        if (role.permissions.canManageUsers) caps.push('User Admin');
        if (role.permissions.canManageRoles) caps.push('Role Admin');

        if (caps.length === 0) {
          return <span className="text-[11px] text-ink-muted italic">Standard</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {caps.map(c => (
              <span
                key={c}
                className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-brand-navy/[0.04] text-brand-navy dark:text-brand-blue border border-brand-navy/10"
              >
                {c}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      cellClassName: 'whitespace-nowrap',
      render: role => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setEditingRole(role);
              setIsRoleEditorOpen(true);
            }}
            className="p-1.5 rounded-level2 text-ink-secondary hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/[0.05] border border-input transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            title="Edit Role Permissions"
            aria-label={`Edit ${role.name}`}
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          {!role.isSystem && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setDeletingRole(role);
              }}
              className="p-1.5 rounded-level2 text-ink-secondary/60 hover:text-alert-coral hover:bg-alert-coral/10 border border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              title="Delete Role"
              aria-label={`Delete ${role.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        title="User & Access Governance"
        subtitle="Manage team directory, granular RBAC roles, page routing scopes, and workspace assignments."
        actions={
          activeTab === 'users' ? (
            <Button variant="coral" onClick={() => setIsCreateUserOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Add User
            </Button>
          ) : (
            <Button
              variant="coral"
              onClick={() => {
                setEditingRole(null);
                setIsRoleEditorOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Role
            </Button>
          )
        }
      />

      {/* Tab Switcher (Stratos Style) */}
      <div className="flex items-center gap-1.5 p-1 bg-brand-navy/[0.04] dark:bg-white/[0.04] rounded-level3 w-fit border border-surface-border">
        <button
          onClick={() => setActiveTab('users')}
          aria-current={activeTab === 'users' ? 'true' : undefined}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-level2 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
            activeTab === 'users'
              ? 'bg-brand-navy text-white shadow-level1'
              : 'text-ink-secondary hover:text-brand-navy hover:bg-brand-navy/5 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Directory ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          aria-current={activeTab === 'roles' ? 'true' : undefined}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-level2 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
            activeTab === 'roles'
              ? 'bg-brand-navy text-white shadow-level1'
              : 'text-ink-secondary hover:text-brand-navy hover:bg-brand-navy/5 dark:hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Roles & Permissions ({roles.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <DataTable<User>
          columns={userColumns}
          data={users}
          getRowKey={user => user.id}
          onRowClick={user => navigate(`/users/${user.id}`)}
          emptyState={
            <>
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-secondary" />
              <p className="font-bold uppercase tracking-wide text-xs">No team members yet</p>
            </>
          }
        />
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <DataTable<Role>
          columns={roleColumns}
          data={roles}
          getRowKey={role => role.id}
          onRowClick={role => {
            setEditingRole(role);
            setIsRoleEditorOpen(true);
          }}
          emptyState={
            <>
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-secondary" />
              <p className="font-bold uppercase tracking-wide text-xs">No roles defined</p>
            </>
          }
        />
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Add Team Member"
        subtitle="Invite a new user, assign RBAC permissions, and attach project workspaces."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="new-user-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Full Name *
            </label>
            <Input
              id="new-user-name"
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="new-user-email" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Email Address *
            </label>
            <Input
              id="new-user-email"
              type="email"
              required
              placeholder="jordan.miller@seic.com"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1.5">
              Assigned Roles *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {roles.map(r => {
                const isSelected = selectedUserRoles.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-level2 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-navy/[0.04] border-brand-navy dark:border-white/30'
                        : 'border-surface-border hover:bg-brand-navy/[0.02]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedUserRoles([...selectedUserRoles, r.id]);
                        } else {
                          if (selectedUserRoles.length > 1) {
                            setSelectedUserRoles(selectedUserRoles.filter(id => id !== r.id));
                          }
                        }
                      }}
                      className="mt-0.5 rounded border-input text-brand-navy focus:ring-focus"
                    />
                    <div>
                      <div className="font-bold text-xs text-ink-primary uppercase">{r.name}</div>
                      <div className="text-[11px] text-ink-secondary font-normal">{r.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                Assign Projects ({selectedProjects.length} selected)
              </label>
              {projects.length > 4 && (
                <span className="text-[10px] font-mono text-ink-secondary">
                  {filteredModalProjects.length} matches
                </span>
              )}
            </div>

            {projects.length > 4 && (
              <div className="mb-2">
                <SearchInput
                  value={modalProjectSearch}
                  onChange={setModalProjectSearch}
                  placeholder="Filter projects..."
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-surface-border rounded-level2 p-2 bg-brand-navy/[0.02]">
              {filteredModalProjects.length === 0 ? (
                <div className="p-4 text-center text-xs text-ink-secondary">
                  <Search className="w-4 h-4 mx-auto mb-1 opacity-50" />
                  No projects match "{modalProjectSearch}"
                </div>
              ) : (
                filteredModalProjects.map(p => (
                  <label
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-level1 hover:bg-surface-hover cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedProjects([...selectedProjects, p.id]);
                          } else {
                            setSelectedProjects(selectedProjects.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded border-input text-brand-navy focus:ring-focus"
                      />
                      <span className="font-bold text-ink-primary truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink-secondary flex-shrink-0">
                      {p.artifactIds?.length || 0} artifacts
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsCreateUserOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Create & Manage
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Editor Modal */}
      <RoleEditorModal
        isOpen={isRoleEditorOpen}
        onClose={() => {
          setIsRoleEditorOpen(false);
          setEditingRole(null);
        }}
        roleToEdit={editingRole}
        onSave={handleSaveRole}
      />

      {/* Delete Role Confirmation Modal */}
      <Modal
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        title="Confirm Role Deletion"
        subtitle={`Remove role "${deletingRole?.name}"`}
      >
        {deletingRole && (
          <div className="space-y-4">
            <p className="text-xs text-ink-secondary">
              Are you sure you want to permanently delete the role{' '}
              <strong className="text-ink-primary">{deletingRole.name}</strong>?
            </p>
            {users.filter(u => u.roles.includes(deletingRole.id)).length > 0 && (
              <div className="p-3 bg-alert-coral/10 border border-alert-coral/20 rounded-level2 text-xs text-ink-primary space-y-1">
                <p className="font-bold text-alert-coral">Active User Impact:</p>
                <p>
                  This role is currently assigned to{' '}
                  <strong>{users.filter(u => u.roles.includes(deletingRole.id)).length} user(s)</strong>. Deleting it will
                  automatically remove this role from their accounts.
                </p>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-border">
              <Button variant="secondary" onClick={() => setDeletingRole(null)}>
                Cancel
              </Button>
              <Button
                variant="coral"
                onClick={handleDeleteRoleConfirm}
                className="bg-alert-coral hover:bg-alert-coral/90 text-white"
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
