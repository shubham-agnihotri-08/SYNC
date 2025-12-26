"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus, Calendar } from "lucide-react"
import { RequestLeaveDialog } from "@/components/request-leave-dialog"

export default function EmployeeLeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

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
      console.error("[v0] Error fetching leave requests:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave & Holidays</h1>
          <p className="text-muted-foreground">Friday, 13-12-2025 - 08:23:44 AM</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Days Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">10/12</div>
                <div className="text-xs text-muted-foreground">10 Days Left out of 12</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sick Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-pink-100 p-2">
                <Calendar className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">7/8</div>
                <div className="text-xs text-muted-foreground">7 Days Left</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Casual Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-teal-100 p-2">
                <Calendar className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">4/5</div>
                <div className="text-xs text-muted-foreground">4 Days Left</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Annual Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">4/6</div>
                <div className="text-xs text-muted-foreground">4 Days Left</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-sm text-muted-foreground">Loading...</div>
          ) : leaveRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Leave Type</th>
                    <th className="pb-3 font-medium">Start Date</th>
                    <th className="pb-3 font-medium">End Date</th>
                    <th className="pb-3 font-medium">Reason</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.id} className="border-b last:border-0">
                      <td className="py-4">
                        <Badge variant="outline">{request.type}</Badge>
                      </td>
                      <td className="py-4">{formatDate(request.startDate)}</td>
                      <td className="py-4">{formatDate(request.endDate)}</td>
                      <td className="py-4 max-w-xs truncate">{request.reason}</td>
                      <td className="py-4">
                        <Badge
                          variant={
                            request.status === "APPROVED"
                              ? "default"
                              : request.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">No leave requests yet</div>
          )}
        </CardContent>
      </Card>

      <RequestLeaveDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchLeaveRequests} />
    </div>
  )
}
