import React, { useState, useRef, useMemo } from 'react';
import {
  Copy,
  Check,
  Code,
  FileText,
  Eye,
  Edit3,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Link as LinkIcon,
  Table as TableIcon,
  Braces,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { marked } from 'marked';

interface PromptEditorProps {
  label?: string;
  title?: string;
  value: string;
  onChange: (val: string) => void;
  language?: 'markdown' | 'json' | 'plaintext' | 'prompt';
  mode?: 'markdown' | 'json' | 'plaintext' | 'prompt';
  height?: string;
  placeholder?: string;
  readOnly?: boolean;
  description?: string;
  subtitle?: string;
  initialViewMode?: 'preview' | 'edit';
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  label,
  title,
  value,
  onChange,
  language,
  mode = 'plaintext',
  height = '380px',
  placeholder,
  readOnly = false,
  description,
  subtitle,
  initialViewMode = 'preview',
}) => {
  const [copied, setCopied] = useState(false);
  const [formattedAlert, setFormattedAlert] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const displayTitle = title || label || 'Editor';
  const displaySubtitle = subtitle || description;
  const langMode = language || mode;
  const isMarkdown = langMode === 'markdown' || langMode === 'prompt' || langMode === 'plaintext';
  const isJson = langMode === 'json';

  // Default to 'preview' mode for markdown/prompt editors when not actively editing
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>(() => {
    if (isJson) return 'edit';
    return initialViewMode;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert markdown to HTML for styled preview
  const renderedHtml = useMemo(() => {
    if (!isMarkdown || !value.trim()) return '';
    try {
      return marked.parse(value, {
        gfm: true,
        breaks: true,
      }) as string;
    } catch {
      return value;
    }
  }, [value, isMarkdown]);

  // Rich markdown formatting actions
  const applyFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToWrap = selectedText || defaultPlaceholder;
    const replacement = `${prefix}${textToWrap}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const cursorStart = start + prefix.length;
      const cursorEnd = cursorStart + textToWrap.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 10);
  };

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    const lastNewline = value.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const before = value.substring(0, lineStart);
    const after = value.substring(lineStart);

    const newValue = `${before}${prefix}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n|---|---|---|\n| Value 1 | Value 2 | Value 3 |\n| Value 4 | Value 5 | Value 6 |\n`;
    applyFormatting(tableTemplate, '', '');
  };

  const insertVariable = (varName: string = 'document_text') => {
    applyFormatting(`{{${varName}}}`, '', '');
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setJsonError(null);
      setFormattedAlert(true);
      setTimeout(() => setFormattedAlert(false), 2000);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
      setTimeout(() => setJsonError(null), 3500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    // Ctrl+B / Cmd+B -> Bold
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormatting('**', '**', 'bold text');
    }
    // Ctrl+I / Cmd+I -> Italic
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormatting('*', '*', 'italic text');
    }
    // Ctrl+K / Cmd+K -> Link
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      applyFormatting('[', '](https://example.com)', 'link text');
    }
    // Tab key indent
    else if (e.key === 'Tab') {
      e.preventDefault();
      applyFormatting('  ', '', '');
    }
  };

  return (
    <div className="flex flex-col border border-surface-border rounded-level4 overflow-hidden bg-surface shadow-level1">
      {/* Top Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-brand-navy/[0.02] dark:bg-white/[0.02] border-b border-surface-border">
        {/* Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          {isJson ? (
            <Code className="w-4 h-4 text-brand-coral flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-brand-navy dark:text-brand-blue flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-primary truncate block">
              {displayTitle}
            </span>
            {displaySubtitle && (
              <p className="text-[10px] text-ink-secondary font-medium truncate">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions: Segmented View Mode Toggle & Copy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMarkdown && (
            <div className="flex items-center p-0.5 bg-brand-navy/[0.06] dark:bg-white/[0.08] rounded-level2 border border-surface-border">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-level1 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewMode === 'preview'
                    ? 'bg-surface text-brand-navy dark:text-white shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="Preview styled markdown"
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('edit');
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
                className={`px-2.5 py-1 rounded-level1 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  viewMode === 'edit'
                    ? 'bg-surface text-brand-navy dark:text-white shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
                title="Edit markdown source with rich toolbar"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          )}

          {isJson && (
            <button
              type="button"
              onClick={handleFormatJson}
              className="px-2 py-1 rounded-level2 bg-brand-navy/[0.04] hover:bg-brand-navy/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-ink-primary text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
              title="Format / Beautify JSON indentation"
            >
              <Wand2 className="w-3 h-3 text-brand-coral" />
              <span>Format JSON</span>
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[10px]"
            icon={copied ? <Check className="w-3 h-3 text-brand-green" /> : <Copy className="w-3 h-3" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* JSON Error / Format feedback alerts */}
      {jsonError && (
        <div className="px-4 py-1.5 bg-alert-coral/10 text-alert-coral text-[11px] font-medium border-b border-alert-coral/20">
          JSON Error: {jsonError}
        </div>
      )}
      {formattedAlert && (
        <div className="px-4 py-1.5 bg-brand-green/10 text-brand-green text-[11px] font-bold uppercase tracking-wider border-b border-brand-green/20 flex items-center gap-1.5">
          <Check className="w-3 h-3" /> Formatted JSON Schema successfully
        </div>
      )}

      {/* Rich Markdown Formatting Toolbar (Shown in Edit Mode for Markdown/Prompt) */}
      {isMarkdown && viewMode === 'edit' && !readOnly && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-brand-navy/[0.015] dark:bg-white/[0.015] border-b border-surface-border text-ink-secondary">
          {/* Text Style Group */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-surface-border">
            <button
              type="button"
              onClick={() => applyFormatting('**', '**', 'bold text')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('*', '*', 'italic text')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('~~', '~~', 'strikethrough text')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings Group */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-surface-border">
            <button
              type="button"
              onClick={() => applyLinePrefix('# ')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('## ')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('### ')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists & Quote */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-surface-border">
            <button
              type="button"
              onClick={() => applyLinePrefix('- ')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Bulleted List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('1. ')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyLinePrefix('> ')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Code & Links */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-surface-border">
            <button
              type="button"
              onClick={() => applyFormatting('`', '`', 'code')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none font-mono text-xs font-bold"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('```\n', '\n```', 'code block content')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Code Block"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('[', '](https://example.com)', 'link title')}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Insert Link (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertTable}
              className="p-1.5 rounded hover:bg-brand-navy/[0.06] hover:text-ink-primary dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              title="Insert Table Structure"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Variables & LLM Template Tokens */}
          <div className="flex items-center gap-1 pl-1.5">
            <button
              type="button"
              onClick={() => insertVariable('document_text')}
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-navy/[0.05] hover:bg-brand-navy/10 text-brand-navy dark:text-brand-blue flex items-center gap-1 transition-colors"
              title="Insert {{document_text}} placeholder variable"
            >
              <Braces className="w-3 h-3 text-brand-coral" />
              <span>{'{{document}}'}</span>
            </button>
            <button
              type="button"
              onClick={() => insertVariable('schema_rules')}
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-navy/[0.05] hover:bg-brand-navy/10 text-brand-navy dark:text-brand-blue flex items-center gap-1 transition-colors"
              title="Insert {{schema_rules}} placeholder variable"
            >
              <Sparkles className="w-3 h-3 text-brand-green" />
              <span>{'{{rules}}'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Styled Markdown Preview vs Editable Textarea */}
      <div
        className="relative overflow-y-auto"
        style={{ minHeight: height, maxHeight: height }}
      >
        {isMarkdown && viewMode === 'preview' ? (
          <div
            onClick={() => {
              if (!readOnly) {
                setViewMode('edit');
                setTimeout(() => textareaRef.current?.focus(), 50);
              }
            }}
            className={`p-5 min-h-full ${
              readOnly ? '' : 'cursor-text hover:bg-brand-navy/[0.008] transition-colors'
            }`}
          >
            {value.trim() ? (
              <div
                className="markdown-preview select-text"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-8 h-8 text-ink-secondary/40 mb-2" />
                <p className="text-xs font-semibold text-ink-secondary">
                  No prompt instructions defined yet.
                </p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('edit');
                      setTimeout(() => textareaRef.current?.focus(), 50);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-level2 bg-brand-navy text-white text-[11px] font-bold uppercase tracking-wider hover:bg-brand-navy/90 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Compose Instructions
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full h-full p-4 font-mono text-xs leading-relaxed bg-surface text-ink-primary placeholder:text-ink-secondary/50 focus:outline-none focus:ring-1 focus:ring-focus resize-none"
            spellCheck={false}
          />
        )}
      </div>

      {/* Footer bar for Edit Mode */}
      {isMarkdown && viewMode === 'edit' && !readOnly && (
        <div className="flex items-center justify-between px-4 py-2 bg-brand-navy/[0.02] dark:bg-white/[0.02] border-t border-surface-border text-[11px] text-ink-secondary">
          <span className="text-[10px] font-medium text-ink-secondary/70">
            Supports GitHub-flavored Markdown &bull; Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+K (Link)
          </span>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-brand-navy dark:text-brand-blue hover:underline inline-flex items-center gap-1"
          >
            <Eye className="w-3 h-3" /> Switch to Preview
          </button>
        </div>
      )}
    </div>
  );
};
