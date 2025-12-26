import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, capacity, openTime, closeTime, maxBookingHours, color, description } = body

    if (!name || !capacity || !openTime || !closeTime || !maxBookingHours) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const cabin = await prisma.cabin.create({
      data: {
        name,
        capacity: Number.parseInt(capacity),
        openTime,
        closeTime,
        maxBookingHours: Number.parseInt(maxBookingHours),
        color: color || "#10b981",
        description: description || null,
        isActive: true,
      },
    })

    return NextResponse.json({ cabin }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating cabin:", error)
    return NextResponse.json({ error: "Failed to create cabin" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cabins = await prisma.cabin.findMany({
      include: {
        bookings: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          include: {
            user: true,
          },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ cabins })
  } catch (error) {
    console.error("[v0] Error fetching cabins:", error)
    return NextResponse.json({ error: "Failed to fetch cabins" }, { status: 500 })
  }
}
