'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ApiConfiguration } from '@/components/ApiConfiguration'
import { SearchForm } from '@/components/SearchForm'
import { MessageList } from '@/components/MessageList'
import { Actions } from '@/components/Actions'
import { SlackWarning } from '@/components/SlackWarning'
import { Alert } from '@/components/ui/Alert'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { SlackAPI } from '@/lib/api/slack'
import { AIAPI } from '@/lib/api/ai'
import { downloadFile, escapeCSV, formatDate } from '@/lib/utils'
import { STORAGE_KEYS } from '@/constants'
import type { Config, SearchState, Message, ValidationStatus, SlackMessage } from '@/types'

export default function Home() {
  const [config, setConfig] = useLocalStorage<Config>(STORAGE_KEYS.CONFIG, {
    slackToken: '',
    aiApiKey: '',
    aiModel: 'gpt-4',
    aiProvider: 'openai',
  })

  const [searchState, setSearchState] = useState<SearchState>({
    prompt: '',
    channel: '',
    dateFrom: '',
    dateTo: '',
    user: '',
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    slack: null,
    ai: null,
  })

  const validateTokens = useCallback(async () => {
    setError('')

    // Validate Slack token
    if (config.slackToken) {
      const slackApi = new SlackAPI(config.slackToken)
      const isValid = await slackApi.validateToken()
      setValidationStatus((prev) => ({ ...prev, slack: isValid }))
    }

    // Validate AI API key (simplified check)
    setValidationStatus((prev) => ({
      ...prev,
      ai: config.aiApiKey.length > 20,
    }))
  }, [config.slackToken, config.aiApiKey])

  const saveConfig = useCallback(() => {
    validateTokens()
  }, [validateTokens])

  const searchMessages = useCallback(async () => {
    if (!config.slackToken || !config.aiApiKey) {
      setError('Please configure both Slack and AI API keys')
      return
    }

    setLoading(true)
    setError('')
    setMessages([])
    setSelectedMessages(new Set())

    try {
      const slackApi = new SlackAPI(config.slackToken)
      const aiApi = new AIAPI(config)

      // Search Slack messages
      const searchResponse = await slackApi.searchMessages(searchState)

      if (!searchResponse.messages?.matches || searchResponse.messages.matches.length === 0) {
        setMessages([])
        setError('No messages found')
        return
      }

      // Score messages with AI
      const scoredMessages: Message[] = []

      for (const slackMessage of searchResponse.messages.matches) {
        const scoreResult = await aiApi.scoreMessage(slackMessage.text, searchState.prompt)

        scoredMessages.push({
          id: slackMessage.iid,
          text: slackMessage.text,
          user: slackMessage.username,
          channel: slackMessage.channel?.name || 'Direct Message',
          timestamp: formatDate(new Date(parseFloat(slackMessage.ts) * 1000)),
          relevanceScore: scoreResult.score,
          permalink: slackMessage.permalink,
        })
      }

      // Sort by relevance score
      scoredMessages.sort((a, b) => b.relevanceScore - a.relevanceScore)
      setMessages(scoredMessages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [config, searchState])

  const deleteSelectedMessages = useCallback(async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedMessages.size} messages? This cannot be undone.`
      )
    ) {
      return
    }

    setLoading(true)
    setError('')
    let deletedCount = 0
    const slackApi = new SlackAPI(config.slackToken)

    for (const msgId of selectedMessages) {
      const message = messages.find((m) => m.id === msgId)
      if (message) {
        try {
          await slackApi.deleteMessage(message.permalink)
          deletedCount++
        } catch (err) {
          console.error('Delete error:', err)
        }
      }
    }

    setMessages(messages.filter((m) => !selectedMessages.has(m.id)))
    setSelectedMessages(new Set())
    setLoading(false)
    alert(`Successfully deleted ${deletedCount} messages`)
  }, [config.slackToken, messages, selectedMessages])

  const exportToCSV = useCallback(() => {
    const messagesToExport = messages.filter(
      (m) => selectedMessages.size === 0 || selectedMessages.has(m.id)
    )

    const headers = ['Text', 'User', 'Channel', 'Timestamp', 'Relevance Score']
    const rows = messagesToExport.map((m) => [
      escapeCSV(m.text),
      escapeCSV(m.user),
      escapeCSV(m.channel),
      escapeCSV(m.timestamp),
      m.relevanceScore.toString(),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadFile(csv, 'slack-messages.csv', 'text/csv')
  }, [messages, selectedMessages])

  const exportToJSON = useCallback(() => {
    const messagesToExport = messages.filter(
      (m) => selectedMessages.size === 0 || selectedMessages.has(m.id)
    )

    const exportData = {
      messages: messagesToExport,
      exportDate: new Date().toISOString(),
      searchCriteria: searchState,
    }

    downloadFile(JSON.stringify(exportData, null, 2), 'slack-messages.json', 'application/json')
  }, [messages, selectedMessages, searchState])

  const toggleMessageSelection = useCallback((id: string) => {
    setSelectedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set())
    } else {
      setSelectedMessages(new Set(messages.map((m) => m.id)))
    }
  }, [messages, selectedMessages])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Slack AI Message Manager</h1>
          <p className="text-gray-600">Detect, analyze, and manage Slack messages using AI</p>
        </div>

        {/* API Configuration */}
        <ApiConfiguration
          config={config}
          onConfigChange={setConfig}
          onSave={saveConfig}
          validationStatus={validationStatus}
        />

        {/* Slack API Limitations Warning */}
        <SlackWarning />

        {/* Search Messages */}
        <SearchForm
          searchState={searchState}
          onSearchStateChange={setSearchState}
          onSearch={searchMessages}
          isLoading={loading}
          isDisabled={!config.slackToken || !config.aiApiKey}
        />

        {/* Error Display */}
        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {messages.length > 0 && (
          <>
            <MessageList
              messages={messages}
              selectedMessages={selectedMessages}
              onToggleMessage={toggleMessageSelection}
              onSelectAll={selectAll}
            />

            <Actions
              selectedCount={selectedMessages.size}
              totalCount={messages.length}
              onExportCSV={exportToCSV}
              onExportJSON={exportToJSON}
              onDelete={deleteSelectedMessages}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  )
}
