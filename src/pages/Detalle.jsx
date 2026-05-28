import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  getOpinionesCurso, getOpinionesServicio,
  getHistorial, getSlotsPorServicio,
  reservarSlot, calificarCurso, calificarServicio
} from '../api/api'

export default function Detalle() {
  const { tipo, id } = useParams()
  const { state: pub } = useLocation()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [opiniones, setOpiniones]         = useState([])
  const [promedio, setPromedio]           = useState(0)
  const [yaCompro, setYaCompro]           = useState(false)
  const [slots, setSlots]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [showCalificar, setShowCalificar] = useState(false)
  const [showAgendar, setShowAgendar]     = useState(false)

  useEffect(() => { if (pub) cargar() }, [id, tipo])

  const cargar = async () => {
    setLoading(true)

    try {
      const opRes = tipo === 'CURSO'
        ? await getOpinionesCurso(id)
        : await getOpinionesServicio(id)
      const ops = opRes.data || []
      setOpiniones(ops)
      if (ops.length > 0) {
        const sum = ops.reduce((a, o) => a + (o.calOps || 0), 0)
        setPromedio((sum / ops.length).toFixed(1))
      }
    } catch (e) {
      console.warn('Opiniones no disponibles')
    }

    try {
      const histRes = await getHistorial(usuario.id)
      const hist = histRes.data || []
      const comprado = hist.some(h =>
        tipo === 'CURSO'
          ? h.cursoId != null && String(h.cursoId) === String(id)
          : h.servicioId != null && String(h.servicioId) === String(id)
      )
      setYaCompro(comprado)
    } catch (e) {
    }

    try {
      if (tipo === 'CLASE') {
        const slotsRes = await getSlotsPorServicio(id)
        setSlots((slotsRes.data || []).filter(s => s.estado === 'DISPONIBLE'))
      }
    } catch (e) {
      console.warn('Slots no disponibles')
    }

    setLoading(false)
  }

  if (!pub) return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ color:'#64748B' }}>No se encontró la publicación.</p>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ padding:'10px 24px' }}>← Volver al inicio</button>
    </div>
  )

  const esMia = pub?.autorId === usuario?.id

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Hero header */}
      <div style={{
        background: '#F1F5FF',
        borderBottom: '1px solid #E2E8F0',
        padding: '20px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <button onClick={() => navigate('/')} style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            color: '#0F172A', borderRadius: 10, padding: '6px 14px',
            fontSize: 13, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
          }}>← Volver</button>
          <span className={`tag tag-${tipo === 'CURSO' ? 'curso' : 'clase'}`}>
            {tipo === 'CURSO' ? '📚 CURSO' : '🎓 CLASE 1A1'}
          </span>
          {esMia && <span style={{ background:'rgba(101,163,13,0.12)', color:'#65A30D', fontSize:10, padding:'3px 10px', borderRadius:20, fontWeight:700 }}>TU PUBL.</span>}
        </div>

        <h1 style={{ fontSize:26, fontFamily:'Syne, sans-serif', marginBottom:12, lineHeight:1.2, color:'#0F172A' }}>{pub.titulo}</h1>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, #2E70FF, #5b9aff)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#fff', fontSize:14 }}>
            {pub.autor?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>{pub.autor}</p>
            <p style={{ color:'#fbbf24', fontSize:12 }}>
              {'★'.repeat(Math.round(promedio))}{'☆'.repeat(5 - Math.round(promedio))} {promedio} ({opiniones.length} reseñas)
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'20px', maxWidth:600, margin:'0 auto' }}>

        {/* Precio / Estado */}
        <div style={{
          background: yaCompro ? 'rgba(34,197,94,0.06)' : '#FFFFFF',
          border: `1px solid ${yaCompro ? 'rgba(34,197,94,0.3)' : '#2E70FF'}`,
          borderRadius:18, padding:20, marginBottom:20,
          boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
        }}>
          <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.1em', marginBottom:6 }}>
            {yaCompro ? 'ESTADO' : 'PRECIO'}
          </p>
          {yaCompro ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(34,197,94,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✅</div>
              <div>
                <p style={{ fontSize:18, fontWeight:700, color:'#16a34a' }}>Contenido desbloqueado</p>
                <p style={{ fontSize:12, color:'#94A3B8' }}>Ya tienes acceso a este contenido</p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize:34, fontWeight:800, color:'#2E70FF', fontFamily:'Syne' }}>
              ${pub.precio?.toFixed(2)} <span style={{ fontSize:14, color:'#94A3B8' }}>MXN</span>
            </p>
          )}
        </div>

        <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.1em', marginBottom:10 }}>DESCRIPCIÓN</p>
        <p style={{ color:'#64748B', lineHeight:1.8, marginBottom:24, fontSize:15 }}>{pub.descripcion}</p>

        {/* Acciones */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {esMia && !yaCompro ? (
            <button className="btn-secondary" onClick={() => navigate('/mis-publicaciones')} style={{ height:50 }}>✏️ Gestionar publicación</button>
          ) : yaCompro ? (
            <>
              <button onClick={() => navigate(`/chat/${pub.autorId}/${encodeURIComponent(pub.autor)}`)}
                style={{ height:52, borderRadius:14, border:'none', background:'linear-gradient(135deg, #2E70FF 0%, #5b9aff 100%)', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 8px 24px rgba(46,112,255,0.25)' }}>
                💬 Chatear con vendedor
              </button>
              {tipo === 'CLASE' && (
                <button onClick={() => setShowAgendar(!showAgendar)}
                  style={{ height:50, borderRadius:14, background: showAgendar ? 'rgba(101,163,13,0.10)' : '#F8FAFC', border:`1px solid ${showAgendar ? '#65A30D' : '#E2E8F0'}`, color: showAgendar ? '#65A30D' : '#0F172A', fontWeight:600, cursor:'pointer', fontSize:14 }}>
                  📅 {showAgendar ? 'Ocultar horarios' : 'Agendar clase'}
                </button>
              )}
              <button onClick={() => setShowCalificar(!showCalificar)}
                style={{ height:46, borderRadius:14, background:'transparent', border:`1px solid ${showCalificar ? '#fbbf24' : '#E2E8F0'}`, color: showCalificar ? '#fbbf24' : '#64748B', cursor:'pointer', fontSize:14 }}>
                ★ {showCalificar ? 'Cancelar' : 'Calificar'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate(`/comprar/${tipo}/${id}`, { state: pub })}
                style={{ height:52, borderRadius:14, border:'none', background:'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)', color:'#fff', fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 8px 24px rgba(101,163,13,0.2)' }}>
                💳 Comprar con PayPal
              </button>
              <button onClick={() => toast('Primero adquiere este contenido para poder contactar al vendedor', 'info')}
                style={{ height:46, borderRadius:14, background:'transparent', border:'1px solid #E2E8F0', color:'#94A3B8', cursor:'pointer', fontSize:14 }}>
                💬 Contactar vendedor
              </button>
            </>
          )}
        </div>

        {/* Horarios */}
        {showAgendar && (
          <div style={{ marginTop:20 }}>
            <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.1em', marginBottom:12 }}>HORARIOS DISPONIBLES</p>
            {slots.length === 0 ? (
              <p style={{ color:'#94A3B8', textAlign:'center', padding:20 }}>No hay horarios disponibles</p>
            ) : slots.map(slot => (
              <div key={slot.idAgenda} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:14, padding:'14px 18px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
                <div>
                  <p style={{ fontWeight:600, color:'#0F172A' }}>📅 {slot.fecha}</p>
                  <p style={{ color:'#64748B', fontSize:13 }}>🕐 {slot.hora}</p>
                </div>
                <button onClick={async () => {
                  try {
                    await reservarSlot(slot.idAgenda, usuario.id)
                    toast(`¡Reservaste el ${slot.fecha} a las ${slot.hora}! 🎉`, 'success')
                    navigate(`/chat/${pub.autorId}/${encodeURIComponent(pub.autor)}`)
                  } catch {
                    toast('Error al reservar el horario', 'error')
                  }
                }} style={{ padding:'8px 18px', borderRadius:10, border:'none', background:'#2E70FF', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:13 }}>Reservar</button>
              </div>
            ))}
          </div>
        )}

        {showCalificar && (
          <CalificarForm tipo={tipo} itemId={id} usuarioId={usuario.id}
            onEnviado={() => { setShowCalificar(false); cargar() }} />
        )}

        {/* Reseñas */}
        {opiniones.length > 0 && (
          <div style={{ marginTop:28 }}>
            <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.1em', marginBottom:12 }}>RESEÑAS ({opiniones.length})</p>
            {opiniones.slice(0, 5).map((o, i) => (
              <div key={i} style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:14, padding:16, marginBottom:10, boxShadow:'0 1px 4px rgba(15,23,42,0.04)' }}>
                <p style={{ color:'#fbbf24', fontSize:14, marginBottom:6 }}>{'★'.repeat(o.calOps)}{'☆'.repeat(5 - o.calOps)}</p>
                <p style={{ color:'#64748B', fontSize:13, lineHeight:1.5 }}>{o.comentOps || 'Sin comentario'}</p>
                <p style={{ color:'#94A3B8', fontSize:11, marginTop:8 }}>— {o.nombreUsuario}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CalificarForm({ tipo, itemId, usuarioId, onEnviado }) {
  const [estrellas, setEstrellas] = useState(5)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const enviar = async () => {
    setLoading(true)
    try {
      const dto = { calOps: estrellas, comentOps: comentario || 'Sin comentario', usuarioId }
      if (tipo === 'CURSO') { dto.cursoId = parseInt(itemId); await calificarCurso(dto) }
      else { dto.servicioId = parseInt(itemId); await calificarServicio(dto) }
      toast('¡Calificación enviada! Gracias por tu reseña ⭐', 'success')
      onEnviado()
    } catch {
      toast('Error al enviar la calificación', 'error')
    }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:16, padding:20, marginTop:16, boxShadow:'0 2px 8px rgba(15,23,42,0.05)' }}>
      <p style={{ fontWeight:700, marginBottom:14, fontFamily:'Syne', color:'#0F172A' }}>Calificar</p>
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} onClick={() => setEstrellas(n)} style={{ fontSize:30, cursor:'pointer', color: n <= estrellas ? '#fbbf24' : '#E2E8F0', transition:'color 0.15s' }}>★</span>
        ))}
      </div>
      <textarea placeholder="Comentario (opcional)" value={comentario} onChange={e => setComentario(e.target.value)} rows={3} style={{ marginBottom:12 }} />
      <button onClick={enviar} disabled={loading} style={{ width:'100%', height:46, borderRadius:12, border:'none', background:'linear-gradient(135deg, #2E70FF, #5b9aff)', color:'#fff', fontWeight:700, cursor:'pointer' }}>
        {loading ? 'Enviando...' : 'Enviar calificación'}
      </button>
    </div>
  )
}
