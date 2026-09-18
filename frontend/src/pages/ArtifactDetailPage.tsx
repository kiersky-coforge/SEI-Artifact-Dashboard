import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { PromptEditor } from '../components/molecules/PromptEditor';
import { ValidationSummary } from '../components/molecules/ValidationSummary';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { Textarea } from '../components/atoms/Textarea';
import { Select } from '../components/atoms/Select';
import { DataTable, type ColumnDef } from '../components/organisms/DataTable';
import {
  ArrowLeft,
  Send,
  RotateCcw,
  CheckCircle2,
  Layers,
  FileCode,
  History,
  ShieldCheck,
  Plus,
  Trash2,
  Eye,
  Link2,
  Unlink,
  Check,
} from 'lucide-react';
import type { ArtifactVersionSnapshot, Project } from '../../../shared/types';

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
  const [selectedSnapshot, setSelectedSnapshot] = useState<ArtifactVersionSnapshot | null>(null);
  const [isAttachProjectOpen, setIsAttachProjectOpen] = useState(false);
  const [selectedProjectToLink, setSelectedProjectToLink] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (artifact) {
      setStage1Prompt(artifact.stage1Prompt);
      setStage2Prompt(artifact.stage2Prompt);
      setJsonSchema(artifact.jsonSchema);
      setFewShotExamples(artifact.fewShotExamples || []);
    }
  }, [artifact?.id]);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!artifact) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold uppercase text-ink-primary font-display">Artifact Not Found</h2>
        <Link to="/artifacts" className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline mt-2 inline-block">
          Return to Artifact Library
        </Link>
      </div>
    );
  }

  const associatedProjects = projects.filter(p => artifact.projectIds.includes(p.id));
  const unlinkedProjects = projects.filter(p => !artifact.projectIds.includes(p.id));

  const triggerAutoSave = (updates: Partial<typeof artifact>) => {
    setSaveStatus('saving');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateArtifact(artifact.id, updates);
      setSaveStatus('saved');
    }, 350);
  };

  const handleStage1Change = (val: string) => {
    setStage1Prompt(val);
    triggerAutoSave({ stage1Prompt: val });
  };

  const handleStage2Change = (val: string) => {
    setStage2Prompt(val);
    triggerAutoSave({ stage2Prompt: val });
  };

  const handleJsonSchemaChange = (val: string) => {
    setJsonSchema(val);
    triggerAutoSave({ jsonSchema: val });
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
    if (confirm(`Restore snapshot "${version}" to the active editor? A new working draft will be created.`)) {
      revertArtifactVersion(artifact.id, version);
      setActiveTab('editor');
    }
  };

  const handleAddExample = () => {
    const newEx = {
      inputRaw: 'Example document excerpt for calibration...',
      outputNormalized: { commitmentAmount: 5000000, currency: 'USD' },
    };
    const updated = [...fewShotExamples, newEx];
    setFewShotExamples(updated);
    updateArtifact(artifact.id, { fewShotExamples: updated });
    setSaveStatus('saved');
  };

  const handleRemoveExample = (index: number) => {
    const updated = fewShotExamples.filter((_, idx) => idx !== index);
    setFewShotExamples(updated);
    updateArtifact(artifact.id, { fewShotExamples: updated });
    setSaveStatus('saved');
  };

  const handleExampleChange = (index: number, val: string) => {
    const updated = [...fewShotExamples];
    updated[index] = { ...updated[index], inputRaw: val };
    setFewShotExamples(updated);
    triggerAutoSave({ fewShotExamples: updated });
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

  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'editor', label: 'Pipeline Editor', icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: 'versions', label: `Versions (${artifact.versions?.length || 0})`, icon: <History className="w-3.5 h-3.5" /> },
    { id: 'validation', label: 'Schema Validation', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const boundProjectColumns: ColumnDef<Project>[] = [
    {
      id: 'name',
      header: 'Project Name',
      sortValue: proj => proj.name,
      hideable: false,
      searchable: true,
      searchValue: proj => proj.name,
      render: proj => (
        <>
          <div className="font-bold text-brand-navy dark:text-brand-blue">{proj.name}</div>
          <div className="text-[10px] text-ink-secondary font-mono">{proj.id}</div>
        </>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: proj => proj.status,
      filterable: true,
      filter: { type: 'select-list', label: 'Status', options: ['active', 'archived'] },
      filterPredicate: (proj, val: string[]) => val.length === 0 || val.includes(proj.status),
      render: proj => <StatusBadge status={proj.status} />,
    },
    {
      id: 'created',
      header: 'Created',
      sortValue: proj => proj.createdAt,
      cellClassName: 'font-mono text-[11px] text-ink-secondary tabular-nums',
      render: proj => proj.createdAt.split('T')[0],
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      render: proj => (
        <button
          onClick={e => { e.stopPropagation(); detachArtifactFromProject(proj.id, artifact.id); }}
          className="p-1 rounded text-ink-secondary hover:text-alert-coral transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          title="Detach Project"
          aria-label={`Detach ${proj.name} from this artifact`}
        >
          <Unlink className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const versionColumns: ColumnDef<ArtifactVersionSnapshot>[] = [
    {
      id: 'version',
      header: 'Version',
      sortValue: snap => snap.version,
      hideable: false,
      cellClassName: 'font-mono text-xs font-bold text-ink-primary tabular-nums',
      render: snap => snap.version,
    },
    {
      id: 'changelog',
      header: 'Changelog & Notes',
      searchable: true,
      searchValue: snap => snap.changelog || '',
      cellClassName: 'font-semibold text-ink-primary',
      render: snap => snap.changelog || 'Routine pipeline release',
    },
    {
      id: 'author',
      header: 'Author',
      cellClassName: 'text-ink-secondary font-medium',
      render: snap => snap.publishedBy?.name || 'Author',
    },
    {
      id: 'releasedAt',
      header: 'Release Timestamp',
      sortValue: snap => snap.publishedAt,
      cellClassName: 'font-mono text-[11px] text-ink-secondary tabular-nums',
      render: snap => snap.publishedAt.split('T')[0],
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      hideable: false,
      cellClassName: 'whitespace-nowrap',
      render: snap => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); setSelectedSnapshot(snap); }}
            className="px-2.5 py-1 rounded-level2 bg-brand-navy/[0.04] hover:bg-brand-navy hover:text-white text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Eye className="w-3 h-3" /> Inspect
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleRevert(snap.version); }}
            className="px-2.5 py-1 rounded-level2 border border-brand-navy/15 hover:bg-brand-navy/[0.05] text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <RotateCcw className="w-3 h-3" /> Restore
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/artifacts"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Artifacts
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-alert-coral hover:bg-alert-coral/10"
          icon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Artifact
        </Button>
      </div>

      {/* Header Bar */}
      <HeaderBar
        title={artifact.name}
        subtitle={artifact.description}
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
              {artifact.currentVersion}
            </span>
            <StatusBadge status={artifact.status} />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-navy/[0.04] dark:bg-white/[0.04] border border-surface-border">
              {saveStatus === 'saving' ? (
                <span className="flex items-center gap-1 text-ink-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-coral animate-ping" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-brand-green">
                  <Check className="w-3 h-3 text-brand-green" />
                  Auto-saved
                </span>
              )}
            </div>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="coral"
              size="sm"
              onClick={() => setIsPublishModalOpen(true)}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Publish Release
            </Button>
          </div>
        }
      />

      {/* Detail Navigation Tabs (Stratos Tab Style) */}
      <div className="flex items-center gap-1.5 p-1 bg-brand-navy/[0.04] dark:bg-white/[0.04] rounded-level3 w-fit border border-surface-border">
        {detailTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            aria-current={activeTab === tab.id ? 'true' : undefined}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-level2 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              activeTab === tab.id
                ? 'bg-brand-navy text-white shadow-level1'
                : 'text-ink-secondary hover:text-brand-navy hover:bg-brand-navy/5 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bound Projects Card */}
            <div className="lg:col-span-2 bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                    Workspace Attachments
                  </p>
                  <h3 className="text-lg font-bold uppercase text-ink-primary font-display mt-0.5">
                    Bound Client Projects ({associatedProjects.length})
                  </h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAttachProjectOpen(true)}
                  icon={<Link2 className="w-3.5 h-3.5 text-brand-coral" />}
                >
                  Bind Project
                </Button>
              </div>

              {associatedProjects.length === 0 ? (
                <div className="p-8 text-center rounded-level2 bg-brand-navy/[0.02] border border-dashed border-brand-navy/[0.1] text-xs text-ink-secondary">
                  No projects currently consume this schema pipeline.
                </div>
              ) : (
                <DataTable<Project>
                  columns={boundProjectColumns}
                  data={associatedProjects}
                  getRowKey={proj => proj.id}
                  onRowClick={proj => navigate(`/projects/${proj.id}`)}
                />
              )}
            </div>

            {/* Quick Diagnostic Card */}
            <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                Validation Summary
              </p>
              <h3 className="text-lg font-bold uppercase text-ink-primary font-display">
                Pipeline Health
              </h3>
              <div className="p-3.5 rounded-level2 bg-brand-green/10 border border-brand-green/20 text-xs text-brand-green font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>All JSON schema syntax rules verified</span>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Stage 1 extraction prompt, Stage 2 normalization rules, and output schemas conform to SEI extraction standard v2.4.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => setActiveTab('validation')}
              >
                Inspect Full Diagnostics
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIPELINE EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PromptEditor
              title="Stage 1 Prompt (Raw Document Extraction)"
              subtitle="Defines LLM instructions for unstructured document OCR extraction."
              value={stage1Prompt}
              onChange={handleStage1Change}
              mode="prompt"
              height="380px"
            />
            <PromptEditor
              title="Stage 2 Prompt (Refinement & Normalization)"
              subtitle="Normalizes line items, validates commitment totals, and standardizes currencies."
              value={stage2Prompt}
              onChange={handleStage2Change}
              mode="prompt"
              height="380px"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PromptEditor
              title="JSON Schema Definition"
              subtitle="Strict JSON Schema standard defining required keys and validation constraints."
              value={jsonSchema}
              onChange={handleJsonSchemaChange}
              mode="json"
              height="380px"
            />

            {/* Few-Shot Calibration Samples */}
            <div className="bg-surface rounded-level4 border border-surface-border shadow-level1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                      Calibration Dataset
                    </p>
                    <h3 className="text-lg font-bold uppercase text-ink-primary font-display">
                      Few-Shot Samples ({fewShotExamples.length})
                    </h3>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleAddExample} icon={<Plus className="w-3.5 h-3.5 text-brand-coral" />}>
                    Add Sample
                  </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {fewShotExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-level2 border border-surface-border bg-brand-navy/[0.02] dark:bg-white/[0.02] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink-primary uppercase text-[10px]">
                          Sample #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveExample(idx)}
                          className="text-alert-coral hover:underline text-[10px] font-bold uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={ex.inputRaw}
                        onChange={e => handleExampleChange(idx, e.target.value)}
                        placeholder="Raw input text sample..."
                        className="w-full p-2 rounded-level1 bg-surface border border-input font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-secondary flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand-green" />
                  Auto-synced with active working draft
                </span>
                <span className="text-[10px] font-mono font-medium text-ink-secondary/70">
                  {saveStatus === 'saving' ? 'Saving changes...' : 'All changes saved'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                Audit Trail & Releases
              </p>
              <h3 className="text-lg font-bold uppercase text-ink-primary font-display">
                Immutable Version Snapshots
              </h3>
            </div>
            <Button
              variant="coral"
              size="sm"
              onClick={() => setIsPublishModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Tag New Release
            </Button>
          </div>

          <DataTable<ArtifactVersionSnapshot>
            columns={versionColumns}
            data={artifact.versions || []}
            getRowKey={snap => snap.version}
            emptyState="No tagged releases created yet."
          />
        </div>
      )}

      {/* TAB 4: VALIDATION DIAGNOSTICS */}
      {activeTab === 'validation' && (
        <div className="space-y-4">
          <ValidationSummary
            validationState={artifact.validationState}
            onRevalidate={handleRunValidation}
          />
        </div>
      )}

      {/* Publish Version Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Release Version"
        subtitle={`Create an immutable version snapshot from the current working draft of ${artifact.name}.`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="changelog-notes" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Changelog / Release Notes *
            </label>
            <Textarea
              id="changelog-notes"
              rows={3}
              required
              placeholder="e.g. Added Schedule K-1 Part III box parsing & updated currency validation regex..."
              value={changelog}
              onChange={e => setChangelog(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="coral" onClick={handlePublishConfirm}>
              Confirm & Tag Release
            </Button>
          </div>
        </div>
      </Modal>

      {/* Attach Project Modal */}
      <Modal
        isOpen={isAttachProjectOpen}
        onClose={() => setIsAttachProjectOpen(false)}
        title="Bind to Project Workspace"
        subtitle="Select a workspace project to consume this artifact pipeline."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="attach-project-select" className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary mb-1">
              Select Project *
            </label>
            {unlinkedProjects.length === 0 ? (
              <p className="text-xs text-ink-secondary py-2 text-center">All projects are already linked.</p>
            ) : (
              <Select
                id="attach-project-select"
                value={selectedProjectToLink}
                onChange={e => setSelectedProjectToLink(e.target.value)}
              >
                <option value="">-- Choose Project --</option>
                {unlinkedProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setIsAttachProjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="coral" onClick={handleAttachProject} disabled={!selectedProjectToLink}>
              Bind to Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Snapshot Inspection Modal */}
      <Modal
        isOpen={!!selectedSnapshot}
        onClose={() => setSelectedSnapshot(null)}
        title={`Release Snapshot ${selectedSnapshot?.version}`}
        subtitle={`Captured on ${selectedSnapshot?.publishedAt.split('T')[0]} by ${selectedSnapshot?.publishedBy?.name || 'Author'}`}
        maxWidth="4xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-brand-navy/[0.02] rounded-level2 border border-brand-navy/[0.08] text-xs">
            <span className="font-bold uppercase text-[10px] text-ink-secondary">Changelog: </span>
            <span className="font-medium text-ink-primary">{selectedSnapshot?.changelog}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PromptEditor
              title="Stage 1 Prompt"
              value={selectedSnapshot?.stage1Prompt || ''}
              onChange={() => {}}
              readOnly
              height="200px"
              initialViewMode="preview"
              mode="prompt"
            />
            <PromptEditor
              title="Stage 2 Prompt"
              value={selectedSnapshot?.stage2Prompt || ''}
              onChange={() => {}}
              readOnly
              height="200px"
              initialViewMode="preview"
              mode="prompt"
            />
          </div>

          <PromptEditor
            title="JSON Schema"
            value={selectedSnapshot?.jsonSchema || ''}
            onChange={() => {}}
            readOnly
            height="200px"
            mode="json"
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setSelectedSnapshot(null)}>
              Close
            </Button>
            <Button
              variant="coral"
              onClick={() => {
                if (selectedSnapshot) {
                  handleRevert(selectedSnapshot.version);
                  setSelectedSnapshot(null);
                }
              }}
            >
              Restore to Editor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
