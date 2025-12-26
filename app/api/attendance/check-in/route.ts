import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
    })

    if (existingAttendance) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: new Date(),
        checkIn: new Date(),
        status: "PRESENT",
        workingMinutes: 0,
        breakTime: 0,
      },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 })
  }
}
