'use client';

import React, { useState } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { Card, CardContent } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Terminal as TerminalIcon, 
  FolderTree, 
  Save, 
  Settings,
  Cpu,
  Shield,
  History,
  Code2,
  Maximize2,
  ChevronRight,
  MessageSquare,
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgentWorkspace() {
  const { t } = useLanguage();
  const [code, setCode] = useState('// Welcome to Moataz AI Agent Sandbox\n// Write your code here to execute in a secure environment\n\nasync function main() {\n  console.log("Initializing Agent...");\n  const response = await ai.chat("Hello! How can you help me today?");\n  console.log("AI Response:", response);\n}\n\nmain();');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'files' | 'settings'>('editor');
  const [sessions] = useState<{id: string, name: string}[]>([
    { id: '1', name: 'Data Analysis Task' },
    { id: '2', name: 'Web Scraper Agent' }
  ]);

  const runCode = () => {
    setIsRunning(true);
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting execution...`]);
    
    setTimeout(() => {
      setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Agent: Initializing...`]);
      setTimeout(() => {
        setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI Gateway: Connected to GPT-4o`]);
        setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Output: Hello! I can assist with data analysis, code generation, and more.`]);
        setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Execution completed successfully.`]);
        setIsRunning(false);
        toast.success("Execution completed");
      }, 1500);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Agent Workspace" 
          subtitle="Advanced AI agent development and execution environment" 
        />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hidden sm:flex">
            <Shield className="h-3 w-3 mr-1" /> Sandbox Active
          </Badge>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" /> History
          </Button>
          <Button variant="default" size="sm" onClick={runCode} disabled={isRunning}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Run Agent
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className="w-64 hidden lg:flex flex-col gap-4">
          <Card className="flex-1 overflow-hidden">
            <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sessions</span>
              <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3 w-3" /></Button>
            </div>
            <CardContent className="p-2 space-y-1 overflow-y-auto">
              {sessions.map(s => (
                <button 
                  key={s.id}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors flex items-center gap-2 group"
                >
                  <MessageSquare className="h-4 w-4 text-primary/60" />
                  <span className="truncate flex-1">{s.name}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Cpu className="h-4 w-4 text-primary" />
                Resources
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase text-muted-foreground font-mono">
                  <span>CPU</span>
                  <span>12%</span>
                </div>
                <div className="h-1 w-full bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[12%]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase text-muted-foreground font-mono">
                  <span>RAM</span>
                  <span>256MB</span>
                </div>
                <div className="h-1 w-full bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[25%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Card className="flex-[2] overflow-hidden flex flex-col border-primary/10">
            <div className="flex items-center justify-between px-4 py-1 border-b bg-muted/20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('editor')}
                  className={`text-xs font-medium py-2 border-b-2 transition-colors ${activeTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5" /> Editor
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('files')}
                  className={`text-xs font-medium py-2 border-b-2 transition-colors ${activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-3.5 w-3.5" /> Files
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Save className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Maximize2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="flex-1 relative min-h-[300px]">
              {activeTab === 'editor' ? (
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  theme="vs-light"
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12, bottom: 12 }
                  }}
                />
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-muted-foreground h-full">
                  <FolderTree className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm">No files in current workspace</p>
                  <Button variant="outline" size="sm" className="mt-4">Upload Files</Button>
                </div>
              )}
            </div>
          </Card>

          {/* Terminal */}
          <Card className="flex-1 overflow-hidden flex flex-col bg-[#0f172a] text-slate-300 border-slate-800 shadow-xl">
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 tracking-tighter">
                <TerminalIcon className="h-3 w-3" />
                AGENT TERMINAL
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 px-2 text-[9px] text-slate-500 hover:text-slate-100 hover:bg-slate-800"
                onClick={() => setOutput([])}
              >
                Clear
              </Button>
            </div>
            <div className="flex-1 p-4 font-mono text-[12px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
              {output.length === 0 ? (
                <span className="text-slate-600 italic">Ready for agent instructions...</span>
              ) : (
                output.map((line, i) => (
                  <div key={i} className={line.includes('Error') ? 'text-rose-400' : line.includes('AI') ? 'text-emerald-400' : line.includes('Starting') ? 'text-sky-400' : ''}>
                    <span className="opacity-30 mr-2">›</span>{line}
                  </div>
                ))
              )}
              {isRunning && (
                <div className="flex items-center gap-2 text-slate-500 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="animate-pulse">Agent is thinking...</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
