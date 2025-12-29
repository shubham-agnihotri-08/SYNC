import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get today's date at start of day
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get yesterday's date at start of day
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get total employees
    const totalEmployees = await prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    })

    // Get employees on leave today (approved leave requests)
    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
    })

    // Get yesterday's counts for percentage calculation
    const yesterdayTotal = await prisma.user.count({
      where: {
        role: "EMPLOYEE",
        createdAt: {
          lt: today,
        },
      },
    })

    const onLeaveYesterday = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        startDate: {
          lte: yesterday,
        },
        endDate: {
          gte: yesterday,
        },
      },
    })

    // Calculate percentages
    const totalEmployeesPercentage =
      yesterdayTotal > 0 ? (((totalEmployees - yesterdayTotal) / yesterdayTotal) * 100).toFixed(1) : "0.0"

    const onLeavePercentage =
      onLeaveYesterday > 0 ? (((onLeaveToday - onLeaveYesterday) / onLeaveYesterday) * 100).toFixed(1) : "0.0"

    return NextResponse.json({
      totalEmployees,
      onLeave: onLeaveToday,
      totalEmployeesPercentage: `${totalEmployeesPercentage}%`,
      onLeavePercentage: `${onLeavePercentage}%`,
    })
  } catch (error) {
    console.error("[v0] Error fetching attendance stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
