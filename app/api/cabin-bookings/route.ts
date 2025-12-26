import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { cabinId, date, startTime, endTime, purpose } = body

    if (!cabinId || !date || !startTime || !endTime || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const booking = await prisma.cabinBooking.create({
      data: {
        userId: user.id,
        cabinId,
        date: new Date(date),
        startTime,
        endTime,
        purpose,
        status: "PENDING",
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating cabin booking:", error)
    return NextResponse.json({ error: "Failed to create cabin booking" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.cabinBooking.findMany({
      where: { userId: user.id },
      include: { cabin: true },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("[v0] Error fetching cabin bookings:", error)
    return NextResponse.json({ error: "Failed to fetch cabin bookings" }, { status: 500 })
  }
}
