// Load environment variables from .env file
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const axios = require('axios')
const { Client } = require('@notionhq/client')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Mail.tm API base URL (per official documentation: https://docs.mail.tm/)
const MAILTM_BASE_URL = 'https://api.mail.tm'

// Cache for available domains
let availableDomains = []
let domainsCacheTime = 0
const DOMAINS_CACHE_DURATION = 3600000 // 1 hour in milliseconds

// Function to get available domains (per Mail.tm API docs: GET /domains)
async function getAvailableDomains() {
  const now = Date.now()
  
  // Return cached domains if still valid
  if (availableDomains.length > 0 && (now - domainsCacheTime) < DOMAINS_CACHE_DURATION) {
    return availableDomains
  }

  try {
    // GET /domains - Returns JSON with hydra:member array (per API docs)
    const response = await axios.get(`${MAILTM_BASE_URL}/domains`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    // Parse response - API can return array directly or hydra:member format
    const data = response.data
    console.log('Domains API response:', JSON.stringify(data, null, 2))
    
    // Handle both array format and hydra:member format
    let domains = []
    if (Array.isArray(data)) {
      // Direct array format
      domains = data
    } else if (data['hydra:member']) {
      // Hydra format
      domains = data['hydra:member']
    } else {
      domains = []
    }
    
    console.log(`Found ${domains.length} domains in response`)
    
    // Filter for active domains only (per API docs structure)
    // Handle both boolean true and string "true" or number 1
    availableDomains = domains
      .filter(domain => {
        const isActive = domain.isActive === true || domain.isActive === 1 || domain.isActive === '1'
        console.log(`Domain ${domain.domain}: isActive=${domain.isActive}, filtered=${isActive}`)
        return isActive
      })
      .map(domain => domain.domain)
    
    console.log(`Filtered to ${availableDomains.length} active domains:`, availableDomains)
    
    domainsCacheTime = now
    
    // If still no domains, try without filter (maybe all are active)
    if (availableDomains.length === 0 && domains.length > 0) {
      console.log('No active domains found, trying all domains...')
      availableDomains = domains.map(domain => domain.domain)
      console.log(`Using all ${availableDomains.length} domains:`, availableDomains)
    }
    
    return availableDomains
  } catch (error) {
    console.error('Error fetching domains:', error.response?.data || error.message)
    console.error('Error status:', error.response?.status)
    console.error('Error headers:', error.response?.headers)
    // Return empty array on error - let the caller handle it
    return []
  }
}

// Test endpoint to check domains API
app.get('/api/test-domains', async (req, res) => {
  try {
    const response = await axios.get(`${MAILTM_BASE_URL}/domains`, {
      headers: {
        'Accept': 'application/json'
      }
    })
    
    // Handle both array format and hydra:member format
    const data = response.data
    let domains = []
    if (Array.isArray(data)) {
      domains = data
    } else if (data['hydra:member']) {
      domains = data['hydra:member']
    }
    
    res.json({
      status: 'success',
      statusCode: response.status,
      data: response.data,
      domainsCount: domains.length,
      domains: domains,
      isArray: Array.isArray(data),
      hasHydraMember: !!data['hydra:member']
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      response: error.response?.data,
      statusCode: error.response?.status
    })
  }
})

// Mail.tm API endpoints
app.post('/api/generate-email', async (req, res) => {
  try {
    // Get available domains
    const domains = await getAvailableDomains()
    
    console.log('Domains received in generate-email:', domains)
    
    if (domains.length === 0) {
      console.error('No available domains found. Please check the API response.')
      return res.status(500).json({ 
        error: 'No available domains. Please try again later.',
        details: 'The Mail.tm API did not return any available domains.'
      })
    }

    // Select a random domain
    const domain = domains[Math.floor(Math.random() * domains.length)]
    
    // Generate a random email address
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const email = `${randomString}@${domain}`
    const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // POST /accounts - Create account (per Mail.tm API docs)
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

    // Response format per API docs: { id, address, ... }
    const accountData = accountResponse.data
    if (!accountData || !accountData.id) {
      throw new Error('Failed to create account')
    }

    // POST /token - Get Bearer token (per Mail.tm API docs)
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

    // Response format per API docs: { id, token }
    const tokenData = tokenResponse.data
    if (!tokenData || !tokenData.token) {
      throw new Error('Failed to get authentication token')
    }

    const token = tokenData.token

    res.json({
      email: email,
      token: token
    })
  } catch (error) {
    console.error('Error generating email:', error.response?.data || error.message)
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        retryAfter: error.response.headers['retry-after'] || 60
      })
    }
    
    // Handle validation errors
    if (error.response?.status === 422) {
      return res.status(422).json({ 
        error: 'Invalid email address. Please try again.',
        details: error.response.data
      })
    }
    
    res.status(500).json({ 
      error: 'Failed to generate email address. Please try again.',
      details: error.response?.data?.detail || error.message
    })
  }
})

// Get emails list (uses intro from GET /messages, more efficient)
app.get('/api/get-emails', async (req, res) => {
  try {
    const token = req.query.token

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    // GET /messages - Get messages list (per Mail.tm API docs)
    // Requires Bearer token authentication
    const messagesResponse = await axios.get(`${MAILTM_BASE_URL}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    // Handle both array format and hydra:member format
    const data = messagesResponse.data
    let messages = []
    if (Array.isArray(data)) {
      messages = data
    } else if (data['hydra:member']) {
      messages = data['hydra:member']
    }

    // Use intro field from messages list (available in GET /messages per API docs)
    // Only fetch full message details when user clicks to view
    const emails = messages.map((message) => {
      return {
        id: message.id,
        from: {
          name: message.from?.name || 'Unknown',
          address: message.from?.address || 'unknown@example.com'
        },
        subject: message.subject || 'No Subject',
        intro: message.intro || '', // intro is available in list view
        seen: message.seen || false,
        hasAttachments: message.hasAttachments || false,
        createdAt: message.createdAt || new Date().toISOString()
      }
    })

    res.json({
      emails: emails
    })
  } catch (error) {
    console.error('Error fetching emails:', error.response?.data || error.message)
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    
    res.status(500).json({ error: 'Failed to fetch emails' })
  }
})

// Get full message details (fetches full text from GET /messages/{id})
app.get('/api/get-message/:messageId', async (req, res) => {
  try {
    const token = req.query.token
    const messageId = req.params.messageId

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' })
    }

    // GET /messages/{id} - Get full message details (per Mail.tm API docs)
    // Includes text, html, attachments (but not intro field)
    const messageResponse = await axios.get(`${MAILTM_BASE_URL}/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    // Response format per API docs: { id, from, to, subject, text, html, attachments, ... }
    const message = messageResponse.data

    res.json({
      id: message.id,
      from: {
        name: message.from?.name || 'Unknown',
        address: message.from?.address || 'unknown@example.com'
      },
      to: message.to || [],
      cc: message.cc || [],
      bcc: message.bcc || [],
      subject: message.subject || 'No Subject',
      text: message.text || '', // Full text from GET /messages/{id}
      html: message.html || [], // HTML content
      seen: message.seen || false,
      hasAttachments: message.hasAttachments || false,
      attachments: message.attachments || [],
      createdAt: message.createdAt || new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching message:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Message not found' })
    }
    
    res.status(500).json({ error: 'Failed to fetch message' })
  }
})

// Notion API integration
app.get('/api/notion-articles', async (req, res) => {
  try {
    // Support both variable naming conventions
    const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_KEY
    const notionDatabaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID

    console.log('Environment check:')
    console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? 'Set' : 'Not set')
    console.log('NOTION_KEY:', process.env.NOTION_KEY ? 'Set' : 'Not set')
    console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID ? 'Set' : 'Not set')
    console.log('NOTION_PAGE_ID:', process.env.NOTION_PAGE_ID ? 'Set' : 'Not set')

    if (!notionToken || !notionDatabaseId) {
      console.log('Notion integration not configured - missing token or database ID')
      console.log('Looking for: NOTION_TOKEN/NOTION_KEY and NOTION_DATABASE_ID/NOTION_PAGE_ID')
      console.log('Make sure you have a .env file in the root directory with these variables')
      return res.json({ articles: [] })
    }

    const notion = new Client({ auth: notionToken })

    // Remove dashes from ID (Notion IDs can be with or without dashes)
    let cleanDatabaseId = notionDatabaseId.replace(/-/g, '')
    
    // Format as UUID if needed (add dashes: 8-4-4-4-12)
    if (cleanDatabaseId.length === 32) {
      cleanDatabaseId = `${cleanDatabaseId.slice(0, 8)}-${cleanDatabaseId.slice(8, 12)}-${cleanDatabaseId.slice(12, 16)}-${cleanDatabaseId.slice(16, 20)}-${cleanDatabaseId.slice(20, 32)}`
    }

    console.log('Using database ID:', cleanDatabaseId)

    // Try to get database info first to verify access
    let actualDatabaseId = cleanDatabaseId
    try {
      const dbInfo = await notion.databases.retrieve({ database_id: cleanDatabaseId })
      actualDatabaseId = dbInfo.id
      console.log('Database access successful:', dbInfo.title?.[0]?.plain_text || 'Untitled')
    } catch (dbError) {
      console.error('Error accessing Notion database:', dbError.message)
      
      // If it's a page, try to get the database from the page
      if (dbError.message?.includes('is a page, not a database')) {
        try {
          console.log('Detected page ID, trying to retrieve database from page...')
          const page = await notion.pages.retrieve({ page_id: cleanDatabaseId })
          
          // Look for database in page properties or children
          // For now, return error asking for database ID
          return res.json({ 
            articles: [],
            error: 'The provided ID is a page, not a database. Please use the database ID from the database URL (not the page URL).',
            hint: 'Use the ID from the URL that looks like: https://www.notion.so/DATABASE_ID?v=...'
          })
        } catch (pageError) {
          console.error('Error accessing page:', pageError.message)
        }
      }
      
      return res.json({ 
        articles: [],
        error: 'Unable to access Notion database. Please check database ID and sharing permissions.',
        details: dbError.message
      })
    }

    const response = await notion.databases.query({
      database_id: actualDatabaseId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending'
        }
      ],
      page_size: 6
    })

    console.log(`Found ${response.results.length} Notion pages`)

    const articles = response.results.map((page) => {
      const properties = page.properties || {}

      // Extract title - try multiple property name variations
      let title = 'Untitled'
      const titleProps = ['Title', 'title', 'Name', 'name', 'Article Title', 'Article']
      for (const propName of titleProps) {
        if (properties[propName]?.type === 'title' && properties[propName].title?.[0]?.plain_text) {
          title = properties[propName].title[0].plain_text
          break
        }
      }

      // Extract description - try multiple property name variations
      let description = ''
      const descProps = ['Description', 'description', 'Summary', 'summary', 'Excerpt', 'excerpt']
      for (const propName of descProps) {
        if (properties[propName]?.type === 'rich_text' && properties[propName].rich_text?.[0]?.plain_text) {
          description = properties[propName].rich_text[0].plain_text
          break
        }
      }

      // Extract URL
      let url = page.url
      const urlProps = ['URL', 'url', 'Link', 'link']
      for (const propName of urlProps) {
        if (properties[propName]?.type === 'url' && properties[propName].url) {
          url = properties[propName].url
          break
        }
      }

      // Extract cover image
      let cover = null
      if (page.cover?.external?.url) {
        cover = page.cover.external.url
      } else if (page.cover?.file?.url) {
        cover = page.cover.file.url
      }

      // Extract date - try multiple property name variations
      let date = null
      const dateProps = ['Date', 'date', 'Published', 'published', 'Published Date']
      for (const propName of dateProps) {
        if (properties[propName]?.type === 'date' && properties[propName].date?.start) {
          date = properties[propName].date.start
          break
        }
      }
      // Fallback to created time
      if (!date && page.created_time) {
        date = page.created_time
      }

      return {
        id: page.id,
        title,
        description,
        url,
        cover,
        date
      }
    })

    console.log(`Successfully processed ${articles.length} articles`)
    res.json({ articles })
  } catch (error) {
    console.error('Error fetching Notion articles:', error.message)
    console.error('Error details:', error)
    res.json({ 
      articles: [],
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

