export class DownloadError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'DOWNLOAD_ERROR'
  ) {
    super(message)
    this.name = 'DownloadError'
  }
}

export const handleApiError = (error: unknown) => {
  console.error('API Error:', error)
  
  if (error instanceof DownloadError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  }
} 