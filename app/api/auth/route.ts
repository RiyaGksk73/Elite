import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

const databaseService = DatabaseService.getInstance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    if (action === "login") {
      // Check if user exists
      let user = await databaseService.getUserByEmail(email)

      if (!user) {
        // Create new user if doesn't exist
        const role = email === "Elitcoders@123" ? "admin" : email.includes("support") ? "support_agent" : "end_user"

        user = await databaseService.createUser({
          email,
          name: name || email.split("@")[0],
          role,
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
      const existingUser = await databaseService.getUserByEmail(email)
      if (existingUser) {
        return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 })
      }

      // Determine role based on email
      const role = email === "Elitcoders@123" ? "admin" : email.includes("support") ? "support_agent" : "end_user"

      const user = await databaseService.createUser({
        email,
        name: name || email.split("@")[0],
        role,
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

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
