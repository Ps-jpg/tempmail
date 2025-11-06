/**
 * Get the API base URL from environment variables
 * Falls back to localhost for development or relative path for same-origin
 */
export function getApiUrl(): string {
  // In browser, check for environment variable set at build time
  if (typeof window !== 'undefined') {
    // Check for NEXT_PUBLIC_API_URL (set at build time)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
      return apiUrl
    }
    // Fallback to relative path (same origin) - will work if API is proxied
    return ''
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001'
}

/**
 * Build full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl()
  // Remove leading slash from path if baseUrl is empty (relative path)
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath
}

