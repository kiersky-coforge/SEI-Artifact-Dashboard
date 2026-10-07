import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Search, ChevronDown, Check, X, Box } from 'lucide-react';
import { StatusBadge } from '../atoms/StatusBadge';
import type { Artifact } from '../../../../shared/types';

export interface ArtifactSearchSelectProps {
  artifacts: Artifact[];
  selectedMode: 'none' | 'new' | 'existing';
  selectedArtifactId?: string;
  onSelectNew: (suggestedName?: string) => void;
  onSelectExisting: (artifactId: string) => void;
  onClear?: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const ArtifactSearchSelect: React.FC<ArtifactSearchSelectProps> = ({
  artifacts,
  selectedMode,
  selectedArtifactId,
  onSelectNew,
  onSelectExisting,
  onClear,
  placeholder = 'Search or select an unlinked artifact, or create new...',
  label = 'Select or Create Artifact',
  required = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedArtifact = useMemo(() => {
    if (selectedMode === 'existing' && selectedArtifactId) {
      return artifacts.find(a => a.id === selectedArtifactId);
    }
    return null;
  }, [artifacts, selectedMode, selectedArtifactId]);

  // Filter artifacts based on search
  const filteredArtifacts = useMemo(() => {
    if (!searchQuery.trim()) return artifacts;
    const q = searchQuery.toLowerCase();
    return artifacts.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.currentVersion.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [artifacts, searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelectNew = () => {
    onSelectNew(searchQuery.trim() || undefined);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectExisting = (id: string) => {
    onSelectExisting(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
          {label} {required && <span className="text-alert-coral">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className={`w-full bg-surface border rounded-level2 px-3.5 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-all shadow-sm select-none ${
          isOpen
            ? 'border-brand-navy dark:border-seic-blue ring-1 ring-focus'
            : 'border-input hover:border-brand-navy/50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          {selectedMode === 'new' ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-brand-coral/10 text-brand-coral">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span className="font-bold text-ink-primary truncate">
                + Create New Empty Artifact
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-coral/10 text-brand-coral border border-brand-coral/20">
                New
              </span>
            </div>
          ) : selectedArtifact ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-brand-navy/10 dark:bg-white/10 text-brand-navy dark:text-white">
                <Box className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-ink-primary truncate">
                {selectedArtifact.name}
              </span>
              <span className="text-[10px] font-mono text-ink-secondary px-1.5 py-0.5 rounded bg-surface border border-surface-border">
                {selectedArtifact.currentVersion}
              </span>
              <StatusBadge status={selectedArtifact.status} />
            </div>
          ) : (
            <span className="text-ink-muted truncate font-normal">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selectedMode !== 'none' && onClear && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
              className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-navy dark:text-seic-blue' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-surface-border rounded-level2 shadow-level3 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col max-h-72"
        >
          {/* Integrated Search Box */}
          <div className="p-2 border-b border-surface-border bg-brand-navy/[0.02] dark:bg-white/[0.02]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search artifacts or type new name..."
                className="w-full bg-surface border border-input rounded-level1 py-1.5 pl-8 pr-7 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-focus"
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredArtifacts.length > 0) {
                      handleSelectExisting(filteredArtifacts[0].id);
                    } else {
                      handleSelectNew();
                    }
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-ink-muted hover:text-ink-primary"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto divide-y divide-surface-border p-1 space-y-1">
            {/* 1st Option: Create New Artifact (Always at the very top!) */}
            <div
              role="option"
              aria-selected={selectedMode === 'new'}
              onClick={handleSelectNew}
              className={`flex items-center justify-between p-2.5 rounded-level1 cursor-pointer transition-colors group ${
                selectedMode === 'new'
                  ? 'bg-brand-coral/10 text-brand-coral border border-brand-coral/20'
                  : 'hover:bg-brand-coral/5 text-ink-primary'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-level1 bg-brand-coral/10 group-hover:bg-brand-coral group-hover:text-white text-brand-coral flex items-center justify-center flex-shrink-0 transition-colors">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-brand-coral flex items-center gap-1.5">
                    + Create New Empty Artifact
                    {searchQuery.trim() && (
                      <span className="font-normal text-ink-secondary text-[11px] truncate">
                        "{searchQuery.trim()}"
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-ink-secondary">
                    Initialize a new extraction pipeline directly bound to this workspace
                  </div>
                </div>
              </div>

              {selectedMode === 'new' && (
                <Check className="w-4 h-4 text-brand-coral flex-shrink-0 mr-1" />
              )}
            </div>

            {/* Existing Artifacts Section */}
            <div className="pt-1">
              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-ink-secondary bg-brand-navy/[0.02]">
                Available Unattached Artifacts ({filteredArtifacts.length})
              </div>

              {filteredArtifacts.length === 0 ? (
                <div className="py-4 px-3 text-center text-xs text-ink-secondary">
                  {artifacts.length === 0
                    ? 'No unattached artifacts available. Select "+ Create New Empty Artifact" above to create one.'
                    : `No unattached artifacts matching "${searchQuery}".`}
                </div>
              ) : (
                <div className="space-y-0.5 mt-0.5">
                  {filteredArtifacts.map(art => {
                    const isSelected = selectedMode === 'existing' && selectedArtifactId === art.id;
                    return (
                      <div
                        key={art.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectExisting(art.id)}
                        className={`flex items-center justify-between p-2 rounded-level1 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-brand-navy/[0.08] dark:bg-white/10 font-semibold'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <div className="w-6 h-6 rounded bg-brand-navy/5 dark:bg-white/5 text-brand-navy dark:text-white flex items-center justify-center flex-shrink-0">
                            <Box className="w-3.5 h-3.5 opacity-70" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-ink-primary truncate">
                                {art.name}
                              </span>
                              <span className="text-[9px] font-mono text-ink-secondary px-1 py-0.2 rounded bg-surface border border-surface-border">
                                {art.currentVersion}
                              </span>
                              <StatusBadge status={art.status} />
                            </div>
                            {art.description && (
                              <p className="text-[10px] text-ink-secondary truncate mt-0.5">
                                {art.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-navy dark:text-seic-blue flex-shrink-0 mr-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
