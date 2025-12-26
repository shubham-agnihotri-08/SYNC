"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const COLORS = [
  { name: "Teal", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Purple", value: "#a855f7" },
  { name: "Lime", value: "#84cc16" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
]

interface AddCabinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // Added onSuccess callback
}

export function AddCabinDialog({ open, onOpenChange, onSuccess }: AddCabinDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    openTime: "",
    openTimeFormat: "AM",
    closeTime: "",
    closeTimeFormat: "PM",
    maxBookingHours: "",
    color: COLORS[0].value,
    description: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/cabins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          capacity: formData.capacity,
          openTime: `${formData.openTime} ${formData.openTimeFormat}`,
          closeTime: `${formData.closeTime} ${formData.closeTimeFormat}`,
          maxBookingHours: formData.maxBookingHours,
          color: formData.color,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add cabin")
      }

      toast({
        title: "Success",
        description: "Cabin added successfully",
      })

      onOpenChange(false)
      setFormData({
        name: "",
        capacity: "",
        openTime: "",
        openTimeFormat: "AM",
        closeTime: "",
        closeTimeFormat: "PM",
        maxBookingHours: "",
        color: COLORS[0].value,
        description: "",
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cabin",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Add New Cabin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Enter Cabin Name</Label>
            <Input
              id="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="hh:mm"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  required
                />
                <Select
                  value={formData.openTimeFormat}
                  onValueChange={(value) => setFormData({ ...formData, openTimeFormat: value })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="hh:mm"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  required
                />
                <Select
                  value={formData.closeTimeFormat}
                  onValueChange={(value) => setFormData({ ...formData, closeTimeFormat: value })}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Enter Number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxHours">Maximum Booking Hours</Label>
            <Input
              id="maxHours"
              placeholder="hh:mm"
              value={formData.maxBookingHours}
              onChange={(e) => setFormData({ ...formData, maxBookingHours: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Colour</Label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className="relative h-8 w-8 rounded-full"
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Write here..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
