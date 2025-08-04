"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function ShortlinkRedirectPage() {
  const params = useParams()
  const shortcode = params.shortlink as string
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    handleRedirect()
  }, [shortcode])

  const handleRedirect = async (providedPassword?: string) => {
    try {
      const response = await fetch(`/api/redirect/${shortcode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: providedPassword || password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to target URL
        window.location.href = data.targetUrl
      } else if (response.status === 401 && data.requiresPassword) {
        setRequiresPassword(true)
        setIsLoading(false)
      } else {
        setError(data.error || "Có lỗi xảy ra")
        setIsLoading(false)
      }
    } catch (error) {
      setError("Có lỗi xảy ra")
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleRedirect(password)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Link được bảo vệ</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Vui lòng nhập mật khẩu để truy cập</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-red-600 text-sm text-center">{error}</div>}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Truy cập
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không thể truy cập</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return null
}
