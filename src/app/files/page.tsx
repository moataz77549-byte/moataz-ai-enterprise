'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Badge } from '@presentation/components/ui/badge';
import { useLanguage } from '@core/providers/language-provider';
import {
  FileText, Upload, FolderPlus, Trash, FileDown, Eye, CheckCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface FileRecord {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: 'uploaded' | 'scanning' | 'indexed' | 'error';
  createdAt: string;
}

export default function FilesPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Seed default file list
    const defaultFiles: FileRecord[] = [
      {
        id: 'file-doc-1',
        name: 'Moataz_AI_Architecture_Manual.txt',
        size: 45290,
        mimeType: 'text/plain',
        status: 'indexed',
        createdAt: new Date().toISOString(),
      },
    ];
    setFiles(defaultFiles);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    toast.info(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', 'brain-project-1'); // default project mapping

    try {
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload request failed.');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const newFile: FileRecord = {
          id: data.data.id,
          name: data.data.name,
          size: data.data.size,
          mimeType: data.data.mimeType,
          status: 'uploaded',
          createdAt: data.data.createdAt,
        };

        setFiles((prev) => [newFile, ...prev]);
        toast.success(`${file.name} uploaded successfully!`);

        // Check index status in background
        pollFileStatus(data.data.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const pollFileStatus = (id: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      // Since this is local, we simulate the status transitions
      // from 'uploaded' -> 'scanning' -> 'indexed' (mirroring our BullMQ worker logs)
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            const nextStatus = f.status === 'uploaded' ? 'scanning' : 'indexed';
            if (nextStatus === 'indexed') {
              clearInterval(interval);
              toast.success(`${f.name} fully indexed in Project Brain.`);
            }
            return { ...f, status: nextStatus };
          }
          return f;
        })
      );

      if (attempts >= 2) {
        clearInterval(interval);
      }
    }, 3000);
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success('File deleted.');
  };

  const getStatusBadge = (status: FileRecord['status']) => {
    switch (status) {
      case 'indexed':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 flex items-center">
            <CheckCircle className="h-3 w-3" />
            <span>Indexed</span>
          </Badge>
        );
      case 'scanning':
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1 flex items-center">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Scanning</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 gap-1 flex items-center">
            <AlertCircle className="h-3 w-3" />
            <span>Error</span>
          </Badge>
        );
      case 'uploaded':
      default:
        return (
          <Badge variant="outline" className="gap-1 flex items-center">
            <CheckCircle className="h-3 w-3" />
            <span>Uploaded</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader title={t.pages.filesTitle} subtitle={t.pages.filesSubtitle} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription>Upload manuals, reports, and source files to index them in the vector library.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
              <p className="text-sm font-semibold mb-1">Drag and drop file here</p>
              <p className="text-xs text-muted-foreground mb-4">PDF, TXT, MD, CSV, DOC up to 10MB</p>
              
              <input
                type="file"
                id="file-upload-input"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="file-upload-input">
                <Button asChild size="sm" className="cursor-pointer" disabled={uploading}>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Files Explorer card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Files Explorer</CardTitle>
              <CardDescription>View, check indexing states, and manage your uploaded files.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-1 self-start sm:self-auto">
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="No Files Uploaded"
                description={t.pages.filesEmpty}
              />
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3.5 border rounded-lg hover:bg-accent/40 transition duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 bg-primary/10 rounded flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(file.status)}
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" aria-label={`Preview ${file.name}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary" aria-label={`Download ${file.name}`}>
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(file.id)}
                        className="h-8 w-8 hover:text-destructive text-muted-foreground"
                        aria-label={`Delete ${file.name}`}
                      >
                        <Trash className="h-4 w-4" />
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
