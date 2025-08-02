import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

const databaseService = DatabaseService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const assignedTo = searchParams.get("assignedTo")
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    let tickets = await databaseService.getTickets()

    // Apply filters
    if (userId) {
      tickets = tickets.filter((ticket) => ticket.userId === userId)
    }
    if (assignedTo) {
      tickets = tickets.filter((ticket) => ticket.assignedTo === assignedTo)
    }
    if (status) {
      tickets = tickets.filter((ticket) => ticket.status === status)
    }
    if (category) {
      tickets = tickets.filter((ticket) => ticket.category === category)
    }

    return NextResponse.json({ success: true, tickets })
  } catch (error) {
    console.error("Get tickets error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, category, userId, assignedTo, tags } = body

    if (!title || !description || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const ticket = await databaseService.createTicket({
      title,
      description,
      status: "open",
      priority: priority || "medium",
      category: category || "Technical Support",
      userId,
      assignedTo,
      tags: tags || [],
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 })
  }
}
