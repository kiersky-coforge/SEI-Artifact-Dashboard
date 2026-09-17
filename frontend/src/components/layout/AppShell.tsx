import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-page text-ink-primary font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <TopBar onToggleMobileMenu={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-surface-border bg-surface py-4 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-2">
            <span>SEI Technology & Investment Solutions • Artifact Dashboard</span>
            <span className="font-mono text-[11px]">v1.0.0 (UX Atlas • React 19 • Tailwind v3)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
