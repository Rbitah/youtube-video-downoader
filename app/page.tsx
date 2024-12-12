'use client'

import { useState } from 'react'
import { ArrowDownTrayIcon, VideoCameraIcon } from '@heroicons/react/24/solid'
import { formatDuration, formatViews } from './utils/format'

type VideoFormat = {
  itag: string | number
  qualityLabel: string
  mimeType: string
  contentLength: string
  container: string
  fps: number
  hasAudio: boolean
}

type VideoInfo = {
  title: string
  thumbnail: string
  author: string
  duration: string
  viewCount: string
  formats: VideoFormat[]
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({})

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    
    setLoading(true)
    setError('')
    setVideoInfo(null)
    
    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      
      console.log('Video info received:', data)
      if (!data.formats || data.formats.length === 0) {
        throw new Error('No download formats available')
      }
      
      setVideoInfo(data)
    } catch (err: any) {
      console.error('Error fetching video info:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: VideoFormat) => {
    try {
      setDownloading(format.itag)
      setDownloadProgress(prev => ({ ...prev, [format.itag]: 0 }))
      
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(url)}&itag=${format.itag}`,
        { method: 'GET' }
      )

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = downloadUrl
      a.download = `${videoInfo?.title || 'video'}.${format.container}`
      
      // Trigger download
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      setDownloadProgress(prev => ({ ...prev, [format.itag]: 100 }))
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to start download')
    } finally {
      setTimeout(() => {
        setDownloading(null)
        setDownloadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[format.itag]
          return newProgress
        })
      }, 2000)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center justify-center gap-3">
            <VideoCameraIcon className="h-10 w-10 text-red-500" />
            YouTube Video Downloader
          </h1>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4 max-w-2xl mx-auto">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="flex-1 p-4 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Loading...' : 'Get Video'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-8 max-w-2xl mx-auto border border-red-700">
              {error}
            </div>
          )}

          {videoInfo && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={videoInfo.thumbnail} 
                    alt={videoInfo.title}
                    className="w-full rounded-lg mb-4 shadow-lg"
                  />
                  <div className="text-left text-gray-300">
                    <h2 className="text-xl font-bold text-white mb-2">{videoInfo.title}</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span>{videoInfo.author}</span>
                      <span>•</span>
                      <span>{formatViews(videoInfo.viewCount)}</span>
                      <span>•</span>
                      <span>{formatDuration(parseInt(videoInfo.duration))}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">Download Options</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-gray-400">Loading available formats...</div>
                    ) : videoInfo?.formats.length === 0 ? (
                      <div className="text-gray-400">No download formats available</div>
                    ) : (
                      videoInfo?.formats.map((format) => (
                        <button
                          key={format.itag}
                          onClick={() => handleDownload(format)}
                          disabled={downloading === format.itag}
                          className={`w-full flex items-center justify-between gap-2 ${
                            downloading === format.itag 
                              ? 'bg-green-600' 
                              : 'bg-gray-700 hover:bg-gray-600'
                          } text-white p-4 rounded-lg transition-all duration-200`}
                        >
                          <div className="flex items-center gap-3">
                            {downloading === format.itag ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            )}
                            <div className="text-left">
                              <div className="font-medium">{format.qualityLabel}</div>
                              <div className="text-xs text-gray-300">
                                {format.container.toUpperCase()} • {format.fps}fps
                                {downloadProgress[format.itag] !== undefined && (
                                  <span className="ml-2">
                                    {downloadProgress[format.itag].toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            {formatFileSize(format.contentLength)}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
