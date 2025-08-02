import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    if (!action || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (action === "login") {
      console.log("🔐 Login attempt for:", email)

      const user = await DatabaseService.authenticateUser(email, password)

      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          profile: user.profile,
        },
      })
    }

    if (action === "register") {
      console.log("📝 Registration attempt for:", email)

      // Check if user already exists
      const existingUser = await DatabaseService.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }

      // Create new user
      const newUser = await DatabaseService.createUser({
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password,
        role: email.includes("admin") ? "admin" : email.includes("agent") ? "support_agent" : "end_user",
        created_at: new Date().toISOString(),
        status: "active",
        profile: {
          phone: "",
          department: "",
          avatar: `/placeholder.svg?height=40&width=40&query=${name}`,
        },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          profile: newUser.profile,
        },
      })
    }

    if (action === "logout") {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("❌ Auth API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // For simplified auth, we'll just return success
    // In a real app, you might check session storage or other mechanisms
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Auth verification error:", error)
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
  }
}
