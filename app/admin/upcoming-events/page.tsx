"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  type: string
  color: string
}

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        const upcoming = (data.events || []).filter((event: Event) => new Date(event.date) >= new Date())
        setEvents(upcoming)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground">View all upcoming events and holidays</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle>All Upcoming Events</CardTitle>
            <div className="relative ml-auto flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold" style={{ color: event.color }}>
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{event.time || "6:00pm to 7:00pm"}</div>
                      {event.description && (
                        <div className="mt-2 text-sm text-muted-foreground">{event.description}</div>
                      )}
                      <Badge className="mt-2" style={{ backgroundColor: event.color, color: "white" }}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">No upcoming events found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
