"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CabinBookingFormProps {
  cabins: any[]
  onSuccess?: () => void
  editingBooking?: any | null
  onCancelEdit?: () => void
}

export function CabinBookingForm({ cabins, onSuccess, editingBooking, onCancelEdit }: CabinBookingFormProps) {
  const [formData, setFormData] = useState({
    cabinId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load editing data when editingBooking changes
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        cabinId: editingBooking.cabinId || "",
        date: editingBooking.date ? new Date(editingBooking.date).toISOString().split("T")[0] : "",
        startTime: editingBooking.startTime || "",
        endTime: editingBooking.endTime || "",
        purpose: editingBooking.purpose || "",
      })
    } else {
      setFormData({
        cabinId: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
      })
    }
  }, [editingBooking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingBooking ? `/api/cabin-bookings/${editingBooking.id}` : "/api/cabin-bookings"
      const method = editingBooking ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingBooking ? "Booking updated successfully" : "Cabin booked successfully",
        })
        setFormData({ cabinId: "", date: "", startTime: "", endTime: "", purpose: "" })
        if (onSuccess) onSuccess()
        if (onCancelEdit) onCancelEdit()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: editingBooking ? "Failed to update booking" : "Failed to book cabin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ cabinId: "", date: "", startTime: "", endTime: "", purpose: "" })
    if (onCancelEdit) onCancelEdit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingBooking ? "Edit Booking" : "Book a Cabin"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cabin">Select Cabin</Label>
              <Select
                value={formData.cabinId}
                onValueChange={(value) => setFormData({ ...formData, cabinId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cabin" />
                </SelectTrigger>
                <SelectContent>
                  {cabins
                    .filter((cabin) => cabin.isActive)
                    .map((cabin) => (
                      <SelectItem key={cabin.id} value={cabin.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cabin.color }} />
                          {cabin.name} (Capacity: {cabin.capacity})
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of your booking..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            {editingBooking && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel Edit
              </Button>
            )}
            <Button type="submit" disabled={loading} className="min-w-32">
              {loading ? "Submitting..." : editingBooking ? "Update Booking" : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
