import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

const BIENVENIDA = {
  texto: '¡Hola! 👋 Soy SaberBot, el asistente de SaberShare. ¿En qué puedo ayudarte hoy?',
  esUsuario: false,
  timestamp: new Date(),
}

function TypingIndicator() {
  return (
    <div style={{
      alignSelf: 'flex-start',
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '18px 18px 18px 4px',
      padding: '10px 16px',
      display: 'flex',
      gap: 5,
      alignItems: 'center',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: '#94A3B8',
          display: 'inline-block',
          animation: 'saberbot-bounce 1.2s ease infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  )
}

function formatTime(ts) {
  if (!ts) return ''
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chatbot() {
  const { usuario } = useAuth()
  const [abierto, setAbierto]     = useState(false)
  const [mensajes, setMensajes]   = useState([BIENVENIDA])
  const [inputTexto, setInput]    = useState('')
  const [cargando, setCargando]   = useState(false)
  const finRef = useRef(null)

  /* Scroll to bottom when messages change */
  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando, abierto])

  /* Keep button above the bottom navbar when user is logged in */
  const btnBottom  = usuario ? 88 : 24
  const winBottom  = usuario ? 156 : 92

  async function enviarMensaje() {
    const texto = inputTexto.trim()
    if (!texto || cargando) return

    setMensajes(prev => [...prev, { texto, esUsuario: true, timestamp: new Date() }])
    setInput('')
    setCargando(true)

    try {
      const res = await api.post('/chat', { mensaje: texto })
      setMensajes(prev => [...prev, {
        texto: res.data.respuesta,
        esUsuario: false,
        timestamp: new Date(),
      }])
    } catch {
      setMensajes(prev => [...prev, {
        texto: 'Lo siento, tuve un problema al conectarme. Intenta de nuevo.',
        esUsuario: false,
        timestamp: new Date(),
      }])
    } finally {
      setCargando(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      <style>{`
        @keyframes saberbot-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes saberbot-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(46,112,255,0.38); }
          50%       { box-shadow: 0 6px 32px rgba(46,112,255,0.65); }
        }
        .saberbot-btn:hover { transform: scale(1.10) !important; }
        .saberbot-send:disabled { opacity: 0.42; cursor: not-allowed; }
        .saberbot-input:focus {
          border-color: #2E70FF !important;
          box-shadow: 0 0 0 3px rgba(46,112,255,0.12) !important;
          outline: none !important;
        }
      `}</style>

      {/* Chat window */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.88,  y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            style={{
              position: 'fixed',
              bottom: winBottom,
              right: 20,
              width: 360,
              height: 'min(480px, calc(100dvh - 200px))',
              borderRadius: 20,
              boxShadow: '0 12px 52px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9998,
              background: '#FFFFFF',
              transformOrigin: 'bottom right',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2E70FF 0%, #1a5ce6 100%)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>🤖</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0, fontFamily: 'Syne, sans-serif' }}>SaberBot</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#86efac' }} />
                  <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: 11, margin: 0 }}>En línea · Asistente IA</p>
                </div>
              </div>
              <button
                onClick={() => setAbierto(false)}
                aria-label="Cerrar chat"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  width: 30, height: 30,
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >✕</button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: '#F8FAFC',
              padding: '14px 14px 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              {mensajes.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.esUsuario ? 'flex-end' : 'flex-start', gap: 3 }}>
                  <div style={m.esUsuario ? {
                    alignSelf: 'flex-end',
                    background: 'linear-gradient(135deg, #2E70FF 0%, #5b9aff 100%)',
                    color: '#fff',
                    borderRadius: '18px 18px 4px 18px',
                    padding: '10px 14px',
                    maxWidth: '80%',
                    fontSize: 14,
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    boxShadow: '0 4px 16px rgba(46,112,255,0.22)',
                  } : {
                    alignSelf: 'flex-start',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #E2E8F0',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '10px 14px',
                    maxWidth: '80%',
                    fontSize: 14,
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                  }}>
                    {m.texto}
                  </div>
                  <span style={{ fontSize: 10, color: '#94A3B8', paddingLeft: m.esUsuario ? 0 : 4, paddingRight: m.esUsuario ? 4 : 0 }}>
                    {formatTime(m.timestamp)}
                  </span>
                </div>
              ))}
              {cargando && <TypingIndicator />}
              <div ref={finRef} />
            </div>

            {/* Input */}
            <div style={{
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              padding: '10px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <input
                className="saberbot-input"
                value={inputTexto}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe un mensaje..."
                disabled={cargando}
                aria-label="Mensaje"
                style={{
                  flex: 1,
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 22,
                  padding: '9px 14px',
                  fontSize: 14,
                  color: '#0F172A',
                  background: '#F8FAFC',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              />
              <motion.button
                className="saberbot-send"
                onClick={enviarMensaje}
                disabled={!inputTexto.trim() || cargando}
                whileTap={{ scale: 0.9 }}
                aria-label="Enviar"
                style={{
                  width: 38, height: 38,
                  borderRadius: '50%',
                  background: inputTexto.trim() ? 'linear-gradient(135deg, #2E70FF 0%, #5b9aff 100%)' : '#F1F5F9',
                  border: 'none',
                  color: inputTexto.trim() ? '#fff' : '#94A3B8',
                  cursor: inputTexto.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                  boxShadow: inputTexto.trim() ? '0 4px 12px rgba(46,112,255,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >➤</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        className="saberbot-btn"
        onClick={() => setAbierto(v => !v)}
        whileTap={{ scale: 0.92 }}
        aria-label={abierto ? 'Cerrar chatbot' : 'Abrir chatbot'}
        style={{
          position: 'fixed',
          bottom: btnBottom,
          right: 20,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: abierto
            ? '#0F172A'
            : 'linear-gradient(135deg, #2E70FF 0%, #65A30D 100%)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: abierto
            ? '0 4px 20px rgba(15,23,42,0.3)'
            : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          zIndex: 9999,
          transition: 'background 0.25s, transform 0.2s',
          animation: abierto ? 'none' : 'saberbot-pulse 2.6s ease infinite',
        }}
      >
        <motion.span
          key={abierto ? 'close' : 'open'}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {abierto ? '✕' : '💬'}
        </motion.span>
      </motion.button>
    </>
  )
}
