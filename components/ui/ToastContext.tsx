'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container (Top-Left) */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in slide-in-from-top-2 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-[#fffaf3]/95 border-[#3e6b48]/30 text-[#3e6b48]'
                : toast.type === 'error'
                ? 'bg-[#fffaf3]/95 border-[#9e3b32]/30 text-[#9e3b32]'
                : 'bg-[#fffaf3]/95 border-[#dfcdbb] text-[#3b2720]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#3e6b48]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#9e3b32]" />}
            {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#a85d35]" />}

            <div className="flex-1 text-sm font-medium text-[#3b2720] leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#806d61] hover:text-[#3b2720] p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
