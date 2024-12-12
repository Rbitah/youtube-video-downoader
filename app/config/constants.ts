export const SUPPORTED_FORMATS = ['mp4', 'webm']
export const MAX_FILE_SIZE = 2000 * 1024 * 1024 // 2GB in bytes

export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid YouTube URL',
  FILE_TOO_LARGE: 'Video file is too large to download',
  NETWORK_ERROR: 'Network error occurred. Please try again',
  FORMAT_UNAVAILABLE: 'This format is currently unavailable',
  VIDEO_UNAVAILABLE: 'This video is unavailable or restricted',
  DOWNLOAD_ERROR: 'Failed to start download. Please try again',
}

export const QUALITY_LABELS = {
  high: '1080p',
  medium: '720p',
  low: '480p',
} 