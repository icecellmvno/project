import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function verifyAuth() {
  const token = cookies().get("token")?.value

  if (!token) {
    throw new Error("Token bulunamadı")
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )
    return verified.payload
  } catch (err) {
    throw new Error("Token geçersiz")
  }
}

export async function authorizeRequest(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json(
      { error: "Yetkilendirme başarısız" },
      { status: 401 }
    )
  }

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )
    return verified.payload
  } catch (err) {
    return NextResponse.json(
      { error: "Token geçersiz" },
      { status: 401 }
    )
  }
} 