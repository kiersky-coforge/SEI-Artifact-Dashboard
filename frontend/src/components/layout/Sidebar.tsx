import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePrototype } from '../../context/PrototypeContext';
import {
  FolderKanban,
  Cpu,
  Users,
  ChevronLeft,
  Sun,
  Moon,
  Map,
  RotateCcw,
  Check,
  UserCheck,
  X,
} from 'lucide-react';
import type { PersonaType } from '../../../../shared/types';
import { ArchitectureMapModal } from '../organisms/ArchitectureMapModal';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { persona, switchPersona, darkMode, toggleDarkMode, resetData, projects, artifacts } = usePrototype();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sei_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sei_sidebar_collapsed', String(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname, setIsMobileOpen]);

  const navItems = [
    {
      to: '/projects',
      label: 'Projects',
      icon: <FolderKanban className="w-4 h-4 flex-shrink-0" />,
      badge: projects.length,
      description: 'Workspaces & artifact bindings',
    },
    {
      to: '/artifacts',
      label: 'Artifacts',
      icon: <Cpu className="w-4 h-4 flex-shrink-0" />,
      badge: artifacts.length,
      description: 'Prompt pipelines & schemas',
    },
    {
      to: '/users',
      label: 'Users',
      icon: <Users className="w-4 h-4 flex-shrink-0" />,
      badge: undefined,
      description: 'RBAC governance & assignments',
      adminOnly: true,
    },
  ];

  const personas: { id: PersonaType; name: string; title: string; initials: string }[] = [
    { id: 'admin', name: 'Sarah Jenkins', title: 'System Administrator', initials: 'SJ' },
    { id: 'author', name: 'Alex Chen', title: 'Senior Prompt Author', initials: 'AC' },
    { id: 'developer', name: 'Marcus Vance', title: 'Integration Developer', initials: 'MV' },
  ];

  const currentPersonaInfo = personas.find(p => p.id === persona) || personas[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-surface border-r border-surface-border flex-shrink-0 shadow-level3 flex flex-col z-[200] transition-all duration-300 ease-in-out fixed inset-y-0 left-0 md:sticky md:top-0 md:translate-x-0 select-none ${
          isCollapsed ? 'w-[68px]' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ height: '100vh' }}
      >
        {/* Header / Logo Lockup */}
        {isCollapsed ? (
          <div className="px-2 pt-5 pb-4 flex flex-col items-center gap-2 border-b border-surface-border">
            <NavLink to="/projects" className="cursor-pointer hover:opacity-80 transition-opacity flex flex-col items-center gap-1.5" title="Artifact Dashboard">
              <div className="w-8 h-8 rounded-level2 bg-brand-navy dark:bg-seic-blue flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-level1">
                SEI
              </div>
            </NavLink>
            <button
              onClick={() => setIsCollapsed(false)}
              title="Expand navigation"
              aria-label="Expand navigation"
              className="p-1 rounded-level2 hover:bg-brand-navy/[0.06] text-ink-secondary/50 hover:text-brand-navy transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        ) : (
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-2 border-b border-surface-border pb-4">
              <NavLink to="/projects" className="flex-1 cursor-pointer group flex items-center gap-2.5 min-w-0" title="Artifact Dashboard">
                <div className="w-8 h-8 rounded-level2 bg-brand-navy dark:bg-seic-blue flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-level1 flex-shrink-0">
                  SEI
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black tracking-tight text-ink-primary uppercase font-display leading-none truncate">
                    Artifacts
                  </span>
                  <span className="text-[10px] text-ink-secondary font-bold uppercase tracking-widest leading-none mt-1 truncate">
                    Command Console
                  </span>
                </div>
              </NavLink>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCollapsed(true)}
                  title="Collapse navigation"
                  aria-label="Collapse navigation"
                  className="hidden md:flex flex-shrink-0 p-1 rounded-level2 hover:bg-brand-navy/[0.06] text-ink-secondary/50 hover:text-brand-navy transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="md:hidden p-1 rounded-level2 text-ink-secondary hover:text-brand-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav
          className="flex-1 flex flex-col gap-1.5 overflow-y-auto pt-2"
          style={{ paddingLeft: isCollapsed ? '8px' : '16px', paddingRight: isCollapsed ? '8px' : '16px' }}
        >
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);

            if (isCollapsed) {
              return (
                <div key={item.to} className="relative group/navitem">
                  <NavLink
                    to={item.to}
                    title={item.label}
                    className={`w-full flex items-center justify-center h-10 rounded-level2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isActive
                        ? 'bg-brand-navy text-white shadow-level1'
                        : 'text-ink-secondary hover:text-brand-navy hover:bg-brand-navy/[0.05]'
                    }`}
                  >
                    {item.icon}
                  </NavLink>
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-surface rounded-level2 shadow-level4 border border-surface-border whitespace-nowrap opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible group-focus-within/navitem:opacity-100 group-focus-within/navitem:visible transition-all duration-150 z-[200] pointer-events-none">
                    <span className="text-xs font-bold uppercase tracking-wide text-brand-navy dark:text-white">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-level2 group transition-all text-xs font-bold uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  isActive
                    ? 'bg-brand-navy text-white shadow-level1'
                    : 'text-ink-secondary hover:text-brand-navy hover:bg-brand-navy/[0.04]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-ink-secondary group-hover:text-brand-navy'}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-brand-navy/[0.06] text-ink-secondary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Persona Footer (Stratos Style) */}
        <div className="p-4 border-t border-surface-border bg-brand-navy/[0.02] dark:bg-white/[0.02] relative">
          <div className="relative">
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-1' : 'gap-3 p-2'
              } rounded-level2 hover:bg-brand-navy/[0.04] transition-all text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-focus`}
              title={`${currentPersonaInfo.name} (${currentPersonaInfo.title})`}
              aria-label={`Switch persona (currently ${currentPersonaInfo.name})`}
            >
              <div className="w-9 h-9 rounded-level3 bg-brand-navy dark:bg-seic-blue text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-level1">
                {currentPersonaInfo.initials}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-ink-primary uppercase leading-snug truncate">
                    {currentPersonaInfo.name}
                  </div>
                  <div className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wide truncate">
                    {currentPersonaInfo.title}
                  </div>
                </div>
              )}
            </button>

            {/* Persona Switcher Popover */}
            {isPersonaOpen && (
              <div
                className="absolute bottom-full left-0 mb-3 w-72 bg-surface rounded-level3 shadow-level4 border border-surface-border p-3 space-y-2 z-[200] animate-in fade-in duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-brand-navy dark:text-brand-blue" />
                    Active Persona
                  </span>
                  <button
                    onClick={() => setIsPersonaOpen(false)}
                    aria-label="Close persona switcher"
                    className="text-ink-secondary hover:text-brand-navy text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  {personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setIsPersonaOpen(false);
                      }}
                      aria-current={persona === p.id ? 'true' : undefined}
                      className={`w-full text-left p-2.5 rounded-level2 transition-all flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                        persona === p.id
                          ? 'bg-brand-navy text-white shadow-level1'
                          : 'hover:bg-brand-navy/[0.04] text-ink-primary'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                          {p.name}
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              persona === p.id ? 'bg-white/20 text-white' : 'bg-brand-navy/5 text-ink-secondary'
                            }`}
                          >
                            {p.id}
                          </span>
                        </div>
                        <div
                          className={`text-[10px] font-medium truncate ${
                            persona === p.id ? 'text-white/80' : 'text-ink-secondary'
                          }`}
                        >
                          {p.title}
                        </div>
                      </div>
                      {persona === p.id && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-surface-border space-y-1">
                  <div className="px-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
                    System Tools
                  </div>

                  <button
                    onClick={() => {
                      setIsMapOpen(true);
                      setIsPersonaOpen(false);
                    }}
                    className="w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-level2 transition-all hover:bg-brand-navy/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <span className="w-7 h-7 rounded-level2 bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
                      <Map className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-primary">Architecture Map</span>
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    className="w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-level2 transition-all hover:bg-brand-navy/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <span className="w-7 h-7 rounded-level2 bg-brand-navy/10 text-brand-navy dark:text-brand-blue flex items-center justify-center flex-shrink-0">
                      {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-primary">
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset prototype mock database to seed defaults?')) {
                        resetData();
                        setIsPersonaOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-3 text-left px-2.5 py-2 rounded-level2 transition-all hover:bg-alert-coral/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <span className="w-7 h-7 rounded-level2 bg-alert-coral/10 text-alert-coral flex items-center justify-center flex-shrink-0">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-primary">Reset Mock Store</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Architecture Map Modal */}
      <ArchitectureMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </>
  );
};
