import { NextResponse } from 'next/server'
import { ERROR_MESSAGES } from '@/app/config/constants'
import { DownloadError } from '@/app/utils/error-handler'
import { cleanYouTubeUrl } from '@/app/utils/validation'
import { getVideoDownloadUrl } from '@/app/utils/youtube'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const itag = searchParams.get('itag')

    if (!url || !itag) {
      throw new DownloadError(ERROR_MESSAGES.INVALID_URL, 400)
    }

    const cleanUrl = cleanYouTubeUrl(url)
    const { stream, title, format } = await getVideoDownloadUrl(cleanUrl, itag)

    // Set headers for download
    const headers = new Headers()
    headers.set('Content-Type', format.mimeType)
    headers.set('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.${format.container}"`)

    // Return the stream directly
    return new Response(stream, {
      headers
    })
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { 
        message: error.message || ERROR_MESSAGES.DOWNLOAD_ERROR,
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: error.statusCode || 500 }
    )
  }
} 