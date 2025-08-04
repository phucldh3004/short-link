"use client"

import { useState } from "react"
import { shortlinkApi } from "@/lib/api"
import { ShortlinkResponseDto, ApiResponse } from "@/lib/types"

interface ShortlinkFormProps {
  onShortlinkCreated: (shortlink: ShortlinkResponseDto) => void
}

export default function ShortlinkForm({ onShortlinkCreated }: ShortlinkFormProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError("Vui lòng nhập URL")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response: ApiResponse<ShortlinkResponseDto> = await shortlinkApi.createShortlink({
        targetUrl: url
      })

      if (response.success && response.data) {
        onShortlinkCreated(response.data)
        setUrl("")
      } else {
        setError(response.message || "Có lỗi xảy ra")
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || "Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Nhập URL để tạo shortlink
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang tạo..." : "Tạo Shortlink"}
        </button>
      </form>
    </div>
  )
}

