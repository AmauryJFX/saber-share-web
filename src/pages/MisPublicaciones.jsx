import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCursos, getServicios, actualizarCurso, actualizarServicio } from '../api/api'
import { useToast } from '../context/ToastContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function MisPublicaciones() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [publicaciones, setPublicaciones] = useState([])
  const [loading, setLoading]             = useState(true)
  const [editando, setEditando]           = useState(null)
  const [form, setForm]                   = useState({})
  const [saving, setSaving]               = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [cursos, servicios] = await Promise.all([getCursos(), getServicios()])
      const lista = [
        ...(cursos.data || [])
          .filter(c => c.usuarioId === usuario.id)
          .map(c => ({ tipo: 'CURSO', id: c.idCurso, titulo: c.titulo, descripcion: c.descripcion, precio: c.precio, extra: c.foto })),
        ...(servicios.data || [])
          .filter(s => s.usuarioId === usuario.id)
          .map(s => ({ tipo: 'CLASE', id: s.servicioId, titulo: s.titulo, descripcion: s.descripcion, precio: s.precio, extra: s.requisitos })),
      ]
      setPublicaciones(lista)
    } catch {}
    finally { setLoading(false) }
  }

  const abrirEditar = (p) => {
    setEditando(p)
    setForm({ titulo: p.titulo, descripcion: p.descripcion, precio: p.precio, extra: p.extra || '' })
  }

  const guardar = async () => {
    setSaving(true)
    try {
      if (editando.tipo === 'CURSO') {
        await actualizarCurso(editando.id, {
          titulo: form.titulo, descripcion: form.descripcion,
          precio: parseFloat(form.precio), foto: form.extra,
          usuarioId: usuario.id, calificacion: '0',
        })
      } else {
        await actualizarServicio(editando.id, {
          titulo: form.titulo, descripcion: form.descripcion,
          precio: parseFloat(form.precio), requisitos: form.extra,
          usuarioId: usuario.id, fecha: '2026-01-01', hora: '00:00:00',
        })
      }
      toast('¡Publicación actualizada con éxito!', 'success')
      setEditando(null)
      cargar()
    } catch {
      toast('Error al guardar los cambios', 'error')
    }
    finally { setSaving(false) }
  }

  const cursos  = publicaciones.filter(p => p.tipo === 'CURSO').length
  const clases  = publicaciones.filter(p => p.tipo === 'CLASE').length

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          background: 'linear-gradient(135deg, #F1F5FF 0%, #FAFBFF 100%)',
          borderBottom: '1px solid #E2E8F0',
          padding: '32px 24px 24px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(101,163,13,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, left:10, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <button onClick={() => navigate(-1)} style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A',
          borderRadius: 10, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
          marginBottom: 18, display: 'inline-flex', alignItems: 'center', gap: 6,
          boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
        }}>← Volver</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, position: 'relative' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 8px 20px rgba(101,163,13,0.25)',
          }}>📁</div>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: 'Syne, sans-serif', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>Mis publicaciones</h1>
            <p style={{ color: '#64748B', fontSize: 13, margin: 0, marginTop: 3 }}>Gestiona y edita tu contenido</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          {[
            { label: 'Total', value: publicaciones.length, icon: '📋', color: '#2E70FF' },
            { label: 'Cursos', value: cursos, icon: '📚', color: '#65A30D' },
            { label: 'Clases', value: clases, icon: '🎓', color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: 14, padding: '12px 8px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
            }}>
              <p style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Syne', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* List */}
      <div style={{ padding: '16px 16px 0', maxWidth: 520, margin: '0 auto' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : publicaciones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '64px 20px',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(101,163,13,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
            }}>📭</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'Syne' }}>Sin publicaciones aún</p>
            <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 }}>
              Comparte tu conocimiento y empieza a generar ingresos
            </p>
            <button onClick={() => navigate('/publicar')} style={{
              marginTop: 8, padding: '11px 32px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(101,163,13,0.28)',
            }}>✨ Crear publicación</button>
          </motion.div>
        ) : publicaciones.map((p, i) => (
          <PublicacionCard
            key={i}
            p={p}
            index={i}
            usuario={usuario}
            onEditar={() => abrirEditar(p)}
            onVerDetalle={() => navigate(`/detalle/${p.tipo}/${p.id}`, { state: { ...p, autorId: usuario.id, autor: usuario.nombre } })}
          />
        ))}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,0.52)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              zIndex: 200,
            }}
            onClick={e => e.target === e.currentTarget && setEditando(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{
                background: '#FFFFFF',
                borderRadius: '24px 24px 0 0',
                padding: '0 0 32px',
                width: '100%',
                maxWidth: 520,
                boxShadow: '0 -12px 48px rgba(15,23,42,0.12)',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, marginBottom: 4 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E2E8F0' }} />
              </div>

              <div style={{ padding: '12px 24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontFamily: 'Syne, sans-serif', color: '#0F172A', margin: 0 }}>Editar publicación</h2>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{editando.titulo}</p>
                  </div>
                  <button onClick={() => setEditando(null)} style={{
                    width: 34, height: 34, borderRadius: '50%', border: '1px solid #E2E8F0',
                    background: '#F8FAFC', color: '#64748B', cursor: 'pointer',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>TÍTULO</label>
                    <input placeholder="Título" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>DESCRIPCIÓN</label>
                    <textarea placeholder="Descripción" value={form.descripcion} rows={3} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>PRECIO (MXN)</label>
                    <input type="number" placeholder="Precio" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                      {editando.tipo === 'CURSO' ? 'ARCHIVO / URL' : 'MODALIDAD'}
                    </label>
                    <input placeholder={editando.tipo === 'CURSO' ? 'Archivo/URL' : 'Modalidad'} value={form.extra} onChange={e => setForm({ ...form, extra: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={guardar} disabled={saving} style={{
                    flex: 1, height: 50, borderRadius: 14, border: 'none',
                    background: saving ? '#F1F5F9' : 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
                    color: saving ? '#94A3B8' : '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: 14, boxShadow: saving ? 'none' : '0 6px 20px rgba(101,163,13,0.25)',
                    transition: 'all 0.2s',
                  }}>
                    {saving ? 'Guardando...' : '💾 Guardar cambios'}
                  </button>
                  <button onClick={() => setEditando(null)} style={{
                    flex: 0.5, height: 50, borderRadius: 14,
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    color: '#64748B', cursor: 'pointer', fontSize: 14,
                  }}>Cancelar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PublicacionCard({ p, index, onEditar, onVerDetalle }) {
  const esCurso = p.tipo === 'CURSO'
  const accentColor = esCurso ? '#65A30D' : '#2E70FF'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 20, padding: 18, marginBottom: 12,
        boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
        overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accentColor}, ${esCurso ? '#4D7C0F' : '#5b9aff'})`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 4 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 700,
            marginBottom: 10, letterSpacing: '0.06em',
            background: esCurso ? 'rgba(101,163,13,0.12)' : 'rgba(46,112,255,0.12)',
            color: accentColor,
          }}>
            {esCurso ? '📚 CURSO' : '🎓 CLASE 1A1'}
          </span>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 5, color: '#0F172A', fontFamily: 'Syne, sans-serif' }}>{p.titulo}</p>
          <p style={{
            color: '#64748B', fontSize: 13, marginBottom: 12, lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{p.descripcion}</p>
          <p style={{ color: accentColor, fontWeight: 800, fontSize: 18, fontFamily: 'Syne' }}>${p.precio?.toFixed(2)} <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>MXN</span></p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onEditar} style={{
          flex: 1, height: 40, borderRadius: 12, border: '1.5px solid #E2E8F0',
          background: 'transparent', color: '#0F172A', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}>✏️ Editar</button>
        {p.tipo === 'CLASE' && (
          <button onClick={onVerDetalle} style={{
            flex: 1, height: 40, borderRadius: 12,
            background: 'rgba(46,112,255,0.08)',
            border: '1.5px solid rgba(46,112,255,0.2)',
            color: '#2E70FF', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>📅 Agenda</button>
        )}
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 18, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 80, height: 20, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '85%', height: 16, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '65%', height: 14, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: 90, height: 20 }} />
        </div>
      ))}
    </div>
  )
}
