import React from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { SearchState } from '@/types'

interface SearchFormProps {
  searchState: SearchState
  onSearchStateChange: (state: SearchState) => void
  onSearch: () => void
  isLoading: boolean
  isDisabled: boolean
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchState,
  onSearchStateChange,
  onSearch,
  isLoading,
  isDisabled,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <Card
      header={
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Search className="mr-2" size={20} />
          Search Messages
        </h2>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            AI Detection Prompt
          </label>
          <textarea
            value={searchState.prompt}
            onChange={(e) => onSearchStateChange({ ...searchState, prompt: e.target.value })}
            placeholder="e.g., Find negative feedback messages, محمد لا يقوم بعمله بشكل جيد..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Channel (optional)"
            value={searchState.channel}
            onChange={(e) => onSearchStateChange({ ...searchState, channel: e.target.value })}
            placeholder="#general"
          />

          <Input
            label="User (optional)"
            value={searchState.user}
            onChange={(e) => onSearchStateChange({ ...searchState, user: e.target.value })}
            placeholder="@username"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <Button
              type="submit"
              disabled={isDisabled}
              loading={isLoading}
              icon={<Search size={16} />}
              className="w-full"
            >
              Search Messages
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
