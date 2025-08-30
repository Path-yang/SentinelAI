import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'SentinelAI Backend API',
      status: 'running',
      version: '1.0.0',
      endpoints: [
        '/api/health',
        '/api/events',
        '/api/bridge/session'
      ]
    })
  } catch (error) {
    console.error('Root API error:', error)
    return NextResponse.json(
      { error: 'API error' },
      { status: 500 }
    )
  }
} 