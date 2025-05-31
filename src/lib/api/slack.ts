import { API_ENDPOINTS, ERROR_MESSAGES } from '@/constants'
import type { SlackSearchResponse, SlackDeleteResponse, SearchState } from '@/types'
import { extractChannelAndTimestamp } from '@/lib/utils'

// For development, you can use a CORS proxy
// In production, you should use Slack's official SDK or OAuth flow
const CORS_PROXY = process.env.NEXT_PUBLIC_CORS_PROXY || ''

export class SlackAPI {
  private token: string
  private useProxy: boolean

  constructor(token: string, useProxy: boolean = true) {
    this.token = token
    this.useProxy = useProxy && !!CORS_PROXY
  }

  private getUrl(endpoint: string): string {
    return this.useProxy ? `${CORS_PROXY}${endpoint}` : endpoint
  }

  async validateToken(): Promise<boolean> {
    try {
      // For user tokens (xoxp-), use a different approach
      if (this.token.startsWith('xoxp-')) {
        // User tokens might work differently, let's try a simple test
        const response = await fetch(this.getUrl(API_ENDPOINTS.SLACK.AUTH_TEST), {
          method: 'POST',
          headers: this.getHeaders(),
        })
        
        if (!response.ok) {
          console.warn('Token validation failed:', response.status)
          return false
        }
        
        const data = await response.json()
        return data.ok === true
      }
      
      // For bot tokens (xoxb-), use the standard approach
      const response = await fetch(this.getUrl(API_ENDPOINTS.SLACK.AUTH_TEST), {
        method: 'POST',
        headers: this.getHeaders(),
      })
      
      const data = await response.json()
      return data.ok === true
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  private getHeaders(): HeadersInit {
    // Different header format for CORS proxy vs direct API calls
    if (this.useProxy) {
      return {
        'Content-Type': 'application/json',
        'X-Slack-Token': this.token,
      }
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }
  }

  async searchMessages(searchState: SearchState): Promise<SlackSearchResponse> {
    const searchParams = new URLSearchParams({
      query: searchState.prompt || '*',
      count: '100',
    })

    if (searchState.channel) {
      searchParams.append('in', searchState.channel)
    }
    if (searchState.user) {
      searchParams.append('from', searchState.user)
    }

    try {
      const response = await fetch(
        `${this.getUrl(API_ENDPOINTS.SLACK.SEARCH_MESSAGES)}?${searchParams}`,
        {
          headers: this.getHeaders(),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.GENERIC)
      }

      return data
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  async deleteMessage(permalink: string): Promise<SlackDeleteResponse> {
    const channelAndTs = extractChannelAndTimestamp(permalink)
    
    if (!channelAndTs) {
      throw new Error('Invalid message permalink')
    }

    try {
      const response = await fetch(this.getUrl(API_ENDPOINTS.SLACK.CHAT_DELETE), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          channel: channelAndTs.channel,
          ts: channelAndTs.ts,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || ERROR_MESSAGES.GENERIC)
      }

      return data
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }
}

// Helper function to check if we're in a browser environment
export function canMakeDirectAPICalls(): boolean {
  // Check if we're in a browser environment and not in a restricted context
  if (typeof window === 'undefined') return false
  
  // Check if we're running in a browser extension context (which bypasses CORS)
  if ((window as any).chrome?.runtime?.id) return true
  
  // Check if we're in Electron or similar environment
  if ((window as any).process?.type) return true
  
  // Default to false for regular browser contexts
  return false
}