export const API_ENDPOINTS = {
  SLACK: {
    AUTH_TEST: 'https://slack.com/api/auth.test',
    SEARCH_MESSAGES: 'https://slack.com/api/search.messages',
    CHAT_DELETE: 'https://slack.com/api/chat.delete',
  },
  OPENAI: {
    CHAT_COMPLETIONS: 'https://api.openai.com/v1/chat/completions',
  },
  ANTHROPIC: {
    MESSAGES: 'https://api.anthropic.com/v1/messages',
  },
  GOOGLE: {
    GENERATE_CONTENT: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
} as const

export const AI_MODELS = {
  OPENAI: {
    GPT4: 'gpt-4',
    GPT35_TURBO: 'gpt-3.5-turbo',
  },
  ANTHROPIC: {
    CLAUDE_3_OPUS: 'claude-3-opus-20240229',
    CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
  },
  GOOGLE: {
    GEMINI_PRO: 'gemini-pro',
  },
} as const

export const SLACK_SCOPES = [
  'search:read',
  'channels:history',
  'chat:write',
  'channels:read',
] as const

export const RELEVANCE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50,
  LOW: 0,
} as const

export const RATE_LIMITS = {
  SLACK: {
    SEARCH: 20, // per minute
    DELETE: 50, // per minute
  },
  OPENAI: {
    REQUESTS_PER_MIN: 60,
  },
} as const

export const STORAGE_KEYS = {
  CONFIG: 'slackAIConfig',
  SEARCH_HISTORY: 'slackAISearchHistory',
} as const

export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid API token. Please check your configuration.',
  RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again.',
  NO_PERMISSION: 'Insufficient permissions. Please check your token scopes.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GENERIC: 'An unexpected error occurred. Please try again.',
} as const
