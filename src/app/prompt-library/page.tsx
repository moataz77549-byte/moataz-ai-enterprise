'use client';

import React from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card, CardContent } from '@presentation/components/ui/card';
import { useLanguage } from '@core/providers/language-provider';
import { Library } from 'lucide-react';

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={t.pages.promptLibraryTitle} subtitle={t.pages.promptLibrarySubtitle} />
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Library className="h-12 w-12" />}
            title={t.pages.promptLibraryTitle}
            description={t.pages.promptLibraryEmpty}
          />
        </CardContent>
      </Card>
    </div>
  );
}
