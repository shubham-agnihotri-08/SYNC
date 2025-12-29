"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getInitials, formatTime } from "@/lib/utils"
import { Search, Eye, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AttendanceFilterPopover } from "@/components/attendance-filter-popover"
import { AttendanceDetailDialog } from "@/components/attendance-detail-dialog"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"

interface Attendance {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  workingHours: string | null
  user: {
    id: string
    name: string
    employeeId: string
    department: string | null
  }
}

interface LeaveRequest {
  id: string
  type: string
  status: string
  user: {
    id: string
    name: string
    employeeId: string
  }
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [sickLeaves, setSickLeaves] = useState<LeaveRequest[]>([])
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeave: 0,
    totalEmployeesPercentage: "0%",
    onLeavePercentage: "0%",
  })
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [departmentFilter, setDepartmentFilter] = useState("ALL")
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAttendance()
  }, [searchQuery, attendance, statusFilter, departmentFilter])

  const fetchData = async () => {
    try {
      const [attendanceRes, leaveRes, statsRes] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/leave-requests"),
        fetch("/api/attendance/stats"),
      ])

      if (attendanceRes.ok) {
        const data = await attendanceRes.json()
        const attendanceData = data.attendance || []
        setAttendance(attendanceData)

        const uniqueDepts = Array.from(
          new Set(attendanceData.map((a: Attendance) => a.user.department).filter(Boolean)),
        ) as string[]
        setDepartments(uniqueDepts)
      }

      if (leaveRes.ok) {
        const data = await leaveRes.json()
        const leaves = data.leaveRequests || []
        setLeaveRequests(leaves.filter((l: LeaveRequest) => l.status === "PENDING" && l.type !== "SICK"))
        setSickLeaves(leaves.filter((l: LeaveRequest) => l.status === "PENDING" && l.type === "SICK"))
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats({
          totalEmployees: data.totalEmployees,
          onLeave: data.onLeave,
          totalEmployeesPercentage: data.totalEmployeesPercentage,
          onLeavePercentage: data.onLeavePercentage,
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAttendance = () => {
    let filtered = attendance

    if (searchQuery) {
      filtered = filtered.filter(
        (att) =>
          att.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          att.user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((att) => att.status === statusFilter)
    }

    if (departmentFilter !== "ALL") {
      filtered = filtered.filter((att) => att.user.department === departmentFilter)
    }

    setFilteredAttendance(filtered)
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
      console.error("Error updating leave:", error)
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      })
    }
  }

  const handleViewAttendance = async (id: string) => {
    try {
      const response = await fetch(`/api/attendance/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedAttendance(data)
        setShowDetailDialog(true)
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance details",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PRESENT":
        return "bg-emerald-100 text-emerald-700"
      case "HALF DAY":
        return "bg-purple-100 text-purple-700"
      case "ON LEAVE":
        return "bg-orange-100 text-orange-700"
      case "ABSENT":
        return "bg-red-100 text-red-700"
      case "SHORT LEAVE":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Monitor Employee Status and Work History</p>
        </div>
        <Button onClick={() => setShowAddEmployeeDialog(true)}>+ New Employee</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-100 p-2">
                    <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{stats.totalEmployees}</div>
                    <div className="text-sm text-muted-foreground">Total Employees</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats.totalEmployeesPercentage} from yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{stats.onLeave}</div>
                    <div className="text-sm text-muted-foreground">On Leave</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stats.onLeavePercentage} from yesterday</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Leave Request</h3>
              <Button variant="link" size="sm" onClick={() => router.push("/admin/leave-requests")}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {leaveRequests.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.user.name}</div>
                      <div className="text-sm text-muted-foreground">{request.user.employeeId}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleLeaveAction(request.id, "REJECTED")}
                    >
                      ✕ Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => handleLeaveAction(request.id, "APPROVED")}
                    >
                      ✓ Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sick leave</h3>
              <Button variant="link" size="sm" onClick={() => router.push("/admin/sick-leaves")}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {sickLeaves.slice(0, 2).map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.user.name}</div>
                      <div className="text-sm text-muted-foreground">{request.user.employeeId}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleLeaveAction(request.id, "REJECTED")}
                    >
                      ✕ Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                      onClick={() => handleLeaveAction(request.id, "APPROVED")}
                    >
                      ✓ Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Employee..."
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

          <h3 className="mb-4 text-lg font-semibold">Attendance</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Check In</th>
                  <th className="pb-3">Check Out</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Working Hours</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(record.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{record.user.name}</div>
                          <div className="text-sm text-muted-foreground">{record.user.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{record.user.department || "N/A"}</td>
                    <td className="py-4">{record.checkIn ? formatTime(new Date(record.checkIn)) : "--"}</td>
                    <td className="py-4">{record.checkOut ? formatTime(new Date(record.checkOut)) : "--"}</td>
                    <td className="py-4">
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="py-4">{record.workingHours || "0h"}</td>
                    <td className="py-4">
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

      <AttendanceDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        attendance={selectedAttendance}
      />

      <AddEmployeeDialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog} onSuccess={fetchData} />
    </div>
  )
}
