"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { Clock, Search, Edit, X, CalendarClock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CabinBookingForm } from "@/components/cabin-booking-form"

export default function EmployeeCabinsPage() {
  const [cabins, setCabins] = useState<any[]>([])
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBooking, setEditingBooking] = useState<any | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Filter bookings based on search query
    if (searchQuery.trim() === "") {
      setFilteredBookings(userBookings)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredBookings(
        userBookings.filter(
          (booking) =>
            booking.cabin?.name?.toLowerCase().includes(query) ||
            booking.purpose?.toLowerCase().includes(query) ||
            booking.status?.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, userBookings])

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
        setFilteredBookings(bookingsData.bookings || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return

    try {
      const response = await fetch(`/api/cabin-bookings/${cancellingBooking.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Success", description: "Booking cancelled successfully" })
        fetchData()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel booking", variant: "destructive" })
    } finally {
      setCancellingBooking(null)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
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
      </div>

      {/* Available Cabins Grid */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Cabins</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cabins
            .filter((cabin) => cabin.isActive)
            .map((cabin) => (
              <Card key={cabin.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cabin.color }} />
                    {cabin.name}
                  </CardTitle>
                  <Badge variant="default" className="bg-green-600">
                    Available
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{cabin.capacity} people</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Operating Hours:
                    </span>
                    <span className="font-medium">
                      {cabin.openTime} - {cabin.closeTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max. Booking:</span>
                    <span className="font-medium">{cabin.maxBookingHours} hours</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Booking Form */}
      <CabinBookingForm
        cabins={cabins}
        onSuccess={fetchData}
        editingBooking={editingBooking}
        onCancelEdit={() => setEditingBooking(null)}
      />

      {/* My Bookings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              My Bookings
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: booking.cabin?.color || "#3b82f6" }}
                      />
                      <h3 className="font-semibold">{booking.cabin?.name || "Unknown Cabin"}</h3>
                      <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(booking.date)}
                      </span>
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.purpose}</p>
                  </div>
                  {booking.status !== "CANCELLED" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingBooking(booking)} className="gap-1">
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setCancellingBooking(booking)}
                        className="gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                {searchQuery ? "No bookings found matching your search" : "No bookings yet. Book a cabin above!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking for {cancellingBooking?.cabin?.name}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive hover:bg-destructive/90">
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
