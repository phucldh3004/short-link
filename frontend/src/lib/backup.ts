import { PrismaClient } from "@prisma/client"
import { log } from "./logger"

const prisma = new PrismaClient()

export interface BackupData {
  version: string
  timestamp: string
  users: any[]
  shortlinks: any[]
  timeSchedules: any[]
  analytics: any[]
}

export interface RestoreResult {
  success: boolean
  message: string
  details?: {
    users: number
    shortlinks: number
    timeSchedules: number
    analytics: number
  }
}

class BackupManager {
  private readonly version = "1.0.0"

  // Create backup of all data
  async createBackup(): Promise<BackupData> {
    try {
      log.info("Starting backup creation")

      const [users, shortlinks, timeSchedules, analytics] = await Promise.all([
        prisma.user.findMany(),
        prisma.shortlink.findMany(),
        prisma.timeSchedule.findMany(),
        prisma.analytics.findMany()
      ])

      const backupData: BackupData = {
        version: this.version,
        timestamp: new Date().toISOString(),
        users,
        shortlinks,
        timeSchedules,
        analytics
      }

      log.info("Backup created successfully", {
        users: users.length,
        shortlinks: shortlinks.length,
        timeSchedules: timeSchedules.length,
        analytics: analytics.length
      })

      return backupData
    } catch (error) {
      log.error(error as Error, { action: "backup_creation" })
      throw error
    }
  }

  // Create backup for specific user
  async createUserBackup(userId: string): Promise<BackupData> {
    try {
      log.info(`Starting backup creation for user: ${userId}`)

      const [user, shortlinks, timeSchedules, analytics] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.shortlink.findMany({ where: { userId } }),
        prisma.timeSchedule.findMany({
          where: {
            shortlink: { userId }
          }
        }),
        prisma.analytics.findMany({
          where: {
            shortlink: { userId }
          }
        })
      ])

      const backupData: BackupData = {
        version: this.version,
        timestamp: new Date().toISOString(),
        users: user ? [user] : [],
        shortlinks,
        timeSchedules,
        analytics
      }

      log.info("User backup created successfully", {
        userId,
        shortlinks: shortlinks.length,
        timeSchedules: timeSchedules.length,
        analytics: analytics.length
      })

      return backupData
    } catch (error) {
      log.error(error as Error, { action: "user_backup_creation", userId })
      throw error
    }
  }

  // Restore data from backup
  async restoreBackup(backupData: BackupData): Promise<RestoreResult> {
    try {
      log.info("Starting backup restoration")

      // Validate backup data
      if (!backupData.version || !backupData.timestamp) {
        throw new Error("Invalid backup data format")
      }

      // Clear existing data (optional - can be made configurable)
      await this.clearExistingData()

      // Restore data in order
      const results = await Promise.all([
        this.restoreUsers(backupData.users),
        this.restoreShortlinks(backupData.shortlinks),
        this.restoreTimeSchedules(backupData.timeSchedules),
        this.restoreAnalytics(backupData.analytics)
      ])

      const [users, shortlinks, timeSchedules, analytics] = results

      log.info("Backup restored successfully", {
        users,
        shortlinks,
        timeSchedules,
        analytics
      })

      return {
        success: true,
        message: "Backup restored successfully",
        details: {
          users,
          shortlinks,
          timeSchedules,
          analytics
        }
      }
    } catch (error) {
      log.error(error as Error, { action: "backup_restoration" })
      return {
        success: false,
        message: `Restore failed: ${(error as Error).message}`
      }
    }
  }

  // Clear existing data
  private async clearExistingData(): Promise<void> {
    await prisma.analytics.deleteMany()
    await prisma.timeSchedule.deleteMany()
    await prisma.shortlink.deleteMany()
    await prisma.user.deleteMany()
  }

  // Restore users
  private async restoreUsers(users: any[]): Promise<number> {
    if (users.length === 0) return 0

    const restoredUsers = await prisma.user.createMany({
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      })),
      skipDuplicates: true
    })

    return restoredUsers.count
  }

  // Restore shortlinks
  private async restoreShortlinks(shortlinks: any[]): Promise<number> {
    if (shortlinks.length === 0) return 0

    const restoredShortlinks = await prisma.shortlink.createMany({
      data: shortlinks.map((shortlink) => ({
        id: shortlink.id,
        shortCode: shortlink.shortCode,
        targetUrl: shortlink.targetUrl,
        userId: shortlink.userId,
        title: shortlink.title,
        description: shortlink.description,
        isPasswordProtected: shortlink.isPasswordProtected,
        password: shortlink.password,
        isTimeRestricted: shortlink.isTimeRestricted,
        expiresAt: shortlink.expiresAt ? new Date(shortlink.expiresAt) : null,
        isActive: shortlink.isActive,
        createdAt: new Date(shortlink.createdAt),
        updatedAt: new Date(shortlink.updatedAt)
      })),
      skipDuplicates: true
    })

    return restoredShortlinks.count
  }

  // Restore time schedules
  private async restoreTimeSchedules(timeSchedules: any[]): Promise<number> {
    if (timeSchedules.length === 0) return 0

    const restoredTimeSchedules = await prisma.timeSchedule.createMany({
      data: timeSchedules.map((schedule) => ({
        id: schedule.id,
        shortlinkId: schedule.shortlinkId,
        targetUrl: schedule.targetUrl,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        isPasswordProtected: schedule.isPasswordProtected,
        password: schedule.password,
        isActive: schedule.isActive,
        createdAt: new Date(schedule.createdAt),
        updatedAt: new Date(schedule.updatedAt)
      })),
      skipDuplicates: true
    })

    return restoredTimeSchedules.count
  }

  // Restore analytics
  private async restoreAnalytics(analytics: any[]): Promise<number> {
    if (analytics.length === 0) return 0

    const restoredAnalytics = await prisma.analytics.createMany({
      data: analytics.map((analytic) => ({
        id: analytic.id,
        shortlinkId: analytic.shortlinkId,
        ipAddress: analytic.ipAddress,
        userAgent: analytic.userAgent,
        referer: analytic.referer,
        deviceType: analytic.deviceType,
        browser: analytic.browser,
        os: analytic.os,
        country: analytic.country,
        city: analytic.city,
        accessedAt: new Date(analytic.accessedAt)
      })),
      skipDuplicates: true
    })

    return restoredAnalytics.count
  }

  // Export backup to file
  async exportBackupToFile(backupData: BackupData): Promise<string> {
    const filename = `backup-${new Date().toISOString().split("T")[0]}.json`
    const content = JSON.stringify(backupData, null, 2)

    // In a real application, you would save this to a file system
    // For now, we'll return the content as a string
    return content
  }

  // Import backup from file
  async importBackupFromFile(content: string): Promise<RestoreResult> {
    try {
      const backupData: BackupData = JSON.parse(content)
      return await this.restoreBackup(backupData)
    } catch (error) {
      log.error(error as Error, { action: "backup_import" })
      return {
        success: false,
        message: `Import failed: ${(error as Error).message}`
      }
    }
  }

  // Get backup statistics
  async getBackupStats(): Promise<{
    totalUsers: number
    totalShortlinks: number
    totalTimeSchedules: number
    totalAnalytics: number
    lastBackup?: string
  }> {
    const [users, shortlinks, timeSchedules, analytics] = await Promise.all([
      prisma.user.count(),
      prisma.shortlink.count(),
      prisma.timeSchedule.count(),
      prisma.analytics.count()
    ])

    return {
      totalUsers: users,
      totalShortlinks: shortlinks,
      totalTimeSchedules: timeSchedules,
      totalAnalytics: analytics
    }
  }
}

// Create singleton backup manager
export const backupManager = new BackupManager()
