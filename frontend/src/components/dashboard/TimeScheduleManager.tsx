"use client"

import { useState, useEffect } from "react"
import { TimeSchedule } from "@/types"

interface TimeScheduleManagerProps {
  shortlinkId: string
}

export default function TimeScheduleManager({ shortlinkId }: TimeScheduleManagerProps) {
  const [timeschedules, setTimeschedules] = useState<TimeSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTimeschedule, setEditingTimeschedule] = useState<TimeSchedule | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTimeschedule, setDeletingTimeschedule] = useState<TimeSchedule | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    targetUrl: "",
    startTime: "",
    endTime: "",
    isPasswordProtected: false,
    password: "",
    isActive: true
  })

  useEffect(() => {
    fetchTimeschedules()
  }, [shortlinkId])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchTimeschedules = async () => {
    try {
      const response = await fetch(`/api/timeschedules?shortlinkId=${shortlinkId}`)
      if (response.ok) {
        const data = await response.json()
        setTimeschedules(data)
      }
    } catch (error) {
      console.error("Error fetching timeschedules:", error)
      showNotification("error", "Không thể tải danh sách lịch trình")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/timeschedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shortlinkId,
          ...formData
        })
      })

      if (response.ok) {
        setFormData({
          targetUrl: "",
          startTime: "",
          endTime: "",
          isPasswordProtected: false,
          password: "",
          isActive: true
        })
        setShowCreateForm(false)
        fetchTimeschedules()
        showNotification("success", "Tạo lịch trình thành công!")
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error creating timeschedule:", error)
      showNotification("error", "Không thể tạo lịch trình")
    }
  }

  const handleEdit = (timeschedule: TimeSchedule) => {
    setEditingTimeschedule(timeschedule)
    setFormData({
      targetUrl: timeschedule.targetUrl,
      startTime: new Date(timeschedule.startTime).toISOString().slice(0, 16),
      endTime: new Date(timeschedule.endTime).toISOString().slice(0, 16),
      isPasswordProtected: timeschedule.isPasswordProtected,
      password: "",
      isActive: timeschedule.isActive
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingTimeschedule) return

    try {
      const response = await fetch("/api/timeschedules", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: editingTimeschedule.id,
          ...formData
        })
      })

      if (response.ok) {
        setShowEditForm(false)
        setEditingTimeschedule(null)
        setFormData({
          targetUrl: "",
          startTime: "",
          endTime: "",
          isPasswordProtected: false,
          password: "",
          isActive: true
        })
        fetchTimeschedules()
        showNotification("success", "Cập nhật lịch trình thành công!")
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error updating timeschedule:", error)
      showNotification("error", "Không thể cập nhật lịch trình")
    }
  }

  const handleDelete = (timeschedule: TimeSchedule) => {
    setDeletingTimeschedule(timeschedule)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deletingTimeschedule) return

    try {
      const response = await fetch(`/api/timeschedules?id=${deletingTimeschedule.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        setDeletingTimeschedule(null)
        fetchTimeschedules()
        showNotification("success", "Xóa lịch trình thành công!")
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error deleting timeschedule:", error)
      showNotification("error", "Không thể xóa lịch trình")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("vi-VN")
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
        <h3 className="text-lg font-medium text-gray-900">Lịch trình thay đổi URL</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Thêm lịch trình
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Thêm lịch trình mới</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL đích</label>
              <input
                type="url"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPasswordProtected"
                  checked={formData.isPasswordProtected}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Bảo vệ bằng mật khẩu</label>
              </div>

              {formData.isPasswordProtected && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={formData.isPasswordProtected}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Hoạt động</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Tạo lịch trình
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && editingTimeschedule && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa lịch trình</h4>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL đích</label>
              <input
                type="url"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPasswordProtected"
                  checked={formData.isPasswordProtected}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Bảo vệ bằng mật khẩu</label>
              </div>

              {formData.isPasswordProtected && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu {editingTimeschedule.isPasswordProtected && "(để trống nếu không thay đổi)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={editingTimeschedule.isPasswordProtected ? "Để trống nếu không thay đổi" : ""}
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Hoạt động</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingTimeschedule(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Cập nhật
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingTimeschedule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
              <p className="text-sm text-gray-500 mb-6">
                Bạn có chắc chắn muốn xóa lịch trình này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletingTimeschedule(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeschedules List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {timeschedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có lịch trình nào. Hãy tạo lịch trình đầu tiên!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {timeschedules.map((timeschedule) => (
              <li key={timeschedule.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{timeschedule.targetUrl}</h4>
                      {timeschedule.isPasswordProtected && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          🔒 Có mật khẩu
                        </span>
                      )}
                      {!timeschedule.isActive && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          ❌ Không hoạt động
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Từ: {formatDateTime(timeschedule.startTime)} - Đến: {formatDateTime(timeschedule.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(timeschedule)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(timeschedule)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
