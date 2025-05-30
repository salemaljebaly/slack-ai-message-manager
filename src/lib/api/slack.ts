import { API_ENDPOINTS, ERROR_MESSAGES } from '@/constants'
import type { SlackSearchResponse, SlackDeleteResponse, SearchState } from '@/types'
import { extractChannelAndTimestamp } from '@/lib/utils'

export class SlackAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.SLACK.AUTH_TEST, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      return data.ok === true
    } catch {
      return false
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

    const response = await fetch(`${API_ENDPOINTS.SLACK.SEARCH_MESSAGES}?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || ERROR_MESSAGES.GENERIC)
    }

    return data
  }

  async deleteMessage(permalink: string): Promise<SlackDeleteResponse> {
    const channelAndTs = extractChannelAndTimestamp(permalink)

    if (!channelAndTs) {
      throw new Error('Invalid message permalink')
    }

    const response = await fetch(API_ENDPOINTS.SLACK.CHAT_DELETE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
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
  }
}
