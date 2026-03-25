import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

// Config file paths
export const CONFIG_PATHS = {
  settings: path.join(CLAUDE_DIR, 'settings.json'),
  settingsLocal: path.join(CLAUDE_DIR, 'settings.local.json'),
  claudeMd: path.join(CLAUDE_DIR, 'CLAUDE.md'),
} as const;

export interface ProjectInfo {
  id: string;
  path: string;
  claudeMdExists: boolean;
  memoryDirExists: boolean;
  memoryFiles: string[];
}

/**
 * Ensure the Claude directory exists
 */
export async function ensureClaudeDir(): Promise<void> {
  try {
    await fs.mkdir(CLAUDE_DIR, { recursive: true });
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create Claude directory:', error);
    throw error;
  }
}

/**
 * Read a file safely, returns null if file doesn't exist
 */
export async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Write a file, creating parent directories if needed
 */
export async function writeFileSafe(filePath: string, content: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Delete a file safely
 */
export async function deleteFileSafe(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Read and parse JSON file
 */
export async function readJsonFile<T = any>(filePath: string): Promise<T | null> {
  const content = await readFileSafe(filePath);
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Failed to parse JSON from ${filePath}:`, error);
    return null;
  }
}

/**
 * Write JSON file with validation
 */
export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  try {
    const content = JSON.stringify(data, null, 2);
    await writeFileSafe(filePath, content);
  } catch (error) {
    console.error(`Failed to write JSON to ${filePath}:`, error);
    throw error;
  }
}

/**
 * List all projects
 */
export async function listProjects(): Promise<ProjectInfo[]> {
  await ensureClaudeDir();

  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: ProjectInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(PROJECTS_DIR, entry.name);
        const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
        const memoryPath = path.join(projectPath, 'memory');

        const claudeMdExists = await fileExists(claudeMdPath);
        const memoryDirExists = await fileExists(memoryPath);

        let memoryFiles: string[] = [];
        if (memoryDirExists) {
          try {
            const files = await fs.readdir(memoryPath);
            memoryFiles = files.filter(f => f.endsWith('.md'));
          } catch (error) {
            console.error(`Failed to read memory dir for ${entry.name}:`, error);
          }
        }

        projects.push({
          id: entry.name,
          path: projectPath,
          claudeMdExists,
          memoryDirExists,
          memoryFiles,
        });
      }
    }

    return projects.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error('Failed to list projects:', error);
    return [];
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get memory files for a project
 */
export async function getMemoryFiles(projectId: string): Promise<string[]> {
  const memoryPath = path.join(PROJECTS_DIR, projectId, 'memory');

  if (!(await fileExists(memoryPath))) {
    return [];
  }

  try {
    const files = await fs.readdir(memoryPath);
    return files.filter(f => f.endsWith('.md')).sort();
  } catch (error) {
    console.error(`Failed to read memory files for ${projectId}:`, error);
    return [];
  }
}

/**
 * Read a memory file
 */
export async function readMemoryFile(projectId: string, filename: string): Promise<string | null> {
  const memoryPath = path.join(PROJECTS_DIR, projectId, 'memory', filename);
  return readFileSafe(memoryPath);
}

/**
 * Write a memory file
 */
export async function writeMemoryFile(projectId: string, filename: string, content: string): Promise<void> {
  const memoryPath = path.join(PROJECTS_DIR, projectId, 'memory', filename);
  await writeFileSafe(memoryPath, content);
}

/**
 * Delete a memory file
 */
export async function deleteMemoryFile(projectId: string, filename: string): Promise<boolean> {
  const memoryPath = path.join(PROJECTS_DIR, projectId, 'memory', filename);
  return deleteFileSafe(memoryPath);
}

/**
 * Read project CLAUDE.md
 */
export async function readProjectClaudeMd(projectId: string): Promise<string | null> {
  const claudeMdPath = path.join(PROJECTS_DIR, projectId, 'CLAUDE.md');
  return readFileSafe(claudeMdPath);
}

/**
 * Write project CLAUDE.md
 */
export async function writeProjectClaudeMd(projectId: string, content: string): Promise<void> {
  const claudeMdPath = path.join(PROJECTS_DIR, projectId, 'CLAUDE.md');
  await writeFileSafe(claudeMdPath, content);
}

/**
 * Get project directory for a given path
 */
export function getProjectIdFromPath(dirPath: string): string | null {
  const normalizedPath = path.normalize(dirPath);
  const projectsNormalized = path.normalize(PROJECTS_DIR);

  if (normalizedPath.startsWith(projectsNormalized)) {
    const relativePath = path.relative(projectsNormalized, normalizedPath);
    const parts = relativePath.split(path.sep);
    if (parts.length > 0) {
      return parts[0];
    }
  }

  return null;
}
