import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: NextRequest, { params }: { params: { shortcode: string } }) {
  try {
    const { shortcode } = params
    const { password } = await request.json()

    // Tìm shortlink
    const shortlink = await prisma.shortlink.findUnique({
      where: { shortCode: shortcode },
      include: {
        timeSchedules: {
          where: {
            isActive: true,
            startTime: { lte: new Date() },
            endTime: { gte: new Date() }
          }
        }
      }
    })

    if (!shortlink) {
      return NextResponse.json({ error: "Shortlink not found" }, { status: 404 })
    }

    if (!shortlink.isActive) {
      return NextResponse.json({ error: "Shortlink is inactive" }, { status: 400 })
    }

    // Kiểm tra thời gian hết hạn
    if (shortlink.isTimeRestricted && shortlink.expiresAt && new Date() > shortlink.expiresAt) {
      return NextResponse.json({ error: "Shortlink has expired" }, { status: 400 })
    }

    // Kiểm tra mật khẩu
    if (shortlink.isPasswordProtected) {
      if (!password) {
        return NextResponse.json({ error: "Password required", requiresPassword: true }, { status: 401 })
      }

      const isPasswordValid = await bcrypt.compare(password, shortlink.password!)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 })
      }
    }

    // Xác định target URL (có thể thay đổi theo lịch)
    let targetUrl = shortlink.targetUrl
    if (shortlink.timeSchedules.length > 0) {
      const activeSchedule = shortlink.timeSchedules[0]
      targetUrl = activeSchedule.targetUrl
    }

    // Lưu analytics
    const userAgent = request.headers.get("user-agent") || ""
    const referer = request.headers.get("referer") || ""
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwarded || realIp || "unknown"

    // Phân tích device type
    let deviceType = "desktop"
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? "tablet" : "mobile"
    }

    // Phân tích browser
    let browser = "unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    // Phân tích OS
    let os = "unknown"
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS")) os = "iOS"

    await prisma.analytics.create({
      data: {
        shortlinkId: shortlink.id,
        ipAddress,
        userAgent,
        referer,
        deviceType,
        browser,
        os
      }
    })

    return NextResponse.json({ targetUrl })
  } catch (error) {
    console.error("Redirect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
