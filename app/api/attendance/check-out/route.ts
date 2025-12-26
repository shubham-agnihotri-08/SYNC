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

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
    })

    if (!attendance) {
      return NextResponse.json({ error: "Not checked in today" }, { status: 400 })
    }

    if (attendance.checkOut) {
      return NextResponse.json({ error: "Already checked out" }, { status: 400 })
    }

    const checkOutTime = new Date()
    const workingMinutes =
      Math.floor((checkOutTime.getTime() - attendance.checkIn.getTime()) / 60000) - attendance.breakTime

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workingMinutes,
      },
    })

    return NextResponse.json({ attendance: updatedAttendance })
  } catch (error) {
    console.error("Check-out error:", error)
    return NextResponse.json({ error: "Failed to check out" }, { status: 500 })
  }
}
