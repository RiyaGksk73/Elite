import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const categories = await DatabaseService.getCategories()
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error("❌ Get categories error:", error)
    return NextResponse.json({ error: "Failed to get categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const category = await DatabaseService.createCategory({
      name,
      description: description || "",
      ticket_count: 0,
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("❌ Create category error:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
