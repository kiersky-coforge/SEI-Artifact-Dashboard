export type ArtifactStatus = 'draft' | 'published' | 'archived';
export type ProjectStatus = 'active' | 'archived';
export type UserRole = 'admin' | 'author' | 'developer';
export type UserStatus = 'active' | 'disabled';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface ArtifactVersionSnapshot {
  version: string;
  stage1Prompt: string;
  stage2Prompt: string;
  jsonSchema: string;
  fewShotExamples: Record<string, any>[];
  publishedAt: string;
  publishedBy: UserSummary;
  changelog?: string;
}

export interface ValidationErrorItem {
  field: 'stage1Prompt' | 'stage2Prompt' | 'jsonSchema' | 'fewShotExamples';
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationState {
  isValid: boolean;
  errors: ValidationErrorItem[];
  warnings: string[];
  lastValidatedAt?: string;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  status: ArtifactStatus;
  currentVersion: string;
  projectIds: string[];
  
  // 4-Tab Contents
  // 1. Overview Metadata
  createdAt: string;
  createdBy: UserSummary;
  updatedAt: string;
  updatedBy: UserSummary;
  
  // 2. Editor State
  stage1Prompt: string; // Extraction prompt (markdown/plaintext)
  stage2Prompt: string; // Refinement/normalization prompt (markdown/plaintext)
  jsonSchema: string;   // JSON schema definition string
  fewShotExamples: Record<string, any>[]; // JSON array
  
  // 3. Versions History
  versions: ArtifactVersionSnapshot[];
  
  // 4. Computed / Transient Validation
  validationState?: ValidationState;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  artifactIds: string[];
  userIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  projectIds: string[];
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export type PersonaType = 'admin' | 'author' | 'developer';
