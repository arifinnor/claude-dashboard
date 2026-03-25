'use client';

import { AppNav } from '@/components/app-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

export default function SettingsPage() {
  const [settings, setSettings] = useState('');
  const [settingsLocal, setSettingsLocal] = useState('');
  const [claudeMd, setClaudeMd] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // Load all configs in parallel
      const [settingsRes, settingsLocalRes, claudeMdRes] = await Promise.all([
        fetch('/api/config/settings'),
        fetch('/api/config/settings-local'),
        fetch('/api/config/claude-md'),
      ]);

      const settingsData = await settingsRes.json();
      const settingsLocalData = await settingsLocalRes.json();
      const claudeMdData = await claudeMdRes.json();

      setSettings(settingsData.exists ? JSON.stringify(settingsData.settings, null, 2) : '');
      setSettingsLocal(settingsLocalData.exists ? JSON.stringify(settingsLocalData.settings, null, 2) : '');
      setClaudeMd(claudeMdData.content || '');
    } catch (error) {
      toast.error('Failed to load configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(settings);
      const res = await fetch('/api/config/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: parsed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const saveSettingsLocal = async () => {
    setSaving(true);
    try {
      if (!settingsLocal.trim()) {
        // Delete if empty
        await fetch('/api/config/settings-local', { method: 'DELETE' });
        toast.success('Local settings deleted');
        return;
      }

      const parsed = JSON.parse(settingsLocal);
      const res = await fetch('/api/config/settings-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: parsed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save local settings');
      }

      toast.success('Local settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save local settings');
    } finally {
      setSaving(false);
    }
  };

  const saveClaudeMd = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/claude-md', {
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

  return (
    <div className="flex h-full">
      <AppNav />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Configure global Claude Code settings
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfig}
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

          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="settings">settings.json</TabsTrigger>
              <TabsTrigger value="local">settings.local.json</TabsTrigger>
              <TabsTrigger value="claude-md">CLAUDE.md</TabsTrigger>
            </TabsList>

            {/* Settings.json Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Global Settings</CardTitle>
                  <CardDescription>
                    Main configuration file for Claude Code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <CodeMirror
                      value={settings}
                      onChange={setSettings}
                      height="400px"
                      extensions={[json()]}
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
                    <Button onClick={saveSettings} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings.local.json Tab */}
            <TabsContent value="local">
              <Card>
                <CardHeader>
                  <CardTitle>Local Settings</CardTitle>
                  <CardDescription>
                    Local overrides for settings (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <CodeMirror
                      value={settingsLocal}
                      onChange={setSettingsLocal}
                      height="400px"
                      extensions={[json()]}
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
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Leave empty to delete this file
                    </p>
                    <Button onClick={saveSettingsLocal} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Local Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CLAUDE.md Tab */}
            <TabsContent value="claude-md">
              <Card>
                <CardHeader>
                  <CardTitle>Global Instructions</CardTitle>
                  <CardDescription>
                    Custom instructions that apply to all Claude Code sessions
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
          </Tabs>
        </div>
      </main>
    </div>
  );
}
