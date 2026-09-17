import React, { useState } from 'react';
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
  UserX,
  UserCheck,
  Trash2,
  Edit,
  FolderKanban,
  ShieldCheck,
  Users,
  UserCog,
} from 'lucide-react';
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
  const devCount = users.filter(u => u.roles.includes('developer')).length;

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
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        kicker="Governance & Access Control"
        title="User Management"
        subtitle="Manage team accounts, role-based permissions, and workspace project assignments."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add User
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Active Users"
          value={activeUsersCount}
          subtitle={`${users.length - activeUsersCount} disabled`}
          icon={<Users className="w-4 h-4 text-brand-navy dark:text-brand-blue" />}
          delta="100% Active"
          deltaType="positive"
        />
        <StatCard
          title="System Admins"
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
          icon={<UserCog className="w-4 h-4 text-brand-green" />}
          delta="Active Authors"
          deltaType="positive"
        />
        <StatCard
          title="Integration Devs"
          value={devCount}
          subtitle="Workspace Consumers"
          icon={<FolderKanban className="w-4 h-4 text-brand-blue" />}
          delta="Developers"
          deltaType="positive"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-level3 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter team members by name or email..."
        />

        <div className="flex flex-wrap items-center gap-2">
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
            count={devCount}
            active={roleFilter === 'developer'}
            onClick={() => setRoleFilter('developer')}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-grey bg-brand-navy/[0.02] dark:bg-white/[0.02]">
                <th className="py-3.5 px-4">User & Contact</th>
                <th className="py-3.5 px-4">Assigned Roles</th>
                <th className="py-3.5 px-4">Workspace Assignments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-grey">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-grey" />
                    <p className="font-bold uppercase tracking-wide text-xs">No team members match the search criteria</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const assignedProjs = projects.filter(p => user.projectIds.includes(p.id));
                  const initials = user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-brand-navy/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      {/* Name, Avatar & Email */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-level3 bg-brand-navy dark:bg-seic-blue text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-level1">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-brand-black dark:text-white text-xs">{user.name}</div>
                            <div className="text-[11px] text-brand-grey font-mono mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span
                              key={role}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                role === 'admin'
                                  ? 'bg-brand-coral/10 text-brand-coral border-brand-coral/25'
                                  : role === 'author'
                                  ? 'bg-brand-green/10 text-brand-green border-brand-green/25'
                                  : 'bg-brand-navy/10 text-brand-navy dark:text-brand-blue border-brand-navy/20 dark:border-white/15'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Assigned Projects */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {assignedProjs.length === 0 ? (
                            <span className="text-brand-grey text-[11px] italic">No projects assigned</span>
                          ) : (
                            assignedProjs.map(p => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-level1 bg-brand-navy/[0.03] dark:bg-white/5 text-brand-black dark:text-white border border-brand-navy/[0.06] truncate max-w-[140px]"
                                title={p.name}
                              >
                                <FolderKanban className="w-2.5 h-2.5 text-brand-navy dark:text-brand-blue" />
                                <span className="truncate">{p.name}</span>
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Last Activity */}
                      <td className="py-4 px-4 text-brand-grey font-mono text-[11px] tabular-nums whitespace-nowrap">
                        {user.lastLoginAt ? user.lastLoginAt.split('T')[0] : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-level2 text-brand-grey hover:text-brand-navy dark:hover:text-white hover:bg-brand-navy/[0.05] border border-brand-navy/10 dark:border-white/10 transition-colors"
                            title="Edit Roles & Projects"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-level2 border border-brand-navy/10 dark:border-white/10 hover:bg-brand-navy/[0.05] transition-colors ${
                              user.status === 'active'
                                ? 'text-brand-coral hover:text-alert-coral'
                                : 'text-brand-green hover:text-brand-green/80'
                            }`}
                            title={user.status === 'active' ? 'Disable User' : 'Enable User'}
                          >
                            {user.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-level2 text-brand-grey/60 hover:text-alert-coral hover:bg-alert-coral/10 border border-transparent transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Team Member"
        subtitle="Invite a new user, assign RBAC permissions, and attach project workspaces."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="jordan.miller@seic.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1.5">
              Assigned Roles *
            </label>
            <div className="space-y-2">
              {allRoles.map(r => {
                const isSelected = selectedRoles.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-level2 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-navy/[0.04] border-brand-navy dark:border-white/30'
                        : 'border-brand-navy/[0.08] dark:border-white/10 hover:bg-brand-navy/[0.02]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, r.id]);
                        } else {
                          if (selectedRoles.length > 1) {
                            setSelectedRoles(selectedRoles.filter(id => id !== r.id));
                          }
                        }
                      }}
                      className="mt-0.5 rounded border-brand-navy/20 text-brand-navy focus:ring-brand-navy"
                    />
                    <div>
                      <div className="font-bold text-xs text-brand-black dark:text-white uppercase">{r.label}</div>
                      <div className="text-[11px] text-brand-grey font-normal">{r.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1.5">
              Assign Projects
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-brand-navy/[0.08] dark:border-white/10 rounded-level2 p-2 bg-brand-navy/[0.02]">
              {projects.map(p => (
                <label
                  key={p.id}
                  className="flex items-center gap-2.5 p-1.5 rounded-level1 hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                >
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
                    className="rounded border-brand-navy/20 text-brand-navy focus:ring-brand-navy"
                  />
                  <span className="font-bold text-brand-black dark:text-white">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Permissions"
        subtitle={`Update roles and project access for ${editingUser?.name}.`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1.5">
              Assigned Roles *
            </label>
            <div className="space-y-2">
              {allRoles.map(r => {
                const isSelected = selectedRoles.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-level2 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-navy/[0.04] border-brand-navy dark:border-white/30'
                        : 'border-brand-navy/[0.08] dark:border-white/10 hover:bg-brand-navy/[0.02]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, r.id]);
                        } else {
                          if (selectedRoles.length > 1) {
                            setSelectedRoles(selectedRoles.filter(id => id !== r.id));
                          }
                        }
                      }}
                      className="mt-0.5 rounded border-brand-navy/20 text-brand-navy focus:ring-brand-navy"
                    />
                    <div>
                      <div className="font-bold text-xs text-brand-black dark:text-white uppercase">{r.label}</div>
                      <div className="text-[11px] text-brand-grey font-normal">{r.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1.5">
              Project Assignments
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-brand-navy/[0.08] dark:border-white/10 rounded-level2 p-2 bg-brand-navy/[0.02]">
              {projects.map(p => (
                <label
                  key={p.id}
                  className="flex items-center gap-2.5 p-1.5 rounded-level1 hover:bg-white dark:hover:bg-slate-800 cursor-pointer text-xs transition-colors"
                >
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
                    className="rounded border-brand-navy/20 text-brand-navy focus:ring-brand-navy"
                  />
                  <span className="font-bold text-brand-black dark:text-white">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
            <Button variant="secondary" onClick={() => setEditingUser(null)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
