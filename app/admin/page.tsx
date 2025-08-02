"use client"

import { useAuth } from "@/components/auth-provider"
import { AdminPanel } from "@/components/admin-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database } from "lucide-react"

export default function AdminPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Database className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <CardTitle className="text-2xl font-bold text-primary">Loading Admin Panel</CardTitle>
            <CardDescription>Verifying admin permissions...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4">Please wait while we verify your access</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-700">Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              You need to be logged in as an administrator to access this page.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Go to Login
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user has admin role
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-700">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Current user details:</p>
              <div className="space-y-1 text-xs">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.role}</span>
                </p>
                <p>
                  <strong>Status:</strong> {user.status}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
              <p className="font-medium mb-1">💡 To access admin panel:</p>
              <p>• Use email containing "admin" (e.g., admin@test.com)</p>
              <p>• Or use: Elitcoders@123 / Elitcoders@123</p>
            </div>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Back to Login
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AdminPanel />
}
