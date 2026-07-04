'use client';

import React from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@presentation/components/ui/card';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import { Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={t.pages.aboutTitle} subtitle={t.pages.aboutSubtitle} />

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Moataz AI</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">v1.0.0</Badge>
                <Badge variant="outline">{t.common.beta}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.pages.aboutDescription}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Framework</p>
              <p className="text-sm font-medium">Next.js 15 + React 19</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Language</p>
              <p className="text-sm font-medium">TypeScript (Strict)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Database</p>
              <p className="text-sm font-medium">Supabase PostgreSQL</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vector DB</p>
              <p className="text-sm font-medium">Qdrant</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
