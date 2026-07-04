'use client';

import React from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card, CardContent } from '@presentation/components/ui/card';
import { useLanguage } from '@core/providers/language-provider';
import { Link2 } from 'lucide-react';

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader title={t.pages.connectorsTitle} subtitle={t.pages.connectorsSubtitle} />
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Link2 className="h-12 w-12" />}
            title={t.pages.connectorsTitle}
            description={t.pages.connectorsEmpty}
          />
        </CardContent>
      </Card>
    </div>
  );
}
