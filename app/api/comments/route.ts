import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

const databaseService = DatabaseService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("ticketId")

    if (ticketId) {
      const comments = await databaseService.getCommentsByTicket(ticketId)
      return NextResponse.json({ success: true, comments })
    }

    const comments = await databaseService.getComments()
    return NextResponse.json({ success: true, comments })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticketId, userId, content, isInternal } = body

    if (!ticketId || !userId || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const comment = await databaseService.createComment({
      ticketId,
      userId,
      content,
      isInternal: isInternal || false,
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 })
  }
}
