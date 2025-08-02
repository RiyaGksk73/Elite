import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

const databaseService = DatabaseService.getInstance()

export async function GET() {
  try {
    const categories = await databaseService.getCategories()
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const category = await databaseService.createCategory({
      name,
      description,
      color: color || "#3b82f6",
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}
