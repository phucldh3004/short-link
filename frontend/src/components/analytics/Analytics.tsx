"use client"

import { useState, useEffect } from "react"
import { AnalyticsData } from "@/types"

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Đang tải thống kê...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">Không có dữ liệu thống kê</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Thống kê truy cập</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tổng lượt click</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalClicks}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Người truy cập</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.uniqueVisitors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Types */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thiết bị truy cập</h3>
          <div className="space-y-3">
            {analytics.deviceTypes.map((device) => (
              <div key={device.deviceType} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{device.deviceType}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${(device.count / analytics.totalClicks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{device.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Trình duyệt</h3>
          <div className="space-y-3">
            {analytics.browsers.map((browser) => (
              <div key={browser.browser} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{browser.browser}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(browser.count / analytics.totalClicks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{browser.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nguồn truy cập hàng đầu</h3>
        <div className="space-y-3">
          {analytics.topReferrers.map((referrer, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{referrer.referer || "Direct"}</span>
              <span className="text-sm text-gray-500">{referrer.count} lượt</span>
            </div>
          ))}
        </div>
      </div>

      {/* Countries */}
      {analytics.countries.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quốc gia truy cập</h3>
          <div className="space-y-3">
            {analytics.countries.map((country) => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{country.country}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(country.count / analytics.totalClicks) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{country.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
