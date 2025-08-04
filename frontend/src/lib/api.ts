import axios from "axios"
import {
  CreateShortlinkDto,
  ShortlinkResponseDto,
  ApiResponse,
  PaginatedResponse,
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponse,
  UpdateShortlinkDto,
  AnalyticsData,
  ShortlinkListItem
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

// Auth API
export const authApi = {
  register: async (data: RegisterDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  login: async (data: LoginDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await api.post("/auth/login", data)
    return response.data
  },

  getProfile: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get("/auth/profile")
    return response.data
  }
}

// Shortlink API - Fixed endpoints to match backend
export const shortlinkApi = {
  createShortlink: async (data: CreateShortlinkDto): Promise<ApiResponse<ShortlinkResponseDto>> => {
    const response = await api.post("/shortlinks", data)
    return response.data
  },

  getAllShortlinks: async (): Promise<ApiResponse<ShortlinkListItem[]>> => {
    const response = await api.get("/shortlinks")
    return response.data
  },

  getShortlinkById: async (id: string): Promise<ApiResponse<ShortlinkListItem>> => {
    const response = await api.get(`/shortlinks/${id}`)
    return response.data
  },

  updateShortlink: async (id: string, data: UpdateShortlinkDto): Promise<ApiResponse<ShortlinkListItem>> => {
    const response = await api.put(`/shortlinks/${id}`, data)
    return response.data
  },

  deleteShortlink: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/shortlinks/${id}`)
    return response.data
  },

  redirectToOriginal: async (code: string): Promise<ApiResponse<{ targetUrl: string }>> => {
    const response = await api.get(`/shortlinks/redirect/${code}`)
    return response.data
  }
}

// Analytics API - Fixed endpoints
export const analyticsApi = {
  getShortlinkAnalytics: async (shortlinkId: string): Promise<ApiResponse<AnalyticsData>> => {
    const response = await api.get(`/shortlinks/${shortlinkId}/analytics/overview`)
    return response.data
  },

  getDeviceStats: async (shortlinkId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/shortlinks/${shortlinkId}/analytics/devices`)
    return response.data
  },

  getCountryStats: async (shortlinkId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/shortlinks/${shortlinkId}/analytics/countries`)
    return response.data
  },

  getTimeStats: async (shortlinkId: string, days: number = 30): Promise<ApiResponse<any>> => {
    const response = await api.get(`/shortlinks/${shortlinkId}/analytics/timeline?days=${days}`)
    return response.data
  }
}

// Password Protection API - Fixed endpoints
export const passwordApi = {
  setPassword: async (
    shortlinkId: string,
    password: string,
    startTime?: string,
    endTime?: string
  ): Promise<ApiResponse<void>> => {
    const response = await api.post(`/passwords`, {
      shortlinkId,
      password,
      startTime,
      endTime
    })
    return response.data
  },

  verifyPassword: async (shortlinkId: string, password: string): Promise<ApiResponse<{ isValid: boolean }>> => {
    const response = await api.post(`/passwords/verify`, { shortlinkId, password })
    return response.data
  },

  getPasswords: async (shortlinkId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/passwords/${shortlinkId}`)
    return response.data
  },

  deletePassword: async (passwordId: string, shortlinkId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/passwords/${passwordId}?shortlinkId=${shortlinkId}`)
    return response.data
  }
}

// Schedule API
export const scheduleApi = {
  createSchedule: async (shortlinkId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/schedules`, { shortlinkId, ...data })
    return response.data
  },

  getSchedules: async (shortlinkId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/schedules/${shortlinkId}`)
    return response.data
  },

  updateSchedule: async (scheduleId: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/schedules/${scheduleId}`, data)
    return response.data
  },

  deleteSchedule: async (scheduleId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/schedules/${scheduleId}`)
    return response.data
  }
}

// Interceptor để thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  }
)

