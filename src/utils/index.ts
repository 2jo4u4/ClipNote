import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  if (hours < 24) return `${hours} 小時前`;
  if (days < 7) return `${days} 天前`;
  return new Date(timestamp).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDomainFromUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Checks whether a DOM event originated inside the given container element,
 * supporting both standard DOM (Side Panel) and Shadow DOM (Content Script)
 * where `e.target` is retargeted to the shadow host across the shadow boundary.
 */
export function isEventInsideNode(e: Event, node: HTMLElement | null): boolean {
  if (!node) return false;
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    if (path.includes(node)) {
      return true;
    }
  }
  if (e.target && typeof node.contains === 'function') {
    try {
      return node.contains(e.target as Node);
    } catch {
      return false;
    }
  }
  return false;
}
