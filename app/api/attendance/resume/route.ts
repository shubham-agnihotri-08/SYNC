import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { pauseTime } = await request.json()

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

    const resumeTime = new Date()
    const breakMinutes = Math.floor((resumeTime.getTime() - new Date(pauseTime).getTime()) / 60000)

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        breakTime: attendance.breakTime + breakMinutes,
      },
    })

    return NextResponse.json({ attendance: updatedAttendance })
  } catch (error) {
    console.error("Resume error:", error)
    return NextResponse.json({ error: "Failed to resume" }, { status: 500 })
  }
}
