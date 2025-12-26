import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const { cabinId, date, startTime, endTime, purpose, status } = body

    // Check if booking belongs to user (employees can only edit their own bookings)
    const existingBooking = await prisma.cabinBooking.findUnique({
      where: { id },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (existingBooking.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update booking
    const booking = await prisma.cabinBooking.update({
      where: { id },
      data: {
        ...(cabinId && { cabinId }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(purpose && { purpose }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
      include: { cabin: true },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("[v0] Error updating cabin booking:", error)
    return NextResponse.json({ error: "Failed to update cabin booking" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Check if booking belongs to user
    const existingBooking = await prisma.cabinBooking.findUnique({
      where: { id },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (existingBooking.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Soft delete by setting status to CANCELLED
    const booking = await prisma.cabinBooking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ booking, message: "Booking cancelled successfully" })
  } catch (error) {
    console.error("[v0] Error cancelling cabin booking:", error)
    return NextResponse.json({ error: "Failed to cancel cabin booking" }, { status: 500 })
  }
}
