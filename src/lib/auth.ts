import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      tenant: true,
    },
  })

  if (!user) {
    throw new Error("Kullanıcı bulunamadı")
  }

  if (!user.isActive) {
    throw new Error("Kullanıcı aktif değil")
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw new Error("Şifre yanlış")
  }

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      username: user.username,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" }
  )

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      tenant: user.tenant,
    },
    token,
  }
}

export async function register(userData: {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  tenantId: string
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
    include: {
      tenant: true,
    },
  })

  const token = jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      username: user.username,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" }
  )

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      tenant: user.tenant,
    },
    token,
  }
}