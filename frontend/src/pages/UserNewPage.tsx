import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { SearchInput } from '../components/atoms/SearchInput';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { ArrowLeft, Save, FolderKanban, Cpu, Search } from 'lucide-react';

export const UserNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { roles, projects, createUser } = usePrototype();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(['developer']);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    if (!projectSearchQuery.trim()) return projects;
    const q = projectSearchQuery.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }, [projects, projectSearchQuery]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.length > 1 ? prev.filter(r => r !== roleId) : prev;
      }
      return [...prev, roleId];
    });
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds(prev => (prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const created = createUser(name, email, selectedRoleIds, selectedProjectIds);
    navigate(`/users/${created.id}`);
  };

  return (
    <div className="space-y-4">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to User & Access Governance
      </Link>

      <HeaderBar
        title="Add Team Member"
        subtitle="Invite a new user, assign RBAC roles, and attach project workspaces."
        actions={
          <Button variant="coral" size="sm" onClick={handleCreate} icon={<Save className="w-3.5 h-3.5" />}>
            Create User
          </Button>
        }
      />

      <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Identity & Roles */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-3.5">
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
              <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-2">
                Role-Based Access Control (RBAC) *
              </span>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {roles.map(r => {
                  const isSelected = selectedRoleIds.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      onClick={() => toggleRole(r.id)}
                      className={`flex items-start gap-3 p-3 rounded-level2 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-navy/[0.04] dark:bg-white/[0.04] border-brand-navy/30 dark:border-brand-blue/40 shadow-sm'
                          : 'border-surface-border hover:bg-brand-navy/[0.02] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-brand-navy focus:ring-focus cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-ink-primary uppercase tracking-wide">{r.name}</div>
                        <div className="text-[11px] text-ink-secondary mt-0.5 leading-snug">{r.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Project Workspace Assignments */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-4">
            <div className="pb-3 border-b border-surface-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">Workspace Governance</p>
              <h3 className="text-lg font-bold uppercase text-ink-primary font-display mt-0.5">
                Assign Projects ({selectedProjectIds.length} of {projects.length})
              </h3>
            </div>

            <div className="space-y-2">
              <label htmlFor="new-user-project-search" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                Search Project Directory ({projects.length} Total Projects)
              </label>
              <SearchInput
                id="new-user-project-search"
                value={projectSearchQuery}
                onChange={setProjectSearchQuery}
                placeholder="Filter projects by title or description..."
                className="w-full"
              />
            </div>

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
                        isAssigned ? 'bg-brand-navy/[0.04] dark:bg-white/[0.04] hover:bg-brand-navy/[0.07]' : 'hover:bg-brand-navy/[0.02]'
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
                          {proj.description && <p className="text-[11px] text-ink-secondary line-clamp-1 mt-0.5">{proj.description}</p>}
                        </div>
                      </div>
                      <FolderKanban className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
