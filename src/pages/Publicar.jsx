import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { crearCurso, crearServicio } from '../api/api'
import { useToast } from '../context/ToastContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Publicar() {
  const { usuario, esVendedor } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [tipo, setTipo]           = useState('CURSO')
  const [titulo, setTitulo]       = useState('')
  const [descripcion, setDesc]    = useState('')
  const [precio, setPrecio]       = useState('')
  const [archivo, setArchivo]     = useState('')
  const [modalidad, setModalidad] = useState('EN_LINEA')
  const [duracion, setDuracion]   = useState('')
  const [fecha, setFecha]         = useState('')
  const [hora, setHora]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handlePublicar = async () => {
    setError('')
    if (!titulo.trim()) { setError('El título es obligatorio'); return }
    if (!precio || isNaN(precio)) { setError('El precio es obligatorio'); return }
    if (tipo === 'CLASE' && (!fecha || !hora)) { setError('La fecha y hora son obligatorias'); return }

    setLoading(true)
    try {
      if (tipo === 'CURSO') {
        await crearCurso({
          titulo, descripcion, precio: parseFloat(precio),
          foto: archivo, usuarioId: usuario.id, calificacion: '0',
        })
      } else {
        await crearServicio({
          titulo, descripcion, precio: parseFloat(precio),
          requisitos: modalidad, fecha, hora: hora + ':00',
          usuarioId: usuario.id,
        })
      }
      toast('¡Publicación creada exitosamente! 🚀', 'success')
      navigate('/')
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Tu cuenta no tiene permisos para publicar. Necesitas registrarte como vendedor (rol CHALAN).')
      } else {
        setError('Error al publicar. Intenta de nuevo.')
      }
    } finally { setLoading(false) }
  }

  const tieneContenido = titulo.trim() || descripcion.trim() || precio

  // Guard: only vendors (CHALAN / ADMIN) can publish
  if (!esVendedor) {
    return (
      <div style={{
        background: '#F8FAFC', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16, padding: 32, textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(101,163,13,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 38,
        }}>🔒</div>
        <h2 style={{ fontSize: 22, fontFamily: 'Syne, sans-serif', color: '#0F172A', margin: 0 }}>
          Cuenta de vendedor requerida
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
          Para publicar cursos y clases necesitas una cuenta con rol <strong>Vendedor (CHALAN)</strong>.
          Crea una cuenta nueva seleccionando "Enseñar" en el registro.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={() => navigate('/registro')} style={{
            padding: '12px 28px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #65A30D, #4D7C0F)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(101,163,13,0.25)',
          }}>Crear cuenta vendedor</button>
          <button onClick={() => navigate('/')} style={{
            padding: '12px 20px', borderRadius: 14,
            background: 'transparent', border: '1.5px solid #E2E8F0',
            color: '#64748B', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>Volver</button>
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
          Tu cuenta actual: <strong>{usuario?.rol || 'USUARIO'}</strong>
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 110 }}>
      <style>{`
        .pub-input { width:100%; box-sizing:border-box; padding:12px 14px; border:1.5px solid #E2E8F0; border-radius:12px; font-size:14px; background:#FFFFFF; color:#0F172A; outline:none; transition:border-color 0.2s, box-shadow 0.2s; font-family:inherit; }
        .pub-input:focus { border-color:#2E70FF; box-shadow:0 0 0 3px rgba(46,112,255,0.10); }
        .pub-input::placeholder { color:#94A3B8; }
        .pub-textarea { width:100%; box-sizing:border-box; padding:12px 14px; border:1.5px solid #E2E8F0; border-radius:12px; font-size:14px; background:#FFFFFF; color:#0F172A; outline:none; resize:none; transition:border-color 0.2s, box-shadow 0.2s; font-family:inherit; line-height:1.6; }
        .pub-textarea:focus { border-color:#2E70FF; box-shadow:0 0 0 3px rgba(46,112,255,0.10); }
        .pub-textarea::placeholder { color:#94A3B8; }
      `}</style>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #F1F5FF 0%, #FAFBFF 100%)',
        borderBottom: '1px solid #E2E8F0',
        padding: '36px 24px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-60, right:-40, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, left:20, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(101,163,13,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:14, maxWidth:480, margin:'0 auto', position:'relative' }}>
          <div style={{
            width:52, height:52, borderRadius:16, flexShrink:0,
            background:'linear-gradient(135deg, #2E70FF 0%, #65A30D 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24, boxShadow:'0 8px 20px rgba(46,112,255,0.2)',
          }}>✨</div>
          <div>
            <h1 style={{ fontSize:24, fontFamily:'Syne, sans-serif', color:'#0F172A', margin:0, lineHeight:1.2 }}>Nueva publicación</h1>
            <p style={{ color:'#64748B', fontSize:13, marginTop:4, margin:0 }}>Comparte tu conocimiento con la comunidad</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'0 16px' }}>

        {/* Tipo de publicación */}
        <div style={{ marginTop:24 }}>
          <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.12em', fontWeight:600, marginBottom:12 }}>TIPO DE PUBLICACIÓN</p>
          <div style={{ display:'flex', gap:12 }}>
            {[
              {
                value: 'CURSO',
                icon: '📚',
                label: 'Curso',
                desc: 'Material grabado, PDF o contenido digital',
                bullets: ['Sin horario fijo', 'Acceso de por vida', 'Cualquier formato'],
              },
              {
                value: 'CLASE',
                icon: '🎓',
                label: 'Clase 1 a 1',
                desc: 'Sesión en vivo con un alumno',
                bullets: ['Fecha y hora definida', 'En línea o presencial', 'Personalizada'],
              },
            ].map(t => (
              <motion.div
                key={t.value}
                onClick={() => setTipo(t.value)}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex:1, padding:'18px 14px', borderRadius:18, cursor:'pointer',
                  background: tipo === t.value ? '#FFFFFF' : '#F1F5F9',
                  border: `2px solid ${tipo === t.value ? '#2E70FF' : '#E2E8F0'}`,
                  boxShadow: tipo === t.value ? '0 4px 20px rgba(46,112,255,0.12)' : 'none',
                  transition:'all 0.2s',
                }}
              >
                <div style={{ fontSize:28, marginBottom:8 }}>{t.icon}</div>
                <p style={{ fontSize:14, fontWeight:700, color: tipo === t.value ? '#2E70FF' : '#0F172A', marginBottom:4, fontFamily:'Syne' }}>{t.label}</p>
                <p style={{ fontSize:11, color:'#94A3B8', marginBottom:10, lineHeight:1.4 }}>{t.desc}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {t.bullets.map((b,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background: tipo === t.value ? '#2E70FF' : '#CBD5E1', flexShrink:0 }} />
                      <span style={{ fontSize:10, color: tipo === t.value ? '#2E70FF' : '#94A3B8' }}>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Información básica */}
        <div style={{ marginTop:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'rgba(46,112,255,0.10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📝</div>
            <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.12em', fontWeight:600 }}>INFORMACIÓN BÁSICA</p>
          </div>

          <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid #E2E8F0', padding:'18px', display:'flex', flexDirection:'column', gap:14, boxShadow:'0 2px 8px rgba(15,23,42,0.04)' }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:12, color:'#64748B', fontWeight:600 }}>Título *</label>
                <span style={{ fontSize:11, color: titulo.length > 60 ? '#f59e0b' : '#94A3B8' }}>{titulo.length}/80</span>
              </div>
              <input className="pub-input" placeholder="Ej: Guitarra para principiantes completo" value={titulo}
                onChange={e => setTitulo(e.target.value)} maxLength={80} />
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:12, color:'#64748B', fontWeight:600 }}>Descripción</label>
                <span style={{ fontSize:11, color: descripcion.length > 400 ? '#f59e0b' : '#94A3B8' }}>{descripcion.length}/500</span>
              </div>
              <textarea className="pub-textarea" placeholder="Describe qué aprenderá el alumno, qué incluye y para quién es..." value={descripcion}
                onChange={e => setDesc(e.target.value)} rows={4} maxLength={500} />
            </div>

            <div>
              <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:8 }}>Precio (MXN) *</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94A3B8', fontSize:16, fontWeight:600 }}>$</span>
                <input className="pub-input" type="number" placeholder="0.00" value={precio}
                  onChange={e => setPrecio(e.target.value)} min="0" step="0.01"
                  style={{ paddingLeft:30 }} />
                <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'#94A3B8', fontSize:11, fontWeight:600 }}>MXN</span>
              </div>
              {precio && !isNaN(precio) && parseFloat(precio) > 0 && (
                <p style={{ fontSize:11, color:'#65A30D', marginTop:6 }}>
                  Recibirás: <strong>${(parseFloat(precio) * 0.9).toFixed(2)} MXN</strong> (después de comisión del 10%)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sección CURSO */}
        <AnimatePresence mode="wait">
          {tipo === 'CURSO' && (
            <motion.div
              key="curso"
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-10 }}
              transition={{ duration:0.2 }}
              style={{ marginTop:16 }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(101,163,13,0.10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📁</div>
                <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.12em', fontWeight:600 }}>CONTENIDO DEL CURSO</p>
              </div>

              <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid #E2E8F0', padding:'18px', boxShadow:'0 2px 8px rgba(15,23,42,0.04)' }}>
                <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:8 }}>URL o nombre del archivo</label>
                <input className="pub-input" placeholder="https://drive.google.com/... o nombre-archivo.pdf" value={archivo}
                  onChange={e => setArchivo(e.target.value)} />
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
                  {['MP4', 'PDF', 'ZIP', 'YouTube', 'Drive', 'Dropbox'].map(f => (
                    <span key={f} style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'#F1F5F9', color:'#64748B', border:'1px solid #E2E8F0', fontWeight:600 }}>{f}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Sección CLASE */}
          {tipo === 'CLASE' && (
            <motion.div
              key="clase"
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-10 }}
              transition={{ duration:0.2 }}
              style={{ marginTop:16 }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(46,112,255,0.10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🗓</div>
                <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.12em', fontWeight:600 }}>DETALLES DE LA CLASE</p>
              </div>

              <div style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid #E2E8F0', padding:'18px', display:'flex', flexDirection:'column', gap:14, boxShadow:'0 2px 8px rgba(15,23,42,0.04)' }}>
                <div>
                  <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:8 }}>Modalidad</label>
                  <div style={{ display:'flex', gap:10 }}>
                    {[
                      { value:'EN_LINEA', icon:'💻', label:'En línea' },
                      { value:'PRESENCIAL', icon:'📍', label:'Presencial' },
                    ].map(m => (
                      <motion.div key={m.value} onClick={() => setModalidad(m.value)} whileTap={{ scale:0.97 }}
                        style={{
                          flex:1, padding:'12px', borderRadius:12, cursor:'pointer', textAlign:'center',
                          background: modalidad === m.value ? 'rgba(101,163,13,0.10)' : '#F8FAFC',
                          border: `2px solid ${modalidad === m.value ? '#65A30D' : '#E2E8F0'}`,
                          transition:'all 0.2s',
                        }}>
                        <p style={{ fontSize:20, marginBottom:4 }}>{m.icon}</p>
                        <p style={{ fontSize:12, fontWeight:700, color: modalidad === m.value ? '#65A30D' : '#64748B' }}>{m.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:8 }}>Duración estimada</label>
                  <input className="pub-input" placeholder="Ej: 60 min, 1.5 horas" value={duracion} onChange={e => setDuracion(e.target.value)} />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:8 }}>Fecha disponible *</label>
                    <input className="pub-input" type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:'#64748B', fontWeight:600, display:'block', marginBottom:8 }}>Hora *</label>
                    <input className="pub-input" type="time" value={hora} onChange={e => setHora(e.target.value)} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vista previa */}
        <AnimatePresence>
          {tieneContenido && (
            <motion.div
              initial={{ opacity:0, height:0 }}
              animate={{ opacity:1, height:'auto' }}
              exit={{ opacity:0, height:0 }}
              transition={{ duration:0.3 }}
              style={{ marginTop:20, overflow:'hidden' }}
            >
              <button onClick={() => setShowPreview(v => !v)} style={{
                width:'100%', height:42, borderRadius:12, border:'1.5px dashed #CBD5E1',
                background:'transparent', color:'#64748B', cursor:'pointer', fontSize:13,
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
                {showPreview ? '🙈 Ocultar vista previa' : '👁 Ver cómo quedará tu publicación'}
              </button>

              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity:0, y:-8 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-8 }}
                    transition={{ duration:0.2 }}
                    style={{ marginTop:10 }}
                  >
                    <p style={{ fontSize:11, color:'#94A3B8', textAlign:'center', marginBottom:8 }}>— Vista previa —</p>
                    <div style={{
                      background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:18, overflow:'hidden',
                      boxShadow:'0 4px 16px rgba(15,23,42,0.07)',
                    }}>
                      <div style={{
                        height:90,
                        background: tipo === 'CURSO'
                          ? 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)'
                          : 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:36,
                      }}>{tipo === 'CURSO' ? '📚' : '🎓'}</div>
                      <div style={{ padding:'14px 16px' }}>
                        <span style={{
                          fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:700, letterSpacing:'0.06em', marginBottom:8, display:'inline-block',
                          background: tipo === 'CURSO' ? 'rgba(101,163,13,0.12)' : 'rgba(46,112,255,0.12)',
                          color: tipo === 'CURSO' ? '#65A30D' : '#2E70FF',
                        }}>{tipo === 'CURSO' ? '📚 CURSO' : '🎓 CLASE'}</span>
                        <p style={{ fontWeight:700, fontSize:15, color:'#0F172A', marginBottom:4, lineHeight:1.3 }}>
                          {titulo || 'Título de tu publicación'}
                        </p>
                        <p style={{ color:'#64748B', fontSize:12, marginBottom:10, lineHeight:1.5,
                          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                          {descripcion || 'Aquí aparecerá tu descripción...'}
                        </p>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <p style={{ color:'#65A30D', fontWeight:800, fontSize:16, fontFamily:'Syne' }}>
                            {precio ? `$${parseFloat(precio).toFixed(2)} MXN` : '$0.00 MXN'}
                          </p>
                          {tipo === 'CLASE' && modalidad && (
                            <span style={{ fontSize:11, color:'#64748B', background:'#F1F5F9', padding:'2px 8px', borderRadius:8 }}>
                              {modalidad === 'EN_LINEA' ? '💻 En línea' : '📍 Presencial'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip box */}
        <div style={{
          background:'rgba(101,163,13,0.06)', border:'1px solid rgba(101,163,13,0.18)',
          borderRadius:14, padding:'14px 16px', marginTop:20,
          display:'flex', gap:10, alignItems:'flex-start',
        }}>
          <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
          <p style={{ fontSize:12, color:'#65A30D', lineHeight:1.6, margin:0 }}>
            <strong>Consejo:</strong> Las publicaciones con descripciones detalladas y precios competitivos reciben hasta <strong>3x más visitas</strong>. Incluye lo que aprenderán y a quién va dirigido.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)',
            borderRadius:12, padding:'12px 16px', marginTop:16, color:'#ef4444', fontSize:13,
            display:'flex', alignItems:'center', gap:8,
          }}>⚠️ {error}</div>
        )}

        {/* Botón publicar */}
        <motion.button
          onClick={handlePublicar}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          style={{
            width:'100%', height:54, borderRadius:16, border:'none',
            background: loading
              ? '#F1F5F9'
              : 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
            color: loading ? '#94A3B8' : '#FFFFFF',
            fontWeight:700, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
            marginTop:20, letterSpacing:'0.04em',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(101,163,13,0.28)',
            transition:'all 0.2s',
          }}
        >
          {loading ? 'Publicando...' : '🚀 PUBLICAR AHORA'}
        </motion.button>

        <p style={{ textAlign:'center', fontSize:11, color:'#94A3B8', marginTop:12 }}>
          Al publicar aceptas que SaberShare retiene el 10% como comisión de plataforma.
        </p>
      </div>
    </div>
  )
}
