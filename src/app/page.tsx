'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import {
  Sparkles, 
  Bot, 
  Brain, 
  FileText, 
  Cpu, 
  GitPullRequest, 
  ArrowRight, 
  Github, 
  HelpCircle, 
  Key, 
  CheckCircle,
  Activity,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Users,
  Code2
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(0);

  const onboardingSteps = [
    {
      title: 'Welcome to Moataz AI Enterprise',
      desc: 'The next-generation AI SaaS platform designed for high-performance and security. Let\'s get you started.',
      icon: Sparkles,
    },
    {
      title: 'Provider Infrastructure',
      desc: 'Connect your AWS Bedrock, Vertex AI, or OpenAI accounts to enable model routing and gateway features.',
      icon: ShieldCheck,
    },
    {
      title: 'Agent Workspace',
      desc: 'Deploy autonomous agents with code interpretation capabilities in a secure sandbox environment.',
      icon: Code2,
    },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-8 text-center space-y-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(var(--primary-rgb),0.08)_0%,transparent_100%)]" />
        
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-center">
            <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold gap-2 bg-background/50 backdrop-blur-sm border-primary/20 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-primary uppercase tracking-widest">Enterprise v1.0.0 Stable</span>
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
            Empowering Enterprises with <span className="bg-gradient-to-r from-primary via-primary/80 to-blue-600 bg-clip-text text-transparent">Sovereign AI</span>
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t.pages.homeSubtitle} Built for scale, security, and seamless integration with your existing cloud infrastructure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Link href="/chat" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20">
              Start Chatting
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-background/50 backdrop-blur-sm" onClick={() => setShowOnboarding(true)}>
            Platform Overview
          </Button>
        </div>
      </section>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <Card className="max-w-2xl mx-auto border-primary/20 shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {React.createElement(onboardingSteps[step].icon, { className: 'h-5 w-5 text-primary' })}
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{onboardingSteps[step].title}</CardTitle>
                <CardDescription className="text-xs">Guided Platform Setup</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono">STEP 0{step + 1}</Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <p className="text-base text-muted-foreground leading-relaxed">{onboardingSteps[step].desc}</p>
            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={() => setShowOnboarding(false)}>Dismiss</Button>
              <div className="flex gap-3">
                {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Previous</Button>}
                {step < 2 ? (
                  <Button onClick={() => setStep(step + 1)} className="min-w-[100px]">Next Step</Button>
                ) : (
                  <Button onClick={() => { setShowOnboarding(false); setStep(0); }} className="min-w-[100px] bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Stats / Activity Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Sessions', value: '1,284', icon: Activity, color: 'text-emerald-500' },
          { label: 'API Requests', value: '842k', icon: Zap, color: 'text-yellow-500' },
          { label: 'Total Agents', value: '42', icon: Bot, color: 'text-primary' },
          { label: 'Storage Used', value: '12.4 GB', icon: FileText, color: 'text-blue-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-background/40 backdrop-blur-sm border-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2 rounded-full bg-background border ${stat.color} bg-opacity-10`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Feature Modules */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Enterprise Ecosystem</h2>
          <Link href="/dashboard" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            View full dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'AI Gateway v2',
              desc: 'Unified entry point for 50+ models with automatic failover, cost-tracking, and PII filtering.',
              icon: Cpu,
              link: '/providers',
              status: 'Ready'
            },
            {
              title: 'Agent Workspace',
              desc: 'Secure sandboxed environment for code execution, data processing, and autonomous workflows.',
              icon: LayoutGrid,
              link: '/workspace',
              status: 'Beta'
            },
            {
              title: 'Knowledge Vault',
              desc: 'Enterprise-grade RAG with hybrid search, automated chunking, and semantic re-ranking.',
              icon: Brain,
              link: '/knowledge-base',
              status: 'Ready'
            },
            {
              title: 'Team Management',
              desc: 'Granular RBAC, workspace isolation, and shared prompt libraries for collaborative AI.',
              icon: Users,
              link: '/settings',
              status: 'Enterprise'
            },
            {
              title: 'Advanced Analytics',
              desc: 'Deep insights into token consumption, latency distribution, and model performance metrics.',
              icon: Activity,
              link: '/analytics',
              status: 'Enterprise'
            },
            {
              title: 'Code Interpreter',
              desc: 'Native execution of Python, JS, and SQL with real-time visualization and file handling.',
              icon: Code2,
              link: '/sandbox',
              status: 'Beta'
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Link href={feat.link} key={idx} className="group">
                <Card className="h-full hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-background/60 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest">{feat.status}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold mt-4">{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Infrastructure & Security */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck className="h-32 w-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Enterprise Security Stack
            </CardTitle>
            <CardDescription>Your data remains yours. Always.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-500"><CheckCircle className="h-3.5 w-3.5" /></div>
                <div>
                  <h4 className="text-sm font-bold">AES-256 Key Encryption</h4>
                  <p className="text-xs text-muted-foreground">All provider keys are encrypted at rest using industry-standard GCM mode.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-500"><CheckCircle className="h-3.5 w-3.5" /></div>
                <div>
                  <h4 className="text-sm font-bold">Isolated Workspaces</h4>
                  <p className="text-xs text-muted-foreground">Logical and physical isolation between different project environments.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-500"><CheckCircle className="h-3.5 w-3.5" /></div>
                <div>
                  <h4 className="text-sm font-bold">SOC2 Compliant Logging</h4>
                  <p className="text-xs text-muted-foreground">Comprehensive audit trails for all model interactions and system changes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-500"><CheckCircle className="h-3.5 w-3.5" /></div>
                <div>
                  <h4 className="text-sm font-bold">Privacy-First RAG</h4>
                  <p className="text-xs text-muted-foreground">On-prem vector search options to keep document embeddings private.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-slate-100 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Github className="h-5 w-5" /> Open Ecosystem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              Moataz AI is built on open standards. Integrate with our API, build custom connectors, or contribute to our plugin ecosystem.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200">
                Documentation <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200">
                API Reference <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary/5 pt-10 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-white font-bold text-[10px]">M</div>
          <span className="font-semibold text-foreground">MOATAZ AI ENTERPRISE</span>
          <span className="mx-2 text-primary/20">|</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex gap-6 font-medium">
          <Link href="/status" className="hover:text-primary transition-colors">Status</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <a href="https://github.com" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
