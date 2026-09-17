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

  const path = location.pathname;

  let pageTitle = 'Dashboard';
  let kicker = 'SEI Technology';
  let icon = <FolderKanban className="w-4 h-4 text-brand-navy dark:text-brand-blue" />;

  if (path.startsWith('/projects/')) {
    const projId = path.split('/')[2];
    const currentProj = projects.find(p => p.id === projId);
    kicker = 'Projects';
    pageTitle = currentProj ? currentProj.name : 'Project Workspace';
    icon = <FolderKanban className="w-4 h-4 text-brand-navy dark:text-brand-blue" />;
  } else if (path.startsWith('/projects')) {
    kicker = 'Workspaces';
    pageTitle = 'Projects & Pipelines';
    icon = <FolderKanban className="w-4 h-4 text-brand-navy dark:text-brand-blue" />;
  } else if (path.startsWith('/artifacts/')) {
    const artId = path.split('/')[2];
    const currentArt = artifacts.find(a => a.id === artId);
    kicker = 'Artifacts Hub';
    pageTitle = currentArt ? currentArt.name : 'Artifact Editor';
    icon = <Cpu className="w-4 h-4 text-brand-coral" />;
  } else if (path.startsWith('/artifacts')) {
    kicker = 'Schema Registry';
    pageTitle = 'Artifacts Library';
    icon = <Cpu className="w-4 h-4 text-brand-coral" />;
  } else if (path.startsWith('/users')) {
    kicker = 'Governance';
    pageTitle = 'User Management';
    icon = <Users className="w-4 h-4 text-brand-green" />;
  }

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-brand-navy/[0.06] dark:border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-level2 text-brand-grey hover:text-brand-navy dark:hover:text-white transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="hidden sm:inline-flex p-1.5 rounded-level1 bg-brand-navy/[0.04] dark:bg-white/5 text-brand-navy dark:text-brand-blue border border-brand-navy/[0.06]">
            {icon}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-grey leading-tight">
              {kicker}
            </span>
            <span className="text-xs sm:text-sm font-bold uppercase text-brand-black dark:text-white truncate leading-tight font-display">
              {pageTitle}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-navy/[0.03] dark:bg-white/5 border border-brand-navy/[0.06] text-brand-grey">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span>Stratos Institutional Live</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-level2 bg-brand-navy text-white text-[10px] font-bold uppercase tracking-widest shadow-level1 font-mono">
          <span>{persona}</span>
        </div>
      </div>
    </header>
  );
};
