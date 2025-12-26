import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { EmployeeSidebar } from "@/components/employee-sidebar"

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "EMPLOYEE") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <EmployeeSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
