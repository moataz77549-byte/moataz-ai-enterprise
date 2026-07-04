'use client';

import React from 'react';
import { Button } from '@presentation/components/ui/button';
import { AlertTriangle } from 'lucide-react';
// global-error replaces the entire root layout (including <html>/<body>) when it fires,
// so it needs its own stylesheet import — otherwise it renders completely unstyled.
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button onClick={reset} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
