import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return `${formatDate(date)} at ${formatTime(date)}`;
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

export function getRandomColor(): string {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-accent-500',
    'bg-success-500',
    'bg-warning-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getPlatformIcon(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return 'twitter';
    case 'facebook':
      return 'facebook';
    case 'instagram':
      return 'instagram';
    case 'linkedin':
      return 'linkedin';
    default:
      return 'share2';
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return 'text-blue-500';
    case 'facebook':
      return 'text-blue-700';
    case 'instagram':
      return 'text-pink-600';
    case 'linkedin':
      return 'text-blue-600';
    default:
      return 'text-gray-500';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'published':
      return 'text-success-500';
    case 'scheduled':
      return 'text-warning-500';
    case 'draft':
      return 'text-gray-500';
    case 'failed':
      return 'text-error-500';
    default:
      return 'text-gray-500';
  }
}