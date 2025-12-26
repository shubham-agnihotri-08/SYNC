"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils"
import { Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EmployeeDashboardPage() {
  const [attendanceState, setAttendanceState] = useState<"not-checked-in" | "checked-in" | "on-break" | "checked-out">(
    "not-checked-in",
  )
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [pauseTime, setPauseTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await fetch("/api/attendance/today")
      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data.todayAttendance)
        setAttendanceHistory(data.attendanceHistory || [])

        // Determine state
        if (!data.todayAttendance) {
          setAttendanceState("not-checked-in")
        } else if (data.todayAttendance.checkOut) {
          setAttendanceState("checked-out")
        } else {
          setAttendanceState("checked-in")
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching attendance:", error)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/attendance/check-in", { method: "POST" })
      if (response.ok) {
        toast({ title: "Success", description: "Checked in successfully" })
        fetchAttendance()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to check in", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/attendance/check-out", { method: "POST" })
      if (response.ok) {
        toast({ title: "Success", description: "Checked out successfully" })
        fetchAttendance()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to check out", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePause = async () => {
    const now = new Date()
    setPauseTime(now)
    setAttendanceState("on-break")
    toast({ title: "Break Started", description: "Enjoy your break!" })
  }

  const handleResume = async () => {
    if (!pauseTime) return

    setLoading(true)
    try {
      const response = await fetch("/api/attendance/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseTime }),
      })
      if (response.ok) {
        toast({ title: "Success", description: "Break ended successfully" })
        setPauseTime(null)
        setAttendanceState("checked-in")
        fetchAttendance()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to resume", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const workingHours = todayAttendance
    ? Math.floor(todayAttendance.workingMinutes / 60) +
      ":" +
      (todayAttendance.workingMinutes % 60).toString().padStart(2, "0")
    : "--"

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            - {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          {attendanceState === "not-checked-in" && (
            <Button onClick={handleCheckIn} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
              Check In
            </Button>
          )}
          {attendanceState === "checked-in" && (
            <>
              <Button onClick={handlePause} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600">
                Pause
              </Button>
              <Button onClick={handleCheckOut} disabled={loading} variant="destructive">
                Check Out
              </Button>
            </>
          )}
          {attendanceState === "on-break" && (
            <Button onClick={handleResume} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600">
              Resume
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Check In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">
                {todayAttendance?.checkIn ? formatTime(todayAttendance.checkIn) : "--"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 p-2">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{workingHours}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Break Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-teal-100 p-2">
                <Clock className="h-4 w-4 text-teal-600" />
              </div>
              <div className="text-2xl font-bold">
                {todayAttendance ? `0:${todayAttendance.breakTime.toString().padStart(2, "0")}` : "--"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Check Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-red-100 p-2">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold">
                {todayAttendance?.checkOut ? formatTime(todayAttendance.checkOut) : "--"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance History</CardTitle>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Check In</th>
                  <th className="pb-3 font-medium">Check Out</th>
                  <th className="pb-3 font-medium">Break Time</th>
                  <th className="pb-3 font-medium">Working Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="py-4">{formatDate(record.date)}</td>
                    <td className="py-4">{record.checkIn ? formatTime(record.checkIn) : "--"}</td>
                    <td className="py-4">{record.checkOut ? formatTime(record.checkOut) : "--"}</td>
                    <td className="py-4">{record.breakTime}m</td>
                    <td className="py-4">
                      {Math.floor(record.workingMinutes / 60)}h {record.workingMinutes % 60}m
                    </td>
                    <td className="py-4">
                      <Badge
                        variant={
                          record.status === "PRESENT"
                            ? "default"
                            : record.status === "ABSENT"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
