"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { DebugInfo } from "@/components/debug-info"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("🔐 Login attempt:", { email, password: "***" })

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Welcome!",
        description: "You have been successfully logged in.",
      })
    } else {
      toast({
        title: "Login failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    const success = await register(email, password, name)

    if (success) {
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      })
    } else {
      toast({
        title: "Registration failed",
        description: "User already exists or please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleQuickLogin = async (email: string, password: string) => {
    setIsLoading(true)
    console.log("⚡ Quick login attempt:", { email, password: "***" })

    const success = await login(email, password)

    if (success) {
      toast({
        title: "Welcome!",
        description: `Logged in as ${email}`,
      })
    } else {
      toast({
        title: "Login failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div>
      <DebugInfo />

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter any email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter any password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">🔓 Flexible Authentication:</p>
            <div className="space-y-1 text-xs">
              <p>
                • <strong>Any email/password</strong> combination is accepted
              </p>
              <p>• New users are created automatically on first login</p>
              <p>• Email containing "admin" → Admin role</p>
              <p>• Email containing "agent" → Support Agent role</p>
              <p>• Other emails → End User role</p>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded text-xs space-y-2">
              <p className="font-medium text-blue-800">⚡ Quick Login Options:</p>

              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 bg-transparent"
                  onClick={() => handleQuickLogin("Elitcoders@123", "Elitcoders@123")}
                  disabled={isLoading}
                >
                  🔑 Admin: Elitcoders@123
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 bg-transparent"
                  onClick={() => handleQuickLogin("admin@test.com", "admin123")}
                  disabled={isLoading}
                >
                  👑 Admin: admin@test.com
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 bg-transparent"
                  onClick={() => handleQuickLogin("sarah.johnson@quickdesk.com", "agent123")}
                  disabled={isLoading}
                >
                  🛠️ Agent: sarah.johnson@quickdesk.com
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8 bg-transparent"
                  onClick={() => handleQuickLogin("user@test.com", "user123")}
                  disabled={isLoading}
                >
                  👤 User: user@test.com
                </Button>
              </div>
            </div>

            <p className="mt-2 text-xs text-blue-600">
              Admin panel: <span className="font-mono">/admin</span>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" type="text" placeholder="Enter your full name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Create a password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
