import { NextResponse } from 'next/server'
import axios from 'axios'

const MAILTM_BASE_URL = 'https://api.mail.tm'

export async function GET(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const messageId = params.messageId

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const messageResponse = await axios.get(`${MAILTM_BASE_URL}/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const message = messageResponse.data

    return NextResponse.json({
      id: message.id,
      from: {
        name: message.from?.name || 'Unknown',
        address: message.from?.address || 'unknown@example.com'
      },
      to: message.to || [],
      cc: message.cc || [],
      bcc: message.bcc || [],
      subject: message.subject || 'No Subject',
      text: message.text || '',
      html: message.html || [],
      seen: message.seen || false,
      hasAttachments: message.hasAttachments || false,
      attachments: message.attachments || [],
      createdAt: message.createdAt || new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error fetching message:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    )
  }
}

