import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const userRole = searchParams.get("userRole")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const db = DatabaseService.getInstance()
    let tickets = await db.getAllTickets()

    // Filter based on user role
    if (userRole === "end_user" && userId) {
      tickets = tickets.filter((ticket) => ticket.userId === userId)
    }

    // Apply filters
    if (status && status !== "all") {
      tickets = tickets.filter((ticket) => ticket.status === status)
    }

    if (category && category !== "all") {
      tickets = tickets.filter((ticket) => ticket.category === category)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      tickets = tickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) || ticket.description.toLowerCase().includes(searchLower),
      )
    }

    // Sort by creation date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ success: true, tickets })
  } catch (error) {
    console.error("Get tickets error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tickets",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, priority, userId, userEmail, userName } = body

    if (!title || !description || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const db = DatabaseService.getInstance()
    const ticket = await db.createTicket({
      title,
      description,
      category: category || "general",
      priority: priority || "medium",
      status: "open",
      userId,
      userEmail,
      userName,
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Create ticket error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create ticket",
      },
      { status: 500 },
    )
  }
}
