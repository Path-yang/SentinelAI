import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for events (for now - you can upgrade to Vercel KV later)
let EVENTS: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { camera_id, type, confidence, timestamp, snapshot_url } = body
    
    // Create event object
    const event = {
      camera_id,
      type,
      confidence,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      snapshot_url
    }
    
    // Add to events array
    EVENTS.push(event)
    
    // Clean up old events (keep only last 1000)
    if (EVENTS.length > 1000) {
      EVENTS = EVENTS.slice(-1000)
    }
    
    return NextResponse.json({ 
      ok: true, 
      event_id: EVENTS.length 
    })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Limit to 100 max
    const actualLimit = Math.min(limit, 100)
    
    // Return events in reverse order (newest first)
    const events = EVENTS.slice(-actualLimit).reverse()
    
    return NextResponse.json({
      events,
      total: EVENTS.length,
      returned: events.length
    })
  } catch (error) {
    console.error('Event retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve events' }, 
      { status: 500 }
    )
  }
} 