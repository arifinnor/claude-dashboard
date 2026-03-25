'use client';

import { AppNav } from '@/components/app-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, Save, RefreshCw, Plus, Trash2, FileText } from 'lucide-react';
import { use } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [claudeMd, setClaudeMd] = useState('');
  const [memoryFiles, setMemoryFiles] = useState<string[]>([]);
  const [selectedMemoryFile, setSelectedMemoryFile] = useState<string | null>(null);
  const [memoryContent, setMemoryContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMemoryFilename, setNewMemoryFilename] = useState('');
  const [showNewMemoryDialog, setShowNewMemoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [claudeMdRes, memoryRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/claude-md`),
        fetch(`/api/projects/${projectId}/memory`),
      ]);

      const claudeMdData = await claudeMdRes.json();
      const memoryData = await memoryRes.json();

      setClaudeMd(claudeMdData.content || '');
      setMemoryFiles(memoryData.files || []);
    } catch (error) {
      toast.error('Failed to load project data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveClaudeMd = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/claude-md`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: claudeMd }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save CLAUDE.md');
      }

      toast.success('CLAUDE.md saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save CLAUDE.md');
    } finally {
      setSaving(false);
    }
  };

  const loadMemoryFile = async (filename: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/memory/${filename}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to load memory file');
      }

      const data = await res.json();
      setMemoryContent(data.content || '');
      setSelectedMemoryFile(filename);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load memory file');
    } finally {
      setLoading(false);
    }
  };

  const saveMemoryFile = async () => {
    if (!selectedMemoryFile) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/memory/${selectedMemoryFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: memoryContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save memory file');
      }

      toast.success('Memory file saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save memory file');
    } finally {
      setSaving(false);
    }
  };

  const createMemoryFile = async () => {
    if (!newMemoryFilename.endsWith('.md')) {
      toast.error('Filename must end with .md');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/memory/${newMemoryFilename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create memory file');
      }

      toast.success('Memory file created successfully');
      setNewMemoryFilename('');
      setShowNewMemoryDialog(false);
      loadProjectData();
      loadMemoryFile(newMemoryFilename);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create memory file');
    } finally {
      setSaving(false);
    }
  };

  const deleteMemoryFile = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/memory/${deleteTarget}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete memory file');
      }

      toast.success('Memory file deleted successfully');
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      if (selectedMemoryFile === deleteTarget) {
        setSelectedMemoryFile(null);
        setMemoryContent('');
      }
      loadProjectData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete memory file');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full">
      <AppNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project: {projectId}</h1>
              <p className="text-muted-foreground mt-2">
                Configure project-specific settings and memory
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjectData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="claude-md" className="space-y-6">
            <TabsList>
              <TabsTrigger value="claude-md">CLAUDE.md</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>

            {/* CLAUDE.md Tab */}
            <TabsContent value="claude-md">
              <Card>
                <CardHeader>
                  <CardTitle>Project Instructions</CardTitle>
                  <CardDescription>
                    Custom instructions specific to this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <CodeMirror
                      value={claudeMd}
                      onChange={setClaudeMd}
                      height="400px"
                      extensions={[markdown()]}
                      theme={oneDark}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        searchKeymap: true,
                        foldKeymap: true,
                        completionKeymap: true,
                        lintKeymap: true,
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={saveClaudeMd} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Instructions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Memory Tab */}
            <TabsContent value="memory">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Memory Files List */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Memory Files</CardTitle>
                      <Dialog open={showNewMemoryDialog} onOpenChange={setShowNewMemoryDialog}>
                        <DialogTrigger>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            New
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Memory File</DialogTitle>
                            <DialogDescription>
                              Enter a name for the new memory file (must end with .md)
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="filename">Filename</Label>
                              <Input
                                id="filename"
                                placeholder="example.md"
                                value={newMemoryFilename}
                                onChange={(e) => setNewMemoryFilename(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowNewMemoryDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={createMemoryFile} disabled={saving}>
                              {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                'Create'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <CardDescription>
                      {memoryFiles.length} file{memoryFiles.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-1">
                        {memoryFiles.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No memory files
                          </p>
                        ) : (
                          memoryFiles.map((file) => (
                            <div
                              key={file}
                              className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                                selectedMemoryFile === file
                                  ? 'bg-accent text-accent-foreground'
                                  : 'hover:bg-accent/50'
                              }`}
                              onClick={() => loadMemoryFile(file)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{file}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(file);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Memory Editor */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      {selectedMemoryFile || 'Select a file'}
                    </CardTitle>
                    {selectedMemoryFile && (
                      <CardDescription>
                        Edit the selected memory file
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMemoryFile ? (
                      <>
                        <div className="border rounded-lg overflow-hidden">
                          <CodeMirror
                            value={memoryContent}
                            onChange={setMemoryContent}
                            height="350px"
                            extensions={[markdown()]}
                            theme={oneDark}
                            basicSetup={{
                              lineNumbers: true,
                              highlightActiveLineGutter: true,
                              highlightSpecialChars: true,
                              foldGutter: true,
                              drawSelection: true,
                              dropCursor: true,
                              allowMultipleSelections: true,
                              indentOnInput: true,
                              bracketMatching: true,
                              closeBrackets: true,
                              autocompletion: true,
                              rectangularSelection: true,
                              crosshairCursor: true,
                              highlightActiveLine: true,
                              highlightSelectionMatches: true,
                              closeBracketsKeymap: true,
                              searchKeymap: true,
                              foldKeymap: true,
                              completionKeymap: true,
                              lintKeymap: true,
                            }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteTarget(selectedMemoryFile);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete File
                          </Button>
                          <Button onClick={saveMemoryFile} disabled={saving}>
                            {saving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save File
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        Select a memory file to edit
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Memory File</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteTarget}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteMemoryFile}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
