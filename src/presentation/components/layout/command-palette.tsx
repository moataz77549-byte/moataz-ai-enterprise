'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useUIStore } from '@core/state/ui-store';
import { useLanguage } from '@core/providers/language-provider';
import {
  Home, MessageSquare, FolderKanban, Building2, Bot, FileText, Code2,
  Key, Cloud, Cpu, Wrench, Puzzle, Link2, BookOpen, Library, History,
  LayoutDashboard, BarChart3, Settings, Info,
} from 'lucide-react';

const COMMAND_ITEMS = [
  { key: 'home' as const, href: '/', icon: Home },
  { key: 'chat' as const, href: '/chat', icon: MessageSquare },
  { key: 'projects' as const, href: '/projects', icon: FolderKanban },
  { key: 'workspace' as const, href: '/workspace', icon: Building2 },
  { key: 'agents' as const, href: '/agents', icon: Bot },
  { key: 'providers' as const, href: '/providers', icon: Cloud },
  { key: 'models' as const, href: '/models', icon: Cpu },
  { key: 'apiKeys' as const, href: '/api-keys', icon: Key },
  { key: 'tools' as const, href: '/tools', icon: Wrench },
  { key: 'files' as const, href: '/files', icon: FileText },
  { key: 'knowledgeBase' as const, href: '/knowledge-base', icon: BookOpen },
  { key: 'promptLibrary' as const, href: '/prompt-library', icon: Library },
  { key: 'sandbox' as const, href: '/sandbox', icon: Code2 },
  { key: 'plugins' as const, href: '/plugins', icon: Puzzle },
  { key: 'connectors' as const, href: '/connectors', icon: Link2 },
  { key: 'dashboard' as const, href: '/dashboard', icon: LayoutDashboard },
  { key: 'analytics' as const, href: '/analytics', icon: BarChart3 },
  { key: 'history' as const, href: '/history', icon: History },
  { key: 'settings' as const, href: '/settings', icon: Settings },
  { key: 'about' as const, href: '/about', icon: Info },
];

export function CommandPalette() {
  const router = useRouter();
  const { t } = useLanguage();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const navigateTo = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
        role="presentation"
      />

      {/* Command dialog */}
      <div className="relative w-full max-w-lg rounded-xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95">
        <Command className="overflow-hidden rounded-xl" loop>
          <div className="flex items-center border-b px-3">
            <Command.Input
              placeholder={t.topNav.searchPlaceholder}
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {t.common.noResults}
            </Command.Empty>
            <Command.Group heading={t.sections.main}>
              {COMMAND_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.key}
                    value={t.nav[item.key]}
                    onSelect={() => navigateTo(item.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{t.nav[item.key]}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
