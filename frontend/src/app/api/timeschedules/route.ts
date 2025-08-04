import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// GET - Lấy danh sách timeschedules của user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shortlinkId = searchParams.get("shortlinkId")

    if (!shortlinkId) {
      return NextResponse.json({ error: "Shortlink ID is required" }, { status: 400 })
    }

    // Kiểm tra quyền sở hữu shortlink
    const shortlink = await prisma.shortlink.findFirst({
      where: {
        id: shortlinkId,
        userId: session.user.id
      }
    })

    if (!shortlink) {
      return NextResponse.json({ error: "Shortlink not found or access denied" }, { status: 404 })
    }

    const timeschedules = await prisma.timeSchedule.findMany({
      where: {
        shortlinkId
      },
      orderBy: {
        startTime: "asc"
      }
    })

    return NextResponse.json(timeschedules)
  } catch (error) {
    console.error("Error fetching timeschedules:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Tạo timeschedule mới
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      shortlinkId,
      targetUrl,
      startTime,
      endTime,
      isPasswordProtected = false,
      password,
      isActive = true
    } = await request.json()

    if (!shortlinkId || !targetUrl || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Kiểm tra quyền sở hữu shortlink
    const shortlink = await prisma.shortlink.findFirst({
      where: {
        id: shortlinkId,
        userId: session.user.id
      }
    })

    if (!shortlink) {
      return NextResponse.json({ error: "Shortlink not found or access denied" }, { status: 404 })
    }

    // Kiểm tra thời gian
    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 })
    }

    // Kiểm tra overlap với timeschedules khác
    const overlappingSchedules = await prisma.timeSchedule.findMany({
      where: {
        shortlinkId,
        isActive: true,
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) }
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) }
          },
          {
            startTime: { gte: new Date(startTime) },
            endTime: { lte: new Date(endTime) }
          }
        ]
      }
    })

    if (overlappingSchedules.length > 0) {
      return NextResponse.json({ error: "Time schedule overlaps with existing schedules" }, { status: 400 })
    }

    const timeschedule = await prisma.timeSchedule.create({
      data: {
        shortlinkId,
        targetUrl,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isPasswordProtected,
        password: isPasswordProtected && password ? await bcrypt.hash(password, 10) : null,
        isActive
      }
    })

    return NextResponse.json(timeschedule, { status: 201 })
  } catch (error) {
    console.error("Error creating timeschedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Cập nhật timeschedule
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, targetUrl, startTime, endTime, isPasswordProtected = false, password, isActive } = await request.json()

    if (!id || !targetUrl || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Kiểm tra quyền sở hữu timeschedule
    const existingTimeschedule = await prisma.timeSchedule.findFirst({
      where: {
        id,
        shortlink: {
          userId: session.user.id
        }
      },
      include: {
        shortlink: true
      }
    })

    if (!existingTimeschedule) {
      return NextResponse.json({ error: "Timeschedule not found or access denied" }, { status: 404 })
    }

    // Kiểm tra thời gian
    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 })
    }

    // Kiểm tra overlap với timeschedules khác (trừ chính nó)
    const overlappingSchedules = await prisma.timeSchedule.findMany({
      where: {
        shortlinkId: existingTimeschedule.shortlinkId,
        id: { not: id },
        isActive: true,
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) }
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) }
          },
          {
            startTime: { gte: new Date(startTime) },
            endTime: { lte: new Date(endTime) }
          }
        ]
      }
    })

    if (overlappingSchedules.length > 0) {
      return NextResponse.json({ error: "Time schedule overlaps with existing schedules" }, { status: 400 })
    }

    const updateData: {
      targetUrl: string
      startTime: Date
      endTime: Date
      isPasswordProtected: boolean
      isActive: boolean
      password?: string | null
    } = {
      targetUrl,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isPasswordProtected,
      isActive
    }

    if (isPasswordProtected && password) {
      updateData.password = await bcrypt.hash(password, 10)
    } else if (!isPasswordProtected) {
      updateData.password = null
    }

    const timeschedule = await prisma.timeSchedule.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(timeschedule)
  } catch (error) {
    console.error("Error updating timeschedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Xóa timeschedule
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Timeschedule ID is required" }, { status: 400 })
    }

    // Kiểm tra quyền sở hữu timeschedule
    const existingTimeschedule = await prisma.timeSchedule.findFirst({
      where: {
        id,
        shortlink: {
          userId: session.user.id
        }
      }
    })

    if (!existingTimeschedule) {
      return NextResponse.json({ error: "Timeschedule not found or access denied" }, { status: 404 })
    }

    await prisma.timeSchedule.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Timeschedule deleted successfully" })
  } catch (error) {
    console.error("Error deleting timeschedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
