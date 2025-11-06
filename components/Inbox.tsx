'use client'

import { useState, useEffect } from 'react'
import { getApiEndpoint } from '@/lib/api'

interface Email {
  id: string
  from: {
    name: string
    address: string
  }
  subject: string
  intro: string
  seen: boolean
  hasAttachments: boolean
  createdAt: string
}

interface FullEmail extends Email {
  text: string
  html?: string[]
  to?: Array<{ name: string; address: string }>
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    id: string
    filename: string
    contentType: string
    size: number
    downloadUrl: string
  }>
}

interface InboxProps {
  email: string
  token: string
}

export default function Inbox({ email, token }: InboxProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null)
  const [loadingFullEmail, setLoadingFullEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmails = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(getApiEndpoint(`/api/get-emails?token=${token}`))
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }

      const data = await response.json()
      setEmails(data.emails || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [token])

  const copyEmail = () => {
    navigator.clipboard.writeText(email)
    alert('Email copied to clipboard!')
  }

  const fetchFullEmail = async (emailId: string) => {
    setLoadingFullEmail(true)
    try {
      const response = await fetch(getApiEndpoint(`/api/get-message/${emailId}?token=${token}`))
      
      if (!response.ok) {
        throw new Error('Failed to fetch full message')
      }

      const fullEmail: FullEmail = await response.json()
      setSelectedEmail(fullEmail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load message')
      setSelectedEmail(null)
    } finally {
      setLoadingFullEmail(false)
    }
  }

  const handleEmailClick = (emailItem: Email) => {
    // Fetch full email details when clicked (per Mail.tm API - GET /messages/{id})
    fetchFullEmail(emailItem.id)
  }

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white text-gray-900">
              Your Inbox
            </h2>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                {email}
              </p>
              <button
                onClick={copyEmail}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Copy email"
              >
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        {emails.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No emails yet. Your inbox will update automatically when emails arrive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emails.map((emailItem) => (
              <div
                key={emailItem.id}
                onClick={() => handleEmailClick(emailItem)}
                className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                  emailItem.seen 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                    : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {emailItem.from.name || emailItem.from.address}
                    </p>
                    {!emailItem.seen && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                    {emailItem.hasAttachments && (
                      <svg className="flex-shrink-0 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {new Date(emailItem.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                  {emailItem.subject}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {emailItem.intro || 'No preview available'}
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEmail(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              {loadingFullEmail ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold dark:text-white text-gray-900">
                      {selectedEmail.subject}
                    </h3>
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">From:</span> {selectedEmail.from.name} ({selectedEmail.from.address})
                    </p>
                    {selectedEmail.to && selectedEmail.to.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-semibold">To:</span> {selectedEmail.to.map(t => t.name || t.address).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-semibold">Date:</span> {new Date(selectedEmail.createdAt).toLocaleString()}
                    </p>
                    {selectedEmail.hasAttachments && selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Attachments:</p>
                        <div className="space-y-1">
                          {selectedEmail.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {att.filename} ({(att.size / 1024).toFixed(2)} KB)
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    {selectedEmail.html && selectedEmail.html.length > 0 ? (
                      <div 
                        className="text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html.join('') }}
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedEmail.text || selectedEmail.intro || 'No content available'}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

