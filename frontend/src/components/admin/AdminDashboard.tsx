"use client"

import { useState, useEffect } from "react"
import { logger } from "@/lib/logger"
import { backupManager } from "@/lib/backup"
import { cacheUtils } from "@/lib/cache"

interface SystemStats {
  totalUsers: number
  totalShortlinks: number
  totalTimeSchedules: number
  totalAnalytics: number
  cacheStats: {
    analytics: { size: number; max: number }
    shortlinks: { size: number; max: number }
  }
  logStats: {
    total: number
    lastHour: number
    lastDay: number
    byLevel: Record<string, number>
    byAction: Record<string, number>
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "backup" | "cache">("overview")
  const [logs, setLogs] = useState<any[]>([])
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    setIsLoading(true)
    try {
      const [backupStats, cacheStats, logStats] = await Promise.all([
        backupManager.getBackupStats(),
        cacheUtils.getStats(),
        logger.getStats()
      ])

      setStats({
        ...backupStats,
        cacheStats,
        logStats
      })
    } catch (error) {
      console.error("Error fetching system stats:", error)
      showNotification("error", "Không thể tải thống kê hệ thống")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = async () => {
    try {
      cacheUtils.clear()
      showNotification("success", "Đã xóa cache thành công")
      fetchSystemStats()
    } catch (error) {
      console.error("Error clearing cache:", error)
      showNotification("error", "Không thể xóa cache")
    }
  }

  const handleClearLogs = async () => {
    try {
      logger.clearLogs()
      showNotification("success", "Đã xóa logs thành công")
      fetchSystemStats()
    } catch (error) {
      console.error("Error clearing logs:", error)
      showNotification("error", "Không thể xóa logs")
    }
  }

  const handleExportLogs = async () => {
    try {
      const logsData = logger.exportLogs()
      const blob = new Blob([logsData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `logs-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showNotification("success", "Đã export logs thành công")
    } catch (error) {
      console.error("Error exporting logs:", error)
      showNotification("error", "Không thể export logs")
    }
  }

  const handleCreateBackup = async () => {
    try {
      const backupData = await backupManager.createBackup()
      const backupContent = await backupManager.exportBackupToFile(backupData)

      const blob = new Blob([backupContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showNotification("success", "Đã tạo backup thành công")
    } catch (error) {
      console.error("Error creating backup:", error)
      showNotification("error", "Không thể tạo backup")
    }
  }

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const result = await backupManager.importBackupFromFile(content)

      if (result.success) {
        showNotification("success", `Restore thành công: ${result.message}`)
        fetchSystemStats()
      } else {
        showNotification("error", `Restore thất bại: ${result.message}`)
      }
    } catch (error) {
      console.error("Error importing backup:", error)
      showNotification("error", "Không thể import backup")
    }
  }

  const fetchLogs = async (level?: string) => {
    try {
      const logsData = level ? logger.getLogs(undefined, undefined, level) : logger.getLogs()
      setLogs(logsData)
    } catch (error) {
      console.error("Error fetching logs:", error)
      showNotification("error", "Không thể tải logs")
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={fetchSystemStats}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Tổng quan" },
            { id: "logs", name: "Logs" },
            { id: "backup", name: "Backup" },
            { id: "cache", name: "Cache" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Users</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Shortlinks</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalShortlinks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Time Schedules</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalTimeSchedules}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalAnalytics}</p>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">System Logs</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchLogs()}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                All
              </button>
              <button
                onClick={() => fetchLogs("error")}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Errors
              </button>
              <button
                onClick={() => fetchLogs("warn")}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Warnings
              </button>
              <button
                onClick={handleExportLogs}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export
              </button>
              <button
                onClick={handleClearLogs}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có logs</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              log.level === "error"
                                ? "bg-red-100 text-red-800"
                                : log.level === "warn"
                                ? "bg-yellow-100 text-yellow-800"
                                : log.level === "info"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {log.level.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{log.timestamp}</span>
                        </div>
                        {log.action && <span className="text-xs text-gray-400">{log.action}</span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-900">{log.message}</p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">Metadata</summary>
                          <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Restore</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Create Backup</h4>
                <button
                  onClick={handleCreateBackup}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Full Backup
                </button>
                <p className="text-sm text-gray-500">Tạo backup toàn bộ dữ liệu hệ thống</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Restore Backup</h4>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-sm text-gray-500">Import backup từ file JSON</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache Tab */}
      {activeTab === "cache" && stats && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Analytics Cache</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Size: {stats.cacheStats.analytics.size} / {stats.cacheStats.analytics.max}
                  </p>
                  <p className="text-sm text-gray-600">TTL: {stats.cacheStats.analytics.ttl}ms</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Shortlinks Cache</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Size: {stats.cacheStats.shortlinks.size} / {stats.cacheStats.shortlinks.max}
                  </p>
                  <p className="text-sm text-gray-600">TTL: {stats.cacheStats.shortlinks.ttl}ms</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleClearCache}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
