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

    // Store pause start time in metadata (you might want to add a field for this)
    return NextResponse.json({ message: "Break started", pauseTime: new Date() })
  } catch (error) {
    console.error("Pause error:", error)
    return NextResponse.json({ error: "Failed to pause" }, { status: 500 })
  }
}
