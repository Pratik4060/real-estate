/**
 * Date utility functions for converting UTC timestamps to IST (Asia/Kolkata)
 */

/**
 * Formats a UTC timestamp to a date string in IST
 * Uses the browser's Intl API to properly convert UTC to IST timezone
 * @param utcTimestamp - UTC timestamp string (e.g., "2025-12-26T06:34:00.000Z")
 * @returns Formatted date string (DD/MM/YYYY) in IST
 */
export const formatDateIST = (utcTimestamp: string): string => {
  const date = new Date(utcTimestamp);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Formats a UTC timestamp to a time string in IST
 * Uses the browser's Intl API to properly convert UTC to IST timezone
 * @param utcTimestamp - UTC timestamp string
 * @returns Formatted time string (HH:MM AM/PM) in IST
 */
export const formatTimeIST = (utcTimestamp: string): string => {
  const date = new Date(utcTimestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};

/**
 * Formats a UTC timestamp to both date and time strings in IST
 * @param utcTimestamp - UTC timestamp string
 * @returns Object with date and time strings in IST
 */
export const formatDateTimeIST = (utcTimestamp: string): { date: string; time: string } => {
  return {
    date: formatDateIST(utcTimestamp),
    time: formatTimeIST(utcTimestamp)
  };
};

/**
 * Formats a UTC timestamp to relative time (e.g., "3 minutes ago", "2 hours ago")
 * @param utcTimestamp - UTC timestamp string
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (utcTimestamp: string): string => {
  const date = new Date(utcTimestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // For older notifications, show date and time
  return formatTimeIST(utcTimestamp);
};

