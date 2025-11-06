import { NextResponse } from 'next/server'
import axios from 'axios'

const MAILTM_BASE_URL = 'https://api.mail.tm'

// Cache for available domains
let availableDomains: string[] = []
let domainsCacheTime = 0
const DOMAINS_CACHE_DURATION = 3600000 // 1 hour

async function getAvailableDomains() {
  const now = Date.now()
  
  if (availableDomains.length > 0 && (now - domainsCacheTime) < DOMAINS_CACHE_DURATION) {
    return availableDomains
  }

  try {
    const response = await axios.get(`${MAILTM_BASE_URL}/domains`, {
      headers: { 'Accept': 'application/json' }
    })

    const data = response.data
    let domains: any[] = []
    
    if (Array.isArray(data)) {
      domains = data
    } else if (data['hydra:member']) {
      domains = data['hydra:member']
    }
    
    availableDomains = domains
      .filter(domain => domain.isActive === true)
      .map(domain => domain.domain)
    
    domainsCacheTime = now
    return availableDomains
  } catch (error: any) {
    console.error('Error fetching domains:', error.response?.data || error.message)
    return []
  }
}

export async function POST() {
  try {
    const domains = await getAvailableDomains()
    
    if (domains.length === 0) {
      return NextResponse.json(
        { error: 'No available domains. Please try again later.' },
        { status: 500 }
      )
    }

    const domain = domains[Math.floor(Math.random() * domains.length)]
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const email = `${randomString}@${domain}`
    const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const accountResponse = await axios.post(`${MAILTM_BASE_URL}/accounts`, {
      address: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    })

    const accountData = accountResponse.data
    if (!accountData || !accountData.id) {
      throw new Error('Failed to create account')
    }

    const tokenResponse = await axios.post(`${MAILTM_BASE_URL}/token`, {
      address: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    })

    const tokenData = tokenResponse.data
    if (!tokenData || !tokenData.token) {
      throw new Error('Failed to get authentication token')
    }

    return NextResponse.json({
      email: email,
      token: tokenData.token
    })
  } catch (error: any) {
    console.error('Error generating email:', error.response?.data || error.message)
    
    if (error.response?.status === 429) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          retryAfter: error.response.headers['retry-after'] || 60
        },
        { status: 429 }
      )
    }
    
    if (error.response?.status === 422) {
      return NextResponse.json(
        { 
          error: 'Invalid email address. Please try again.',
          details: error.response.data
        },
        { status: 422 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate email address. Please try again.',
        details: error.response?.data?.detail || error.message
      },
      { status: 500 }
    )
  }
}

