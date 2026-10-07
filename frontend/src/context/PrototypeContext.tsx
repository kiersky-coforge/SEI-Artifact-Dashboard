import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Artifact, Project, User, Role, PersonaType, ValidationState, ValidationErrorItem, ArtifactVersionSnapshot } from '../../../shared/types';
import { SEED_ARTIFACTS, SEED_PROJECTS, SEED_USERS, SEED_ROLES } from '../../../shared/seed';

interface PrototypeContextType {
  persona: PersonaType;
  switchPersona: (p: PersonaType) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Projects
  projects: Project[];
  createProject: (name: string, description: string, artifactIds?: string[]) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  attachArtifactToProject: (projectId: string, artifactId: string) => void;
  linkArtifactToProject: (projectId: string, artifactId: string) => void;
  
  // Artifacts
  artifacts: Artifact[];
  createArtifact: (name: string, description: string, initialProjectId?: string) => Artifact;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  publishArtifactVersion: (id: string, changelog?: string) => void;
  createDraftVersion: (id: string) => void;
  revertArtifactVersion: (id: string, targetVersion: string) => void;
  deleteArtifact: (id: string) => void;
  validateArtifact: (id: string) => ValidationState;
  
  // Users
  users: User[];
  createUser: (name: string, email: string, roles: User['roles'], projectIds: string[]) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  assignUserToProject: (projectId: string, userId: string) => void;
  detachUserFromProject: (projectId: string, userId: string) => void;
  setUserProjects: (userId: string, projectIds: string[]) => void;
  setProjectUsers: (projectId: string, userIds: string[]) => void;

  // Roles & Permissions
  roles: Role[];
  createRole: (roleData: Omit<Role, 'id' | 'createdAt'>) => Role;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  
  // Reset
  resetData: () => void;
}

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: 'sei_artifact_dash_projects',
  ARTIFACTS: 'sei_artifact_dash_artifacts',
  USERS: 'sei_artifact_dash_users',
  ROLES: 'sei_artifact_dash_roles',
  DARK_MODE: 'sei_artifact_dash_darkmode',
};

export const PrototypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persona, setPersona] = useState<PersonaType>('admin');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : SEED_PROJECTS;
  });

  const [artifacts, setArtifacts] = useState<Artifact[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARTIFACTS);
    return saved ? JSON.parse(saved) : SEED_ARTIFACTS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLES);
    return saved ? JSON.parse(saved) : SEED_ROLES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(artifacts));
  }, [artifacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const switchPersona = (p: PersonaType) => setPersona(p);

  const resetData = () => {
    setProjects(SEED_PROJECTS);
    setArtifacts(SEED_ARTIFACTS);
    setUsers(SEED_USERS);
    setRoles(SEED_ROLES);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.ARTIFACTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ROLES);
  };

  // Project Actions
  const createProject = (name: string, description: string, artifactIds: string[] = []): Project => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      status: 'active',
      artifactIds,
      userIds: [users[0]?.id || 'usr-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [newProj, ...prev]);

    if (artifactIds.length > 0) {
      setArtifacts(prev =>
        prev.map(art =>
          artifactIds.includes(art.id)
            ? { ...art, projectIds: Array.from(new Set([...art.projectIds, newProj.id])) }
            : art
        )
      );
    }
    return newProj;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setArtifacts(prev =>
      prev
        .map(a => ({ ...a, projectIds: a.projectIds.filter(pid => pid !== id) }))
        .filter(a => a.projectIds.length > 0)
    );
    setUsers(prev =>
      prev.map(u => ({
        ...u,
        projectIds: u.projectIds.filter(pid => pid !== id),
      }))
    );
  };

  const attachArtifactToProject = (projectId: string, artifactId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId && !p.artifactIds.includes(artifactId)
          ? { ...p, artifactIds: [...p.artifactIds, artifactId], updatedAt: new Date().toISOString() }
          : p
      )
    );
    setArtifacts(prev =>
      prev.map(a =>
        a.id === artifactId && !a.projectIds.includes(projectId)
          ? { ...a, projectIds: [...a.projectIds, projectId], updatedAt: new Date().toISOString() }
          : a
      )
    );
  };

  // Artifact Actions
  const createArtifact = (name: string, description: string, initialProjectId?: string): Artifact => {
    const currentUser = users.find(u => u.roles.includes(persona)) || users[0];
    const newArt: Artifact = {
      id: `art-${Date.now()}`,
      name,
      description,
      status: 'draft',
      currentVersion: 'v0.1.0-draft',
      projectIds: initialProjectId ? [initialProjectId] : [],
      createdAt: new Date().toISOString(),
      createdBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
      updatedAt: new Date().toISOString(),
      updatedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
      stage1Prompt: 'Enter Stage 1 Extraction Prompt here...',
      stage2Prompt: 'Enter Stage 2 Refinement / Normalization Prompt here...',
      jsonSchema: '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": {}\n}',
      fewShotExamples: [],
      versions: [],
      validationState: {
        isValid: true,
        errors: [],
        warnings: ['New draft artifact has not been validated yet.'],
        lastValidatedAt: new Date().toISOString()
      }
    };

    setArtifacts(prev => [newArt, ...prev]);

    if (initialProjectId) {
      setProjects(prev =>
        prev.map(p =>
          p.id === initialProjectId
            ? { ...p, artifactIds: [...p.artifactIds, newArt.id], updatedAt: new Date().toISOString() }
            : p
        )
      );
    }
    return newArt;
  };

  const getNextDraftVersion = (currentVersion: string, versions: ArtifactVersionSnapshot[] = []): string => {
    if (currentVersion.endsWith('-draft')) {
      return currentVersion;
    }
    const match = currentVersion.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      return `v${major}.${minor + 1}.0-draft`;
    }
    return `v${versions.length + 1}.0.0-draft`;
  };

  const updateArtifact = (id: string, updates: Partial<Artifact>) => {
    const currentUser = users.find(u => u.roles.includes(persona)) || users[0];
    setArtifacts(prev =>
      prev.map(a => {
        if (a.id !== id) return a;

        let newStatus = updates.status !== undefined ? updates.status : a.status;
        let newVersion = updates.currentVersion !== undefined ? updates.currentVersion : a.currentVersion;

        // Check if pipeline content was changed
        const hasContentUpdates =
          (updates.stage1Prompt !== undefined && updates.stage1Prompt !== a.stage1Prompt) ||
          (updates.stage2Prompt !== undefined && updates.stage2Prompt !== a.stage2Prompt) ||
          (updates.jsonSchema !== undefined && updates.jsonSchema !== a.jsonSchema) ||
          (updates.fewShotExamples !== undefined && JSON.stringify(updates.fewShotExamples) !== JSON.stringify(a.fewShotExamples));

        // If making edits to a published artifact, automatically fork into draft mode with next draft version
        if (hasContentUpdates && a.status === 'published' && updates.status === undefined) {
          newStatus = 'draft';
          newVersion = getNextDraftVersion(a.currentVersion, a.versions);
        }

        return {
          ...a,
          ...updates,
          status: newStatus,
          currentVersion: newVersion,
          updatedAt: new Date().toISOString(),
          updatedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
        };
      })
    );
  };

  const validateArtifact = (id: string): ValidationState => {
    const target = artifacts.find(a => a.id === id);
    if (!target) return { isValid: false, errors: [], warnings: ['Artifact not found'] };

    const errors: ValidationErrorItem[] = [];
    const warnings: string[] = [];

    if (!target.stage1Prompt || target.stage1Prompt.trim().length < 10) {
      errors.push({
        field: 'stage1Prompt',
        message: 'Stage 1 Extraction Prompt is empty or too short (minimum 10 characters).',
        severity: 'error'
      });
    }

    if (!target.stage2Prompt || target.stage2Prompt.trim().length < 10) {
      errors.push({
        field: 'stage2Prompt',
        message: 'Stage 2 Refinement Prompt is empty or too short (minimum 10 characters).',
        severity: 'error'
      });
    }

    try {
      const parsedSchema = JSON.parse(target.jsonSchema);
      if (!parsedSchema || typeof parsedSchema !== 'object') {
        errors.push({
          field: 'jsonSchema',
          message: 'JSON Schema must be a valid JSON object.',
          severity: 'error'
        });
      } else if (!parsedSchema.type && !parsedSchema.properties) {
        warnings.push('JSON Schema is missing top-level "type" or "properties" definition.');
      }
    } catch (e: any) {
      errors.push({
        field: 'jsonSchema',
        message: `JSON Schema syntax error: ${e.message}`,
        severity: 'error'
      });
    }

    if (!target.fewShotExamples || target.fewShotExamples.length === 0) {
      warnings.push('No few-shot calibration examples registered. Adding at least 1 example improves extraction accuracy.');
    }

    const state: ValidationState = {
      isValid: errors.length === 0,
      errors,
      warnings,
      lastValidatedAt: new Date().toISOString()
    };

    updateArtifact(id, { validationState: state });
    return state;
  };

  const publishArtifactVersion = (id: string, changelog?: string) => {
    const target = artifacts.find(a => a.id === id);
    if (!target) return;

    const currentUser = users.find(u => u.roles.includes(persona)) || users[0];
    
    // Clean published version tag (strip -draft suffix if present, or compute next)
    let publishedVersionStr = target.currentVersion.replace(/-draft$/, '');
    if (publishedVersionStr === target.currentVersion && target.versions.some(v => v.version === publishedVersionStr)) {
      const match = publishedVersionStr.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        publishedVersionStr = `v${major}.${minor + 1}.0`;
      } else {
        publishedVersionStr = `v${target.versions.length + 1}.0.0`;
      }
    }

    const snapshot = {
      version: publishedVersionStr,
      stage1Prompt: target.stage1Prompt,
      stage2Prompt: target.stage2Prompt,
      jsonSchema: target.jsonSchema,
      fewShotExamples: target.fewShotExamples,
      publishedAt: new Date().toISOString(),
      publishedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
      changelog: changelog || `Release version ${publishedVersionStr}`,
    };

    updateArtifact(id, {
      status: 'published',
      currentVersion: publishedVersionStr,
      versions: [...target.versions, snapshot],
    });
  };

  const createDraftVersion = (id: string) => {
    const target = artifacts.find(a => a.id === id);
    if (!target) return;

    const currentUser = users.find(u => u.roles.includes(persona)) || users[0];
    const isDraft = target.currentVersion.endsWith('-draft');

    // Drafting off a draft keeps the open draft as a saved snapshot in the version list.
    const versions = isDraft
      ? [
          ...target.versions.filter(v => v.version !== target.currentVersion),
          {
            version: target.currentVersion,
            stage1Prompt: target.stage1Prompt,
            stage2Prompt: target.stage2Prompt,
            jsonSchema: target.jsonSchema,
            fewShotExamples: target.fewShotExamples,
            publishedAt: new Date().toISOString(),
            publishedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
            changelog: 'Saved draft (not published)',
          },
        ]
      : target.versions;

    // Next minor after the highest version in use, so drafts never collide.
    let major = 0;
    let minor = 0;
    [target.currentVersion, ...versions.map(v => v.version)].forEach(v => {
      const m = v.match(/^v?(\d+)\.(\d+)/);
      if (!m) return;
      const mj = parseInt(m[1], 10);
      const mn = parseInt(m[2], 10);
      if (mj > major || (mj === major && mn > minor)) {
        major = mj;
        minor = mn;
      }
    });

    updateArtifact(id, {
      status: 'draft',
      currentVersion: `v${major}.${minor + 1}.0-draft`,
      versions,
    });
  };

  const revertArtifactVersion = (id: string, targetVersion: string) => {
    const target = artifacts.find(a => a.id === id);
    if (!target) return;

    const snapshot = target.versions.find(v => v.version === targetVersion);
    if (!snapshot) return;

    const nextDraftVersion = getNextDraftVersion(target.currentVersion, target.versions);

    updateArtifact(id, {
      stage1Prompt: snapshot.stage1Prompt,
      stage2Prompt: snapshot.stage2Prompt,
      jsonSchema: snapshot.jsonSchema,
      fewShotExamples: snapshot.fewShotExamples,
      status: 'draft',
      currentVersion: nextDraftVersion,
    });
  };

  const deleteArtifact = (id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id));
    setProjects(prev =>
      prev.map(p => ({
        ...p,
        artifactIds: p.artifactIds.filter(aid => aid !== id)
      }))
    );
  };

  // User Actions
  const createUser = (name: string, email: string, roles: User['roles'], projectIds: string[] = []): User => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      roles,
      projectIds,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);

    if (projectIds.length > 0) {
      setProjects(prev =>
        prev.map(p =>
          projectIds.includes(p.id)
            ? { ...p, userIds: Array.from(new Set([...(p.userIds || []), newUser.id])), updatedAt: new Date().toISOString() }
            : p
        )
      );
    }

    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));

    if (updates.projectIds) {
      const nextProjectIds = updates.projectIds;
      setProjects(prev =>
        prev.map(p => {
          const hasUser = p.userIds?.includes(id);
          const shouldHaveUser = nextProjectIds.includes(p.id);
          if (hasUser && !shouldHaveUser) {
            return { ...p, userIds: p.userIds.filter(uid => uid !== id), updatedAt: new Date().toISOString() };
          }
          if (!hasUser && shouldHaveUser) {
            return { ...p, userIds: [...(p.userIds || []), id], updatedAt: new Date().toISOString() };
          }
          return p;
        })
      );
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setProjects(prev =>
      prev.map(p => ({
        ...p,
        userIds: (p.userIds || []).filter(uid => uid !== id),
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  const assignUserToProject = (projectId: string, userId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId && !(p.userIds || []).includes(userId)
          ? { ...p, userIds: [...(p.userIds || []), userId], updatedAt: new Date().toISOString() }
          : p
      )
    );
    setUsers(prev =>
      prev.map(u =>
        u.id === userId && !u.projectIds.includes(projectId)
          ? { ...u, projectIds: [...u.projectIds, projectId] }
          : u
      )
    );
  };

  const detachUserFromProject = (projectId: string, userId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, userIds: (p.userIds || []).filter(uid => uid !== userId), updatedAt: new Date().toISOString() }
          : p
      )
    );
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, projectIds: u.projectIds.filter(pid => pid !== projectId) }
          : u
      )
    );
  };

  const setUserProjects = (userId: string, projectIds: string[]) => {
    updateUser(userId, { projectIds });
  };

  const setProjectUsers = (projectId: string, userIds: string[]) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, userIds, updatedAt: new Date().toISOString() }
          : p
      )
    );
    setUsers(prev =>
      prev.map(u => {
        const hasProject = u.projectIds.includes(projectId);
        const shouldHaveProject = userIds.includes(u.id);
        if (hasProject && !shouldHaveProject) {
          return { ...u, projectIds: u.projectIds.filter(pid => pid !== projectId) };
        }
        if (!hasProject && shouldHaveProject) {
          return { ...u, projectIds: [...u.projectIds, projectId] };
        }
        return u;
      })
    );
  };

  // Role Actions
  const createRole = (roleData: Omit<Role, 'id' | 'createdAt'>): Role => {
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    setRoles(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    setUsers(prev =>
      prev.map(u => ({
        ...u,
        roles: u.roles.filter(r => r !== id),
      }))
    );
  };

  return (
    <PrototypeContext.Provider
      value={{
        persona,
        switchPersona,
        darkMode,
        toggleDarkMode,
        projects,
        createProject,
        updateProject,
        deleteProject,
        attachArtifactToProject,
        linkArtifactToProject: attachArtifactToProject,
        artifacts,
        createArtifact,
        updateArtifact,
        publishArtifactVersion,
        createDraftVersion,
        revertArtifactVersion,
        deleteArtifact,
        validateArtifact,
        users,
        createUser,
        updateUser,
        deleteUser,
        assignUserToProject,
        detachUserFromProject,
        setUserProjects,
        setProjectUsers,
        roles,
        createRole,
        updateRole,
        deleteRole,
        resetData,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
};

export const usePrototype = () => {
  const context = useContext(PrototypeContext);
  if (!context) throw new Error('usePrototype must be used within a PrototypeProvider');
  return context;
};
