// User Types
export interface User {
  id?: string
  email: string
  password: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserResponse {
  id: string
  email: string
  name: string
}

// Shortlink Types
export interface Shortlink {
  id?: string
  code: string
  targetUrl: string
  clicks: number
  isActive: boolean
  expiresAt?: Date | null
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateShortlinkDto {
  targetUrl: string
  expiresAt?: string
}

export interface ShortlinkResponseDto {
  id: number
  code: string
  originalUrl: string
  shortUrl: string
  clicks: number
  createdAt: Date
}

export interface UpdateShortlinkDto {
  targetUrl?: string
  isActive?: boolean
  expiresAt?: string
}

// Auth Types
export interface RegisterDto {
  email: string
  password: string
  name: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponseDto {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
  }
}

// Analytics Types
export interface AccessLog {
  id?: string
  shortlinkId: string
  ipAddress: string
  userAgent?: string
  referer?: string
  deviceType?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  region?: string
  timezone?: string
  timestamp?: Date
}

// Password Protection Types
export interface ShortlinkPassword {
  id?: string
  shortlinkId: string
  password: string // hashed
  startTime?: Date | null
  endTime?: Date | null
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Frontend Specific Types
export interface ShortlinkFormData {
  targetUrl: string
  expiresAt?: string
  password?: string
}

export interface ShortlinkListItem {
  id: string
  code: string
  originalUrl: string
  shortUrl: string
  clicks: number
  isActive: boolean
  expiresAt?: Date
  createdAt: Date
}

// Error Types
export interface ApiError {
  statusCode: number
  message: string
  error: string
}

// Analytics Dashboard Types
export interface AnalyticsData {
  totalClicks: number
  uniqueVisitors: number
  topReferrers: Array<{
    referer: string
    count: number
  }>
  clicksByDate: Array<{
    date: string
    clicks: number
  }>
  deviceTypes: Array<{
    deviceType: string
    count: number
  }>
  browsers: Array<{
    browser: string
    count: number
  }>
  countries: Array<{
    country: string
    count: number
  }>
}

// Schedule Types (if implemented)
export interface Schedule {
  id?: string
  shortlinkId: string
  startTime: Date
  endTime: Date
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}
