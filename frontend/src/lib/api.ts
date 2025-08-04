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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

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

// Shortlink API
export const shortlinkApi = {
  createShortlink: async (data: CreateShortlinkDto): Promise<ApiResponse<ShortlinkResponseDto>> => {
    const response = await api.post("/shortlink", data)
    return response.data
  },

  getAllShortlinks: async (): Promise<ApiResponse<ShortlinkListItem[]>> => {
    const response = await api.get("/shortlink")
    return response.data
  },

  getShortlinkById: async (id: string): Promise<ApiResponse<ShortlinkListItem>> => {
    const response = await api.get(`/shortlink/${id}`)
    return response.data
  },

  updateShortlink: async (id: string, data: UpdateShortlinkDto): Promise<ApiResponse<ShortlinkListItem>> => {
    const response = await api.patch(`/shortlink/${id}`, data)
    return response.data
  },

  deleteShortlink: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/shortlink/${id}`)
    return response.data
  },

  redirectToOriginal: async (code: string): Promise<ApiResponse<{ targetUrl: string }>> => {
    const response = await api.get(`/shortlink/redirect/${code}`)
    return response.data
  }
}

// Analytics API
export const analyticsApi = {
  getShortlinkAnalytics: async (shortlinkId: string): Promise<ApiResponse<AnalyticsData>> => {
    const response = await api.get(`/analytics/shortlink/${shortlinkId}`)
    return response.data
  },

  getUserAnalytics: async (): Promise<ApiResponse<AnalyticsData>> => {
    const response = await api.get("/analytics/user")
    return response.data
  }
}

// Password Protection API
export const passwordApi = {
  setPassword: async (shortlinkId: string, password: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/passwords/${shortlinkId}`, { password })
    return response.data
  },

  verifyPassword: async (shortlinkId: string, password: string): Promise<ApiResponse<{ isValid: boolean }>> => {
    const response = await api.post(`/passwords/${shortlinkId}/verify`, { password })
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
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

