"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, formatTime, calculateWorkingHours } from "@/lib/utils"
import { Clock, Calendar } from "lucide-react"

interface AttendanceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: {
    id: string
    date: string
    checkIn: string | null
    checkOut: string | null
    breakTime: number
    status: string
    user: {
      id: string
      name: string
      employeeId: string
      email: string
      department: string | null
    }
  } | null
}

export function AttendanceDetailDialog({ open, onOpenChange, attendance }: AttendanceDetailDialogProps) {
  if (!attendance) return null

  const workingHours = calculateWorkingHours(attendance.checkIn, attendance.checkOut, attendance.breakTime)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Attendance Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{getInitials(attendance.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-lg">{attendance.user.name}</div>
              <div className="text-sm text-muted-foreground">{attendance.user.employeeId}</div>
              <div className="text-sm text-muted-foreground">{attendance.user.email}</div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Department</span>
              <span className="text-sm text-muted-foreground">{attendance.user.department || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Date</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(attendance.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Check In</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {attendance.checkIn ? formatTime(new Date(attendance.checkIn)) : "--"}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Check Out</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {attendance.checkOut ? formatTime(new Date(attendance.checkOut)) : "--"}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Break Time</span>
              <span className="text-sm text-muted-foreground">
                {Math.floor(attendance.breakTime / 60)}h {attendance.breakTime % 60}m
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Working Hours</span>
              <span className="text-sm text-muted-foreground">{workingHours}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge
                className={
                  attendance.status === "PRESENT"
                    ? "bg-emerald-100 text-emerald-700"
                    : attendance.status === "ABSENT"
                      ? "bg-red-100 text-red-700"
                      : attendance.status === "HALF_DAY"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                }
              >
                {attendance.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
