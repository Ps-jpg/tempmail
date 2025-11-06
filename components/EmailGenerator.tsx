'use client'

import { useState } from 'react'
import { getApiEndpoint } from '@/lib/api'

interface EmailGeneratorProps {
  onEmailGenerated: (email: string, token: string) => void
}

export default function EmailGenerator({ onEmailGenerated }: EmailGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateEmail = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(getApiEndpoint('/api/generate-email'), {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error messages from backend
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`)
        }
        throw new Error(data.error || 'Failed to generate email')
      }

      onEmailGenerated(data.email, data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 dark:text-white text-gray-900">
          Generate Temporary Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Click the button below to generate a temporary email address. Use it to receive emails without exposing your real email.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <button
          onClick={generateEmail}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Email Address'
          )}
        </button>
      </div>
    </div>
  )
}

