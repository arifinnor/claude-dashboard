'use client';

import { useEffect } from 'react';
import { useFileWatcher } from '@/lib/use-file-watcher';
import { FileChangeEvent } from '@/lib/watcher';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

export function FileChangeNotifier() {
  const pathname = usePathname();

  useFileWatcher((change: FileChangeEvent) => {
    // Determine if the change is relevant to the current page
    const isRelevant = isChangeRelevant(change, pathname);

    if (isRelevant) {
      showNotification(change);
    }
  });

  return null;
}

function isChangeRelevant(change: FileChangeEvent, pathname: string): boolean {
  // Settings pages
  if (pathname === '/settings') {
    return (
      change.fileType === 'settings' ||
      change.fileType === 'claude-md'
    );
  }

  // Projects list
  if (pathname === '/projects') {
    return change.fileType === 'project';
  }

  // Project detail page
  if (pathname.startsWith('/projects/') && change.projectId) {
    const urlProjectId = pathname.split('/')[2];
    return change.projectId === urlProjectId;
  }

  // Memory browser
  if (pathname === '/memory') {
    return change.fileType === 'memory';
  }

  return false;
}

function showNotification(change: FileChangeEvent): void {
  const fileName = change.path.split('/').pop() || 'file';

  switch (change.fileType) {
    case 'settings':
      if (change.type === 'change') {
        toast.info(`Settings file updated externally`, {
          description: 'Refresh to see the latest changes',
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      }
      break;

    case 'claude-md':
      if (change.type === 'change') {
        toast.info(`CLAUDE.md updated externally`, {
          description: 'Refresh to see the latest changes',
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      }
      break;

    case 'memory':
      if (change.type === 'change') {
        toast.info(`Memory file "${fileName}" updated`, {
          description: 'Refresh to see the latest changes',
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      } else if (change.type === 'add') {
        toast.success(`New memory file "${fileName}" created`, {
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      } else if (change.type === 'unlink') {
        toast.warning(`Memory file "${fileName}" deleted`, {
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      }
      break;

    case 'project':
      if (change.type === 'add' || change.type === 'addDir') {
        toast.success(`Project "${change.projectId}" updated`, {
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
          },
        });
      }
      break;

    default:
      break;
  }
}
