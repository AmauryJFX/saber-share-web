import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCursos, getServicios } from '../api/api'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIAS = [
  { key: 'TODOS', label: 'Todos',     icon: '🌐', color: '#2E70FF', bg: 'rgba(46,112,255,0.10)' },
  { key: 'CURSO', label: 'Cursos',    icon: '📚', color: '#65A30D', bg: 'rgba(101,163,13,0.10)' },
  { key: 'CLASE', label: '1 a 1',     icon: '🎓', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
]

export default function Inicio() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [publicaciones, setPublicaciones] = useState([])
  const [filtradas, setFiltradas]         = useState([])
  const [filtro, setFiltro]               = useState('TODOS')
  const [busqueda, setBusqueda]           = useState('')
  const [loading, setLoading]             = useState(true)

  useEffect(() => { cargar() }, [])
  useEffect(() => {
    let lista = publicaciones
    if (filtro === 'CURSO') lista = lista.filter(p => p.tipo === 'CURSO')
    if (filtro === 'CLASE') lista = lista.filter(p => p.tipo === 'CLASE')
    if (busqueda) lista = lista.filter(p => p.titulo?.toLowerCase().includes(busqueda.toLowerCase()))
    setFiltradas(lista)
  }, [filtro, busqueda, publicaciones])

  const cargar = async () => {
    setLoading(true)
    try {
      const [cursos, servicios] = await Promise.all([getCursos(), getServicios()])
      const lista = [
        ...(cursos.data || []).map(c => ({
          tipo: 'CURSO', id: c.idCurso, titulo: c.titulo,
          descripcion: c.descripcion, precio: c.precio,
          autor: c.nombreUsuario, autorId: c.usuarioId,
          calificacion: c.calificacion || '0',
        })),
        ...(servicios.data || []).map(s => ({
          tipo: 'CLASE', id: s.servicioId, titulo: s.titulo,
          descripcion: s.descripcion, precio: s.precio,
          autor: s.nombreUsuario, autorId: s.usuarioId,
          calificacion: '0',
        })),
      ]
      setPublicaciones(lista)
    } catch {}
    finally { setLoading(false) }
  }

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const inicial = usuario?.nombre?.charAt(0).toUpperCase() || 'U'

  const totalCursos  = publicaciones.filter(p => p.tipo === 'CURSO').length
  const totalClases  = publicaciones.filter(p => p.tipo === 'CLASE').length

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 100 }}>
      <style>{`
        .inicio-search {
          background: #F8FAFC !important;
          border: 1.5px solid #E2E8F0 !important;
          color: #0F172A !important;
          font-family: Inter, sans-serif !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .inicio-search:focus {
          border-color: #2E70FF !important;
          box-shadow: 0 0 0 3px rgba(46,112,255,0.10) !important;
          outline: none !important;
        }
        .inicio-search::placeholder { color: #94A3B8; }
        .shimmer {
          background: linear-gradient(90deg, #F1F5F9 0%, #E8EDF4 50%, #F1F5F9 100%);
          background-size: 200% 100%;
          animation: shimmer-anim 1.4s ease-in-out infinite;
        }
        @keyframes shimmer-anim {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .cat-pill { transition: all 0.2s ease; }
        .cat-pill:hover { transform: translateY(-2px); }
      `}</style>

      {/* ── HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(145deg, #EEF4FF 0%, #F5FFF0 60%, #F0F7FF 100%)',
          borderBottom: '1px solid #E2E8F0',
          padding: '28px 22px 22px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background orbs */}
        <div style={{ position:'absolute', top:-70, right:-70, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.09) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-50, left:-40, width:190, height:190, borderRadius:'50%', background:'radial-gradient(circle, rgba(101,163,13,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%', right:'20%', width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* User row */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, position:'relative' }}>
          <motion.div
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/perfil')}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2E70FF, #65A30D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 22,
              fontFamily: 'Syne, sans-serif', flexShrink: 0,
              boxShadow: '0 6px 20px rgba(46,112,255,0.28)',
              cursor: 'pointer',
            }}
          >{inicial}</motion.div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 2 }}>{saludo} 👋</p>
            <h1 style={{ fontSize: 20, lineHeight: 1.1, fontFamily: 'Syne, sans-serif', color: '#0F172A', margin: 0 }}>
              {usuario?.nombre}
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={cargar}
            style={{
              width: 38, height: 38, borderRadius: 12, border: '1px solid rgba(226,232,240,0.9)',
              background: 'rgba(255,255,255,0.8)', color: '#64748B',
              cursor: 'pointer', fontSize: 16, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
          >↻</motion.button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:10, position:'relative' }}>
          {[
            { label:'Publicaciones', value: publicaciones.length, icon:'📋', color:'#2E70FF' },
            { label:'Cursos', value: totalCursos, icon:'📚', color:'#65A30D' },
            { label:'Clases 1·1', value: totalClases, icon:'🎓', color:'#8b5cf6' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', damping: 18 }}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(226,232,240,0.8)',
                borderRadius: 14, padding: '10px 6px', textAlign: 'center',
                boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <p style={{ fontSize: 16, marginBottom: 1 }}>{s.icon}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'Syne', lineHeight: 1, margin: '2px 0' }}>{s.value}</p>
              <p style={{ fontSize: 9, color: '#94A3B8', marginTop: 2, letterSpacing: '0.03em' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div style={{ padding: '18px 18px 0', maxWidth: 1200, margin: '0 auto' }}>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, pointerEvents: 'none', zIndex: 1, opacity: 0.6,
          }}>🔍</span>
          <input
            className="inicio-search"
            placeholder="Buscar cursos, clases, instructores..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIAS.map(cat => {
            const activo = filtro === cat.key
            return (
              <motion.button
                key={cat.key}
                className="cat-pill"
                onClick={() => setFiltro(cat.key)}
                whileTap={{ scale: 0.94 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 24, flexShrink: 0,
                  border: activo ? 'none' : `1.5px solid #E2E8F0`,
                  background: activo
                    ? `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`
                    : '#F8FAFC',
                  color: activo ? '#fff' : '#64748B',
                  fontWeight: activo ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: activo ? `0 6px 18px ${cat.color}38` : 'none',
                  transition: 'all 0.22s ease',
                }}
              >
                <span style={{ fontSize: 15 }}>{cat.icon}</span>
                {cat.label}
                {activo && filtradas.length > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.25)',
                    borderRadius: 10, padding: '1px 7px',
                    fontSize: 11, fontWeight: 700,
                    marginLeft: 2,
                  }}>{filtradas.length}</span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Section header */}
        <AnimatePresence mode="wait">
          {!loading && filtradas.length > 0 && (
            <motion.div
              key={filtro + busqueda}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                {busqueda
                  ? `"${busqueda}" — ${filtradas.length} resultado${filtradas.length !== 1 ? 's' : ''}`
                  : filtro === 'TODOS'
                    ? `Explorar todo el contenido`
                    : filtro === 'CURSO'
                      ? `Cursos disponibles`
                      : `Clases 1 a 1`
                }
              </p>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{filtradas.length} items</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : filtradas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 14, padding: '60px 20px',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(46,112,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
            }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'Syne' }}>
              {busqueda ? 'Sin resultados' : 'Sin publicaciones aún'}
            </p>
            <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
              {busqueda
                ? `No encontramos nada para "${busqueda}"`
                : 'Sé el primero en publicar contenido'}
            </p>
            {busqueda && (
              <button onClick={() => setBusqueda('')} style={{
                padding: '9px 22px', borderRadius: 12, border: '1px solid #E2E8F0',
                background: '#F8FAFC', color: '#64748B', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>Limpiar búsqueda</button>
            )}
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {filtradas.map((p, index) => (
              <PublicacionCard
                key={`${p.tipo}-${p.id}`}
                p={p}
                index={index}
                esMia={p.autorId === usuario?.id}
                onClick={() => navigate(`/detalle/${p.tipo}/${p.id}`, { state: p })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          background: '#F8FAFC', border: '1px solid #E2E8F0',
          borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
        }}>
          <div className="shimmer" style={{ width: '100%', height: 140 }} />
          <div style={{ padding: 18 }}>
            <div className="shimmer" style={{ width: 70, height: 20, borderRadius: 8, marginBottom: 12 }} />
            <div className="shimmer" style={{ width: '90%', height: 18, borderRadius: 6, marginBottom: 8 }} />
            <div className="shimmer" style={{ width: '65%', height: 16, borderRadius: 6, marginBottom: 14 }} />
            <div className="shimmer" style={{ width: '100%', height: 12, borderRadius: 6, marginBottom: 6 }} />
            <div className="shimmer" style={{ width: '80%', height: 12, borderRadius: 6, marginBottom: 14 }} />
            <div style={{ height: 1, background: '#E2E8F0', marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="shimmer" style={{ width: 80, height: 13, borderRadius: 6 }} />
              <div className="shimmer" style={{ width: 55, height: 22, borderRadius: 8 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PublicacionCard({ p, esMia, onClick, index }) {
  const esCurso = p.tipo === 'CURSO'
  const accentColor = esCurso ? '#65A30D' : '#8b5cf6'
  const imgSrc = esCurso
    ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80'
    : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80'

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.38 }}
      whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(15,23,42,0.12)' }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: '#FFFFFF', border: '1px solid #E8EDF4',
        borderRadius: 20, cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 3px 14px rgba(15,23,42,0.07)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Accent top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${esCurso ? '#4D7C0F' : '#7c3aed'})`,
        opacity: 0.8,
      }} />

      {/* Cover image */}
      <div style={{ position: 'relative' }}>
        <img
          src={imgSrc}
          alt={p.tipo}
          style={{ width: '100%', height: 136, objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(transparent 45%, rgba(255,255,255,0.96))',
        }} />
        {/* "Tuya" badge */}
        {esMia && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            color: '#65A30D', fontSize: 9, padding: '3px 9px',
            borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em',
            border: '1px solid rgba(101,163,13,0.25)',
            boxShadow: '0 2px 8px rgba(15,23,42,0.1)',
          }}>TU PUBL.</div>
        )}
      </div>

      <div style={{ padding: '14px 18px 18px' }}>
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: esCurso ? 'rgba(101,163,13,0.12)' : 'rgba(139,92,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}>
            {esCurso ? '📚' : '🎓'}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: accentColor,
          }}>
            {esCurso ? 'CURSO' : 'CLASE 1 A 1'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontFamily: 'Syne, sans-serif', marginBottom: 7,
          lineHeight: 1.35, color: '#0F172A',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{p.titulo}</h3>

        {/* Description */}
        <p style={{
          color: '#64748B', fontSize: 12.5, lineHeight: 1.55, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{p.descripcion}</p>

        {/* Divider */}
        <div style={{ height: 1, background: '#F1F5F9', marginBottom: 12 }} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: `linear-gradient(135deg, ${accentColor}, ${esCurso ? '#4D7C0F' : '#7c3aed'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff',
              }}>
                {(p.autor || 'A').charAt(0).toUpperCase()}
              </div>
              <p style={{ color: '#94A3B8', fontSize: 11 }}>{p.autor}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: '#fbbf24', fontSize: 11 }}>★</span>
              <p style={{ color: '#64748B', fontSize: 11 }}>{p.calificacion || '0.0'}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 8, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 1 }}>PRECIO</p>
            <p style={{ color: accentColor, fontSize: 20, fontWeight: 800, fontFamily: 'Syne', lineHeight: 1 }}>
              ${p.precio?.toFixed(2)}
            </p>
            <p style={{ fontSize: 9, color: '#94A3B8' }}>MXN</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
