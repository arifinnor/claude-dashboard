import chokidar from 'chokidar';
import { EventEmitter } from 'events';
import path from 'path';
import os from 'os';
import { ensureClaudeDir, CONFIG_PATHS, getProjectIdFromPath } from './fs';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');

export type FileEventType = 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';

export interface FileChangeEvent {
  type: FileEventType;
  path: string;
  projectId: string | null;
  fileType: 'settings' | 'claude-md' | 'memory' | 'project' | 'unknown';
}

class FileWatcher extends EventEmitter {
  private watcher: ReturnType<typeof chokidar.watch> | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await ensureClaudeDir();

    this.watcher = chokidar.watch(CLAUDE_DIR, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', (eventType: string, filePath: string) => {
      this.handleFileChange(eventType as FileEventType, filePath);
    });

    this.watcher.on('error', (error) => {
      console.error('File watcher error:', error);
    });

    await new Promise<void>((resolve) => {
      if (this.watcher) {
        this.watcher.on('ready', () => resolve);
      } else {
        resolve();
      }
    });

    this.initialized = true;
    console.log('File watcher initialized');
  }

  private handleFileChange(eventType: FileEventType, filePath: string): void {
    const change: FileChangeEvent = {
      type: eventType,
      path: filePath,
      projectId: getProjectIdFromPath(path.dirname(filePath)),
      fileType: this.detectFileType(filePath),
    };

    this.emit('change', change);
  }

  private detectFileType(filePath: string): FileChangeEvent['fileType'] {
    const filename = path.basename(filePath);
    const dirname = path.basename(path.dirname(filePath));

    // Global settings
    if (filePath === CONFIG_PATHS.settings) return 'settings';
    if (filePath === CONFIG_PATHS.settingsLocal) return 'settings';
    if (filePath === CONFIG_PATHS.claudeMd) return 'claude-md';

    // Project files
    if (filename === 'CLAUDE.md') return 'claude-md';
    if (dirname === 'memory' && filename.endsWith('.md')) return 'memory';
    if (filename === 'CLAUDE.md' || dirname === 'memory') return 'project';

    return 'unknown';
  }

  async close(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.initialized = false;
    }
  }

  isReady(): boolean {
    return this.initialized;
  }
}

// Singleton instance
const fileWatcher = new FileWatcher();

// Initialize on module load
fileWatcher.init().catch((error) => {
  console.error('Failed to initialize file watcher:', error);
});

export default fileWatcher;
