import React from 'react';
import { NavLink } from 'react-router-dom';
import { FolderKanban, Cpu, Users } from 'lucide-react';
import { PrototypeTools } from './PrototypeTools';
import { usePrototype } from '../../context/PrototypeContext';

export const Header: React.FC = () => {
  const { persona } = usePrototype();

  const navItems = [
    { to: '/projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { to: '/artifacts', label: 'All Artifacts', icon: <Cpu className="w-4 h-4" /> },
    ...(persona === 'admin'
      ? [{ to: '/users', label: 'User Management', icon: <Users className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-surface-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/projects" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-action-primary flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm group-hover:bg-action-primary-hover transition-colors">
              SEI
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-ink-primary flex items-center gap-1.5">
                Artifact Dashboard
              </span>
              <span className="text-[10px] text-ink-muted -mt-0.5 tracking-wider uppercase font-semibold">
                Extraction & Schema Hub
              </span>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-hover text-ink-primary border border-surface-border font-semibold shadow-xs'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover/50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <PrototypeTools />
        </div>
      </div>
    </header>
  );
};
