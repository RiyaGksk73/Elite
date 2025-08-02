import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    const db = DatabaseService.getInstance()

    if (action === "login") {
      // Simple login - any email/password combination works
      let user = await db.getUserByEmail(email)

      if (!user) {
        // Auto-create user if doesn't exist
        const role =
          email === "admin@quickdesk.com" ? "admin" : email.includes("support") ? "support_agent" : "end_user"

        user = await db.createUser({
          email,
          name: name || email.split("@")[0],
          role,
          password, // In real app, this would be hashed
        })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    }

    if (action === "register") {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "User already exists",
          },
          { status: 400 },
        )
      }

      // Determine role based on email
      const role = email === "admin@quickdesk.com" ? "admin" : email.includes("support") ? "support_agent" : "end_user"

      const user = await db.createUser({
        email,
        name: name || email.split("@")[0],
        role,
        password, // In real app, this would be hashed
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    }

    if (action === "logout") {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
