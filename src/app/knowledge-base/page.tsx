'use client';

import React, { useState } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import { BookOpen, Search, Brain, Check, Play } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
}

export default function KnowledgeBasePage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&projectId=brain-project-1`);
      if (!response.ok) {
        throw new Error('Search request failed.');
      }
      const data = await response.json();
      if (data.success && data.data) {
        // Map search results
        const items = data.data
          .filter((item: any) => item.type === 'knowledge' || item.type === 'file')
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            snippet: item.snippet,
            score: item.score || 0.85,
          }));
        setResults(items);
        toast.success(`Found ${items.length} relevant document matches.`);
      }
    } catch {
      toast.error('Failed to run vector query search.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader title={t.pages.knowledgeBaseTitle} subtitle={t.pages.knowledgeBaseSubtitle} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Collection stats card */}
        <Card className="md:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Brain className="h-5 w-5 text-primary" />
              <span>Collection Status</span>
            </CardTitle>
            <CardDescription>Metrics of active project vector collections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Vector Index DB</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active (Qdrant)</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Dimension</span>
              <span className="text-sm font-semibold">1536 (Cosine)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Document Chunks</span>
              <span className="text-sm font-semibold">324 chunks</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Sync status</span>
              <span className="text-sm font-semibold text-muted-foreground flex gap-1 items-center">
                <Check className="h-4 w-4 text-emerald-500" />
                Synced
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Vector Search Sandbox card */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Vector Search Sandbox</CardTitle>
            <CardDescription>Test the semantic retrieval engine and view similarity scores.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter a test prompt or keyword..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="ps-9 h-9"
                  required
                />
              </div>
              <Button type="submit" size="sm" loading={searching} className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                <span>Search</span>
              </Button>
            </form>

            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 scrollbar-thin">
              {results.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-10 w-10 text-muted-foreground/60" />}
                  title="Query the Library"
                  description="Run a test vector search to view matching semantic segments and scores."
                />
              ) : (
                results.map((res) => (
                  <div key={res.id} className="p-3 border rounded-lg hover:bg-accent/40 transition">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold truncate max-w-[80%]">{res.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        Score: {(res.score * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      &ldquo;{res.snippet}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
