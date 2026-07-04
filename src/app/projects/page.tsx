'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import { FolderKanban, Plus, FileText, MessageSquare, Calendar, Brain, Trash } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    // Seed default projects
    const list = [
      {
        id: 'brain-project-1',
        workspaceId: 'personal',
        name: 'Enterprise AI Agent RAG',
        description: 'Knowledge base and RAG pipeline configurations for engineering manuals.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'brain-project-2',
        workspaceId: 'personal',
        name: 'Finance Analytics',
        description: 'Analyzing quarterly sheets and token usage budgets.',
        createdAt: new Date().toISOString(),
      },
    ];
    setProjects(list);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      workspaceId: 'personal',
      name,
      description: desc,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    setName('');
    setDesc('');
    setShowCreate(false);
    toast.success('Project created successfully.');
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success('Project deleted successfully.');
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader
        title={t.pages.projectsTitle}
        subtitle={t.pages.projectsSubtitle}
        actions={
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </Button>
        }
      />

      {showCreate && (
        <Card className="max-w-xl animate-in fade-in-0 duration-300">
          <CardHeader>
            <CardTitle>New Project</CardTitle>
            <CardDescription>Create an isolated context workspace for your documents and chats.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="e.g. Sales Report Brain"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Describe project contents..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title={t.pages.projectsTitle}
          description={t.pages.projectsEmpty}
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col justify-between hover:shadow-md transition duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="flex gap-1 items-center">
                    <Brain className="h-3 w-3" />
                    <span>Project Brain</span>
                  </Badge>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1 hover:text-destructive text-muted-foreground transition-colors tap-target"
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
                <CardTitle className="text-lg font-bold mt-2">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-3">
                <div className="flex justify-between border-t pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>4 Chats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>12 Files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button className="w-full mt-2" size="sm" variant="outline">
                  Open Project Brain
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
