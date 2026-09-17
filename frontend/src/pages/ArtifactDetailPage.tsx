import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { PromptEditor } from '../components/molecules/PromptEditor';
import { ValidationSummary } from '../components/molecules/ValidationSummary';
import { Modal } from '../components/molecules/Modal';
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
  Layers,
  FileCode,
  History,
  ShieldCheck,
  FolderKanban,
  Plus,
  Trash2,
  Eye,
  Link2,
  Unlink,
} from 'lucide-react';
import type { ArtifactVersionSnapshot } from '../../../shared/types';

export const ArtifactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    artifacts,
    projects,
    updateArtifact,
    publishArtifactVersion,
    revertArtifactVersion,
    deleteArtifact,
    validateArtifact,
    attachArtifactToProject,
    detachArtifactFromProject,
  } = usePrototype();

  const artifact = artifacts.find(a => a.id === id);

  const [activeTab, setActiveTab] = useState<'overview' | 'editor' | 'versions' | 'validation'>('editor');
  
  // Working draft editor state
  const [stage1Prompt, setStage1Prompt] = useState(artifact?.stage1Prompt || '');
  const [stage2Prompt, setStage2Prompt] = useState(artifact?.stage2Prompt || '');
  const [jsonSchema, setJsonSchema] = useState(artifact?.jsonSchema || '');
  const [fewShotExamples, setFewShotExamples] = useState<any[]>(artifact?.fewShotExamples || []);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [changelog, setChangelog] = useState('');
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ArtifactVersionSnapshot | null>(null);
  const [isAttachProjectOpen, setIsAttachProjectOpen] = useState(false);
  const [selectedProjectToLink, setSelectedProjectToLink] = useState('');

  React.useEffect(() => {
    if (artifact) {
      setStage1Prompt(artifact.stage1Prompt);
      setStage2Prompt(artifact.stage2Prompt);
      setJsonSchema(artifact.jsonSchema);
      setFewShotExamples(artifact.fewShotExamples || []);
    }
  }, [artifact?.id]);

  if (!artifact) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-bold text-ink-primary">Artifact Not Found</h2>
        <Link to="/artifacts" className="text-xs text-action-primary hover:underline mt-2 inline-block">
          Return to Artifact Library
        </Link>
      </div>
    );
  }

  const associatedProjects = projects.filter(p => artifact.projectIds.includes(p.id));
  const unlinkedProjects = projects.filter(p => !artifact.projectIds.includes(p.id));

  const handleSaveDraft = () => {
    updateArtifact(artifact.id, {
      stage1Prompt,
      stage2Prompt,
      jsonSchema,
      fewShotExamples,
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleRunValidation = () => {
    updateArtifact(artifact.id, {
      stage1Prompt,
      stage2Prompt,
      jsonSchema,
      fewShotExamples,
    });
    validateArtifact(artifact.id);
  };

  const handlePublishConfirm = () => {
    updateArtifact(artifact.id, {
      stage1Prompt,
      stage2Prompt,
      jsonSchema,
      fewShotExamples,
    });
    publishArtifactVersion(artifact.id, changelog);
    setChangelog('');
    setIsPublishModalOpen(false);
    setActiveTab('versions');
  };

  const handleRevert = (version: string) => {
    if (confirm(`Restore snapshot "${version}" to the active editor? Working draft changes will be replaced.`)) {
      revertArtifactVersion(artifact.id, version);
      setActiveTab('editor');
    }
  };

  const handleAddExample = () => {
    const newEx = {
      inputRaw: 'Example input text from document...',
      outputNormalized: { exampleKey: 'exampleValue' },
    };
    setFewShotExamples([...fewShotExamples, newEx]);
  };

  const handleRemoveExample = (index: number) => {
    setFewShotExamples(fewShotExamples.filter((_, idx) => idx !== index));
  };

  const handleAttachProject = () => {
    if (selectedProjectToLink) {
      attachArtifactToProject(selectedProjectToLink, artifact.id);
      setSelectedProjectToLink('');
      setIsAttachProjectOpen(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete artifact "${artifact.name}"?`)) {
      deleteArtifact(artifact.id);
      navigate('/artifacts');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/artifacts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Artifact Library
        </Link>

        <div className="flex items-center gap-2">
          {isSavedAlert && (
            <span className="text-xs text-status-success-text font-semibold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Draft Saved
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleSaveDraft} icon={<Save className="w-3.5 h-3.5" />}>
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPublishModalOpen(true)}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Publish New Version
          </Button>
        </div>
      </div>

      {/* Artifact Header Banner */}
      <div className="p-6 rounded-lg border border-surface-border bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-ink-primary tracking-tight">{artifact.name}</h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-hover border border-surface-border text-ink-primary font-bold">
                {artifact.currentVersion}
              </span>
              <StatusBadge status={artifact.status} />
            </div>
            <p className="text-xs text-ink-secondary mt-1">{artifact.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-status-error-text hover:bg-status-error/10"
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-surface-border gap-2 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-action-primary text-action-primary'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Layers className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'editor'
                ? 'border-action-primary text-action-primary'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <FileCode className="w-4 h-4" /> Editor (Prompts & Schema)
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'versions'
                ? 'border-action-primary text-action-primary'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <History className="w-4 h-4" /> Versions ({artifact.versions.length})
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'validation'
                ? 'border-action-primary text-action-primary'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Validation
            {artifact.validationState && (
              <span
                className={`w-2 h-2 rounded-full ${
                  artifact.validationState.isValid ? 'bg-status-success' : 'bg-status-error'
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg border border-surface-border bg-surface space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-primary">Metadata & Lineage</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-surface-border">
                  <span className="text-ink-muted">Artifact ID</span>
                  <span className="font-mono text-ink-primary">{artifact.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border">
                  <span className="text-ink-muted">Publish Status</span>
                  <StatusBadge status={artifact.status} />
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border">
                  <span className="text-ink-muted">Current Active Version</span>
                  <span className="font-mono font-bold text-ink-primary">{artifact.currentVersion}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border">
                  <span className="text-ink-muted">Created By</span>
                  <span className="text-ink-primary font-medium">{artifact.createdBy.name} ({artifact.createdBy.email})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border">
                  <span className="text-ink-muted">Created Date</span>
                  <span className="text-ink-primary">{new Date(artifact.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-surface-border">
                  <span className="text-ink-muted">Last Updated By</span>
                  <span className="text-ink-primary font-medium">{artifact.updatedBy.name}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-ink-muted">Last Updated Date</span>
                  <span className="text-ink-primary">{new Date(artifact.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-surface-border bg-surface space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-ink-primary">
                    Associated Projects ({associatedProjects.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAttachProjectOpen(true)}
                    icon={<Link2 className="w-3.5 h-3.5" />}
                  >
                    Link to Project
                  </Button>
                </div>

                {associatedProjects.length === 0 ? (
                  <p className="text-xs text-ink-muted py-6 text-center border border-dashed border-surface-border rounded-lg">
                    This artifact is not currently linked to any project.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {associatedProjects.map(proj => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between p-3 rounded-md border border-surface-border bg-surface-hover/50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-action-primary" />
                          <Link to={`/projects/${proj.id}`} className="font-semibold text-ink-primary hover:underline">
                            {proj.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => detachArtifactFromProject(proj.id, artifact.id)}
                          className="p-1 rounded text-ink-muted hover:text-status-error-text hover:bg-status-error/10"
                          title="Unlink from project"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 rounded bg-action-primary/5 border border-action-primary/20 text-xs text-ink-secondary">
                <strong className="text-action-primary">Reusability Note:</strong> Updating this artifact's published version automatically updates schemas in all linked projects.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-surface-border">
            <div className="text-xs text-ink-secondary">
              Editing working draft payload for <strong>{artifact.name}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleRunValidation} icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Validate Content
              </Button>
              <Button size="sm" onClick={handleSaveDraft} icon={<Save className="w-3.5 h-3.5" />}>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PromptEditor
              label="Prompt - Stage 1 (Extraction Prompt)"
              description="Markdown/Plaintext instruction for initial verbatim field extraction"
              value={stage1Prompt}
              onChange={setStage1Prompt}
              height="h-72"
              placeholder="Enter Stage 1 extraction instructions..."
            />

            <PromptEditor
              label="Prompt - Stage 2 (Refinement / Normalization)"
              description="Markdown/Plaintext instruction for GAAP normalization & formatting"
              value={stage2Prompt}
              onChange={setStage2Prompt}
              height="h-72"
              placeholder="Enter Stage 2 refinement instructions..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PromptEditor
              label="JSON Schema Specification"
              description="Draft-07 JSON Schema enforcing response structure"
              language="json"
              value={jsonSchema}
              onChange={setJsonSchema}
              height="h-96"
              placeholder="{\n  &quot;type&quot;: &quot;object&quot;\n}"
            />

            <div className="flex flex-col border border-surface-border rounded-lg overflow-hidden bg-surface">
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-hover border-b border-surface-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
                  Few-Shot Calibration Examples ({fewShotExamples.length})
                </span>
                <Button size="sm" variant="outline" onClick={handleAddExample} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Example
                </Button>
              </div>

              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {fewShotExamples.length === 0 ? (
                  <p className="text-xs text-ink-muted text-center py-10">
                    No few-shot examples added yet. Click &quot;Add Example&quot; to calibrate extraction results.
                  </p>
                ) : (
                  fewShotExamples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-surface-border bg-surface-hover/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-primary">Example #{idx + 1}</span>
                        <button
                          onClick={() => handleRemoveExample(idx)}
                          className="text-ink-muted hover:text-status-error-text text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-ink-muted block mb-1">Raw Input String:</label>
                        <textarea
                          rows={2}
                          value={ex.inputRaw || ''}
                          onChange={e => {
                            const updated = [...fewShotExamples];
                            updated[idx] = { ...updated[idx], inputRaw: e.target.value };
                            setFewShotExamples(updated);
                          }}
                          className="w-full p-2 font-mono text-xs rounded border border-input bg-surface text-ink-primary"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-ink-muted block mb-1">Normalized JSON Output:</label>
                        <textarea
                          rows={3}
                          value={typeof ex.outputNormalized === 'object' ? JSON.stringify(ex.outputNormalized, null, 2) : ex.outputNormalized || ''}
                          onChange={e => {
                            const updated = [...fewShotExamples];
                            try {
                              updated[idx] = { ...updated[idx], outputNormalized: JSON.parse(e.target.value) };
                            } catch {
                              updated[idx] = { ...updated[idx], outputNormalized: e.target.value };
                            }
                            setFewShotExamples(updated);
                          }}
                          className="w-full p-2 font-mono text-xs rounded border border-input bg-surface text-ink-primary"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: VERSIONS */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-primary">
              Immutable Version Lineage ({artifact.versions.length})
            </h3>
            <Button size="sm" onClick={() => setIsPublishModalOpen(true)} icon={<Send className="w-3.5 h-3.5" />}>
              Publish Current Working Draft
            </Button>
          </div>

          {artifact.versions.length === 0 ? (
            <div className="p-12 text-center rounded-lg border border-dashed border-surface-border bg-surface">
              <History className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-semibold text-ink-primary">No Published Versions Yet</h4>
              <p className="text-xs text-ink-secondary mt-1">
                This artifact is currently in draft. Once your prompts and JSON schema pass validation, publish v1.0.0.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {artifact.versions
                .slice()
                .reverse()
                .map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-lg border border-surface-border bg-surface hover:border-emphasis transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm px-3 py-1 rounded bg-action-primary/10 text-action-primary font-bold">
                          {ver.version}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-ink-primary">
                            Published by {ver.publishedBy.name}
                          </span>
                          <span className="text-[11px] text-ink-muted ml-2">
                            {new Date(ver.publishedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSnapshot(ver)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Snapshot
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevert(ver.version)}
                          icon={<RotateCcw className="w-3.5 h-3.5" />}
                        >
                          Restore into Editor
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-ink-secondary">{ver.changelog || 'No changelog specified.'}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: VALIDATION */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          <ValidationSummary
            validationState={artifact.validationState}
            onRevalidate={handleRunValidation}
          />

          <div className="p-5 rounded-lg border border-surface-border bg-surface space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-primary">
              Full Exportable Payload Preview
            </h4>
            <pre className="p-4 rounded-md bg-black/90 text-blue-300 font-mono text-xs overflow-x-auto max-h-80">
              {JSON.stringify(
                {
                  id: artifact.id,
                  name: artifact.name,
                  version: artifact.currentVersion,
                  stage1Prompt,
                  stage2Prompt,
                  jsonSchema: (() => {
                    try {
                      return JSON.parse(jsonSchema);
                    } catch {
                      return jsonSchema;
                    }
                  })(),
                  fewShotExamples,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish New Artifact Version"
        description="Creates an immutable snapshot of all current prompts, JSON schema, and examples."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishConfirm}>Confirm & Publish</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-primary mb-1.5">
              Changelog / Release Summary
            </label>
            <textarea
              rows={3}
              value={changelog}
              onChange={e => setChangelog(e.target.value)}
              placeholder="e.g. Added strict GAAP operating income scaling rules..."
              className="w-full px-3 py-2 text-xs rounded-md border border-input bg-surface text-ink-primary focus:outline-none focus:ring-1 focus:ring-focus"
            />
          </div>
        </div>
      </Modal>

      {/* Snapshot Inspector Modal */}
      <Modal
        isOpen={!!selectedSnapshot}
        onClose={() => setSelectedSnapshot(null)}
        title={`Version Snapshot: ${selectedSnapshot?.version}`}
        description={`Published ${selectedSnapshot ? new Date(selectedSnapshot.publishedAt).toLocaleString() : ''} by ${selectedSnapshot?.publishedBy.name}`}
        maxWidth="2xl"
        footer={<Button onClick={() => setSelectedSnapshot(null)}>Close</Button>}
      >
        {selectedSnapshot && (
          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="font-bold text-ink-primary block mb-1">Stage 1 Extraction Prompt:</span>
              <pre className="p-3 bg-surface-hover rounded border border-surface-border whitespace-pre-wrap">{selectedSnapshot.stage1Prompt}</pre>
            </div>
            <div>
              <span className="font-bold text-ink-primary block mb-1">Stage 2 Refinement Prompt:</span>
              <pre className="p-3 bg-surface-hover rounded border border-surface-border whitespace-pre-wrap">{selectedSnapshot.stage2Prompt}</pre>
            </div>
            <div>
              <span className="font-bold text-ink-primary block mb-1">JSON Schema:</span>
              <pre className="p-3 bg-surface-hover rounded border border-surface-border whitespace-pre-wrap">{selectedSnapshot.jsonSchema}</pre>
            </div>
          </div>
        )}
      </Modal>

      {/* Link to Project Modal */}
      <Modal
        isOpen={isAttachProjectOpen}
        onClose={() => setIsAttachProjectOpen(false)}
        title="Link Artifact to Project"
        description="Select a project to associate with this artifact."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAttachProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAttachProject} disabled={!selectedProjectToLink}>
              Link Project
            </Button>
          </>
        }
      >
        {unlinkedProjects.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-6">This artifact is already linked to all existing projects.</p>
        ) : (
          <div className="space-y-2">
            {unlinkedProjects.map(proj => (
              <label
                key={proj.id}
                className="flex items-center gap-3 p-3 rounded-md border border-surface-border hover:bg-surface-hover cursor-pointer"
              >
                <input
                  type="radio"
                  name="projectSelect"
                  value={proj.id}
                  checked={selectedProjectToLink === proj.id}
                  onChange={() => setSelectedProjectToLink(proj.id)}
                  className="border-input text-action-primary focus:ring-focus"
                />
                <div>
                  <span className="text-xs font-semibold text-ink-primary">{proj.name}</span>
                  <p className="text-[11px] text-ink-secondary">{proj.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
