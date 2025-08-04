import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shortlinkId = searchParams.get("shortlinkId")
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y

    // Lấy tất cả shortlinks của user
    const shortlinks = await prisma.shortlink.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    })

    const shortlinkIds = shortlinks.map((s: { id: string }) => s.id)

    if (shortlinkIds.length === 0) {
      return NextResponse.json({
        totalClicks: 0,
        uniqueVisitors: 0,
        topReferrers: [],
        deviceTypes: [],
        browsers: [],
        countries: [],
        clicksByDate: [],
        clicksByHour: [],
        topShortlinks: [],
        recentActivity: []
      })
    }

    // Tính toán thời gian dựa trên period
    const now = new Date()
    const startDate = (() => {
      const date = new Date()
      switch (period) {
        case "7d":
          date.setDate(now.getDate() - 7)
          break
        case "30d":
          date.setDate(now.getDate() - 30)
          break
        case "90d":
          date.setDate(now.getDate() - 90)
          break
        case "1y":
          date.setFullYear(now.getFullYear() - 1)
          break
        default:
          date.setDate(now.getDate() - 30)
      }
      return date
    })()

    // Filter shortlinkId nếu có
    const analyticsFilter = shortlinkId ? { shortlinkId } : { shortlinkId: { in: shortlinkIds } }

    // Tổng lượt click
    const totalClicks = await prisma.analytics.count({
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate }
      }
    })

    // Unique visitors (unique IPs)
    const uniqueVisitors = await prisma.analytics
      .groupBy({
        by: ["ipAddress"],
        where: {
          ...analyticsFilter,
          accessedAt: { gte: startDate }
        },
        _count: { ipAddress: true }
      })
      .then((result) => result.length)

    // Top referrers
    const topReferrers = await prisma.analytics.groupBy({
      by: ["referer"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate },
        referer: { not: null }
      },
      _count: { referer: true },
      orderBy: { _count: { referer: "desc" } },
      take: 10
    })

    // Device types
    const deviceTypes = await prisma.analytics.groupBy({
      by: ["deviceType"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate }
      },
      _count: { deviceType: true },
      orderBy: { _count: { deviceType: "desc" } }
    })

    // Browsers
    const browsers = await prisma.analytics.groupBy({
      by: ["browser"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate }
      },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 10
    })

    // Countries
    const countries = await prisma.analytics.groupBy({
      by: ["country"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate },
        country: { not: null }
      },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 10
    })

    // Clicks by date
    const clicksByDate = await prisma.analytics.groupBy({
      by: ["accessedAt"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate }
      },
      _count: { accessedAt: true },
      orderBy: { accessedAt: "asc" }
    })

    // Clicks by hour (last 24 hours)
    const last24Hours = new Date()
    last24Hours.setHours(now.getHours() - 24)

    const clicksByHour = await prisma.analytics.groupBy({
      by: ["accessedAt"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: last24Hours }
      },
      _count: { accessedAt: true },
      orderBy: { accessedAt: "asc" }
    })

    // Top shortlinks
    const topShortlinks = await prisma.analytics.groupBy({
      by: ["shortlinkId"],
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate }
      },
      _count: { shortlinkId: true },
      orderBy: { _count: { shortlinkId: "desc" } },
      take: 10
    })

    // Recent activity (last 10 clicks)
    const recentActivity = await prisma.analytics.findMany({
      where: {
        ...analyticsFilter,
        accessedAt: { gte: startDate }
      },
      include: {
        shortlink: {
          select: {
            shortCode: true,
            title: true
          }
        }
      },
      orderBy: {
        accessedAt: "desc"
      },
      take: 10
    })

    return NextResponse.json({
      totalClicks,
      uniqueVisitors,
      topReferrers: topReferrers.map((r) => ({
        referer: r.referer,
        count: r._count.referer
      })),
      deviceTypes: deviceTypes.map((d) => ({
        deviceType: d.deviceType,
        count: d._count.deviceType
      })),
      browsers: browsers.map((b) => ({
        browser: b.browser,
        count: b._count.browser
      })),
      countries: countries.map((c) => ({
        country: c.country,
        count: c._count.country
      })),
      clicksByDate: clicksByDate.map((c) => ({
        date: c.accessedAt.toISOString().split("T")[0],
        clicks: c._count.accessedAt
      })),
      clicksByHour: clicksByHour.map((c) => ({
        hour: c.accessedAt.toISOString().slice(0, 13) + ":00:00",
        clicks: c._count.accessedAt
      })),
      topShortlinks: topShortlinks.map((s) => ({
        shortlinkId: s.shortlinkId,
        count: s._count.shortlinkId
      })),
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        shortlinkId: a.shortlinkId,
        shortCode: a.shortlink.shortCode,
        title: a.shortlink.title,
        ipAddress: a.ipAddress,
        deviceType: a.deviceType,
        browser: a.browser,
        accessedAt: a.accessedAt
      }))
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

