import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { camera_label } = body
    
    // Generate unique camera ID (same format as your backend)
    const camera_id = `cam-${Math.random().toString(36).substr(2, 9)}`
    
    // Get domain from environment or use Vercel URL
    const domain = process.env.VERCEL_URL ? 
      process.env.VERCEL_URL.replace('https://', '') : 
      'localhost:3000'
    
    // Create response matching your FastAPI backend
    const response = {
      camera_id,
      publish_url: `rtsp://${domain}:8554/${camera_id}`,
      hls_url: `https://${domain}/hls/${camera_id}/index.m3u8`,
      created_at: Math.floor(Date.now() / 1000),
      label: camera_label || 'Camera'
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Bridge session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create bridge session' }, 
      { status: 500 }
    )
  }
} 