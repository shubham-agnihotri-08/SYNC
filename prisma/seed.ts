import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Check if any ADMIN user exists
  const adminExists = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  })

  if (adminExists) {
    console.log("✅ Admin user already exists. Skipping seed.")
    return
  }

  // Get admin credentials from environment variables
  const adminName = process.env.ADMIN_NAME || "System Admin"
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123"

  // Hash the password
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  // Create default admin user
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      department: "Management",
      phone: "+1234567890",
      isActive: true,
    },
  })

  console.log("✅ Created default admin user:")
  console.log(`   Email: ${admin.email}`)
  console.log(`   Password: ${adminPassword}`)
  console.log("")
  console.log("🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
