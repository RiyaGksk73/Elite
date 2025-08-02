import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const tickets = await DatabaseService.getTicketsByUser(userId)
      return NextResponse.json({ success: true, tickets })
    }

    const tickets = await DatabaseService.getTickets()
    return NextResponse.json({ success: true, tickets })
  } catch (error) {
    console.error("❌ Get tickets error:", error)
    return NextResponse.json({ error: "Failed to get tickets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, description, category, priority, created_by } = body

    if (!subject || !description || !category || !priority || !created_by) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ticket = await DatabaseService.createTicket({
      subject,
      description,
      status: "open",
      category,
      priority,
      created_by,
      votes: 0,
      comments_count: 0,
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("❌ Create ticket error:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}
