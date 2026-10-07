import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Input } from '../components/atoms/Input';
import { Textarea } from '../components/atoms/Textarea';
import { ArrowLeft, Save, FolderKanban, Cpu, Users, KeyRound, Check } from 'lucide-react';
import type { RolePermissions } from '../../../shared/types';

const DEFAULT_PERMISSIONS: RolePermissions = {
  canAccessProjects: true,
  canAccessArtifacts: true,
  canAccessUsers: false,
  canAccessRoles: false,
  canViewAllProjects: false,
  projectAccessLevel: 'view',
  artifactAccessLevel: 'view',
  canAssignUsersToProjects: false,
  canManageUsers: false,
  canManageRoles: false,
};

const COLOR_OPTIONS = [
  { id: 'coral', label: 'Coral', bg: 'bg-brand-coral/10 text-brand-coral border-brand-coral/30' },
  { id: 'green', label: 'Green', bg: 'bg-brand-green/10 text-brand-green border-brand-green/30' },
  { id: 'blue', label: 'Blue', bg: 'bg-brand-navy/10 text-brand-navy dark:text-brand-blue border-brand-navy/20' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
];

export const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles, createRole, updateRole } = usePrototype();
  const isNew = id === 'new';
  const roleToEdit = isNew ? null : roles.find(r => r.id === id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('coral');
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description);
      setColor(roleToEdit.color || 'blue');
      setPermissions(roleToEdit.permissions);
    }
  }, [roleToEdit?.id]);

  if (!isNew && !roleToEdit) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold uppercase text-ink-primary font-display">Role Not Found</h2>
        <Link to="/users" className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline mt-2 inline-block">
          Return to User & Access Governance
        </Link>
      </div>
    );
  }

  const updatePermission = <K extends keyof RolePermissions>(key: K, value: RolePermissions[K]) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    if (isNew) {
      const created = createRole({ name, description, color, isSystem: false, permissions });
      navigate(`/roles/${created.id}`);
    } else {
      updateRole(roleToEdit!.id, { name, description, color, permissions });
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 2500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to User & Access Governance
      </Link>

      {/* Header Bar */}
      <HeaderBar
        title={isNew ? 'Create Custom Role' : `Edit Role: ${roleToEdit!.name}`}
        subtitle="Configure granular route access, project visibility, artifact authoring rights, and user administration."
        actions={
          <Button variant="coral" size="sm" onClick={handleSave} icon={<Save className="w-3.5 h-3.5" />}>
            {isNew ? 'Create Role' : 'Save Role Changes'}
          </Button>
        }
      />

      {/* Success Alert */}
      {isSavedAlert && (
        <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-level2 text-xs text-brand-green font-bold uppercase tracking-wide flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> Role permissions updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-3.5">
          <div>
            <label htmlFor="role-name" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Role Title *
            </label>
            <Input
              id="role-name"
              type="text"
              required
              placeholder="e.g. Prompt QA Lead"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="role-description" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Role Description *
            </label>
            <Textarea
              id="role-description"
              rows={2}
              required
              placeholder="Summary of responsibilities and scope granted to holders of this role..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1.5">
              Badge Color Accent
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setColor(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    opt.bg
                  } ${color === opt.id ? 'ring-2 ring-focus scale-105 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                >
                  {color === opt.id && <Check className="w-3 h-3" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 1: Page Access */}
        <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-brand-coral" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              1. Navigation &amp; Page Access
            </h4>
          </div>
          <p className="text-[11px] text-ink-secondary">Select which application navigation items and views are visible to this role.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <label className="flex items-center gap-2 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessProjects}
                onChange={e => updatePermission('canAccessProjects', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">Projects &amp; Workspaces</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessArtifacts}
                onChange={e => updatePermission('canAccessArtifacts', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">Artifact Pipelines</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessUsers}
                onChange={e => updatePermission('canAccessUsers', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">User Management</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessRoles}
                onChange={e => updatePermission('canAccessRoles', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">Roles &amp; Governance</span>
            </label>
          </div>
        </div>

        {/* SECTION 2: Project Visibility & Operations */}
        <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-3">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              2. Workspace Project Scope &amp; Permissions
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
              Visibility Scope (Cross-project visibility)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                onClick={() => updatePermission('canViewAllProjects', true)}
                className={`p-2.5 rounded-level2 border cursor-pointer transition-all ${
                  permissions.canViewAllProjects
                    ? 'bg-brand-navy/[0.02] dark:bg-white/[0.02] border-brand-navy dark:border-brand-blue shadow-sm font-bold text-ink-primary'
                    : 'border-surface-border opacity-75 hover:opacity-100 text-ink-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="project-scope"
                    checked={permissions.canViewAllProjects}
                    onChange={() => {}}
                    className="text-brand-navy focus:ring-focus"
                  />
                  <span>All Organization Projects</span>
                </div>
                <p className="text-[10px] font-normal text-ink-secondary mt-1 pl-5">
                  Can browse and inspect all projects across the company even if not assigned.
                </p>
              </label>

              <label
                onClick={() => updatePermission('canViewAllProjects', false)}
                className={`p-2.5 rounded-level2 border cursor-pointer transition-all ${
                  !permissions.canViewAllProjects
                    ? 'bg-brand-navy/[0.02] dark:bg-white/[0.02] border-brand-navy dark:border-brand-blue shadow-sm font-bold text-ink-primary'
                    : 'border-surface-border opacity-75 hover:opacity-100 text-ink-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="project-scope"
                    checked={!permissions.canViewAllProjects}
                    onChange={() => {}}
                    className="text-brand-navy focus:ring-focus"
                  />
                  <span>Assigned Projects Only</span>
                </div>
                <p className="text-[10px] font-normal text-ink-secondary mt-1 pl-5">
                  Strictly limited to projects where the user is an assigned team member.
                </p>
              </label>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
              Project Actions Level
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              {(['none', 'view', 'edit'] as const).map(lvl => (
                <label key={lvl} className="flex items-center gap-1.5 cursor-pointer font-medium text-xs text-ink-primary">
                  <input
                    type="radio"
                    name="project-level"
                    value={lvl}
                    checked={permissions.projectAccessLevel === lvl}
                    onChange={() => updatePermission('projectAccessLevel', lvl)}
                    className="text-brand-navy focus:ring-focus"
                  />
                  <span>{lvl === 'edit' ? 'Full Edit & Create' : lvl === 'view' ? 'Read-Only (View)' : 'Hidden (None)'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: Artifact Pipeline Authoring */}
        <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-coral" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              3. Prompt Pipeline &amp; Schema Permissions
            </h4>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
              Artifact Authoring Level
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              {(['none', 'view', 'edit'] as const).map(lvl => (
                <label key={lvl} className="flex items-center gap-1.5 cursor-pointer font-medium text-xs text-ink-primary">
                  <input
                    type="radio"
                    name="artifact-level"
                    value={lvl}
                    checked={permissions.artifactAccessLevel === lvl}
                    onChange={() => updatePermission('artifactAccessLevel', lvl)}
                    className="text-brand-navy focus:ring-focus"
                  />
                  <span>
                    {lvl === 'edit'
                      ? 'Full Authoring (Edit, Test, Publish)'
                      : lvl === 'view'
                      ? 'Read-Only (Inspect Schemas)'
                      : 'Hidden (None)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: Team Governance & Role Administration */}
        <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              4. User &amp; Administration Privileges
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2.5 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.canAssignUsersToProjects}
                onChange={e => updatePermission('canAssignUsersToProjects', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <div>
                <span className="font-bold text-ink-primary block">Assign Users to Projects</span>
                <span className="text-[10px] text-ink-secondary">Can add or remove team members from workspace projects</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.canManageUsers}
                onChange={e => updatePermission('canManageUsers', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <div>
                <span className="font-bold text-ink-primary block">User Account Management</span>
                <span className="text-[10px] text-ink-secondary">Can invite, edit profiles, toggle active/disabled, and delete user accounts</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-level1 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.canManageRoles}
                onChange={e => updatePermission('canManageRoles', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <div>
                <span className="font-bold text-ink-primary block">Role &amp; Permission Governance</span>
                <span className="text-[10px] text-ink-secondary">Can create, edit permissions, and delete system roles</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" type="button" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button variant="coral" type="submit" icon={<Save className="w-3.5 h-3.5" />}>
            {isNew ? 'Create Role' : 'Save Role Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
