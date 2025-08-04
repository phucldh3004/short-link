"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ShortlinkManager from "./ShortlinkManager"
import Analytics from "../analytics/Analytics"
import BulkImportExport from "./BulkImportExport"
import { Shortlink } from "@/types"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"shortlinks" | "analytics" | "import">("shortlinks")
  const [stats, setStats] = useState({
    totalShortlinks: 0,
    activeShortlinks: 0,
    totalClicks: 0,
    todayClicks: 0
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/shortlinks")
      if (response.ok) {
        const shortlinks = await response.json()
        setStats({
          totalShortlinks: shortlinks.length,
          activeShortlinks: shortlinks.filter((s: Shortlink) => s.isActive).length,
          totalClicks: 0, // TODO: Calculate from analytics
          todayClicks: 0 // TODO: Calculate from analytics
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleImport = async (shortlinks: Partial<Shortlink>[]) => {
    try {
      const promises = shortlinks.map((shortlink) =>
        fetch("/api/shortlinks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(shortlink)
        })
      )

      await Promise.all(promises)
      fetchStats() // Refresh stats after import
    } catch (error) {
      console.error("Error importing shortlinks:", error)
      throw error
    }
  }

  const handleExport = () => {
    // This will be handled by the BulkImportExport component
  }

  if (status === "loading") {
    return <div className="text-center py-8">Đang tải...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Chào mừng, {session.user?.name || session.user?.email}!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Tổng Shortlinks</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalShortlinks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Đang hoạt động</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeShortlinks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Tổng lượt click</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalClicks}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Hôm nay</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.todayClicks}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "shortlinks", name: "Shortlinks" },
              { id: "analytics", name: "Thống kê" },
              { id: "import", name: "Import/Export" }
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

        {/* Tab Content */}
        {activeTab === "shortlinks" && <ShortlinkManager />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "import" && (
          <BulkImportExport
            onImport={handleImport}
            onExport={handleExport}
            shortlinks={[]} // This will be populated by the component
          />
        )}
      </div>
    </div>
  )
}

