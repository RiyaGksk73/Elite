import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("ticketId")

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    const comments = await DatabaseService.getCommentsByTicket(ticketId)
    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error("❌ Get comments error:", error)
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_id, content, author_id, author_name, author_role } = body

    if (!ticket_id || !content || !author_id || !author_name || !author_role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const comment = await DatabaseService.addComment({
      ticket_id,
      content,
      author_id,
      author_name,
      author_role,
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("❌ Create comment error:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
