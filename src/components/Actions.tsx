import React from 'react'
import { Download, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ActionsProps {
  selectedCount: number
  totalCount: number
  onExportCSV: () => void
  onExportJSON: () => void
  onDelete: () => void
  isLoading: boolean
}

export const Actions: React.FC<ActionsProps> = ({
  selectedCount,
  totalCount,
  onExportCSV,
  onExportJSON,
  onDelete,
  isLoading,
}) => {
  return (
    <Card header={<h2 className="text-lg font-semibold text-gray-800">Actions</h2>}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={<Download size={16} />} onClick={onExportCSV}>
            Export CSV
          </Button>

          <Button variant="secondary" icon={<Download size={16} />} onClick={onExportJSON}>
            Export JSON
          </Button>

          <Button
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={onDelete}
            disabled={selectedCount === 0}
            loading={isLoading}
          >
            Delete Selected ({selectedCount})
          </Button>
        </div>

        <p className="text-sm text-gray-600">
          Status: {selectedCount} of {totalCount} messages selected
        </p>
      </div>
    </Card>
  )
}
