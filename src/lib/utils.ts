import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateSnippet(clientId: string, adminId: string): string {
  // Get the current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  return `<script>
  (function() {
    var script = document.createElement('script');
    script.async = true;
    script.src = '${origin}/api/snippet/${adminId}/${clientId}.js';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  })();
</script>`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getApiEndpoint(path: string = ''): string {
  // Get the current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/api${path}`;
}

export function getCdnUrl(path: string = ''): string {
  // Get the current origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${path}`;
}
