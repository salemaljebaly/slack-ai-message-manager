import { API_ENDPOINTS, AI_MODELS } from '@/constants'
import type { Config, OpenAIResponse } from '@/types'

export interface AIScoreResult {
  score: number
  error?: string
}

export class AIAPI {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  async scoreMessage(message: string, prompt: string): Promise<AIScoreResult> {
    try {
      switch (this.config.aiProvider) {
        case 'openai':
          return await this.scoreWithOpenAI(message, prompt)
        case 'anthropic':
          return await this.scoreWithAnthropic(message, prompt)
        case 'google':
          return await this.scoreWithGoogle(message, prompt)
        default:
          throw new Error('Invalid AI provider')
      }
    } catch (error) {
      console.error('AI scoring error:', error)
      return { score: 0, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private async scoreWithOpenAI(message: string, prompt: string): Promise<AIScoreResult> {
    const response = await fetch(API_ENDPOINTS.OPENAI.CHAT_COMPLETIONS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.aiModel,
        messages: [
          {
            role: 'system',
            content:
              'Score the relevance of the following message to the given prompt on a scale of 0-100. Respond with only a number.',
          },
          {
            role: 'user',
            content: `Prompt: ${prompt}\n\nMessage: ${message}`,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data: OpenAIResponse = await response.json()
    const score = parseInt(data.choices[0].message.content) || 0

    return { score: Math.min(100, Math.max(0, score)) }
  }

  private async scoreWithAnthropic(message: string, prompt: string): Promise<AIScoreResult> {
    const response = await fetch(API_ENDPOINTS.ANTHROPIC.MESSAGES, {
      method: 'POST',
      headers: {
        'x-api-key': this.config.aiApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODELS.ANTHROPIC.CLAUDE_3_SONNET,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: `Score the relevance of the following message to the given prompt on a scale of 0-100. Respond with only a number.\n\nPrompt: ${prompt}\n\nMessage: ${message}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    const score = parseInt(data.content[0].text) || 0

    return { score: Math.min(100, Math.max(0, score)) }
  }

  private async scoreWithGoogle(message: string, prompt: string): Promise<AIScoreResult> {
    const response = await fetch(
      `${API_ENDPOINTS.GOOGLE.GENERATE_CONTENT}/${AI_MODELS.GOOGLE.GEMINI_PRO}:generateContent?key=${this.config.aiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Score the relevance of the following message to the given prompt on a scale of 0-100. Respond with only a number.\n\nPrompt: ${prompt}\n\nMessage: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    const score = parseInt(text) || 0

    return { score: Math.min(100, Math.max(0, score)) }
  }
}
