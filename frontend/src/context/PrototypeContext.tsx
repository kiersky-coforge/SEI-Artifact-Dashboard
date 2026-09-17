import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Artifact, Project, User, PersonaType, ValidationState, ValidationErrorItem } from '../../../shared/types';
import { SEED_ARTIFACTS, SEED_PROJECTS, SEED_USERS } from '../../../shared/seed';

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
  detachArtifactFromProject: (projectId: string, artifactId: string) => void;
  linkArtifactToProject: (projectId: string, artifactId: string) => void;
  unlinkArtifactFromProject: (projectId: string, artifactId: string) => void;
  
  // Artifacts
  artifacts: Artifact[];
  createArtifact: (name: string, description: string, initialProjectId?: string) => Artifact;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  publishArtifactVersion: (id: string, changelog?: string) => void;
  revertArtifactVersion: (id: string, targetVersion: string) => void;
  deleteArtifact: (id: string) => void;
  validateArtifact: (id: string) => ValidationState;
  
  // Users
  users: User[];
  createUser: (name: string, email: string, roles: User['roles'], projectIds: string[]) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Reset
  resetData: () => void;
}

const PrototypeContext = createContext<PrototypeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: 'sei_artifact_dash_projects',
  ARTIFACTS: 'sei_artifact_dash_artifacts',
  USERS: 'sei_artifact_dash_users',
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
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.ARTIFACTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
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
      prev.map(a => ({
        ...a,
        projectIds: a.projectIds.filter(pid => pid !== id),
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

  const detachArtifactFromProject = (projectId: string, artifactId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, artifactIds: p.artifactIds.filter(aid => aid !== artifactId), updatedAt: new Date().toISOString() }
          : p
      )
    );
    setArtifacts(prev =>
      prev.map(a =>
        a.id === artifactId
          ? { ...a, projectIds: a.projectIds.filter(pid => pid !== projectId), updatedAt: new Date().toISOString() }
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

  const updateArtifact = (id: string, updates: Partial<Artifact>) => {
    const currentUser = users.find(u => u.roles.includes(persona)) || users[0];
    setArtifacts(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString(),
              updatedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email }
            }
          : a
      )
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
    const prevVersionNum = target.versions.length > 0
      ? parseInt(target.versions[target.versions.length - 1].version.replace(/[^0-9]/g, '') || '10', 10)
      : 10;
    const nextVersionStr = `v${((prevVersionNum + 1) / 10).toFixed(1)}.0`;

    const snapshot = {
      version: nextVersionStr,
      stage1Prompt: target.stage1Prompt,
      stage2Prompt: target.stage2Prompt,
      jsonSchema: target.jsonSchema,
      fewShotExamples: target.fewShotExamples,
      publishedAt: new Date().toISOString(),
      publishedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
      changelog: changelog || `Release version ${nextVersionStr}`,
    };

    updateArtifact(id, {
      status: 'published',
      currentVersion: nextVersionStr,
      versions: [...target.versions, snapshot],
    });
  };

  const revertArtifactVersion = (id: string, targetVersion: string) => {
    const target = artifacts.find(a => a.id === id);
    if (!target) return;

    const snapshot = target.versions.find(v => v.version === targetVersion);
    if (!snapshot) return;

    updateArtifact(id, {
      stage1Prompt: snapshot.stage1Prompt,
      stage2Prompt: snapshot.stage2Prompt,
      jsonSchema: snapshot.jsonSchema,
      fewShotExamples: snapshot.fewShotExamples,
      status: 'draft',
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
  const createUser = (name: string, email: string, roles: User['roles'], projectIds: string[]): User => {
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
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
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
        detachArtifactFromProject,
        linkArtifactToProject: attachArtifactToProject,
        unlinkArtifactFromProject: detachArtifactFromProject,
        artifacts,
        createArtifact,
        updateArtifact,
        publishArtifactVersion,
        revertArtifactVersion,
        deleteArtifact,
        validateArtifact,
        users,
        createUser,
        updateUser,
        deleteUser,
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
