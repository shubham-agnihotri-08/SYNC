"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { Clock, Search } from "lucide-react"
import { BookCabinDialog } from "@/components/book-cabin-dialog"

export default function EmployeeCabinsPage() {
  const [cabins, setCabins] = useState<any[]>([])
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cabinsRes, bookingsRes] = await Promise.all([fetch("/api/cabins"), fetch("/api/cabin-bookings")])

      if (cabinsRes.ok) {
        const cabinsData = await cabinsRes.json()
        setCabins(cabinsData.cabins || [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setUserBookings(bookingsData.bookings || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cabin Booking</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            - {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search cabin" className="pl-9 w-64" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cabins.map((cabin) => (
          <Card key={cabin.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cabin.color }} />
                {cabin.name}
              </CardTitle>
              <Badge variant={cabin.isActive ? "default" : "secondary"}>
                {cabin.isActive ? "Available" : "Booked"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">Capacity: {cabin.capacity}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {cabin.openTime} - {cabin.closeTime}
                  </span>
                </div>
                <div className="text-muted-foreground">Max. Booking: {cabin.maxBookingHours} Hour</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline">Select Cabin</Button>
              <Button variant="outline">Duration</Button>
            </div>
            <Button onClick={() => setDialogOpen(true)}>Submit Request</Button>
          </div>

          {userBookings.length > 0 ? (
            <div className="space-y-4">
              {userBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <div className="font-medium">{booking.cabin?.name || "Cabin"}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(booking.date)} • {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{booking.purpose}</div>
                  </div>
                  <Badge
                    variant={
                      booking.status === "CONFIRMED"
                        ? "default"
                        : booking.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">No bookings yet</div>
          )}
        </CardContent>
      </Card>

      <BookCabinDialog open={dialogOpen} onOpenChange={setDialogOpen} cabins={cabins} onSuccess={fetchData} />
    </div>
  )
}
