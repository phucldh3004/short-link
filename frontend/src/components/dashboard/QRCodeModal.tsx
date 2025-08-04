"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"

interface QRCodeModalProps {
  shortlink: {
    shortCode: string
    title?: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function QRCodeModal({ shortlink, isOpen, onClose }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen && shortlink) {
      generateQRCode()
    }
  }, [isOpen, shortlink])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      const shortlinkUrl = `${window.location.origin}/${shortlink.shortCode}`
      const qrCodeDataUrl = await QRCode.toDataURL(shortlinkUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.download = `qr-${shortlink.shortCode}.png`
    link.href = qrCodeUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            QR Code cho {shortlink.title || shortlink.shortCode}
          </h3>

          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Đang tạo QR code...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="border border-gray-200 rounded-lg" />
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  Link: {window.location.origin}/{shortlink.shortCode}
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Tải xuống
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
