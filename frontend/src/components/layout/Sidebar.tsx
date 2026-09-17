import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePrototype } from '../../context/PrototypeContext';
import {
  FolderKanban,
  Cpu,
  Users,
  ChevronLeft,
  ChevronRight,
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

  // Collapsed state stored in localStorage
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

  // Close mobile drawer on route change
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
      label: 'All Artifacts',
      icon: <Cpu className="w-4 h-4 flex-shrink-0" />,
      badge: artifacts.length,
      description: 'Prompt pipelines & schemas',
    },
    {
      to: '/users',
      label: 'User Management',
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
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-surface-border transition-all duration-300 ease-in-out select-none ${
          isCollapsed ? 'md:w-[68px]' : 'md:w-64'
        } ${isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ height: '100vh' }}
      >
        {/* Header / Brand Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-surface-border">
          {isCollapsed ? (
            <div className="w-full flex flex-col items-center justify-center gap-1">
              <NavLink to="/projects" className="group flex items-center justify-center">
                <div className="w-9 h-9 rounded-level1 bg-brand-navy dark:bg-seic-blue flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-sm">
                  SEI
                </div>
              </NavLink>
              <button
                onClick={() => setIsCollapsed(false)}
                title="Expand Navigation"
                className="hidden md:flex p-1 rounded-level1 text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <NavLink to="/projects" className="flex items-center gap-2.5 group min-w-0">
                <div className="w-9 h-9 rounded-level1 bg-brand-navy dark:bg-seic-blue flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm flex-shrink-0 group-hover:opacity-90 transition-opacity">
                  SEI
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black tracking-tight text-ink-primary truncate uppercase font-sans">
                    Artifact Hub
                  </span>
                  <span className="text-[10px] text-ink-muted -mt-0.5 tracking-wider uppercase font-semibold truncate">
                    Extraction & Schema
                  </span>
                </div>
              </NavLink>

              <div className="flex items-center gap-1">
                {/* Desktop Collapse Button */}
                <button
                  onClick={() => setIsCollapsed(true)}
                  title="Collapse Navigation"
                  className="hidden md:flex p-1.5 rounded-level1 text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden p-1.5 rounded-level1 text-ink-muted hover:text-ink-primary hover:bg-surface-hover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Main Menu
            </div>
          )}

          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);

            return (
              <div key={item.to} className="relative group/nav">
                <NavLink
                  to={item.to}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                  } rounded-level2 text-xs font-semibold uppercase tracking-wide transition-all ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-card dark:bg-brand-blue/20 dark:text-brand-blue dark:border-l-2 dark:border-brand-blue'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-surface-border text-ink-secondary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>

                {/* Collapsed Hover Flyout Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-surface border border-surface-border shadow-hover rounded-level2 whitespace-nowrap opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-150 z-50 pointer-events-none">
                    <div className="text-xs font-bold text-ink-primary">{item.label}</div>
                    <div className="text-[10px] text-ink-muted">{item.description}</div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t border-surface-border my-3">
            {!isCollapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Prototype Tools
              </div>
            )}

            {/* Architecture Map Modal Launcher */}
            <div className="relative group/nav">
              <button
                onClick={() => setIsMapOpen(true)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                } rounded-level2 text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors`}
                title="Interactive Architecture Map"
              >
                <Map className="w-4 h-4 text-action-accent flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Architecture Map</span>}
              </button>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-surface border border-surface-border shadow-hover rounded-level2 whitespace-nowrap opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 pointer-events-none">
                  <span className="text-xs font-bold text-ink-primary">Architecture Map</span>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <div className="relative group/nav">
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                } rounded-level2 text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-seic-yellow flex-shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-seic-navy flex-shrink-0" />
                )}
                {!isCollapsed && (
                  <span className="truncate">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                )}
              </button>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-surface border border-surface-border shadow-hover rounded-level2 whitespace-nowrap opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 pointer-events-none">
                  <span className="text-xs font-bold text-ink-primary">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
              )}
            </div>

            {/* Reset Mock Data */}
            <div className="relative group/nav">
              <button
                onClick={() => {
                  if (confirm('Reset prototype mock database to seed defaults?')) {
                    resetData();
                  }
                }}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'
                } rounded-level2 text-xs font-semibold text-ink-secondary hover:text-brand-coral hover:bg-brand-coral/5 transition-colors`}
                title="Reset Prototype Data"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Reset Mock Store</span>}
              </button>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-surface border border-surface-border shadow-hover rounded-level2 whitespace-nowrap opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 pointer-events-none">
                  <span className="text-xs font-bold text-ink-primary">Reset Seeds</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: User & Persona Switcher */}
        <div className="p-3 border-t border-surface-border bg-surface-hover/30 relative">
          <div className="relative">
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-1.5' : 'gap-2.5 p-2'
              } rounded-level2 hover:bg-surface border border-transparent hover:border-surface-border transition-all text-left group`}
              title={`${currentPersonaInfo.name} (${currentPersonaInfo.title})`}
            >
              <div className="w-8 h-8 rounded-level1 bg-brand-navy dark:bg-seic-blue text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                {currentPersonaInfo.initials}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-primary truncate">
                      {currentPersonaInfo.name}
                    </span>
                    <span className="text-[9px] font-mono px-1 rounded bg-action-primary/10 text-action-primary uppercase font-semibold">
                      {persona}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink-muted truncate">
                    {currentPersonaInfo.title}
                  </div>
                </div>
              )}
            </button>

            {/* Persona Switcher Popover */}
            {isPersonaOpen && (
              <div
                className="absolute bottom-full left-0 mb-2 w-72 rounded-level2 bg-surface border border-surface-border shadow-hover z-50 p-3 space-y-2 animate-in fade-in duration-100"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-surface-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-action-primary" /> Switch Persona
                  </span>
                  <button
                    onClick={() => setIsPersonaOpen(false)}
                    className="text-ink-muted hover:text-ink-primary text-xs"
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
                      className={`w-full text-left p-2 rounded-level1 transition-all flex items-center justify-between ${
                        persona === p.id
                          ? 'bg-action-primary/10 border border-action-primary text-ink-primary'
                          : 'hover:bg-surface-hover text-ink-secondary border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                          {p.name}
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface-hover text-ink-muted uppercase">
                            {p.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-ink-muted truncate">{p.title}</div>
                      </div>
                      {persona === p.id && (
                        <Check className="w-4 h-4 text-action-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
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
