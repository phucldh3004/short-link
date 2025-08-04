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

    // Lấy tất cả shortlinks của user
    const shortlinks = await prisma.shortlink.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    })

    const shortlinkIds = shortlinks.map((s: any) => s.id)

    if (shortlinkIds.length === 0) {
      return NextResponse.json({
        totalClicks: 0,
        uniqueVisitors: 0,
        topReferrers: [],
        deviceTypes: [],
        browsers: [],
        countries: [],
        clicksByDate: []
      })
    }

    // Tổng lượt click
    const totalClicks = await prisma.analytics.count({
      where: { shortlinkId: { in: shortlinkIds } }
    })

    // Unique visitors (unique IPs)
    const uniqueVisitors = await prisma.analytics
      .groupBy({
        by: ["ipAddress"],
        where: { shortlinkId: { in: shortlinkIds } },
        _count: { ipAddress: true }
      })
      .then((result) => result.length)

    // Top referrers
    const topReferrers = await prisma.analytics.groupBy({
      by: ["referer"],
      where: {
        shortlinkId: { in: shortlinkIds },
        referer: { not: null }
      },
      _count: { referer: true },
      orderBy: { _count: { referer: "desc" } },
      take: 10
    })

    // Device types
    const deviceTypes = await prisma.analytics.groupBy({
      by: ["deviceType"],
      where: { shortlinkId: { in: shortlinkIds } },
      _count: { deviceType: true },
      orderBy: { _count: { deviceType: "desc" } }
    })

    // Browsers
    const browsers = await prisma.analytics.groupBy({
      by: ["browser"],
      where: { shortlinkId: { in: shortlinkIds } },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 10
    })

    // Countries
    const countries = await prisma.analytics.groupBy({
      by: ["country"],
      where: {
        shortlinkId: { in: shortlinkIds },
        country: { not: null }
      },
      _count: { country: true },
      orderBy: { _count: { country: "desc" } },
      take: 10
    })

    // Clicks by date (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const clicksByDate = await prisma.analytics.groupBy({
      by: ["accessedAt"],
      where: {
        shortlinkId: { in: shortlinkIds },
        accessedAt: { gte: thirtyDaysAgo }
      },
      _count: { accessedAt: true },
      orderBy: { accessedAt: "asc" }
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
      }))
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

