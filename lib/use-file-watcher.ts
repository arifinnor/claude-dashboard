'use client';

import { useEffect, useState, useRef } from 'react';
import { FileChangeEvent } from './watcher';

export function useFileWatcher(onChange?: (change: FileChangeEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource('/api/watch');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('File watcher connected');
      setIsConnected(true);
    };

    eventSource.addEventListener('connected', () => {
      console.log('File watcher: Connection confirmed');
    });

    eventSource.addEventListener('change', (e) => {
      try {
        const change = JSON.parse(e.data) as FileChangeEvent;
        console.log('File change detected:', change);
        onChange?.(change);
      } catch (error) {
        console.error('Failed to parse file change event:', error);
      }
    });

    eventSource.addEventListener('error', (e) => {
      console.error('File watcher error:', e);
      setIsConnected(false);
    });

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsConnected(false);
    };

    // Cleanup
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [onChange]);

  return { isConnected };
}
