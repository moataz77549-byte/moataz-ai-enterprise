'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@shared/utils/cn';
import { useLanguage } from '@core/providers/language-provider';
import { useUIStore } from '@core/state/ui-store';
import {
  Home, MessageSquare, FolderKanban, Building2, Bot, FileText, Code2,
  Key, Cloud, Cpu, Wrench, Puzzle, Link2, BookOpen, Library, History,
  LayoutDashboard, BarChart3, Settings, Info, PanelLeftClose, PanelLeft,
  Sparkles, X,
} from 'lucide-react';
import { Button } from '@presentation/components/ui/button';

interface NavItem {
  labelKey: keyof typeof import('@core/i18n/locales/en').default.nav;
  href: string;
  icon: React.ElementType;
  section: 'main' | 'aiEngine' | 'knowledge' | 'platform' | 'system';
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'home', href: '/', icon: Home, section: 'main' },
  { labelKey: 'chat', href: '/chat', icon: MessageSquare, section: 'main' },
  { labelKey: 'projects', href: '/projects', icon: FolderKanban, section: 'main' },
  { labelKey: 'workspace', href: '/workspace', icon: Building2, section: 'main' },
  { labelKey: 'agents', href: '/agents', icon: Bot, section: 'aiEngine' },
  { labelKey: 'providers', href: '/providers', icon: Cloud, section: 'aiEngine' },
  { labelKey: 'models', href: '/models', icon: Cpu, section: 'aiEngine' },
  { labelKey: 'apiKeys', href: '/api-keys', icon: Key, section: 'aiEngine' },
  { labelKey: 'tools', href: '/tools', icon: Wrench, section: 'aiEngine' },
  { labelKey: 'files', href: '/files', icon: FileText, section: 'knowledge' },
  { labelKey: 'knowledgeBase', href: '/knowledge-base', icon: BookOpen, section: 'knowledge' },
  { labelKey: 'promptLibrary', href: '/prompt-library', icon: Library, section: 'knowledge' },
  { labelKey: 'sandbox', href: '/sandbox', icon: Code2, section: 'platform' },
  { labelKey: 'plugins', href: '/plugins', icon: Puzzle, section: 'platform' },
  { labelKey: 'connectors', href: '/connectors', icon: Link2, section: 'platform' },
  { labelKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'system' },
  { labelKey: 'analytics', href: '/analytics', icon: BarChart3, section: 'system' },
  { labelKey: 'history', href: '/history', icon: History, section: 'system' },
  { labelKey: 'settings', href: '/settings', icon: Settings, section: 'system' },
  { labelKey: 'about', href: '/about', icon: Info, section: 'system' },
];

const SECTIONS: Array<{ key: 'main' | 'aiEngine' | 'knowledge' | 'platform' | 'system'; labelKey: keyof typeof import('@core/i18n/locales/en').default.sections }> = [
  { key: 'main', labelKey: 'main' },
  { key: 'aiEngine', labelKey: 'aiEngine' },
  { key: 'knowledge', labelKey: 'knowledge' },
  { key: 'platform', labelKey: 'platform' },
  { key: 'system', labelKey: 'system' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  // Close the mobile drawer automatically whenever the route changes.
  React.useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  const renderNav = (isCollapsedRail: boolean) => (
    <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
      {SECTIONS.map((section) => {
        const items = NAV_ITEMS.filter((item) => item.section === section.key);
        if (items.length === 0) return null;

        return (
          <div key={section.key} className="mb-4">
            {!isCollapsedRail && (
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.sections[section.labelKey]}
              </p>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-2.5 py-2.5 sm:py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        isCollapsedRail && 'justify-center px-0'
                      )}
                      title={isCollapsedRail ? t.nav[item.labelKey] : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsedRail && (
                        <span className="truncate">{t.nav[item.labelKey]}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile overlay backdrop, shown only while the drawer is open */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Desktop rail: unchanged behavior, hidden on small screens */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-30 hidden md:flex flex-col border-e bg-card transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">
                Moataz AI
              </span>
            )}
          </Link>
        </div>

        {renderNav(sidebarCollapsed)}

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center"
            aria-label={sidebarCollapsed ? t.sidebar.expand : t.sidebar.collapse}
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!sidebarCollapsed && (
              <span className="ms-2 text-xs">{t.sidebar.collapse}</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer: full nav, slides in from the start edge, always expanded */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-72 max-w-[85vw] flex-col border-e bg-card shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileSidebarOpen ? 'translate-x-0' : 'rtl:translate-x-full -translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              Moataz AI
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="tap-target"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label={t.common.close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {renderNav(false)}
      </aside>
    </>
  );
}
