import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: string;
  onChange: (val: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex-1 min-w-[200px] group ${className}`}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface border border-surface-border rounded-level1 py-2 pl-9 pr-8 text-xs font-medium text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-brand-navy dark:focus:border-action-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        {...props}
      />
      <span className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
        <Search className="w-3.5 h-3.5 text-ink-muted group-focus-within:text-brand-navy dark:group-focus-within:text-action-primary transition-colors" />
      </span>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-0.5 top-0 bottom-0 px-2.5 text-ink-muted hover:text-ink-primary transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
