import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const links = [
  { to: '/',          emoji: '🏠', label: 'Inicio' },
  { to: '/mensajes',  emoji: '💬', label: 'Mensajes' },
  { to: '/publicar',  emoji: '➕', label: 'Publicar' },
  { to: '/historial', emoji: '📋', label: 'Historial' },
  { to: '/perfil',    emoji: '👤', label: 'Perfil' },
]

export default function Navbar() {
  const location = useLocation()
  const navRef   = useRef(null)
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!navRef.current) return
    const activeIndex = links.findIndex(l => l.to === location.pathname)
    if (activeIndex < 0) return
    const items = navRef.current.querySelectorAll('.nav-item')
    const el = items[activeIndex]
    if (!el) return
    const { offsetLeft, offsetWidth } = el
    setIndicatorStyle({
      left: offsetLeft + offsetWidth / 2 - 18,
      width: 36,
      opacity: 1,
    })
    if (!mounted) setMounted(true)
  }, [location.pathname])

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        /* Semi-transparent so backdrop-filter actually blurs content behind it */
        background: 'rgba(255,255,255,0.94)',
        borderTop: '1px solid rgba(226,232,240,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 -4px 24px rgba(15,23,42,0.07)',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 100,
        animation: 'slideUp 0.4s cubic-bezier(0.4,0,0.2,1) both',
      }}
    >
      {/* Sliding top indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        height: 3,
        borderRadius: '0 0 6px 6px',
        background: 'linear-gradient(90deg, var(--accent-blue), #5b9aff)',
        boxShadow: '0 0 16px var(--accent-glow)',
        transition: mounted
          ? 'left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)'
          : 'none',
        ...indicatorStyle,
      }} />

      {links.map((l, i) => {
        const activo = location.pathname === l.to
        return (
          <Link
            key={l.to}
            to={l.to}
            className="nav-item"
            title={l.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              position: 'relative',
              animation: `fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) ${0.05 + i * 0.06}s both`,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Icon */}
            <span style={{
              fontSize: 22,
              lineHeight: 1,
              transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
              transform: activo ? 'scale(1.28) translateY(-2px)' : 'scale(1)',
              opacity: activo ? 1 : 0.42,
              display: 'block',
              filter: activo ? 'drop-shadow(0 2px 6px rgba(46,112,255,0.35))' : 'none',
            }}>
              {l.emoji}
            </span>

            {/* Label */}
            <span style={{
              fontSize: 10,
              fontFamily: 'var(--font-display)',
              fontWeight: activo ? 700 : 400,
              letterSpacing: '0.04em',
              color: activo ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              transition: 'color 0.2s, font-weight 0.2s',
            }}>
              {l.label}
            </span>

            {/* Active background pill */}
            {activo && (
              <div style={{
                position: 'absolute',
                inset: '4px 6px',
                borderRadius: 10,
                background: 'var(--accent-blue-bg)',
                zIndex: -1,
                animation: 'scaleIn 0.25s cubic-bezier(0.4,0,0.2,1) both',
              }} />
            )}
          </Link>
        )
      })}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </nav>
  )
}
