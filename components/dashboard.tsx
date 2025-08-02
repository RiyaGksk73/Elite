"use client"

import { useAuth } from "@/components/auth-provider"
import { EndUserDashboard } from "@/components/end-user-dashboard"
import { SupportAgentDashboard } from "@/components/support-agent-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"

export function Dashboard() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case "end_user":
      return <EndUserDashboard />
    case "support_agent":
      return <SupportAgentDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      return <EndUserDashboard />
  }
}
