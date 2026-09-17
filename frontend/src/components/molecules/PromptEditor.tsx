import React, { useState } from 'react';
import { Copy, Check, Code, FileText } from 'lucide-react';
import { Button } from '../atoms/Button';

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
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  label,
  title,
  value,
  onChange,
  language,
  mode = 'plaintext',
  height = 'h-64',
  placeholder,
  readOnly = false,
  description,
  subtitle,
}) => {
  const [copied, setCopied] = useState(false);

  const displayTitle = title || label || 'Code Editor';
  const displaySubtitle = subtitle || description;
  const langMode = language || mode;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = (value.match(/\n/g) || []).length + 1;

  return (
    <div className="flex flex-col border border-brand-navy/[0.08] dark:border-white/10 rounded-level4 overflow-hidden bg-white dark:bg-slate-900 shadow-level1">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-navy/[0.02] dark:bg-white/[0.02] border-b border-brand-navy/[0.06] dark:border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          {langMode === 'json' ? (
            <Code className="w-4 h-4 text-brand-coral flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-brand-navy dark:text-brand-blue flex-shrink-0" />
          )}
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-black dark:text-white truncate">
              {displayTitle}
            </span>
            {displaySubtitle && (
              <p className="text-[10px] text-brand-grey font-medium truncate">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-brand-navy/[0.04] text-brand-grey tabular-nums">
            {lineCount} lines
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
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
          style={{ height: height.includes('px') ? height : undefined }}
          className={`w-full ${height.includes('px') ? '' : height} p-4 font-mono text-xs leading-relaxed bg-white dark:bg-slate-900 text-brand-black dark:text-white placeholder:text-brand-grey/50 focus:outline-none focus:ring-1 focus:ring-brand-navy resize-y`}
          spellCheck={false}
        />
      </div>
    </div>
  );
};
