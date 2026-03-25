'use client';

import { AppNav } from '@/components/app-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, Search, FolderOpen, FileText } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  memoryFiles: string[];
}

interface MemoryFile {
  projectId: string;
  filename: string;
}

export default function MemoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allMemoryFiles, setAllMemoryFiles] = useState<MemoryFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MemoryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allMemoryFiles.filter(f =>
        f.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.projectId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(allMemoryFiles);
    }
  }, [searchQuery, allMemoryFiles]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load projects');
      }

      const projectsWithMemory = data.projects.filter((p: Project) => p.memoryFiles.length > 0);
      setProjects(projectsWithMemory);

      // Flatten all memory files
      const files: MemoryFile[] = [];
      projectsWithMemory.forEach((project: Project) => {
        project.memoryFiles.forEach((filename: string) => {
          files.push({ projectId: project.id, filename });
        });
      });

      setAllMemoryFiles(files);
      setFilteredFiles(files);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <AppNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Memory Browser</h1>
            <p className="text-muted-foreground mt-2">
              Browse and search memory files across all projects
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search memory files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Memory Files List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No memory files found' : 'No memory files found across all projects'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Memory Files</CardTitle>
                <CardDescription>
                  {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} across {projects.length} project{projects.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredFiles.map((file, index) => (
                    <Link
                      key={`${file.projectId}-${file.filename}-${index}`}
                      href={`/projects/${file.projectId}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.filename}</p>
                        <p className="text-sm text-muted-foreground truncate">{file.projectId}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
