import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'

export const SlackWarning: React.FC = () => {
  return (
    <Alert variant="warning" title="⚠️ SLACK API LIMITATIONS:">
      <ul className="list-disc list-inside space-y-1">
        <li>Rate Limits: 1-100 requests per minute (varies by method)</li>
        <li>Search Limit: Maximum 100 messages per search request</li>
        <li>Token Permissions: Ensure your token has required scopes</li>
        <li>Enterprise Grid: May have additional restrictions</li>
        <li>Message Retention: Respects workspace retention policies</li>
        <li>Delete Permissions: Can only delete your own messages</li>
      </ul>
    </Alert>
  )
}
