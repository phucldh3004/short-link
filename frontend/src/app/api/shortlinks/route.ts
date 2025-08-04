import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

// GET - Lấy danh sách shortlinks của user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const shortlinks = await prisma.shortlink.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        timeSchedules: true,
        analytics: {
          orderBy: {
            accessedAt: "desc"
          },
          take: 10
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(shortlinks)
  } catch (error) {
    console.error("Error fetching shortlinks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Tạo shortlink mới
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      targetUrl,
      title,
      description,
      isPasswordProtected = false,
      password,
      isTimeRestricted = false,
      expiresAt
    } = await request.json()

    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json({ error: "Target URL is required" }, { status: 400 })
    }

    // Generate unique short code
    let shortCode
    let isUnique = false

    while (!isUnique) {
      shortCode = nanoid(8)
      const existing = await prisma.shortlink.findUnique({
        where: { shortCode }
      })
      if (!existing) {
        isUnique = true
      }
    }

    const shortlink = await prisma.shortlink.create({
      data: {
        shortCode,
        targetUrl,
        userId: session.user.id,
        title,
        description,
        isPasswordProtected,
        password: isPasswordProtected ? password : null,
        isTimeRestricted,
        expiresAt: isTimeRestricted && expiresAt ? new Date(expiresAt) : null
      }
    })

    return NextResponse.json(shortlink, { status: 201 })
  } catch (error) {
    console.error("Error creating shortlink:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Cập nhật shortlink
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      targetUrl,
      title,
      description,
      isPasswordProtected = false,
      password,
      isTimeRestricted = false,
      expiresAt,
      isActive
    } = body

    if (!id) {
      return NextResponse.json({ error: "Shortlink ID is required" }, { status: 400 })
    }

    if (!targetUrl) {
      return NextResponse.json({ error: "Target URL is required" }, { status: 400 })
    }

    // Kiểm tra quyền sở hữu
    const existingShortlink = await prisma.shortlink.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingShortlink) {
      return NextResponse.json({ error: "Shortlink not found or access denied" }, { status: 404 })
    }

    const updateData: {
      targetUrl: string
      title?: string | null
      description?: string | null
      isPasswordProtected: boolean
      isTimeRestricted: boolean
      isActive: boolean
      password?: string | null
      expiresAt?: Date | null
    } = {
      targetUrl,
      title,
      description,
      isPasswordProtected,
      isTimeRestricted,
      isActive
    }

    if (isPasswordProtected && password) {
      updateData.password = password
    } else if (!isPasswordProtected) {
      updateData.password = null
    }

    if (isTimeRestricted && expiresAt) {
      updateData.expiresAt = new Date(expiresAt)
    } else if (!isTimeRestricted) {
      updateData.expiresAt = null
    }

    const shortlink = await prisma.shortlink.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(shortlink)
  } catch (error) {
    console.error("Error updating shortlink:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Xóa shortlink
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Shortlink ID is required" }, { status: 400 })
    }

    // Kiểm tra quyền sở hữu
    const existingShortlink = await prisma.shortlink.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingShortlink) {
      return NextResponse.json({ error: "Shortlink not found or access denied" }, { status: 404 })
    }

    // Xóa shortlink (cascade sẽ xóa analytics và timeSchedules)
    await prisma.shortlink.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Shortlink deleted successfully" })
  } catch (error) {
    console.error("Error deleting shortlink:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

