'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import { useTheme } from 'next-themes';
import {
  Key, Sun, Moon, Monitor, Languages, Plus, Trash
} from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { toast, Toaster } from 'sonner';

interface ApiKeyList {
  id: string;
  providerId: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // API Keys States
  const [keys, setKeys] = useState<ApiKeyList[]>([]);
  const [providerId, setProviderId] = useState('openai');
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [addingKey, setAddingKey] = useState(false);

  const fetchKeys = () => {
    fetch('/api/keys')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setKeys(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyValue.trim() || !keyName.trim()) return;

    setAddingKey(true);
    toast.info('Testing connection and rotating keys...');

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          name: keyName,
          value: keyValue,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('API Key validated and saved securely!');
        setKeyName('');
        setKeyValue('');
        fetchKeys();
      } else {
        toast.error(data.error?.message || 'Connection test failed.');
      }
    } catch {
      toast.error('API connection failed.');
    } finally {
      setAddingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const response = await fetch(`/api/keys?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('API Key revoked.');
        fetchKeys();
      }
    } catch {
      toast.error('Failed to delete key.');
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: t.settings.themeLight, icon: Sun },
    { value: 'dark' as const, label: t.settings.themeDark, icon: Moon },
    { value: 'system' as const, label: t.settings.themeSystem, icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader title={t.pages.settingsTitle} subtitle={t.pages.settingsSubtitle} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t.settings.appearance}</CardTitle>
            <CardDescription>{t.settings.theme}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(option.value)}
                    className={cn('flex-1 gap-2')}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>{t.settings.language}</span>
              </h4>
              <div className="flex gap-3">
                <Button
                  variant={locale === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocale('en')}
                  className="flex-1"
                >
                  English
                </Button>
                <Button
                  variant={locale === 'ar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocale('ar')}
                  className="flex-1"
                >
                  العربية
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Key Vault Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <span>Secure API Keys Vault</span>
            </CardTitle>
            <CardDescription>Manage, rotate, and test provider credentials safely. Secrets are always encrypted.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Key Form */}
            <form onSubmit={handleAddKey} className="space-y-3 p-3 border rounded-lg bg-accent/20">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Provider</label>
                  <select
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    className="w-full text-xs rounded border p-1.5 bg-background h-8"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="groq">Groq</option>
                    <option value="together">Together AI</option>
                    <option value="ollama">Ollama (Local)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Key Name</label>
                  <Input
                    placeholder="e.g. Production Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Key Value</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <Button type="submit" size="sm" className="w-full h-8 gap-1.5" loading={addingKey}>
                <Plus className="h-3.5 w-3.5" />
                <span>Test & Add Key</span>
              </Button>
            </form>

            {/* Keys list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Keys</h4>
              {keys.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No API keys saved yet.</p>
              ) : (
                keys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between p-2.5 border rounded-lg">
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate">{k.name} ({k.providerId})</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Added: {new Date(k.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                        Active
                      </Badge>
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1.5 hover:text-destructive text-muted-foreground rounded hover:bg-accent transition-colors tap-target"
                        aria-label={`${t.common.delete} ${k.name}`}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
