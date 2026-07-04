'use client';

import React from 'react';
import { cn } from '@shared/utils/cn';
import { useUIStore } from '@core/state/ui-store';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { CommandPalette } from './command-palette';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopNav />
      <CommandPalette />
      <main
        className={cn(
          'min-h-screen pt-14 transition-all duration-300',
          sidebarCollapsed ? 'md:ps-16' : 'md:ps-64'
        )}
      >
        <div className="container mx-auto max-w-7xl p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
