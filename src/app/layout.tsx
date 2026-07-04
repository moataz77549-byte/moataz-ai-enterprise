import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@core/providers/theme-provider';
import { LanguageProvider } from '@core/providers/language-provider';
import { FeatureFlagProvider } from '@core/providers/feature-flag-provider';
import { AppShell } from '@presentation/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Moataz AI — Enterprise AI Platform',
  description: 'Production-grade AI SaaS platform for unified multi-provider LLM access, knowledge management, and agentic workflows.',
  keywords: ['AI', 'SaaS', 'LLM', 'ChatGPT', 'Gemini', 'Claude', 'enterprise'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <FeatureFlagProvider>
              <AppShell>
                {children}
              </AppShell>
            </FeatureFlagProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
