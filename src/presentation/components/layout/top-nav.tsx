'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@shared/utils/cn';
import { useLanguage } from '@core/providers/language-provider';
import { useUIStore } from '@core/state/ui-store';
import { Button } from '@presentation/components/ui/button';
import {
  Search, Bell, Sun, Moon, Monitor, Languages, Menu,
} from 'lucide-react';

export function TopNav() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed, setCommandPaletteOpen, setNotificationsPanelOpen, toggleMobileSidebar } = useUIStore();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const themeIcon = theme === 'dark'
    ? <Moon className="h-4 w-4" />
    : theme === 'light'
      ? <Sun className="h-4 w-4" />
      : <Monitor className="h-4 w-4" />;

  return (
    <header
      className={cn(
        'fixed top-0 end-0 start-0 z-20 flex h-14 items-center justify-between gap-2 border-b bg-card/80 backdrop-blur-sm px-3 sm:px-4 transition-all duration-300',
        sidebarCollapsed ? 'md:start-16' : 'md:start-64'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile menu trigger — only visible below md, where the rail is hidden */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 tap-target"
          onClick={toggleMobileSidebar}
          aria-label={t.sidebar.openMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 text-muted-foreground w-64"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">{t.topNav.searchPlaceholder}</span>
          <kbd className="pointer-events-none ms-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandPaletteOpen(true)}
          className="sm:hidden"
          aria-label={t.topNav.commandPalette}
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          aria-label={t.topNav.languageToggle}
        >
          <Languages className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          aria-label={t.topNav.themeToggle}
        >
          {themeIcon}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsPanelOpen(true)}
          aria-label={t.topNav.notifications}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
