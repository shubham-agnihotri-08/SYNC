"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatTime, getInitials } from "@/lib/utils"
import { Clock, Search, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AttendanceDetailDialog } from "@/components/attendance-detail-dialog"
import { AttendanceFilterPopover } from "@/components/attendance-filter-popover"
import Link from "next/link"

interface Cabin {
  id: string
  name: string
  capacity: number
  color: string
}

interface Attendance {
  id: string
  checkIn: string | null
  status: string
  user: {
    id: string
    name: string
    employeeId: string
    department: string | null
  }
}

interface LeaveRequest {
  id: string
  user: {
    id: string
    name: string
    employeeId: string
  }
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: string
}

export default function AdminDashboardPage() {
  const [cabins, setCabins] = useState<Cabin[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [sickLeaves, setSickLeaves] = useState<LeaveRequest[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [departmentFilter, setDepartmentFilter] = useState("ALL")
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cabinsRes, attendanceRes, leaveRes, eventsRes] = await Promise.all([
        fetch("/api/cabins"),
        fetch("/api/attendance"),
        fetch("/api/leave-requests"),
        fetch("/api/events"),
      ])

      if (cabinsRes.ok) {
        const data = await cabinsRes.json()
        setCabins(data.cabins?.slice(0, 3) || [])
      }

      if (attendanceRes.ok) {
        const data = await attendanceRes.json()
        setAttendance(data.attendance?.slice(0, 5) || [])
      }

      if (leaveRes.ok) {
        const data = await leaveRes.json()
        const leaves = data.leaveRequests || []
        setLeaveRequests(leaves.filter((l: any) => l.status === "PENDING" && l.type !== "SICK").slice(0, 1))
        setSickLeaves(leaves.filter((l: any) => l.status === "PENDING" && l.type === "SICK").slice(0, 1))
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setUpcomingEvents(data.events?.slice(0, 3) || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const handleLeaveAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Leave request ${status.toLowerCase()}`,
        })
        fetchData()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredAttendance = attendance.filter((att) => {
    const matchesSearch = att.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || att.status === statusFilter
    const matchesDepartment = departmentFilter === "ALL" || att.user.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const departments = Array.from(new Set(attendance.map((att) => att.user.department).filter(Boolean))) as string[]

  const handleViewAttendance = async (id: string) => {
    try {
      const response = await fetch(`/api/attendance/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedAttendance(data.attendance)
        setDetailDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          You have 3 upcoming meetings today. The Mountain View cabin is available for your next meeting.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cabins.map((cabin) => (
          <Card key={cabin.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: cabin.color }} />
                    <h3 className="font-semibold">{cabin.name}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">Capacity : {cabin.capacity}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  <span>09:00am - 6:30pm</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-cyan-500" />
                  <span>Max. Booking Hours: 1 Hour</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-4">
              <h3 className="text-lg font-semibold">Attendance</h3>
              <div className="relative ml-auto flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search booking, cabin, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <AttendanceFilterPopover
                statusFilter={statusFilter}
                departmentFilter={departmentFilter}
                onStatusChange={setStatusFilter}
                onDepartmentChange={setDepartmentFilter}
                departments={departments}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3">Employee Name</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Check In</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{getInitials(record.user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.user.name}</div>
                            <div className="text-xs text-muted-foreground">{record.user.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm">{record.user.department || "N/A"}</td>
                      <td className="py-3 text-sm">{record.checkIn ? formatTime(new Date(record.checkIn)) : "--"}</td>
                      <td className="py-3">
                        <Badge
                          className={
                            record.status === "PRESENT"
                              ? "bg-emerald-100 text-emerald-700"
                              : record.status === "ABSENT"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                          }
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleViewAttendance(record.id)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Leave Request</h3>
                <Link href="/admin/leave-requests">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View All
                  </Button>
                </Link>
              </div>
              {leaveRequests.map((request) => (
                <div key={request.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{request.user.name}</div>
                      <div className="text-sm text-muted-foreground">{request.user.employeeId}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleLeaveAction(request.id, "REJECTED")}
                    >
                      ✕ Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleLeaveAction(request.id, "APPROVED")}
                    >
                      ✓ Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Sick leave</h3>
                <Link href="/admin/sick-leaves">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View All
                  </Button>
                </Link>
              </div>
              {sickLeaves.map((request) => (
                <div key={request.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{request.user.name}</div>
                      <div className="text-sm text-muted-foreground">{request.user.employeeId}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleLeaveAction(request.id, "REJECTED")}
                    >
                      ✕ Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handleLeaveAction(request.id, "APPROVED")}
                    >
                      ✓ Approve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Upcoming Events</h3>
                <Link href="/admin/upcoming-events">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{new Date(event.date).getDate()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">{event.time || "6:00pm to 7:00pm"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AttendanceDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        attendance={selectedAttendance}
      />
    </div>
  )
}
