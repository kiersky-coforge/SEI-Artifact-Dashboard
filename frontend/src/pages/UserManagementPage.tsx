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
import {
  Plus,
  FolderKanban,
  Users,
  ChevronRight,
  Search,
} from 'lucide-react';
import type { User, UserRole } from '../../../shared/types';

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, projects, createUser } = usePrototype();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['developer']);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [modalProjectSearch, setModalProjectSearch] = useState('');

  const filteredModalProjects = useMemo(() => {
    if (!modalProjectSearch.trim()) return projects;
    const q = modalProjectSearch.toLowerCase();
    return projects.filter(
      p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, modalProjectSearch]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const created = createUser(name, email, selectedRoles, selectedProjects);
    setName('');
    setEmail('');
    setSelectedRoles(['developer']);
    setSelectedProjects([]);
    setModalProjectSearch('');
    setIsCreateOpen(false);
    navigate(`/users/${created.id}`);
  };

  const allRoles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'admin', label: 'Admin', desc: 'Full system management and user governance' },
    { id: 'author', label: 'Prompt Author', desc: 'Can author, edit, validate, and publish artifacts' },
    { id: 'developer', label: 'Developer', desc: 'Can create projects and consume published schemas' },
  ];

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
              <div className="font-bold text-ink-primary text-xs group-hover:text-brand-coral transition-colors">{user.name}</div>
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
      filter: { type: 'select-list', label: 'Roles', options: ['admin', 'author', 'developer'] },
      filterPredicate: (user, val: string[]) => val.length === 0 || val.some(r => user.roles.includes(r as UserRole)),
      render: user => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
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
      id: 'workspaces',
      header: 'Workspace Assignments',
      render: user => {
        const assignedProjs = projects.filter(p => user.projectIds.includes(p.id));
        return (
          <div className="flex flex-wrap gap-1 max-w-[240px]">
            {assignedProjs.length === 0 ? (
              <span className="text-ink-secondary text-[11px] italic">No projects assigned</span>
            ) : (
              assignedProjs.map(p => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-level1 bg-brand-navy/[0.03] dark:bg-white/5 text-ink-primary border border-brand-navy/[0.06] truncate max-w-[140px]"
                  title={p.name}
                >
                  <FolderKanban className="w-2.5 h-2.5 text-brand-navy dark:text-brand-blue" />
                  <span className="truncate">{p.name}</span>
                </span>
              ))
            )}
          </div>
        );
      },
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
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      cellClassName: 'whitespace-nowrap',
      render: user => (
        <div className="flex items-center justify-end">
          <Link
            to={`/users/${user.id}`}
            className="px-3 py-1.5 rounded-level2 bg-brand-navy/[0.04] dark:bg-white/5 hover:bg-brand-navy hover:text-white text-brand-navy dark:text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <HeaderBar
        title="User Management"
        subtitle="Manage team accounts, role-based permissions, and workspace project assignments."
        actions={
          <Button variant="coral" onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add User
          </Button>
        }
      />

      {/* Users Table */}
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

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Team Member"
        subtitle="Invite a new user, assign RBAC permissions, and attach project workspaces."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="new-user-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Full Name *
            </label>
            <Input
              id="new-user-name"
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={name}
              onChange={e => setName(e.target.value)}
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
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1.5">
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
                        : 'border-surface-border hover:bg-brand-navy/[0.02]'
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
                      className="mt-0.5 rounded border-input text-brand-navy focus:ring-focus"
                    />
                    <div>
                      <div className="font-bold text-xs text-ink-primary uppercase">{r.label}</div>
                      <div className="text-[11px] text-ink-secondary font-normal">{r.desc}</div>
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
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="coral" type="submit">
              Create & Manage
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
