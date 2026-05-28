import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInbox } from '../api/api'
import { motion } from 'framer-motion'

export default function Inbox() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [conversaciones, setConversaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getInbox(usuario.id)
      setConversaciones(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  const sinLeer = conversaciones.reduce((a, c) => a + (c.noLeidos || 0), 0)

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          background: 'linear-gradient(135deg, #F1F5FF 0%, #FAFBFF 100%)',
          borderBottom: '1px solid #E2E8F0',
          padding: '32px 24px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Orbs */}
        <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, left:20, width:130, height:130, borderRadius:'50%', background:'radial-gradient(circle, rgba(101,163,13,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'linear-gradient(135deg, #2E70FF 0%, #5b9aff 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 8px 24px rgba(46,112,255,0.25)',
              }}>💬</div>
              <div>
                <h1 style={{ fontSize: 26, fontFamily: 'Syne, sans-serif', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>Mensajes</h1>
                <p style={{ color: '#64748B', fontSize: 13, margin: 0, marginTop: 2 }}>Tus conversaciones activas</p>
              </div>
            </div>
          </div>

          {sinLeer > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 280 }}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                color: '#fff', fontSize: 12, fontWeight: 700,
                padding: '4px 12px', borderRadius: 20,
                boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
              }}
            >{sinLeer} sin leer</motion.div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, position: 'relative' }}>
          {[
            { label: 'Conversaciones', value: conversaciones.length, icon: '💬', color: '#2E70FF' },
            { label: 'Sin leer', value: sinLeer, icon: '🔔', color: sinLeer > 0 ? '#ef4444' : '#94A3B8' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 14, padding: '12px 10px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
            }}>
              <p style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Syne', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
          <button
            onClick={cargar}
            style={{
              flex: 0.5, background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 14, cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
              transition: 'background 0.15s',
            }}
          >↻</button>
        </div>
      </motion.div>

      {/* List */}
      <div style={{ padding: '16px 16px 0', maxWidth: 520, margin: '0 auto' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : conversaciones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '64px 20px',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(46,112,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
            }}>💬</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'Syne' }}>Sin conversaciones</p>
            <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
              Compra un curso o clase para chatear con el instructor
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: 8, padding: '10px 28px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #2E70FF, #5b9aff)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(46,112,255,0.28)',
              }}
            >Explorar contenido</button>
          </motion.div>
        ) : conversaciones.map((c, i) => (
          <ConversacionCard
            key={i}
            c={c}
            index={i}
            onClick={() => navigate(`/chat/${c.otroId}/${encodeURIComponent(c.otroNombre || 'Usuario')}`)}
          />
        ))}
      </div>
    </div>
  )
}

function ConversacionCard({ c, index, onClick }) {
  const inicial = (c.otroNombre || 'U').charAt(0).toUpperCase()
  const tieneNoLeidos = (c.noLeidos || 0) > 0

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: tieneNoLeidos ? 'rgba(46,112,255,0.03)' : '#FFFFFF',
        border: `1px solid ${tieneNoLeidos ? 'rgba(46,112,255,0.18)' : '#E2E8F0'}`,
        borderRadius: 18, padding: '14px 16px', marginBottom: 10,
        cursor: 'pointer',
        boxShadow: tieneNoLeidos
          ? '0 4px 16px rgba(46,112,255,0.08)'
          : '0 2px 8px rgba(15,23,42,0.05)',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2E70FF 0%, #65A30D 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 19,
            fontFamily: 'Syne, sans-serif',
            boxShadow: '0 4px 14px rgba(46,112,255,0.22)',
          }}>{inicial}</div>

          {tieneNoLeidos && (
            <div className="badge-pulse" style={{
              position: 'absolute', top: -2, right: -2,
              width: 20, height: 20, borderRadius: '50%',
              background: '#ef4444',
              color: '#fff', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2.5px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
            }}>{c.noLeidos}</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <p style={{
              fontWeight: tieneNoLeidos ? 700 : 600,
              fontSize: 15, color: '#0F172A',
              fontFamily: tieneNoLeidos ? 'Syne, sans-serif' : 'Inter, sans-serif',
            }}>{c.otroNombre || 'Usuario'}</p>
            <p style={{ fontSize: 11, color: tieneNoLeidos ? '#2E70FF' : '#94A3B8', fontWeight: tieneNoLeidos ? 600 : 400 }}>
              {c.fechaUltimo || ''}
            </p>
          </div>
          <p style={{
            color: tieneNoLeidos ? '#0F172A' : '#94A3B8',
            fontSize: 13,
            fontWeight: tieneNoLeidos ? 500 : 400,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>{c.ultimoMensaje || 'Sin mensajes'}</p>
        </div>

        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: tieneNoLeidos ? 'rgba(46,112,255,0.08)' : '#F8FAFC',
          border: `1px solid ${tieneNoLeidos ? 'rgba(46,112,255,0.2)' : '#E2E8F0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: tieneNoLeidos ? '#2E70FF' : '#94A3B8', fontSize: 14, fontWeight: 700,
          flexShrink: 0,
        }}>›</div>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          background: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: 18, padding: '14px 16px', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '55%', height: 14, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '80%', height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
