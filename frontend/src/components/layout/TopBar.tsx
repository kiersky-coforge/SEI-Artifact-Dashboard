import React from 'react';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  return (
    <header className="md:hidden h-14 bg-surface border-b border-surface-border px-4 flex items-center gap-3 sticky top-0 z-30 shadow-xs">
      <button
        onClick={onToggleMobileMenu}
        className="p-1.5 -ml-1.5 rounded-level2 text-ink-secondary hover:text-brand-navy dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        title="Open Menu"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-level2 bg-brand-navy dark:bg-seic-blue flex items-center justify-center text-white font-black text-[10px] tracking-tighter shadow-level1">
          SEI
        </div>
        <span className="text-xs font-black tracking-tight text-ink-primary uppercase font-display">
          Artifacts
        </span>
      </div>
    </header>
  );
};
