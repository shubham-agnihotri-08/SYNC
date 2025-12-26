"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getInitials } from "@/lib/utils"
import { Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface LeaveRequest {
  id: string
  type: string
  startDate: string
  endDate: string
  reason: string
  status: string
  user: {
    id: string
    name: string
    employeeId: string
    department: string | null
  }
}

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch("/api/leave-requests")
      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data.leaveRequests || [])
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error)
    }
  }

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
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
        fetchLeaveRequests()
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to update leave request",
        variant: "destructive",
      })
    }
  }

  const filteredRequests = leaveRequests.filter((req) =>
    req.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground">View and manage all leave requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>All Leave Requests</CardTitle>
            <div className="relative ml-auto flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{request.user.name}</div>
                    <div className="text-sm text-muted-foreground">{request.user.employeeId}</div>
                    <div className="text-sm text-muted-foreground">{request.user.department || "N/A"}</div>
                  </div>
                </div>

                <div className="flex-1 px-6">
                  <div className="text-sm">
                    <div className="font-medium">Type: {request.type}</div>
                    <div className="text-muted-foreground">
                      {new Date(request.startDate).toLocaleDateString()} -{" "}
                      {new Date(request.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground">Reason: {request.reason}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      request.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : request.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {request.status}
                  </Badge>
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleAction(request.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAction(request.id, "APPROVED")}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No leave requests found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
