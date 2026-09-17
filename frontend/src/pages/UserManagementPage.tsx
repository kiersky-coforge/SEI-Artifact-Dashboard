import React, { useState } from 'react';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { StatCard } from '../components/molecules/StatCard';
import { SearchInput } from '../components/atoms/SearchInput';
import { FilterChip } from '../components/atoms/FilterChip';
import { Plus, UserX, UserCheck, Trash2, Edit, FolderKanban, ShieldCheck, Users, UserCog } from 'lucide-react';
import type { User, UserRole } from '../../../shared/types';

export const UserManagementPage: React.FC = () => {
  const { users, projects, createUser, updateUser, deleteUser } = usePrototype();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['developer']);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.roles.includes('admin')).length;
  const authorCount = users.filter(u => u.roles.includes('author')).length;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    createUser(name, email, selectedRoles, selectedProjects);
    setName('');
    setEmail('');
    setSelectedRoles(['developer']);
    setSelectedProjects([]);
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setSelectedRoles(user.roles);
    setSelectedProjects(user.projectIds);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, {
      name,
      email,
      roles: selectedRoles,
      projectIds: selectedProjects,
    });
    setEditingUser(null);
  };

  const handleToggleStatus = (user: User) => {
    updateUser(user.id, {
      status: user.status === 'active' ? 'disabled' : 'active',
    });
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      deleteUser(user.id);
    }
  };

  const allRoles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'admin', label: 'Admin', desc: 'Full system management and user governance' },
    { id: 'author', label: 'Prompt Author', desc: 'Can author, edit, validate, and publish artifacts' },
    { id: 'developer', label: 'Developer', desc: 'Can create projects and consume published schemas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <HeaderBar
        kicker="Governance & Access Control"
        title="User Management"
        subtitle="Manage team accounts, role-based permissions, and workspace project assignments."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add User
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Users"
          value={activeUsersCount}
          subtitle={`${users.length - activeUsersCount} disabled`}
          icon={<Users className="w-4 h-4" />}
          delta="Authenticated"
          deltaType="positive"
        />
        <StatCard
          title="System Administrators"
          value={adminCount}
          subtitle="Full governance rights"
          icon={<ShieldCheck className="w-4 h-4 text-brand-coral" />}
          delta="Governance"
          deltaType="neutral"
        />
        <StatCard
          title="Prompt Authors"
          value={authorCount}
          subtitle="Pipeline & Schema Creators"
          icon={<UserCog className="w-4 h-4 text-action-primary" />}
          delta="Active Creators"
          deltaType="positive"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface rounded-level2 border border-surface-border shadow-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter users by name or email..."
        />

        <div className="flex items-center gap-2">
          <FilterChip
            label="All Roles"
            count={users.length}
            active={roleFilter === 'all'}
            onClick={() => setRoleFilter('all')}
          />
          <FilterChip
            label="Admin"
            count={adminCount}
            active={roleFilter === 'admin'}
            onClick={() => setRoleFilter('admin')}
          />
          <FilterChip
            label="Author"
            count={authorCount}
            active={roleFilter === 'author'}
            onClick={() => setRoleFilter('author')}
          />
          <FilterChip
            label="Developer"
            count={users.filter(u => u.roles.includes('developer')).length}
            active={roleFilter === 'developer'}
            onClick={() => setRoleFilter('developer')}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-level2 border border-surface-border bg-surface overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-surface-border bg-surface-hover/50 text-ink-muted uppercase font-bold text-[10px] tracking-wider">
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Roles</th>
              <th className="py-3.5 px-4">Assigned Projects</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Last Login</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredUsers.map(user => {
              const assignedProjs = projects.filter(p => user.projectIds.includes(p.id));
              return (
                <tr key={user.id} className="hover:bg-surface-hover/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-ink-primary">{user.name}</div>
                    <div className="text-[11px] text-ink-muted font-mono">{user.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span
                          key={role}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-navy/5 dark:bg-white/5 border border-brand-navy/15 dark:border-white/15 text-brand-navy dark:text-action-primary"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {assignedProjs.length === 0 ? (
                        <span className="text-ink-muted text-[11px]">None</span>
                      ) : (
                        assignedProjs.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-action-primary/5 text-ink-secondary border border-action-primary/20"
                          >
                            <FolderKanban className="w-2.5 h-2.5 text-action-primary" />
                            {p.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={user.status} />
                  </td>

                  <td className="py-3.5 px-4 text-ink-muted text-[11px] font-mono">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-level1 text-ink-muted hover:text-ink-primary hover:bg-surface-hover"
                        title="Edit Roles & Projects"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded-level1 hover:bg-surface-hover ${
                          user.status === 'active'
                            ? 'text-status-warning-text'
                            : 'text-status-success-text'
                        }`}
                        title={user.status === 'active' ? 'Disable Account' : 'Enable Account'}
                      >
                        {user.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1.5 rounded-level1 text-ink-muted hover:text-status-error-text hover:bg-status-error/10"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Team Member"
        description="Invite a new user with specific role permissions and project access."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || !email.trim()}>
              Create User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rachel Adams"
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="rachel.adams@seic.com"
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Roles
            </label>
            <div className="space-y-1.5">
              {allRoles.map(r => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 p-2 rounded-level1 border border-surface-border hover:bg-surface-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, r.id]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(role => role !== r.id));
                      }
                    }}
                    className="rounded border-input text-action-primary focus:ring-focus"
                  />
                  <div>
                    <span className="text-xs font-bold text-ink-primary">{r.label}</span>
                    <span className="text-[11px] text-ink-muted ml-2">{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Project Assignments
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 border border-surface-border rounded-level1 p-2">
              {projects.map(p => (
                <label key={p.id} className="flex items-center gap-2 p-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(p.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedProjects([...selectedProjects, p.id]);
                      } else {
                        setSelectedProjects(selectedProjects.filter(pid => pid !== p.id));
                      }
                    }}
                    className="rounded border-input text-action-primary focus:ring-focus"
                  />
                  <span className="font-medium">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.name}`}
        description="Update roles and assigned project associations."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-level1 border border-input bg-surface text-ink-primary"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Roles
            </label>
            <div className="space-y-1.5">
              {allRoles.map(r => (
                <label key={r.id} className="flex items-center gap-2 p-2 rounded-level1 border border-surface-border cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, r.id]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(role => role !== r.id));
                      }
                    }}
                    className="rounded border-input text-action-primary focus:ring-focus"
                  />
                  <span className="text-xs font-bold text-ink-primary">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-ink-primary mb-1.5">
              Assigned Projects
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 border border-surface-border rounded-level1 p-2">
              {projects.map(p => (
                <label key={p.id} className="flex items-center gap-2 p-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(p.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedProjects([...selectedProjects, p.id]);
                      } else {
                        setSelectedProjects(selectedProjects.filter(pid => pid !== p.id));
                      }
                    }}
                    className="rounded border-input text-action-primary focus:ring-focus"
                  />
                  <span className="font-medium">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
