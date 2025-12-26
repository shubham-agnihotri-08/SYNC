import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
    })

    const attendanceHistory = await prisma.attendance.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 10,
    })

    return NextResponse.json({ todayAttendance, attendanceHistory })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
