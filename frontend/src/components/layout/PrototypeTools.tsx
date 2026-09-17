import React, { useState } from 'react';
import { usePrototype } from '../../context/PrototypeContext';
import { UserCheck, Moon, Sun, RotateCcw, Map, Settings2 } from 'lucide-react';
import type { PersonaType } from '../../../../shared/types';
import { ArchitectureMapModal } from '../organisms/ArchitectureMapModal';

export const PrototypeTools: React.FC = () => {
  const { persona, switchPersona, darkMode, toggleDarkMode, resetData } = usePrototype();
  const [isOpen, setIsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const personas: { id: PersonaType; label: string; roleDesc: string }[] = [
    { id: 'admin', label: 'Admin (Sarah Jenkins)', roleDesc: 'Full permissions, user management, project & artifact publishing' },
    { id: 'author', label: 'Prompt Author (Alex Chen)', roleDesc: 'Drafts extraction & refinement prompts, defines schemas, runs validation' },
    { id: 'developer', label: 'Developer (Marcus Vance)', roleDesc: 'Creates projects, links shared artifacts, consumes published schemas' },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-ink-primary hover:bg-surface-hover border border-surface-border transition-colors"
          title="Prototype Tools & Persona Switcher"
        >
          <Settings2 className="w-3.5 h-3.5 text-action-primary" />
          <span className="hidden sm:inline">Prototype Tools</span>
          <span className="px-1.5 py-0.2 rounded bg-action-primary/10 text-action-primary text-[10px] uppercase font-bold">
            {persona}
          </span>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-80 rounded-lg bg-surface border border-surface-border shadow-hover z-50 p-4 space-y-4 animate-in fade-in duration-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-primary flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-action-primary" /> Active Persona
              </span>
              <span className="text-[10px] text-ink-muted">React Context</span>
            </div>

            <div className="space-y-1.5">
              {personas.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    switchPersona(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-md border transition-all ${
                    persona === p.id
                      ? 'bg-action-primary/10 border-action-primary text-ink-primary'
                      : 'border-transparent hover:bg-surface-hover text-ink-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{p.label}</span>
                    {persona === p.id && <span className="w-2 h-2 rounded-full bg-action-primary" />}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{p.roleDesc}</p>
                </button>
              ))}
            </div>

            <div className="border-t border-surface-border pt-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Prototype Utilities</div>
              
              <button
                onClick={() => {
                  setIsMapOpen(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded text-xs text-ink-primary hover:bg-surface-hover border border-surface-border/50"
              >
                <span className="flex items-center gap-2">
                  <Map className="w-3.5 h-3.5 text-action-accent" /> Architecture Map
                </span>
                <span className="text-[10px] text-ink-muted">Vis / Diagram</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between p-2 rounded text-xs text-ink-primary hover:bg-surface-hover border border-surface-border/50"
              >
                <span className="flex items-center gap-2">
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-seic-yellow" /> : <Moon className="w-3.5 h-3.5 text-seic-navy" />}
                  Dark Mode
                </span>
                <span className="text-[10px] text-ink-muted">{darkMode ? 'Active' : 'Light'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset prototype mock store to initial seeds?')) {
                    resetData();
                    setIsOpen(false);
                  }
                }}
                className="w-full flex items-center justify-between p-2 rounded text-xs text-status-error-text hover:bg-status-error/10 border border-status-error/20"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Mock Data
                </span>
                <span className="text-[10px] text-ink-muted">Seed Fixtures</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ArchitectureMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </>
  );
};
