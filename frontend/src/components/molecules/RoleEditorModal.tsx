import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import {
  FolderKanban,
  Cpu,
  Users,
  KeyRound,
  Check,
} from 'lucide-react';
import type { Role, RolePermissions } from '../../../../shared/types';

interface RoleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit: Role | null;
  onSave: (roleData: Omit<Role, 'id' | 'createdAt'>, roleId?: string) => void;
}

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

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('coral');
  const [permissions, setPermissions] = useState<RolePermissions>(DEFAULT_PERMISSIONS);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description);
      setColor(roleToEdit.color || 'blue');
      setPermissions(roleToEdit.permissions);
    } else {
      setName('');
      setDescription('');
      setColor('blue');
      setPermissions(DEFAULT_PERMISSIONS);
    }
  }, [roleToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name,
        description,
        color,
        isSystem: roleToEdit?.isSystem ?? false,
        permissions,
      },
      roleToEdit?.id
    );
    onClose();
  };

  const updatePermission = <K extends keyof RolePermissions>(key: K, value: RolePermissions[K]) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roleToEdit ? `Edit Role: ${roleToEdit.name}` : 'Create Custom Role'}
      subtitle="Configure granular route access, project visibility, artifact authoring rights, and user administration."
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Basic Info */}
        <div className="space-y-3">
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
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setColor(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
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
        <div className="p-3.5 rounded-level3 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border space-y-2.5">
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-brand-coral" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              1. Navigation & Page Access
            </h4>
          </div>
          <p className="text-[11px] text-ink-secondary">Select which application navigation items and views are visible to this role.</p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <label className="flex items-center gap-2 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessProjects}
                onChange={e => updatePermission('canAccessProjects', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">Projects & Workspaces</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessArtifacts}
                onChange={e => updatePermission('canAccessArtifacts', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">Artifact Pipelines</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessUsers}
                onChange={e => updatePermission('canAccessUsers', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">User Management</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={permissions.canAccessRoles}
                onChange={e => updatePermission('canAccessRoles', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <span className="font-bold text-ink-primary">Roles & Governance</span>
            </label>
          </div>
        </div>

        {/* SECTION 2: Project Visibility & Operations */}
        <div className="p-3.5 rounded-level3 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border space-y-3">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              2. Workspace Project Scope & Permissions
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
                    ? 'bg-surface border-brand-navy dark:border-brand-blue shadow-sm font-bold text-ink-primary'
                    : 'bg-surface/50 border-surface-border opacity-75 hover:opacity-100 text-ink-secondary'
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
                    ? 'bg-surface border-brand-navy dark:border-brand-blue shadow-sm font-bold text-ink-primary'
                    : 'bg-surface/50 border-surface-border opacity-75 hover:opacity-100 text-ink-secondary'
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
            <div className="flex items-center gap-3">
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
                  <span className="capitalize">{lvl === 'edit' ? 'Full Edit & Create' : lvl === 'view' ? 'Read-Only (View)' : 'Hidden (None)'}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: Artifact Pipeline Authoring */}
        <div className="p-3.5 rounded-level3 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-coral" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              3. Prompt Pipeline & Schema Permissions
            </h4>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
              Artifact Authoring Level
            </span>
            <div className="flex items-center gap-3 flex-wrap">
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
                  <span className="capitalize">
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
        <div className="p-3.5 rounded-level3 bg-brand-navy/[0.02] dark:bg-white/[0.02] border border-surface-border space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-primary font-display">
              4. User & Administration Privileges
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2.5 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer">
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

            <label className="flex items-center gap-2.5 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer">
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

            <label className="flex items-center gap-2.5 p-2 rounded-level1 bg-surface border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.canManageRoles}
                onChange={e => updatePermission('canManageRoles', e.target.checked)}
                className="rounded text-brand-navy focus:ring-focus"
              />
              <div>
                <span className="font-bold text-ink-primary block">Role & Permission Governance</span>
                <span className="text-[10px] text-ink-secondary">Can create, edit permissions, and delete system roles</span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="coral" type="submit">
            {roleToEdit ? 'Save Role Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
