import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/lib/models/Message'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userInput, botResponse, timestamp, sessionId } = body

    // Validate required fields
    if (!userInput || !botResponse || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: userInput, botResponse, and timestamp are required' },
        { status: 400 }
      )
    }

    // Create and save the message
    const message = new Message({
      userInput,
      botResponse,
      timestamp: new Date(timestamp),
      sessionId: sessionId || null,
    })

    await message.save()

    return NextResponse.json(
      { 
        success: true, 
        messageId: message._id,
        message: 'Message saved successfully' 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error saving message to MongoDB:', error)
    return NextResponse.json(
      { error: 'Failed to save message', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const query = sessionId ? { sessionId } : {}
    
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(
      { success: true, messages },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching messages from MongoDB:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    )
  }
}

