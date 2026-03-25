'use client';

import { AppNav } from '@/components/app-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, Search, FileText, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  path: string;
  claudeMdExists: boolean;
  memoryDirExists: boolean;
  memoryFiles: string[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(p =>
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load projects');
      }

      setProjects(data.projects);
      setFilteredProjects(data.projects);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load projects';
      toast.error(message);
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
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Browse and manage Claude Code project configurations
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No projects found' : 'No projects found in ~/.claude/projects/'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FolderOpen className="h-5 w-5" />
                        {project.id}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {project.path}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {project.claudeMdExists ? (
                            <FileText className="h-4 w-4 text-green-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={project.claudeMdExists ? 'text-foreground' : 'text-muted-foreground'}>
                            CLAUDE.md {project.claudeMdExists ? 'exists' : 'missing'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {project.memoryDirExists ? (
                            <FolderOpen className="h-4 w-4 text-green-500" />
                          ) : (
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={project.memoryDirExists ? 'text-foreground' : 'text-muted-foreground'}>
                            Memory ({project.memoryFiles.length} files)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
