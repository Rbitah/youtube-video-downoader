export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(remainingSeconds)}`
  }
  return `${minutes}:${padZero(remainingSeconds)}`
}

export const padZero = (num: number): string => {
  return num.toString().padStart(2, '0')
}

export const formatViews = (count: string): string => {
  const num = parseInt(count)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`
  }
  return `${num} views`
}

export const getFileExtension = (mimeType: string): string => {
  const match = mimeType.match(/\/([a-zA-Z0-9]+)/)
  return match ? match[1] : 'mp4'
} 