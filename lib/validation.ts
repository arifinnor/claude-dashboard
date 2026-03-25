import { z } from 'zod';

/**
 * Settings.json validation schema
 * Based on Claude Code settings structure
 */
export const SettingsSchema = z.object({
  // Environment variables
  env: z.record(z.string(), z.string()).optional(),

  // Model configuration
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),

  // Plugin configuration
  enabledPlugins: z.record(z.string(), z.boolean()).optional(),

  // Marketplace configuration
  extraKnownMarketplaces: z.record(z.string(), z.any()).optional(),

  // UI preferences
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  fontScale: z.number().min(0.5).max(2).optional(),

  // Other settings (catch-all)
}).passthrough();

export type Settings = z.infer<typeof SettingsSchema>;

/**
 * CLAUDE.md content validation
 */
export const ClaudeMdSchema = z.string().min(1).optional().nullable();

export type ClaudeMdContent = z.infer<typeof ClaudeMdSchema>;

/**
 * Memory file content validation
 */
export const MemoryFileSchema = z.object({
  filename: z.string().min(1).refine(
    (name) => /^[a-zA-Z0-9_-]+\.md$/.test(name),
    { message: 'Filename must end with .md and contain only alphanumeric characters, hyphens, and underscores' }
  ),
  content: z.string(),
});

export type MemoryFile = z.infer<typeof MemoryFileSchema>;

/**
 * Project ID validation
 */
export const ProjectIdSchema = z.string().min(1).regex(
  /^[a-zA-Z0-9_-]+$/,
  { message: 'Project ID must contain only alphanumeric characters, hyphens, and underscores' }
);

export type ProjectId = z.infer<typeof ProjectIdSchema>;

/**
 * Validation error response
 */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

/**
 * Validate settings JSON
 */
export function validateSettings(data: unknown): { success: boolean; data?: Settings; errors?: ValidationError[] } {
  const result = SettingsSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return { success: false, errors };
}

/**
 * Validate CLAUDE.md content
 */
export function validateClaudeMd(content: string): { success: boolean; errors?: ValidationError[] } {
  const result = ClaudeMdSchema.safeParse(content);

  if (result.success) {
    return { success: true };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return { success: false, errors };
}

/**
 * Validate memory file
 */
export function validateMemoryFile(filename: string, content: string): { success: boolean; errors?: ValidationError[] } {
  const result = MemoryFileSchema.safeParse({ filename, content });

  if (result.success) {
    return { success: true };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return { success: false, errors };
}

/**
 * Validate project ID
 */
export function validateProjectId(projectId: string): { success: boolean; errors?: ValidationError[] } {
  const result = ProjectIdSchema.safeParse(projectId);

  if (result.success) {
    return { success: true };
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return { success: false, errors };
}
