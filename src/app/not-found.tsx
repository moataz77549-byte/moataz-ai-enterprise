'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@presentation/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground/60" />
      <h2 className="text-2xl font-bold">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
