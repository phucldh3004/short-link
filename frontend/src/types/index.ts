export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Shortlink {
  id: string
  shortCode: string
  targetUrl: string
  userId: string
  title?: string
  description?: string
  isPasswordProtected: boolean
  password?: string
  isTimeRestricted: boolean
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  timeSchedules?: TimeSchedule[]
  analytics?: Analytics[]
}

export interface TimeSchedule {
  id: string
  shortlinkId: string
  targetUrl: string
  startTime: Date
  endTime: Date
  isActive: boolean
}

export interface Analytics {
  id: string
  shortlinkId: string
  ipAddress: string
  userAgent: string
  referer?: string
  deviceType: "desktop" | "mobile" | "tablet"
  browser: string
  os: string
  country?: string
  city?: string
  accessedAt: Date
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CreateShortlinkData {
  targetUrl: string
  title?: string
  description?: string
  isPasswordProtected?: boolean
  password?: string
  isTimeRestricted?: boolean
  expiresAt?: Date
}

export interface UpdateShortlinkData {
  targetUrl?: string
  title?: string
  description?: string
  isPasswordProtected?: boolean
  password?: string
  isTimeRestricted?: boolean
  expiresAt?: Date
  isActive?: boolean
}

export interface AnalyticsData {
  totalClicks: number
  uniqueVisitors: number
  topReferrers: Array<{ referer: string; count: number }>
  deviceTypes: Array<{ deviceType: string; count: number }>
  browsers: Array<{ browser: string; count: number }>
  countries: Array<{ country: string; count: number }>
  clicksByDate: Array<{ date: string; clicks: number }>
}
