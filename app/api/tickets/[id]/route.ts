import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

const databaseService = DatabaseService.getInstance()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await databaseService.getTicketById(params.id)

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Get ticket error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch ticket" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updates = body

    const ticket = await databaseService.updateTicket(params.id, updates)

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Update ticket error:", error)
    return NextResponse.json({ success: false, error: "Failed to update ticket" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await databaseService.deleteTicket(params.id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete ticket error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete ticket" }, { status: 500 })
  }
}
