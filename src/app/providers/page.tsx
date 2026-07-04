'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import { 
  Server, 
  Globe, 
  Plus, 
  Trash2, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Cloud, 
  Settings2, 
  Download, 
  Upload, 
  Copy, 
  RefreshCw, 
  ShieldCheck,
  Cpu,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';

type ProviderType = 'native' | 'openai_compatible' | 'local' | 'custom';

interface BuiltInProvider {
  id: string;
  name: string;
  builtIn: true;
  capabilities: { supportsStreaming: boolean; supportsVision: boolean; supportsTools: boolean; supportsReasoning: boolean };
}

interface CustomProvider {
  id: string;
  slug: string;
  name: string;
  providerType: ProviderType;
  baseUrl: string;
  defaultModel?: string;
  status: 'enabled' | 'disabled';
  connectionStatus: 'unknown' | 'healthy' | 'degraded' | 'down';
  hasApiKey: boolean;
  lastTestedAt?: string;
  lastLatencyMs?: number;
}

const emptyForm = {
  name: '',
  baseUrl: '',
  apiKey: '',
  defaultModel: '',
  providerType: 'openai_compatible' as ProviderType,
};

export default function ProvidersPage() {
  const { t } = useLanguage();
  const [builtIn, setBuiltIn] = useState<BuiltInProvider[]>([]);
  const [custom, setCustom] = useState<CustomProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/providers');
      const json = await res.json();
      if (json.success) {
        setBuiltIn(json.data.builtIn);
        setCustom(json.data.custom);
      }
    } catch {
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Failed to create provider.');
      }
      toast.success("Provider added successfully");
      setIsAdding(false);
      setStep(1);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/providers/${id}`, { method: 'DELETE' });
      toast.success("Provider deleted");
      load();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/providers/${id}/test`, { method: 'POST' });
      if (res.ok) {
        toast.success("Connection healthy");
      } else {
        toast.error("Connection failed");
      }
      load();
    } catch (err) {
      toast.error("Test failed");
    } finally {
      setTestingId(null);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(custom));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "providers_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Providers exported");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        toast.success(`Ready to import ${imported.length} providers`);
      } catch (err) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const providerIcons = {
    native: <ShieldCheck className="h-5 w-5 text-blue-500" />,
    openai_compatible: <Cloud className="h-5 w-5 text-emerald-500" />,
    local: <Cpu className="h-5 w-5 text-orange-500" />,
    custom: <Settings2 className="h-5 w-5 text-purple-500" />
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title={t.pages.providersTitle} 
          subtitle={t.pages.providersSubtitle} 
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <div className="relative">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" /> Import
                <input type="file" className="hidden" onChange={handleImport} accept=".json" />
              </label>
            </Button>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Provider
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Add New Provider</CardTitle>
                <CardDescription>Step {step} of 2: {step === 1 ? 'Choose Type' : 'Configure Connection'}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setStep(1); }}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'native', name: 'Native', desc: 'AWS Bedrock, Vertex AI, OpenAI', icon: <ShieldCheck className="h-8 w-8 text-blue-500" /> },
                  { id: 'openai_compatible', name: 'OpenAI-Compatible', desc: 'Groq, DeepSeek, Together', icon: <Cloud className="h-8 w-8 text-emerald-500" /> },
                  { id: 'local', name: 'Local', desc: 'Ollama, vLLM, LM Studio', icon: <Cpu className="h-8 w-8 text-orange-500" /> },
                  { id: 'custom', name: 'Custom', desc: 'Custom API integration', icon: <Settings2 className="h-8 w-8 text-purple-500" /> }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setForm({ ...form, providerType: type.id as any }); setStep(2); }}
                    className="flex flex-col items-center text-center p-6 rounded-xl border-2 border-transparent bg-accent/50 hover:bg-accent hover:border-primary/40 transition-all group"
                  >
                    <div className="mb-4 p-3 rounded-full bg-background group-hover:scale-110 transition-transform shadow-sm">
                      {type.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider Name</label>
                    <Input
                      required
                      placeholder="e.g. My Enterprise OpenAI"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Input value={form.providerType} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">Base URL</label>
                    <Input
                      required
                      type="url"
                      placeholder="https://api.openai.com/v1"
                      value={form.baseUrl}
                      onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={form.apiKey}
                      onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Model</label>
                    <Input
                      placeholder="gpt-4o"
                      value={form.defaultModel}
                      onChange={(e) => setForm({ ...form, defaultModel: e.target.value })}
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" loading={saving} className="min-w-[120px]">
                    Complete Setup
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" /> Health Monitoring
            </CardTitle>
            <CardDescription>Live status of your AI infrastructure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-primary/5">
              <span className="text-sm">Built-in Providers</span>
              <span className="font-bold">{builtIn.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-primary/5">
              <span className="text-sm">Custom Providers</span>
              <span className="font-bold">{custom.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-primary/5">
              <span className="text-sm">Healthy Connections</span>
              <span className="text-emerald-500 font-bold">
                {custom.filter(p => p.connectionStatus === 'healthy').length}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={load}>
              <RefreshCw className="h-3 w-3 mr-2" /> Refresh Status
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" /> Configured Providers
            </CardTitle>
            <CardDescription>Manage your enterprise AI connections and keys</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Synchronizing providers...</p>
              </div>
            ) : custom.length === 0 ? (
              <EmptyState
                icon={<Cloud className="h-12 w-12" />}
                title={t.pages.providersTitle}
                description={t.pages.providersEmpty}
              />
            ) : (
              <div className="space-y-4">
                {custom.map((p) => (
                  <div
                    key={p.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-accent/50 group-hover:bg-primary/10 transition-colors">
                        {providerIcons[p.providerType] || <Globe className="h-5 w-5" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base">{p.name}</span>
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {p.providerType.replace('_', ' ')}
                          </Badge>
                          {p.connectionStatus === 'healthy' ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Healthy
                            </div>
                          ) : p.connectionStatus === 'down' ? (
                            <div className="flex items-center gap-1 text-[10px] text-destructive font-medium bg-destructive/5 px-1.5 py-0.5 rounded-full">
                              <XCircle className="h-3 w-3" /> Offline
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded-full">
                              <Zap className="h-3 w-3" /> Untested
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{p.baseUrl}</p>
                        {p.defaultModel && (
                          <p className="text-[11px] text-primary/70">Default: <span className="font-medium">{p.defaultModel}</span></p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleTest(p.id)} 
                        loading={testingId === p.id}
                        className="h-8 text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1.5" /> Test
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Rotate Keys">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                        setForm({
                          name: p.name,
                          baseUrl: p.baseUrl,
                          apiKey: '',
                          defaultModel: p.defaultModel || '',
                          providerType: p.providerType,
                        });
                        setIsAdding(true);
                        setStep(2);
                      }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
