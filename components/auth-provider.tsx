"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { DatabaseService, type User } from "@/lib/database"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  blobId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [blobId, setBlobId] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...")

        // Initialize the database service
        await DatabaseService.initialize()
        const currentBlobId = DatabaseService.getBlobId()
        setBlobId(currentBlobId)
        console.log("📊 Database initialized with blob ID:", currentBlobId)

        // Check for existing session in localStorage
        const savedUserId = localStorage.getItem("quickdesk_user_id")
        console.log("💾 Saved user ID from localStorage:", savedUserId)

        if (savedUserId) {
          console.log("🔍 Looking up user by ID:", savedUserId)
          const savedUser = await DatabaseService.getUserById(savedUserId)

          if (savedUser) {
            console.log("✅ User found:", {
              id: savedUser.id,
              name: savedUser.name,
              email: savedUser.email,
              role: savedUser.role,
            })
            setUser(savedUser)
          } else {
            console.log("❌ User not found, clearing localStorage")
            localStorage.removeItem("quickdesk_user_id")
          }
        } else {
          console.log("ℹ️ No saved user ID found")
        }
      } catch (error) {
        console.error("❌ Failed to initialize auth:", error)
      } finally {
        console.log("✅ Auth initialization complete")
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 Attempting login for:", email)

      // Flexible authentication - accepts any email/password
      const authenticatedUser = await DatabaseService.authenticateUser(email, password)

      if (authenticatedUser) {
        console.log("✅ Login successful:", {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          role: authenticatedUser.role,
        })

        setUser(authenticatedUser)
        localStorage.setItem("quickdesk_user_id", authenticatedUser.id)
        return true
      }

      console.log("❌ Login failed: No user returned")
      return false
    } catch (error) {
      console.error("❌ Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log("📝 Attempting registration for:", email)

      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(email)
      if (existingUser) {
        console.log("❌ Registration failed: User already exists")
        return false
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        role: email.includes("admin") ? "admin" : email.includes("agent") ? "support_agent" : "end_user",
        status: "active",
        created_at: new Date().toISOString(),
        profile: {
          phone: "",
          department: "",
          avatar: `/placeholder.svg?height=40&width=40&query=${name}`,
        },
      }

      console.log("👤 Creating new user with role:", newUser.role)
      const createdUser = await DatabaseService.createUser(newUser)

      setUser(createdUser)
      localStorage.setItem("quickdesk_user_id", createdUser.id)

      console.log("✅ Registration successful")
      return true
    } catch (error) {
      console.error("❌ Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    console.log("🚪 Logging out user")
    setUser(null)
    localStorage.removeItem("quickdesk_user_id")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, blobId }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
