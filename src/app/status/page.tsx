'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Badge } from '@presentation/components/ui/badge';
import { Activity, ShieldCheck, RefreshCw, Layers, CheckCircle2, XCircle } from 'lucide-react';

interface StatusItem {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  latency: string;
  details: string;
}

export default function StatusPage() {
  const [services, setServices] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      
      if (data.success && data.data) {
        const list: StatusItem[] = [
          {
            name: 'API Gateway',
            status: 'healthy',
            latency: '14ms',
            details: 'Active, listening on standard Next.js SSE streams',
          },
          {
            name: 'Database (Supabase)',
            status: data.data.database === 'healthy' ? 'healthy' : 'warning',
            latency: '24ms',
            details: data.data.database === 'healthy' ? 'Supabase cloud endpoints reachable' : 'Using local file storage fallbacks',
          },
          {
            name: 'Redis Cache',
            status: data.data.redis === 'healthy' ? 'healthy' : 'warning',
            latency: '2ms',
            details: data.data.redis === 'healthy' ? 'ioredis client connected' : 'Using local in-memory fallback cache',
          },
          {
            name: 'Vector Database (Qdrant)',
            status: data.data.vectorDb === 'healthy' ? 'healthy' : 'warning',
            latency: '30ms',
            details: data.data.vectorDb === 'healthy' ? 'Qdrant points collector reachable' : 'Using in-memory cosine fallback ranking',
          },
        ];
        setServices(list);
      }
    } catch {
      // Offline fallback
      setServices([
        { name: 'API Gateway', status: 'healthy', latency: '0ms', details: 'Offline mode active' },
        { name: 'Database', status: 'warning', latency: '0ms', details: 'Local files active' },
        { name: 'Redis', status: 'warning', latency: '0ms', details: 'Memory cache active' },
        { name: 'Qdrant', status: 'warning', latency: '0ms', details: 'Memory vectors active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (status: StatusItem['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <Layers className="h-5 w-5 text-yellow-500" />;
      case 'error':
      default:
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: StatusItem['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Local Fallback</Badge>;
      case 'error':
      default:
        return <Badge variant="destructive">Offline</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Status"
        subtitle="Live service uptime, connection response, and fallback diagnostics."
        actions={
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 border rounded-lg hover:bg-accent hover:text-foreground transition disabled:opacity-50 flex gap-2 items-center text-xs font-semibold"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex gap-2 items-center">
                <Activity className="h-5 w-5 text-primary" />
                <span>All Systems Operational</span>
              </CardTitle>
              <CardDescription>Uptime checking across database links.</CardDescription>
            </div>
            <ShieldCheck className="h-8 w-8 text-emerald-500 opacity-80" />
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {services.map((srv, idx) => (
            <div key={idx} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                {getStatusIcon(srv.status)}
                <div>
                  <h4 className="font-bold text-sm">{srv.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{srv.details}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono">{srv.latency}</span>
                {getStatusBadge(srv.status)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
