import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("ticketId")

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket ID is required",
        },
        { status: 400 },
      )
    }

    const db = DatabaseService.getInstance()
    const comments = await db.getCommentsByTicket(ticketId)

    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch comments",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, content, userId, userName, userRole } = body

    if (!ticketId || !content || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const db = DatabaseService.getInstance()
    const comment = await db.createComment({
      ticketId,
      content,
      userId,
      userName: userName || "Anonymous",
      userRole: userRole || "end_user",
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create comment",
      },
      { status: 500 },
    )
  }
}
