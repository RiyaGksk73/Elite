import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

const databaseService = DatabaseService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let users = await databaseService.getUsers()

    if (role) {
      users = users.filter((user) => user.role === role)
    }

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role } = body

    if (!email || !name || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 })
    }

    const user = await databaseService.createUser({
      email,
      name,
      role,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}
