import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { iniciarPago, confirmarPago } from '../api/api'

const RETURN_URL = 'https://saber-share-webb.vercel.app/paypal-return'
const CANCEL_URL = 'https://saber-share-webb.vercel.app/'

export default function Comprar() {
  const { tipo, id } = useParams()
  const { state: pub } = useLocation()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [exitoso, setExitoso] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentId = params.get('paymentId')
    const payerId   = params.get('PayerID')

    if (paymentId && payerId) {
      const saved = JSON.parse(sessionStorage.getItem('paypal_pending') || '{}')
      if (saved.itemId && saved.tipo && saved.usuarioId) {
        procesarConfirmacion(paymentId, payerId, saved)
      }
    }
  }, [])

  const procesarConfirmacion = async (paymentId, payerId, saved) => {
    setLoading(true)
    try {
      await confirmarPago(paymentId, payerId, saved.usuarioId, saved.itemId, saved.tipo)
      sessionStorage.removeItem('paypal_pending')
      setExitoso(true)
      // Navegar al inicio después de 2 segundos para que recargue el historial
      setTimeout(() => navigate('/'), 2500)
    } catch {
      setError('No se pudo confirmar el pago. Contacta soporte.')
      setLoading(false)
    }
  }

  const handlePagar = async () => {
    setLoading(true); setError('')
    try {
      sessionStorage.setItem('paypal_pending', JSON.stringify({
        itemId: parseInt(id), tipo, usuarioId: usuario.id
      }))
      const res = await iniciarPago({
        itemId: parseInt(id), tipo,
        usuarioId: usuario.id,
        returnUrl: RETURN_URL,
        cancelUrl: CANCEL_URL,
      })
      if (res.data?.approvalUrl) {
        window.location.href = res.data.approvalUrl
      } else {
        setError('No se recibió la URL de PayPal. Intenta de nuevo.')
        setLoading(false)
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje
        || err.response?.data?.message
        || err.response?.data
        || (err.code === 'ECONNABORTED' ? 'El servidor tardó demasiado. El backend puede estar iniciando, espera unos segundos e intenta de nuevo.' : null)
        || 'Error de conexión con el servidor. Verifica tu internet e intenta de nuevo.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
      setLoading(false)
    }
  }

  // Pantalla de éxito
  if (exitoso) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 20, padding: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, #84cc16 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 40px rgba(163,230,53,0.4)',
        }}>✅</div>
        <h2 style={{ fontSize: 26, fontFamily: 'Syne, sans-serif', textAlign: 'center' }}>
          ¡Pago exitoso!
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 15 }}>
          Tu compra ha sido registrada.<br />Redirigiendo al inicio...
        </p>
        <div className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  // Si estamos en /paypal-return pero aún procesando
  if (!pub && !exitoso) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Procesando tu pago...</p>
        {error && <p className="error-msg">{error}</p>}
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      paddingBottom: 100, position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow fondo */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,112,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          color: '#0F172A', borderRadius: 10, padding: '6px 14px',
          fontSize: 13, cursor: 'pointer', marginBottom: 24,
          boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
        }}>← Volver</button>

        <h1 style={{ fontSize: 26, fontFamily: 'Syne, sans-serif', marginBottom: 4 }}>
          Confirmar compra
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Serás redirigido a PayPal para completar el pago
        </p>

        {/* Resumen */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(46,112,255,0.04) 100%)',
          border: '1px solid var(--border)', borderRadius: 20, padding: 22, marginBottom: 16,
        }}>
          <span className={`tag tag-${tipo === 'CURSO' ? 'curso' : 'clase'}`}
            style={{ marginBottom: 14, display: 'inline-block' }}>
            {tipo === 'CURSO' ? '📚 CURSO' : '🎓 CLASE'}
          </span>
          <h2 style={{ fontSize: 18, fontFamily: 'Syne, sans-serif', marginBottom: 10 }}>{pub?.titulo}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
            {pub?.descripcion}
          </p>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Subtotal</span>
              <span style={{ fontSize: 14 }}>${pub?.precio?.toFixed(2)} MXN</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--accent)', fontFamily: 'Syne' }}>
                ${pub?.precio?.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>

        {/* Vendedor */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent-blue), #5b9aff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#fff', fontSize: 16,
          }}>{pub?.autor?.charAt(0).toUpperCase()}</div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Vendedor</p>
            <p style={{ fontWeight: 600 }}>{pub?.autor}</p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Recibirá</p>
            <p style={{ color: 'var(--accent)', fontWeight: 700 }}>
              ${(pub?.precio * 0.9)?.toFixed(2)}
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <p style={{ color: '#ef4444', fontSize: 13, lineHeight: 1.55 }}>{error}</p>
            </div>
            <button onClick={handlePagar} style={{
              width: '100%', height: 38, borderRadius: 10, border: 'none',
              background: 'rgba(239,68,68,0.12)', color: '#ef4444',
              fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}>↻ Reintentar</button>
          </div>
        )}

        {/* Botón PayPal */}
        <button onClick={handlePagar} disabled={loading}
          style={{
            width: '100%', height: 54, borderRadius: 14, border: 'none',
            background: loading ? 'var(--bg-card)' : '#0070ba',
            color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: loading ? 'none' : '0 8px 24px rgba(0,112,186,0.35)',
            transition: 'all 0.2s', marginBottom: 12,
          }}>
          {loading
            ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: '#fff' }} />Conectando con PayPal...</>
            : '🔒 Pagar con PayPal'
          }
        </button>

        <button onClick={() => navigate(-1)} style={{
          width: '100%', height: 46, borderRadius: 14,
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
        }}>Cancelar</button>
      </div>
    </div>
  )
}