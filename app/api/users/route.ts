import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const users = await DatabaseService.getUsers()
    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("❌ Get users error:", error)
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const user = await DatabaseService.createUser({
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: "default", // In a real app, this would be properly handled
      role: role || "end_user",
      created_at: new Date().toISOString(),
      status: "active",
      profile: {
        phone: "",
        department: "",
        avatar: `/placeholder.svg?height=40&width=40&query=${name}`,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("❌ Create user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
