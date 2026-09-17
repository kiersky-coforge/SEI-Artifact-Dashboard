import React, { useState } from 'react';
import { Copy, Check, Code, FileText } from 'lucide-react';
import { Button } from '../atoms/Button';

interface PromptEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  language?: 'markdown' | 'json' | 'plaintext';
  height?: string;
  placeholder?: string;
  readOnly?: boolean;
  description?: string;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  label,
  value,
  onChange,
  language = 'plaintext',
  height = 'h-64',
  placeholder,
  readOnly = false,
  description,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = (value.match(/\n/g) || []).length + 1;

  return (
    <div className="flex flex-col border border-surface-border rounded-lg overflow-hidden bg-surface">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-hover border-b border-surface-border">
        <div className="flex items-center gap-2">
          {language === 'json' ? (
            <Code className="w-4 h-4 text-action-accent" />
          ) : (
            <FileText className="w-4 h-4 text-ink-brand" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            {label}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface border border-surface-border text-ink-muted">
            {language}
          </span>
          {description && <span className="text-xs text-ink-muted">({description})</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted">{lineCount} lines</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-3.5 h-3.5 text-status-success-text" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full ${height} p-4 font-mono text-xs leading-relaxed bg-surface text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:ring-1 focus:ring-focus resize-y`}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
