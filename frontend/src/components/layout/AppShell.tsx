import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-surface-border bg-surface py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-2">
          <span>SEI Technology & Investment Solutions • Artifact Dashboard Prototype</span>
          <span className="font-mono text-[11px]">v1.0.0 (UX Atlas • React 19 • Tailwind v3)</span>
        </div>
      </footer>
    </div>
  );
};
