import { DownloadError } from './error-handler'
import { ERROR_MESSAGES } from '../config/constants'
import ytdl from '@distube/ytdl-core'

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

export async function getVideoInfo(url: string) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new DownloadError(ERROR_MESSAGES.INVALID_URL, 400)
    }

    const videoId = ytdl.getVideoID(url)
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    // Get video info
    const info = await ytdl.getInfo(videoUrl, {
      requestOptions: {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      }
    })

    // Get available formats
    let formats = info.formats
      .filter(format => {
        // Check if format has necessary properties
        return format.hasVideo && 
               format.qualityLabel && // Must have quality info
               format.mimeType?.includes('video/mp4') // Only MP4 formats
      })
      .map(format => ({
        itag: format.itag,
        qualityLabel: format.qualityLabel,
        mimeType: 'video/mp4',
        contentLength: format.contentLength || '0',
        container: 'mp4',
        fps: format.fps || 30,
        hasAudio: format.hasAudio,
        approxSizeLabel: formatFileSize(parseInt(format.contentLength || '0'))
      }))
      .sort((a, b) => {
        const qualityA = parseInt(a.qualityLabel) || 0
        const qualityB = parseInt(b.qualityLabel) || 0
        return qualityB - qualityA
      })

    // If no formats found, try with less strict filtering
    if (formats.length === 0) {
      formats = info.formats
        .filter(format => format.hasVideo)
        .map(format => ({
          itag: format.itag,
          qualityLabel: format.qualityLabel || 'Unknown',
          mimeType: 'video/mp4',
          contentLength: format.contentLength || '0',
          container: 'mp4',
          fps: format.fps || 30,
          hasAudio: format.hasAudio || false,
          approxSizeLabel: formatFileSize(parseInt(format.contentLength || '0'))
        }))
        .sort((a, b) => {
          const qualityA = parseInt(a.qualityLabel) || 0
          const qualityB = parseInt(b.qualityLabel) || 0
          return qualityB - qualityA
        })
    }

    // If still no formats available, throw error
    if (formats.length === 0) {
      throw new DownloadError(ERROR_MESSAGES.FORMAT_UNAVAILABLE, 400)
    }

    return {
      videoId,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
      author: info.videoDetails.author?.name || 'Unknown',
      duration: info.videoDetails.lengthSeconds,
      viewCount: info.videoDetails.viewCount,
      formats
    }
  } catch (error: any) {
    console.error('Video info error:', error)
    throw new DownloadError(
      error.message || ERROR_MESSAGES.NETWORK_ERROR,
      error.statusCode || 500
    )
  }
}

export async function getVideoDownloadUrl(url: string, itag: string) {
  try {
    if (!ytdl.validateURL(url)) {
      throw new DownloadError(ERROR_MESSAGES.INVALID_URL, 400)
    }

    const videoId = ytdl.getVideoID(url)
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    // Get video info
    const info = await ytdl.getInfo(videoUrl, {
      requestOptions: {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      }
    })

    // Create download stream
    const stream = ytdl(videoUrl, {
      quality: itag,
      filter: 'audioandvideo',
      requestOptions: {
        headers: {
          'User-Agent': USER_AGENT
        }
      }
    })

    // Get format info for headers
    const format = info.formats.find(f => f.itag.toString() === itag) || {
      mimeType: 'video/mp4',
      container: 'mp4'
    }

    return {
      stream,
      title: info.videoDetails.title,
      format: {
        mimeType: format.mimeType || 'video/mp4',
        container: format.container || 'mp4'
      }
    }
  } catch (error: any) {
    console.error('Video URL error:', error)
    throw new DownloadError(
      error.message || ERROR_MESSAGES.NETWORK_ERROR,
      error.statusCode || 500
    )
  }
} 