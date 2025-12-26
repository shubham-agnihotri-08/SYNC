import { LoginForm } from "@/components/login-form"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight">SYNC</h1>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Login</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
