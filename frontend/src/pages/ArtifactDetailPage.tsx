import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePrototype } from '../context/PrototypeContext';
import { Button } from '../components/atoms/Button';
import { StatusBadge } from '../components/atoms/StatusBadge';
import { PromptEditor } from '../components/molecules/PromptEditor';
import { ValidationSummary } from '../components/molecules/ValidationSummary';
import { Modal } from '../components/molecules/Modal';
import { HeaderBar } from '../components/molecules/HeaderBar';
import { StatCard } from '../components/molecules/StatCard';
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
  Check,
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
        <h2 className="text-xl font-bold uppercase text-brand-black dark:text-white font-display">Artifact Not Found</h2>
        <Link to="/artifacts" className="text-xs text-brand-coral font-bold uppercase tracking-wider hover:underline mt-2 inline-block">
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
      inputRaw: 'Example document excerpt for calibration...',
      outputNormalized: { commitmentAmount: 5000000, currency: 'USD' },
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

  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'editor', label: 'Pipeline Editor', icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: 'versions', label: `Versions (${artifact.versions?.length || 0})`, icon: <History className="w-3.5 h-3.5" /> },
    { id: 'validation', label: 'Schema Validation', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/artifacts"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-grey hover:text-brand-navy dark:hover:text-white transition-colors"
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
        kicker="Schema & Prompt Hub"
        title={artifact.name}
        subtitle={artifact.description}
        badge={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-level1 bg-brand-navy text-white shadow-level1 tabular-nums">
              {artifact.currentVersion}
            </span>
            <StatusBadge status={artifact.status} />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveDraft}
              icon={<Save className="w-3.5 h-3.5 text-brand-coral" />}
            >
              Save Draft
            </Button>
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

      {/* Success Banner */}
      {isSavedAlert && (
        <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-level2 text-xs text-brand-green font-bold uppercase tracking-wide flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> Draft changes saved successfully to prototype store.
        </div>
      )}

      {/* Detail Navigation Tabs (Stratos Tab Style) */}
      <div className="flex items-center gap-1.5 p-1 bg-brand-navy/[0.04] dark:bg-white/[0.04] rounded-level3 w-fit border border-brand-navy/[0.06] dark:border-white/10">
        {detailTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-level2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-brand-navy text-white shadow-level1'
                : 'text-brand-grey hover:text-brand-navy hover:bg-brand-navy/5 dark:hover:text-white'
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <StatCard
              title="Release Version"
              value={artifact.currentVersion}
              subtitle="Latest published tag"
              icon={<History className="w-4 h-4 text-brand-coral" />}
              delta="Active"
              deltaType="positive"
            />
            <StatCard
              title="Attached Projects"
              value={associatedProjects.length}
              subtitle="Workspaces consuming schema"
              icon={<FolderKanban className="w-4 h-4 text-brand-navy dark:text-brand-blue" />}
              delta="Connected"
              deltaType="positive"
            />
            <StatCard
              title="Audit History"
              value={artifact.versions?.length || 1}
              subtitle="Immutable releases"
              icon={<CheckCircle2 className="w-4 h-4 text-brand-green" />}
              delta="Audited"
              deltaType="positive"
            />
            <StatCard
              title="Last Activity"
              value={artifact.updatedAt.split('T')[0]}
              subtitle={`By ${artifact.updatedBy || 'Author'}`}
              icon={<FileCode className="w-4 h-4 text-brand-blue" />}
              delta="Synchronized"
              deltaType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bound Projects Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-navy/[0.06] dark:border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                    Workspace Attachments
                  </p>
                  <h3 className="text-lg font-bold uppercase text-brand-black dark:text-white font-display mt-0.5">
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
                <div className="p-8 text-center rounded-level2 bg-brand-navy/[0.02] border border-dashed border-brand-navy/[0.1] text-xs text-brand-grey">
                  No projects currently consume this schema pipeline.
                </div>
              ) : (
                <div className="border border-brand-navy/[0.06] dark:border-white/10 rounded-level3 overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-navy/[0.02] dark:bg-white/[0.02] border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase text-brand-grey tracking-widest">
                        <th className="py-2.5 px-4">Project Name</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Created</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
                      {associatedProjects.map(proj => (
                        <tr key={proj.id} className="hover:bg-brand-navy/[0.02]">
                          <td className="py-3 px-4">
                            <Link
                              to={`/projects/${proj.id}`}
                              className="font-bold text-brand-navy dark:text-brand-blue hover:underline"
                            >
                              {proj.name}
                            </Link>
                            <div className="text-[10px] text-brand-grey font-mono">{proj.id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={proj.status} />
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-brand-grey tabular-nums">
                            {proj.createdAt.split('T')[0]}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => detachArtifactFromProject(proj.id, artifact.id)}
                              className="p-1 rounded text-brand-grey hover:text-alert-coral transition-colors"
                              title="Detach Project"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Diagnostic Card */}
            <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 p-5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                Validation Summary
              </p>
              <h3 className="text-lg font-bold uppercase text-brand-black dark:text-white font-display">
                Pipeline Health
              </h3>
              <div className="p-3.5 rounded-level2 bg-brand-green/10 border border-brand-green/20 text-xs text-brand-green font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>All JSON schema syntax rules verified</span>
              </div>
              <p className="text-xs text-brand-grey leading-relaxed">
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
              onChange={setStage1Prompt}
              mode="prompt"
              height="380px"
            />
            <PromptEditor
              title="Stage 2 Prompt (Refinement & Normalization)"
              subtitle="Normalizes line items, validates commitment totals, and standardizes currencies."
              value={stage2Prompt}
              onChange={setStage2Prompt}
              mode="prompt"
              height="380px"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PromptEditor
              title="JSON Schema Definition"
              subtitle="Strict JSON Schema standard defining required keys and validation constraints."
              value={jsonSchema}
              onChange={setJsonSchema}
              mode="json"
              height="380px"
            />

            {/* Few-Shot Calibration Samples */}
            <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-brand-navy/[0.06] dark:border-white/10 mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                      Calibration Dataset
                    </p>
                    <h3 className="text-lg font-bold uppercase text-brand-black dark:text-white font-display">
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
                      className="p-3 rounded-level2 border border-brand-navy/[0.08] dark:border-white/10 bg-brand-navy/[0.02] dark:bg-white/[0.02] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-black dark:text-white uppercase text-[10px]">
                          Sample #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleRemoveExample(idx)}
                          className="text-alert-coral hover:underline text-[10px] font-bold uppercase"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={ex.inputRaw}
                        onChange={e => {
                          const updated = [...fewShotExamples];
                          updated[idx] = { ...updated[idx], inputRaw: e.target.value };
                          setFewShotExamples(updated);
                        }}
                        placeholder="Raw input text sample..."
                        className="w-full p-2 rounded-level1 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-navy/[0.06] dark:border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-grey">
                  Auto-synced with extraction engine
                </span>
                <Button variant="coral" size="sm" onClick={handleSaveDraft}>
                  Save All Edits
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY */}
      {activeTab === 'versions' && (
        <div className="bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 overflow-hidden">
          <div className="p-4 border-b border-brand-navy/[0.06] dark:border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-grey">
                Audit Trail & Releases
              </p>
              <h3 className="text-lg font-bold uppercase text-brand-black dark:text-white font-display">
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

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-navy/[0.06] dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-grey bg-brand-navy/[0.02] dark:bg-white/[0.02]">
                <th className="py-3.5 px-4">Version Tag</th>
                <th className="py-3.5 px-4">Changelog & Notes</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Release Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-navy/[0.04] dark:divide-white/[0.04]">
              {(!artifact.versions || artifact.versions.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-brand-grey">
                    No tagged releases created yet.
                  </td>
                </tr>
              ) : (
                artifact.versions.map(snap => (
                  <tr key={snap.version} className="hover:bg-brand-navy/[0.02]">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-level1 bg-brand-navy text-white shadow-level1 tabular-nums">
                        {snap.version}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-black dark:text-white">
                        {snap.changelog || 'Routine pipeline release'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-grey font-medium">
                      {snap.publishedBy?.name || 'Author'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-grey tabular-nums">
                      {snap.publishedAt.split('T')[0]}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSnapshot(snap)}
                          className="px-2.5 py-1 rounded-level2 bg-brand-navy/[0.04] hover:bg-brand-navy hover:text-white text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Inspect
                        </button>
                        <button
                          onClick={() => handleRevert(snap.version)}
                          className="px-2.5 py-1 rounded-level2 border border-brand-navy/15 hover:bg-brand-navy/[0.05] text-brand-navy dark:text-white font-bold text-[10px] uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Changelog / Release Notes *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Added Schedule K-1 Part III box parsing & updated currency validation regex..."
              value={changelog}
              onChange={e => setChangelog(e.target.value)}
              className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-navy font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-grey mb-1">
              Select Project *
            </label>
            {unlinkedProjects.length === 0 ? (
              <p className="text-xs text-brand-grey py-2 text-center">All projects are already linked.</p>
            ) : (
              <select
                value={selectedProjectToLink}
                onChange={e => setSelectedProjectToLink(e.target.value)}
                className="w-full px-3.5 py-2 rounded-level2 bg-white dark:bg-slate-800 border border-brand-navy/15 dark:border-white/15 text-brand-black dark:text-white text-xs font-medium"
              >
                <option value="">-- Choose Project --</option>
                {unlinkedProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
            <span className="font-bold uppercase text-[10px] text-brand-grey">Changelog: </span>
            <span className="font-medium text-brand-black dark:text-white">{selectedSnapshot?.changelog}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-grey">Stage 1 Prompt</span>
              <pre className="p-3 bg-brand-navy/[0.04] rounded font-mono text-[11px] overflow-auto max-h-48 border border-brand-navy/[0.08]">
                {selectedSnapshot?.stage1Prompt}
              </pre>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-grey">Stage 2 Prompt</span>
              <pre className="p-3 bg-brand-navy/[0.04] rounded font-mono text-[11px] overflow-auto max-h-48 border border-brand-navy/[0.08]">
                {selectedSnapshot?.stage2Prompt}
              </pre>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-grey">JSON Schema</span>
            <pre className="p-3 bg-brand-navy/[0.04] rounded font-mono text-[11px] overflow-auto max-h-48 border border-brand-navy/[0.08]">
              {selectedSnapshot?.jsonSchema}
            </pre>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-navy/[0.06] dark:border-white/10">
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
