import { AppNav } from '@/components/app-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, FolderKanban, Brain, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex h-full">
      <AppNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your Claude Code configuration and memory
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Settings
                </CardTitle>
                <CardDescription>
                  Configure Claude Code global preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/settings">
                  <Button variant="outline" className="w-full">
                    Open Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Projects
                </CardTitle>
                <CardDescription>
                  Browse and manage project configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/projects">
                  <Button variant="outline" className="w-full">
                    View Projects
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Memory
                </CardTitle>
                <CardDescription>
                  Access and manage memory files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/memory">
                  <Button variant="outline" className="w-full">
                    Browse Memory
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Claude Config Manager provides a web interface for managing your Claude Code configuration files.
                </p>
                <p>
                  All changes are saved directly to <code className="bg-muted px-1 py-0.5 rounded">~/.claude/</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li>Edit global settings.json</li>
                  <li>Manage CLAUDE.md instructions</li>
                  <li>Browse project configurations</li>
                  <li>Create and edit memory files</li>
                  <li>Real-time file change detection</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
