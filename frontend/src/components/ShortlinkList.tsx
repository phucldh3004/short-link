"use client"

import { useState, useEffect } from "react"
import { shortlinkApi } from "@/lib/api"
import { ShortlinkListItem, ApiResponse } from "@/lib/types"

export default function ShortlinkList() {
  const [shortlinks, setShortlinks] = useState<ShortlinkListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadShortlinks()
  }, [])

  const loadShortlinks = async () => {
    try {
      const response: ApiResponse<ShortlinkListItem[]> = await shortlinkApi.getAllShortlinks()
      if (response.success && response.data) {
        setShortlinks(response.data)
      } else {
        setError(response.message || "Không thể tải danh sách shortlink")
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách shortlink:", error)
      setError("Có lỗi xảy ra khi tải danh sách")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      // Có thể thêm toast notification ở đây
    } catch (error) {
      console.error("Lỗi khi copy:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={loadShortlinks} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Thử lại
        </button>
      </div>
    )
  }

  if (shortlinks.length === 0) {
    return <div className="text-center py-8 text-gray-500">Chưa có shortlink nào được tạo</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Danh sách Shortlink</h2>
      <div className="space-y-3">
        {shortlinks.map((shortlink) => (
          <div key={shortlink.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 truncate">{shortlink.originalUrl}</p>
                <p className="text-blue-600 font-medium truncate">{shortlink.shortUrl}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Clicks: {shortlink.clicks}</span>
                  <span>{new Date(shortlink.createdAt).toLocaleDateString("vi-VN")}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      shortlink.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {shortlink.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(shortlink.shortUrl)}
                className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

