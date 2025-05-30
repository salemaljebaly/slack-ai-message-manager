export interface Config {
  slackToken: string
  aiApiKey: string
  aiModel: string
  aiProvider: 'openai' | 'anthropic' | 'google'
}

export interface SearchState {
  prompt: string
  channel: string
  dateFrom: string
  dateTo: string
  user: string
}

export interface Message {
  id: string
  text: string
  user: string
  channel: string
  timestamp: string
  relevanceScore: number
  permalink: string
}

export interface ValidationStatus {
  slack: boolean | null
  ai: boolean | null
}

export interface SlackSearchResponse {
  ok: boolean
  messages?: {
    matches: SlackMessage[]
  }
  error?: string
}

export interface SlackMessage {
  iid: string
  text: string
  username: string
  ts: string
  permalink: string
  channel?: {
    name: string
  }
}

export interface SlackDeleteResponse {
  ok: boolean
  error?: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export type AIProvider = 'openai' | 'anthropic' | 'google'

export interface ExportData {
  messages: Message[]
  exportDate: string
  searchCriteria: SearchState
}
