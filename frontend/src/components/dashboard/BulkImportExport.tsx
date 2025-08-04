"use client"

import { useState } from "react"
import { Shortlink } from "@/types"

interface BulkImportExportProps {
  onImport: (shortlinks: Partial<Shortlink>[]) => Promise<void>
  onExport: () => void
  shortlinks: Shortlink[]
}

export default function BulkImportExport({ onImport, onExport, shortlinks }: BulkImportExportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importData, setImportData] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      showNotification("error", "Vui lòng nhập dữ liệu để import")
      return
    }

    setIsImporting(true)
    try {
      let parsedData: Partial<Shortlink>[]

      try {
        // Try parsing as JSON first
        parsedData = JSON.parse(importData)
      } catch {
        // If JSON fails, try parsing as CSV
        parsedData = parseCSV(importData)
      }

      if (!Array.isArray(parsedData)) {
        throw new Error("Dữ liệu phải là một mảng")
      }

      await onImport(parsedData)
      setImportData("")
      setShowImportModal(false)
      showNotification("success", `Import thành công ${parsedData.length} shortlinks!`)
    } catch (error) {
      console.error("Import error:", error)
      showNotification("error", "Có lỗi xảy ra khi import. Vui lòng kiểm tra định dạng dữ liệu.")
    } finally {
      setIsImporting(false)
    }
  }

  const parseCSV = (csvData: string): Partial<Shortlink>[] => {
    const lines = csvData.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const shortlinks: Partial<Shortlink>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const shortlink: Partial<Shortlink> = {}

      headers.forEach((header, index) => {
        const value = values[index]
        switch (header.toLowerCase()) {
          case "targeturl":
            shortlink.targetUrl = value
            break
          case "title":
            shortlink.title = value
            break
          case "description":
            shortlink.description = value
            break
          case "ispasswordprotected":
            shortlink.isPasswordProtected = value.toLowerCase() === "true"
            break
          case "password":
            shortlink.password = value
            break
          case "istimerestricted":
            shortlink.isTimeRestricted = value.toLowerCase() === "true"
            break
          case "expiresat":
            if (value) {
              shortlink.expiresAt = new Date(value)
            }
            break
        }
      })

      if (shortlink.targetUrl) {
        shortlinks.push(shortlink)
      }
    }

    return shortlinks
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport()
      showNotification("success", "Export thành công!")
    } catch (error) {
      console.error("Export error:", error)
      showNotification("error", "Có lỗi xảy ra khi export")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "targetUrl",
      "title",
      "description",
      "isPasswordProtected",
      "isTimeRestricted",
      "expiresAt",
      "isActive",
      "shortCode"
    ]

    const csvData = [
      headers.join(","),
      ...shortlinks.map((shortlink) =>
        [
          `"${shortlink.targetUrl}"`,
          `"${shortlink.title || ""}"`,
          `"${shortlink.description || ""}"`,
          shortlink.isPasswordProtected,
          shortlink.isTimeRestricted,
          shortlink.expiresAt ? `"${shortlink.expiresAt}"` : "",
          shortlink.isActive,
          `"${shortlink.shortCode}"`
        ].join(",")
      )
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `shortlinks-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalShortlinks: shortlinks.length,
      shortlinks: shortlinks.map((shortlink) => ({
        targetUrl: shortlink.targetUrl,
        title: shortlink.title,
        description: shortlink.description,
        isPasswordProtected: shortlink.isPasswordProtected,
        isTimeRestricted: shortlink.isTimeRestricted,
        expiresAt: shortlink.expiresAt,
        isActive: shortlink.isActive,
        shortCode: shortlink.shortCode
      }))
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json;charset=utf-8;"
    })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `shortlinks-${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

      {/* Import/Export Buttons */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Import/Export</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Import Shortlinks
          </button>
          <button onClick={exportToCSV} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export CSV
          </button>
          <button onClick={exportToJSON} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Export JSON
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Import/Export shortlinks theo định dạng CSV hoặc JSON</p>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-3/4 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import Shortlinks</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dữ liệu (CSV hoặc JSON)</label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={10}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`CSV format:
targetUrl,title,description,isPasswordProtected,isTimeRestricted
https://example.com,My Link,Description,false,false

JSON format:
[
  {
    "targetUrl": "https://example.com",
    "title": "My Link",
    "description": "Description",
    "isPasswordProtected": false,
    "isTimeRestricted": false
  }
]`}
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    <strong>CSV Format:</strong> targetUrl,title,description,isPasswordProtected,isTimeRestricted
                  </p>
                  <p>
                    <strong>JSON Format:</strong> Array of objects with shortlink properties
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isImporting ? "Đang import..." : "Import"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
