import { NextResponse } from 'next/server'
import { getVideoInfo } from '@/app/utils/youtube'
import { ERROR_MESSAGES } from '@/app/config/constants'
import { DownloadError } from '@/app/utils/error-handler'
import { cleanYouTubeUrl } from '@/app/utils/validation'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      throw new DownloadError(ERROR_MESSAGES.INVALID_URL, 400)
    }

    const cleanUrl = cleanYouTubeUrl(url)
    const videoInfo = await getVideoInfo(cleanUrl)

    return NextResponse.json(videoInfo)
  } catch (error: any) {
    console.error('Video info error:', error)
    return NextResponse.json(
      { 
        message: error.message || 'Failed to fetch video info',
        code: error.code || 'UNKNOWN_ERROR',
      },
      { status: error.statusCode || 500 }
    )
  }
} 