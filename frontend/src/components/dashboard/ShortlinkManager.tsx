"use client"

import { useState, useEffect } from "react"
import { Shortlink } from "@/types"
import TimeScheduleManager from "./TimeScheduleManager"
import QRCodeModal from "./QRCodeModal"

export default function ShortlinkManager() {
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([])
  const [filteredShortlinks, setFilteredShortlinks] = useState<Shortlink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingShortlink, setEditingShortlink] = useState<Shortlink | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingShortlink, setDeletingShortlink] = useState<Shortlink | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedShortlinkForQR, setSelectedShortlinkForQR] = useState<Shortlink | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "timeschedule">("list")
  const [selectedShortlink, setSelectedShortlink] = useState<Shortlink | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [formData, setFormData] = useState({
    targetUrl: "",
    title: "",
    description: "",
    isPasswordProtected: false,
    password: "",
    isTimeRestricted: false,
    expiresAt: ""
  })

  useEffect(() => {
    fetchShortlinks()
  }, [])

  useEffect(() => {
    filterShortlinks()
  }, [shortlinks, searchTerm, statusFilter])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const filterShortlinks = () => {
    let filtered = shortlinks

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (shortlink) =>
          shortlink.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortlink.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortlink.targetUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortlink.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((shortlink) => (statusFilter === "active" ? shortlink.isActive : !shortlink.isActive))
    }

    setFilteredShortlinks(filtered)
  }

  const fetchShortlinks = async () => {
    try {
      const response = await fetch("/api/shortlinks")
      if (response.ok) {
        const data = await response.json()
        setShortlinks(data)
      }
    } catch (error) {
      console.error("Error fetching shortlinks:", error)
      showNotification("error", "Không thể tải danh sách shortlinks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/shortlinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({
          targetUrl: "",
          title: "",
          description: "",
          isPasswordProtected: false,
          password: "",
          isTimeRestricted: false,
          expiresAt: ""
        })
        setShowCreateForm(false)
        fetchShortlinks()
        showNotification("success", "Tạo shortlink thành công!")
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error creating shortlink:", error)
      showNotification("error", "Không thể tạo shortlink")
    }
  }

  const handleEdit = (shortlink: Shortlink) => {
    setEditingShortlink(shortlink)
    setFormData({
      targetUrl: shortlink.targetUrl,
      title: shortlink.title || "",
      description: shortlink.description || "",
      isPasswordProtected: shortlink.isPasswordProtected,
      password: "",
      isTimeRestricted: shortlink.isTimeRestricted,
      expiresAt: shortlink.expiresAt ? new Date(shortlink.expiresAt).toISOString().slice(0, 16) : ""
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingShortlink) return

    try {
      const response = await fetch("/api/shortlinks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: editingShortlink.id,
          ...formData
        })
      })

      if (response.ok) {
        setShowEditForm(false)
        setEditingShortlink(null)
        setFormData({
          targetUrl: "",
          title: "",
          description: "",
          isPasswordProtected: false,
          password: "",
          isTimeRestricted: false,
          expiresAt: ""
        })
        fetchShortlinks()
        showNotification("success", "Cập nhật shortlink thành công!")
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error updating shortlink:", error)
      showNotification("error", "Không thể cập nhật shortlink")
    }
  }

  const handleDelete = (shortlink: Shortlink) => {
    setDeletingShortlink(shortlink)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!deletingShortlink) return

    try {
      const response = await fetch(`/api/shortlinks?id=${deletingShortlink.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        setDeletingShortlink(null)
        fetchShortlinks()
        showNotification("success", "Xóa shortlink thành công!")
      } else {
        const errorData = await response.json()
        showNotification("error", errorData.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Error deleting shortlink:", error)
      showNotification("error", "Không thể xóa shortlink")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(url)
    showNotification("success", "Đã copy link vào clipboard!")
  }

  const handleManageTimeschedule = (shortlink: Shortlink) => {
    setSelectedShortlink(shortlink)
    setActiveTab("timeschedule")
  }

  const handleBackToList = () => {
    setSelectedShortlink(null)
    setActiveTab("list")
  }

  const handleShowQRCode = (shortlink: Shortlink) => {
    setSelectedShortlinkForQR(shortlink)
    setShowQRModal(true)
  }

  const handleDuplicate = (shortlink: Shortlink) => {
    setFormData({
      targetUrl: shortlink.targetUrl,
      title: `${shortlink.title || shortlink.shortCode} (Copy)`,
      description: shortlink.description || "",
      isPasswordProtected: shortlink.isPasswordProtected,
      password: "",
      isTimeRestricted: shortlink.isTimeRestricted,
      expiresAt: shortlink.expiresAt ? new Date(shortlink.expiresAt).toISOString().slice(0, 16) : ""
    })
    setShowCreateForm(true)
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

      {/* QR Code Modal */}
      {selectedShortlinkForQR && (
        <QRCodeModal
          shortlink={selectedShortlinkForQR}
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false)
            setSelectedShortlinkForQR(null)
          }}
        />
      )}

      {/* TimeSchedule View */}
      {activeTab === "timeschedule" && selectedShortlink && (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <button onClick={handleBackToList} className="text-indigo-600 hover:text-indigo-900">
              ← Quay lại danh sách
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              Lịch trình cho: {selectedShortlink.title || selectedShortlink.shortCode}
            </h3>
          </div>
          <TimeScheduleManager shortlinkId={selectedShortlink.id} />
        </div>
      )}

      {/* Shortlinks List View */}
      {activeTab === "list" && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Quản lý Shortlink</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Tạo Shortlink mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Tìm theo tên, code, URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Hiển thị {filteredShortlinks.length} / {shortlinks.length} shortlinks
                </div>
              </div>
            </div>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo Shortlink mới</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
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
                      name="isTimeRestricted"
                      checked={formData.isTimeRestricted}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Giới hạn thời gian</label>
                  </div>

                  {formData.isTimeRestricted && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thời gian hết hạn</label>
                      <input
                        type="datetime-local"
                        name="expiresAt"
                        value={formData.expiresAt}
                        onChange={handleChange}
                        required={formData.isTimeRestricted}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}
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
                    Tạo Shortlink
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Form */}
          {showEditForm && editingShortlink && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa Shortlink</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
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
                        Mật khẩu {editingShortlink.isPasswordProtected && "(để trống nếu không thay đổi)"}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={editingShortlink.isPasswordProtected ? "Để trống nếu không thay đổi" : ""}
                      />
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isTimeRestricted"
                      checked={formData.isTimeRestricted}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Giới hạn thời gian</label>
                  </div>

                  {formData.isTimeRestricted && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thời gian hết hạn</label>
                      <input
                        type="datetime-local"
                        name="expiresAt"
                        value={formData.expiresAt}
                        onChange={handleChange}
                        required={formData.isTimeRestricted}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingShortlink(null)
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
          {showDeleteConfirm && deletingShortlink && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Bạn có chắc chắn muốn xóa shortlink &quot;{deletingShortlink.title || deletingShortlink.shortCode}
                    &quot;? Hành động này không thể hoàn tác.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeletingShortlink(null)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shortlinks List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredShortlinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Không tìm thấy shortlink nào phù hợp với bộ lọc"
                  : "Chưa có shortlink nào. Hãy tạo shortlink đầu tiên!"}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredShortlinks.map((shortlink) => (
                  <li key={shortlink.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {shortlink.title || shortlink.shortCode}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {shortlink.shortCode}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{shortlink.targetUrl}</p>
                        {shortlink.description && <p className="text-sm text-gray-600 mt-1">{shortlink.description}</p>}
                        <div className="flex items-center space-x-4 mt-2">
                          {shortlink.isPasswordProtected && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              🔒 Có mật khẩu
                            </span>
                          )}
                          {shortlink.isTimeRestricted && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              ⏰ Có thời hạn
                            </span>
                          )}
                          {!shortlink.isActive && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              ❌ Không hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(shortlink.shortCode)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          title="Copy link"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleShowQRCode(shortlink)}
                          className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                          title="QR Code"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => handleEdit(shortlink)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          title="Sửa"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDuplicate(shortlink)}
                          className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                          title="Duplicate"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleManageTimeschedule(shortlink)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                          title="Lịch trình"
                        >
                          Lịch trình
                        </button>
                        <button
                          onClick={() => handleDelete(shortlink)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          title="Xóa"
                        >
                          Xóa
                        </button>
                        <a
                          href={`/${shortlink.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                          title="Test link"
                        >
                          Test
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}

