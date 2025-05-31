import React, { useState } from 'react'
import { Settings } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { AI_MODELS } from '@/constants'
import type { Config, ValidationStatus } from '@/types'

interface ApiConfigurationProps {
  config: Config
  onConfigChange: (config: Config) => void
  onSave: () => void
  validationStatus: ValidationStatus
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({
  config,
  onConfigChange,
  onSave,
  validationStatus,
}) => {
  const [showTokens, setShowTokens] = useState(false)

  const aiProviderOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic Claude' },
    { value: 'google', label: 'Google Gemini' },
  ]

  const getModelOptions = () => {
    switch (config.aiProvider) {
      case 'openai':
        return [
          { value: AI_MODELS.OPENAI.GPT4, label: 'GPT-4' },
          { value: AI_MODELS.OPENAI.GPT35_TURBO, label: 'GPT-3.5 Turbo' },
        ]
      case 'anthropic':
        return [
          { value: AI_MODELS.ANTHROPIC.CLAUDE_3_OPUS, label: 'Claude 3 Opus' },
          { value: AI_MODELS.ANTHROPIC.CLAUDE_3_SONNET, label: 'Claude 3 Sonnet' },
        ]
      case 'google':
        return [{ value: AI_MODELS.GOOGLE.GEMINI_PRO, label: 'Gemini Pro' }]
      default:
        return []
    }
  }

  const getApiKeyPlaceholder = () => {
    switch (config.aiProvider) {
      case 'openai':
        return 'sk-...'
      case 'anthropic':
        return 'sk-ant-...'
      case 'google':
        return 'AIza...'
      default:
        return 'API Key'
    }
  }

  const getApiKeyHint = () => {
    switch (config.aiProvider) {
      case 'openai':
        return 'API key for OpenAI'
      case 'anthropic':
        return 'API key for Anthropic'
      case 'google':
        return 'API key for Google'
      default:
        return 'API key for your AI provider'
    }
  }

  const getValidationBadge = (status: boolean | null) => {
    if (status === null) return null
    return (
      <span
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {status ? '✓ Valid' : '✗ Invalid'}
      </span>
    )
  }

  return (
    <Card
      header={
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Settings className="mr-2" size={20} />
          API Configuration
        </h2>
      }
    >
      <div className="space-y-4">
        <div className="flex items-end space-x-2">
          <Input
            label="Slack Token"
            type={showTokens ? 'text' : 'password'}
            value={config.slackToken}
            onChange={(e) => onConfigChange({ ...config, slackToken: e.target.value })}
            placeholder="xoxb-... or xoxp-..."
            hint="Bot or user token with required scopes"
            className="flex-1"
          />
          {getValidationBadge(validationStatus.slack)}
        </div>

        <Select
          label="AI Provider"
          value={config.aiProvider}
          onChange={(e) =>
            onConfigChange({
              ...config,
              aiProvider: e.target.value as Config['aiProvider'],
              aiModel: getModelOptions()[0]?.value || '',
            })
          }
          options={aiProviderOptions}
        />

        <div className="flex items-end space-x-2">
          <Input
            label="AI API Key"
            type={showTokens ? 'text' : 'password'}
            value={config.aiApiKey}
            onChange={(e) => onConfigChange({ ...config, aiApiKey: e.target.value })}
            placeholder={getApiKeyPlaceholder()}
            hint={getApiKeyHint()}
            className="flex-1"
          />
          {getValidationBadge(validationStatus.ai)}
        </div>

        {config.aiProvider === 'openai' && (
          <Select
            label="Model"
            value={config.aiModel}
            onChange={(e) => onConfigChange({ ...config, aiModel: e.target.value })}
            options={getModelOptions()}
          />
        )}

        <div className="flex items-center justify-between pt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTokens}
              onChange={(e) => setShowTokens(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Show tokens</span>
          </label>
          <Button onClick={onSave}>Save Configuration</Button>
        </div>
      </div>
    </Card>
  )
}
