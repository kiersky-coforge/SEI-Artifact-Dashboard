import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Cpu, FolderKanban, Users } from 'lucide-react';
import { usePrototype } from '../../context/PrototypeContext';

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const location = useLocation();
  const { persona, projects, artifacts } = usePrototype();

  // Determine current page context & breadcrumbs
  const path = location.pathname;

  let pageTitle = 'Dashboard';
  let kicker = 'SEI Technology';
  let icon = <FolderKanban className="w-4 h-4 text-action-primary" />;

  if (path.startsWith('/projects/')) {
    const projId = path.split('/')[2];
    const currentProj = projects.find(p => p.id === projId);
    kicker = 'Projects';
    pageTitle = currentProj ? currentProj.name : 'Project Workspace';
    icon = <FolderKanban className="w-4 h-4 text-action-primary" />;
  } else if (path.startsWith('/projects')) {
    kicker = 'Workspaces';
    pageTitle = 'Projects & Pipelines';
    icon = <FolderKanban className="w-4 h-4 text-action-primary" />;
  } else if (path.startsWith('/artifacts/')) {
    const artId = path.split('/')[2];
    const currentArt = artifacts.find(a => a.id === artId);
    kicker = 'Artifacts Hub';
    pageTitle = currentArt ? currentArt.name : 'Artifact Editor';
    icon = <Cpu className="w-4 h-4 text-action-accent" />;
  } else if (path.startsWith('/artifacts')) {
    kicker = 'Schema Registry';
    pageTitle = 'All Artifacts';
    icon = <Cpu className="w-4 h-4 text-action-accent" />;
  } else if (path.startsWith('/users')) {
    kicker = 'Governance';
    pageTitle = 'User Management';
    icon = <Users className="w-4 h-4 text-brand-green" />;
  }

  return (
    <header className="h-14 bg-surface border-b border-surface-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-level1 text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline-flex p-1.5 rounded-level1 bg-surface-hover text-ink-primary border border-surface-border">
            {icon}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted leading-tight">
              {kicker}
            </span>
            <span className="text-xs sm:text-sm font-bold text-ink-primary truncate leading-tight">
              {pageTitle}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-surface-hover border border-surface-border text-ink-secondary">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Institutional Mock API</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-level1 bg-action-primary/10 text-action-primary text-xs font-bold uppercase tracking-wide">
          <span>{persona}</span>
        </div>
      </div>
    </header>
  );
};
