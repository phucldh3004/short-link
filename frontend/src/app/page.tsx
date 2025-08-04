"use client"

import { useState, useEffect } from "react"
import ShortlinkForm from "@/components/ShortlinkForm"
import ShortlinkList from "@/components/ShortlinkList"
import { ShortlinkResponseDto } from "@/lib/types"

export default function HomePage() {
  const [shortlinks, setShortlinks] = useState<ShortlinkResponseDto[]>([])

  const handleShortlinkCreated = (newShortlink: ShortlinkResponseDto) => {
    setShortlinks((prev) => [newShortlink, ...prev])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ShortlinkApp</h1>
          <p className="text-gray-600">Tạo link rút gọn nhanh chóng và dễ dàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ShortlinkForm onShortlinkCreated={handleShortlinkCreated} />
          </div>
          <div>
            <ShortlinkList />
          </div>
        </div>
      </div>
    </div>
  )
}

