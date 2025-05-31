'use client'

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
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

// Disable SSR for the entire Home component to prevent hydration issues
const HomeContent = () => {
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
  const [showCorsWarning, setShowCorsWarning] = useState(false)

  const validateTokens = useCallback(async () => {
    setError('')
    setShowCorsWarning(false)

    // Validate Slack token
    if (config.slackToken) {
      try {
        const slackApi = new SlackAPI(config.slackToken)
        const isValid = await slackApi.validateToken()
        setValidationStatus((prev) => ({ ...prev, slack: isValid }))
      } catch (error) {
        console.error('Slack validation error:', error)
        setValidationStatus((prev) => ({ ...prev, slack: false }))
        if (error instanceof Error && error.message.includes('CORS')) {
          setShowCorsWarning(true)
        }
      }
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

        {/* CORS Warning for Development */}
        {showCorsWarning && (
          <Alert variant="warning" title="CORS Policy Blocking Slack API">
            <p className="mb-2">
              The Slack API is blocking requests from your browser due to CORS policy.
            </p>
            <p className="font-semibold mb-1">Quick solutions for development:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                Install a CORS browser extension like{' '}
                <a
                  href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  CORS Unblock
                </a>
              </li>
              <li>
                Use a CORS proxy by creating a <code>.env.local</code> file with:
                <pre className="bg-gray-100 p-2 mt-1 rounded text-xs">
                  NEXT_PUBLIC_CORS_PROXY=https://cors-anywhere.herokuapp.com/
                </pre>
              </li>
              <li>For production, implement OAuth flow or use Slack's official SDK</li>
            </ol>
          </Alert>
        )}

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

// Export the component with SSR disabled
export default dynamic(() => Promise.resolve(HomeContent), {
  ssr: false,
})
