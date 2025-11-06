import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET() {
  try {
    const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_KEY
    const notionDatabaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID

    if (!notionToken || !notionDatabaseId) {
      console.log('Notion integration not configured')
      return NextResponse.json({ articles: [] })
    }

    const notion = new Client({ auth: notionToken })

    // Remove dashes from ID and format as UUID
    let cleanDatabaseId = notionDatabaseId.replace(/-/g, '')
    if (cleanDatabaseId.length === 32) {
      cleanDatabaseId = `${cleanDatabaseId.slice(0, 8)}-${cleanDatabaseId.slice(8, 12)}-${cleanDatabaseId.slice(12, 16)}-${cleanDatabaseId.slice(16, 20)}-${cleanDatabaseId.slice(20, 32)}`
    }

    // Verify database access
    try {
      await notion.databases.retrieve({ database_id: cleanDatabaseId })
    } catch (dbError: any) {
      console.error('Error accessing Notion database:', dbError.message)
      return NextResponse.json({ 
        articles: [],
        error: 'Unable to access Notion database. Please check database ID and sharing permissions.'
      })
    }

    const response = await notion.databases.query({
      database_id: cleanDatabaseId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending'
        }
      ],
      page_size: 6
    })

    const articles = response.results.map((page: any) => {
      const properties = page.properties || {}

      let title = 'Untitled'
      const titleProps = ['Title', 'title', 'Name', 'name', 'Article Title', 'Article']
      for (const propName of titleProps) {
        if (properties[propName]?.type === 'title' && properties[propName].title?.[0]?.plain_text) {
          title = properties[propName].title[0].plain_text
          break
        }
      }

      let description = ''
      const descProps = ['Description', 'description', 'Summary', 'summary', 'Excerpt', 'excerpt']
      for (const propName of descProps) {
        if (properties[propName]?.type === 'rich_text' && properties[propName].rich_text?.[0]?.plain_text) {
          description = properties[propName].rich_text[0].plain_text
          break
        }
      }

      let url = page.url
      const urlProps = ['URL', 'url', 'Link', 'link']
      for (const propName of urlProps) {
        if (properties[propName]?.type === 'url' && properties[propName].url) {
          url = properties[propName].url
          break
        }
      }

      let cover = null
      if (page.cover?.external?.url) {
        cover = page.cover.external.url
      } else if (page.cover?.file?.url) {
        cover = page.cover.file.url
      }

      let date = null
      const dateProps = ['Date', 'date', 'Published', 'published', 'Published Date']
      for (const propName of dateProps) {
        if (properties[propName]?.type === 'date' && properties[propName].date?.start) {
          date = properties[propName].date.start
          break
        }
      }
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

    return NextResponse.json({ articles })
  } catch (error: any) {
    console.error('Error fetching Notion articles:', error.message)
    return NextResponse.json({ 
      articles: [],
      error: error.message
    })
  }
}

