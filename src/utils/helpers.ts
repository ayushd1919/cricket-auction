import { PLAYER_ROLES } from './constants';

export function formatCurrency(amount: number): string {
  return `${amount} pts`;
}

export function formatLakhs(amount: number): string {
  return `${amount} pts`;
}

export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case PLAYER_ROLES.BATSMAN:
      return 'badge-batsman';
    case PLAYER_ROLES.BOWLER:
      return 'badge-bowler';
    case PLAYER_ROLES.ALL_ROUNDER:
      return 'badge-allrounder';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'unsold':
      return 'bg-green-500';
    case 'bidding':
      return 'bg-yellow-500';
    case 'sold':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'unsold':
      return 'Available';
    case 'bidding':
      return 'In Auction';
    case 'sold':
      return 'Sold';
    default:
      return status;
  }
}

export function calculateBudgetPercentage(remaining: number, total: number): number {
  return Math.round(((total - remaining) / total) * 100);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
}

export function convertToDirectImageUrl(url: string): string {
  if (!url) return '';

  // Already a direct Google URL, return as is
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }

  // Already a thumbnail URL, return as is
  if (url.includes('drive.google.com/thumbnail')) {
    return url;
  }

  // Already a uc export URL, return as is
  if (url.includes('drive.google.com/uc')) {
    return url;
  }

  // Convert Google Drive sharing link to direct image URL
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // Or: https://drive.google.com/open?id=FILE_ID
  // Or: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
  // Convert to: https://drive.google.com/uc?export=view&id=FILE_ID

  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    let fileId = '';

    // Format: /file/d/FILE_ID/
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    }

    // Format: ?id=FILE_ID or &id=FILE_ID
    if (!fileId) {
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        fileId = idMatch[1];
      }
    }

    if (fileId) {
      // Use uc export view URL - most compatible
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }

  // Return original URL if not a Google Drive link
  return url;
}

// Get file ID from Google Drive URL
export function getGoogleDriveFileId(url: string): string {
  if (!url) return '';

  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return '';
}
