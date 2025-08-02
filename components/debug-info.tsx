"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, ExternalLink } from "lucide-react"

export function DebugInfo() {
  const { blobId } = useAuth()

  if (!blobId) return null

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
          Database Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Connected
          </Badge>
          <span className="text-gray-600">JSONBlob ID:</span>
          <code className="bg-white px-2 py-1 rounded text-blue-600">{blobId}</code>
          <a
            href={`https://jsonblob.com/api/jsonBlob/${blobId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Data is persisted to JSONBlob.com. Any email/password combination is accepted for login.
        </p>
      </CardContent>
    </Card>
  )
}
