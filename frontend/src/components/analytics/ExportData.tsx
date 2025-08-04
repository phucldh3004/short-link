"use client"

import { useState } from "react"
import { AnalyticsData } from "@/types"

interface ExportDataProps {
  analytics: AnalyticsData
  period: string
}

export default function ExportData({ analytics, period }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)

    try {
      // Tạo dữ liệu CSV
      const csvData = [
        // Header
        ["Thống kê Analytics", ""],
        ["Thời gian", period],
        ["Tổng lượt click", analytics.totalClicks],
        ["Người truy cập unique", analytics.uniqueVisitors],
        ["", ""],

        // Device Types
        ["Thiết bị", "Lượt click"],
        ...analytics.deviceTypes.map((d) => [d.deviceType, d.count]),
        ["", ""],

        // Browsers
        ["Trình duyệt", "Lượt click"],
        ...analytics.browsers.map((b) => [b.browser, b.count]),
        ["", ""],

        // Countries
        ["Quốc gia", "Lượt click"],
        ...analytics.countries.map((c) => [c.country, c.count]),
        ["", ""],

        // Referrers
        ["Nguồn truy cập", "Lượt click"],
        ...analytics.topReferrers.map((r) => [r.referer || "Direct", r.count]),
        ["", ""],

        // Clicks by date
        ["Ngày", "Lượt click"],
        ...analytics.clicksByDate.map((c) => [c.date, c.clicks]),
        ["", ""],

        // Recent activity
        ["Hoạt động gần đây", "", "", "", ""],
        ["Shortlink", "IP Address", "Thiết bị", "Trình duyệt", "Thời gian"],
        ...analytics.recentActivity.map((a) => [
          a.title || a.shortCode,
          a.ipAddress,
          a.deviceType,
          a.browser,
          new Date(a.accessedAt).toLocaleString("vi-VN")
        ])
      ]

      // Chuyển đổi thành CSV string
      const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

      // Tạo và download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `analytics-${period}-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = () => {
    setIsExporting(true)

    try {
      const jsonData = {
        period,
        exportDate: new Date().toISOString(),
        summary: {
          totalClicks: analytics.totalClicks,
          uniqueVisitors: analytics.uniqueVisitors
        },
        deviceTypes: analytics.deviceTypes,
        browsers: analytics.browsers,
        countries: analytics.countries,
        topReferrers: analytics.topReferrers,
        clicksByDate: analytics.clicksByDate,
        recentActivity: analytics.recentActivity
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json;charset=utf-8;"
      })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `analytics-${period}-${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting data:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Xuất dữ liệu</h3>
      <div className="flex space-x-4">
        <button
          onClick={exportToCSV}
          disabled={isExporting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isExporting ? "Đang xuất..." : "Xuất CSV"}
        </button>
        <button
          onClick={exportToJSON}
          disabled={isExporting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isExporting ? "Đang xuất..." : "Xuất JSON"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">Xuất dữ liệu thống kê theo định dạng CSV hoặc JSON để phân tích thêm</p>
    </div>
  )
}
