import React from 'react'
import { CheckSquare, Square } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { RELEVANCE_THRESHOLDS } from '@/constants'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
  selectedMessages: Set<string>
  onToggleMessage: (id: string) => void
  onSelectAll: () => void
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessages,
  onToggleMessage,
  onSelectAll,
}) => {
  const getRelevanceBadge = (score: number) => {
    let colorClass = 'bg-green-100 text-green-800'

    if (score >= RELEVANCE_THRESHOLDS.HIGH) {
      colorClass = 'bg-red-100 text-red-800'
    } else if (score >= RELEVANCE_THRESHOLDS.MEDIUM) {
      colorClass = 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={cn('px-2 py-1 text-xs rounded-full', colorClass)}>{score}% relevant</span>
    )
  }

  return (
    <Card
      header={
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Results ({messages.length} messages)
          </h2>
          <button onClick={onSelectAll} className="text-sm text-primary-600 hover:text-primary-700">
            {selectedMessages.size === messages.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      }
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'p-4 border rounded-lg cursor-pointer transition-all duration-200',
              selectedMessages.has(message.id)
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => onToggleMessage(message.id)}
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {selectedMessages.has(message.id) ? (
                  <CheckSquare className="text-primary-600" size={20} />
                ) : (
                  <Square className="text-gray-400" size={20} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{message.user}</span>
                    {' in '}
                    <span className="font-medium">{message.channel}</span>
                    {' • '}
                    <span>{message.timestamp}</span>
                  </div>
                  {getRelevanceBadge(message.relevanceScore)}
                </div>
                <p className="text-gray-800 break-words">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
