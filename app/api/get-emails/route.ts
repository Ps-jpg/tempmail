import { NextResponse } from 'next/server'
import axios from 'axios'

const MAILTM_BASE_URL = 'https://api.mail.tm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const messagesResponse = await axios.get(`${MAILTM_BASE_URL}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    const data = messagesResponse.data
    let messages: any[] = []
    
    if (Array.isArray(data)) {
      messages = data
    } else if (data['hydra:member']) {
      messages = data['hydra:member']
    }

    const emails = messages.map((message) => {
      return {
        id: message.id,
        from: {
          name: message.from?.name || 'Unknown',
          address: message.from?.address || 'unknown@example.com'
        },
        subject: message.subject || 'No Subject',
        intro: message.intro || '',
        seen: message.seen || false,
        hasAttachments: message.hasAttachments || false,
        createdAt: message.createdAt || new Date().toISOString()
      }
    })

    return NextResponse.json({ emails })
  } catch (error: any) {
    console.error('Error fetching emails:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}

