import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    let tickets = await DatabaseService.getTickets()

    // Apply filters
    if (userId) {
      tickets = tickets.filter((ticket) => ticket.created_by === userId)
    }
    if (status) {
      tickets = tickets.filter((ticket) => ticket.status === status)
    }
    if (category) {
      tickets = tickets.filter((ticket) => ticket.category === category)
    }

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

    if (!subject || !description || !created_by) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ticket = await DatabaseService.createTicket({
      subject,
      description,
      category: category || "General",
      priority: priority || "medium",
      created_by,
      status: "open",
      votes: 0,
      comments_count: 0,
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("❌ Create ticket error:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}
