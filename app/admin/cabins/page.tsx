"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"
import { AddCabinDialog } from "@/components/add-cabin-dialog"

export default function CabinsPage() {
  const [cabins, setCabins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchCabins()
  }, [])

  const fetchCabins = async () => {
    try {
      const response = await fetch("/api/cabins")
      if (response.ok) {
        const data = await response.json()
        setCabins(data.cabins || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching cabins:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCabinAdded = () => {
    fetchCabins()
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cabins/Manage Cabins</h1>
          <p className="text-muted-foreground">Manage your cabin bookings</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Cabin
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cabins.map((cabin) => (
          <Card key={cabin.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">{cabin.name}</CardTitle>
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: cabin.color }} />
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
                <div className="text-muted-foreground">Max. Booking: {cabin.maxBookingHours} Hours</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddCabinDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={handleCabinAdded} />
    </div>
  )
}
