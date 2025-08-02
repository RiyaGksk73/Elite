import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const db = DatabaseService.getInstance()
    const categories = await db.getAllCategories()

    return NextResponse.json({ success: true, categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 },
      )
    }

    const db = DatabaseService.getInstance()
    const category = await db.createCategory({
      name,
      description: description || "",
    })

    return NextResponse.json({ success: true, category })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    )
  }
}
