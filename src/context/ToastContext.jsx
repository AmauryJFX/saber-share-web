import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastCtx = createContext(null)

const ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}

      {/* Toast container — sits above navbar */}
      <div style={{
        position: 'fixed',
        bottom: 90,
        left: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        zIndex: 99999,
        pointerEvents: 'none',
        alignItems: 'center',
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: -8,  scale: 0.94 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              style={{
                background: 'rgba(15,23,42,0.97)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 16,
                padding: '13px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                maxWidth: 400,
                width: '100%',
                pointerEvents: 'all',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[t.type]}</span>
              <p style={{
                color: '#F1F5F9',
                fontSize: 14,
                fontWeight: 500,
                flex: 1,
                lineHeight: 1.45,
                fontFamily: 'Inter, sans-serif',
              }}>{t.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
