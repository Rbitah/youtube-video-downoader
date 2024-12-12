import ytdl from 'ytdl-core'

export const cleanYouTubeUrl = (url: string): string => {
  try {
    // Extract video ID using ytdl-core
    const videoId = ytdl.getVideoID(url)
    // Return clean URL
    return `https://www.youtube.com/watch?v=${videoId}`
  } catch {
    // If we can't extract ID, return original URL
    return url
  }
}

export const isValidYouTubeUrl = (url: string): boolean => {
  return ytdl.validateURL(url)
} 