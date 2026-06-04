import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSaldo, actualizarCorreoPaypal, getCursos, getServicios, getHistorialVentas } from '../api/api'
import { useToast } from '../context/ToastContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts'

function EstadisticasModal({ usuarioId, onClose }) {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistorialVentas(usuarioId)
      .then(r => setHistorial(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [usuarioId])

  // DTO fields: idHistorial, fechapago, pago, usuario_idUsuario, cursoId, servicioId
  const cursosSold = historial.filter(h => h.cursoId    != null).length
  const clasesSold = historial.filter(h => h.servicioId != null).length
  const totalItems = historial.length
  const totalEarned = historial.reduce((s, h) => s + ((h.pago || 0) * 0.9), 0)
  const avgSale = totalItems > 0 ? totalEarned / totalItems : 0

  // Monthly bar chart — last 6 months (field: fechapago = "YYYY-MM-DD")
  const getLast6 = () => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('es-MX', { month: 'short' }),
      }
    })
  }
  const months = getLast6()
  const monthlyData = months.map(m => ({
    name: m.label,
    total: historial
      .filter(h => (h.fechapago || '').startsWith(m.key))
      .reduce((s, h) => s + ((h.pago || 0) * 0.9), 0),
  }))

  const pieData = [
    { name: 'Cursos', value: cursosSold || 0, fill: '#65A30D' },
    { name: 'Clases', value: clasesSold || 0, fill: '#2E70FF' },
  ].filter(d => d.value > 0)
  const PIE_COLORS = ['#65A30D', '#2E70FF']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background:'#0F172A', borderRadius:10, padding:'8px 12px', fontSize:12 }}>
          <p style={{ color:'#94A3B8', marginBottom:2 }}>{label}</p>
          <p style={{ color:'#65A30D', fontWeight:700 }}>${payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(15,23,42,0.5)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      zIndex:300,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y:'100%', opacity:0 }}
        animate={{ y:0, opacity:1 }}
        exit={{ y:'100%', opacity:0 }}
        transition={{ type:'spring', damping:28, stiffness:320 }}
        style={{
          background:'#FFFFFF', borderRadius:'24px 24px 0 0',
          width:'100%', maxWidth:480, maxHeight:'88vh',
          overflowY:'auto', paddingBottom:40,
          boxShadow:'0 -12px 48px rgba(15,23,42,0.12)',
        }}
      >
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
          <div style={{ width:40, height:4, borderRadius:2, background:'#E2E8F0' }} />
        </div>

        <div style={{ padding:'12px 20px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <h2 style={{ fontSize:20, fontFamily:'Syne, sans-serif', color:'#0F172A', margin:0 }}>Estadísticas</h2>
              <p style={{ fontSize:12, color:'#94A3B8', marginTop:3 }}>Tu rendimiento en la plataforma</p>
            </div>
            <button onClick={onClose} style={{
              width:36, height:36, borderRadius:'50%', border:'1px solid #E2E8F0',
              background:'#F8FAFC', color:'#64748B', cursor:'pointer', fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'40px 0', gap:12 }}>
              <div className="spinner" />
              <p style={{ color:'#94A3B8', fontSize:13 }}>Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
                {[
                  { label:'Total generado', value:`$${totalEarned.toFixed(2)}`, sub:'MXN (90%)', color:'#65A30D', icon:'💰' },
                  { label:'Transacciones', value:totalItems, sub:'ventas totales', color:'#2E70FF', icon:'🛒' },
                  { label:'Cursos vendidos', value:cursosSold, sub:'publicaciones', color:'#f59e0b', icon:'📚' },
                  { label:'Promedio por venta', value:`$${avgSale.toFixed(2)}`, sub:'MXN', color:'#8b5cf6', icon:'📈' },
                ].map((s, i) => (
                  <div key={i} style={{
                    background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:16, padding:'14px 14px',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontSize:18 }}>{s.icon}</span>
                      <span style={{ fontSize:11, color:'#94A3B8' }}>{s.sub}</span>
                    </div>
                    <p style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:'Syne', lineHeight:1 }}>{s.value}</p>
                    <p style={{ fontSize:11, color:'#64748B', marginTop:4 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Ingresos por mes */}
              <div style={{ marginBottom:24 }}>
                <p style={{ fontSize:12, color:'#64748B', fontWeight:700, marginBottom:14 }}>Ingresos mensuales (últimos 6 meses)</p>
                {monthlyData.every(d => d.total === 0) ? (
                  <div style={{
                    background:'#F8FAFC', border:'1px dashed #E2E8F0', borderRadius:16,
                    padding:'32px 20px', textAlign:'center',
                  }}>
                    <p style={{ fontSize:28, marginBottom:8 }}>📊</p>
                    <p style={{ color:'#94A3B8', fontSize:13 }}>Sin datos de ventas aún</p>
                    <p style={{ color:'#CBD5E1', fontSize:12, marginTop:4 }}>Aquí verás tus ingresos cuando tengas ventas</p>
                  </div>
                ) : (
                  <div style={{ height:180, background:'#F8FAFC', borderRadius:16, border:'1px solid #E2E8F0', padding:'16px 8px 8px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} barCategoryGap="30%">
                        <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(101,163,13,0.07)' }} />
                        <Bar dataKey="total" fill="#65A30D" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Distribución por tipo */}
              {pieData.length > 0 && (
                <div style={{ marginBottom:24 }}>
                  <p style={{ fontSize:12, color:'#64748B', fontWeight:700, marginBottom:14 }}>Distribución por tipo</p>
                  <div style={{ display:'flex', gap:16, alignItems:'center', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:16, padding:'16px' }}>
                    <div style={{ width:120, height:120, flexShrink:0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={52}
                            dataKey="value" strokeWidth={2} stroke="#FFFFFF" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                      {pieData.map((d, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:3, background:PIE_COLORS[i], flexShrink:0 }} />
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', justifyContent:'space-between' }}>
                              <span style={{ fontSize:13, color:'#0F172A', fontWeight:600 }}>{d.name}</span>
                              <span style={{ fontSize:13, color:'#64748B' }}>{d.value}</span>
                            </div>
                            <div style={{ height:4, background:'#E2E8F0', borderRadius:2, marginTop:4 }}>
                              <div style={{
                                height:'100%', borderRadius:2, background:PIE_COLORS[i],
                                width:`${totalItems > 0 ? (d.value / totalItems) * 100 : 0}%`,
                                transition:'width 0.6s ease',
                              }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {historial.length === 0 && (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <p style={{ fontSize:32, marginBottom:8 }}>🌱</p>
                  <p style={{ color:'#64748B', fontSize:14, fontWeight:600 }}>Aún sin actividad</p>
                  <p style={{ color:'#94A3B8', fontSize:12, marginTop:4, lineHeight:1.6 }}>
                    Las estadísticas se irán llenando conforme realices ventas o compras en la plataforma.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function Perfil() {
  const { usuario, logout, esVendedor } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [saldo, setSaldo]               = useState(null)
  const [correoPaypal, setCorreoPaypal] = useState('')
  const [editPaypal, setEditPaypal]     = useState(false)
  const [nuevoCorreo, setNuevoCorreo]   = useState('')
  const [nPublicaciones, setNPublicaciones] = useState(0)
  const [loading, setLoading]           = useState(false)
  const [showStats, setShowStats]       = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      if (esVendedor) {
        const res = await getSaldo(usuario.id)
        setSaldo(res.data.saldoPendiente || 0)
        setCorreoPaypal(res.data.correoPaypal || '')
        setNuevoCorreo(res.data.correoPaypal || '')
      }
      const [cursos, servicios] = await Promise.all([getCursos(), getServicios()])
      const mios = (cursos.data || []).filter(c => c.usuarioId === usuario.id).length
              + (servicios.data || []).filter(s => s.usuarioId === usuario.id).length
      setNPublicaciones(mios)
    } catch {}
  }

  const handleGuardarPaypal = async () => {
    if (!nuevoCorreo) return
    setLoading(true)
    try {
      await actualizarCorreoPaypal(usuario.id, { correoPaypal: nuevoCorreo })
      setCorreoPaypal(nuevoCorreo)
      setEditPaypal(false)
      toast('Correo PayPal actualizado correctamente ✅', 'success')
    } catch {
      toast('Error al guardar el correo PayPal', 'error')
    }
    finally { setLoading(false) }
  }

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() || 'U'

  const menuItems = [
    { icon: '📋', label: 'Historial de compras', sub: 'Tus transacciones', path: '/historial', color: '#2E70FF', bg: 'rgba(46,112,255,0.10)' },
    ...(esVendedor ? [
      { icon: '📁', label: 'Mis publicaciones', sub: 'Edita tu contenido', path: '/mis-publicaciones', color: '#65A30D', bg: 'rgba(101,163,13,0.10)' },
    ] : []),
  ]

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #F1F5FF 0%, #FAFBFF 100%)',
        borderBottom: '1px solid #E2E8F0',
        padding: '40px 24px 28px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, right:20, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(101,163,13,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Avatar */}
        <motion.div
          initial={{ scale:0.8, opacity:0 }}
          animate={{ scale:1, opacity:1 }}
          transition={{ type:'spring', damping:18, stiffness:260 }}
          style={{
            width:90, height:90, borderRadius:'50%', margin:'0 auto 16px',
            background:'linear-gradient(135deg, #2E70FF 0%, #65A30D 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:36, fontWeight:800, color:'#fff',
            fontFamily:'Syne, sans-serif',
            boxShadow:'0 8px 28px rgba(46,112,255,0.28)',
            position:'relative',
          }}>
          {inicial}
          <div style={{
            position:'absolute', bottom:3, right:3,
            width:20, height:20, borderRadius:'50%',
            background:'#65A30D', border:'2.5px solid #FFFFFF',
            boxShadow:'0 2px 8px rgba(101,163,13,0.3)',
          }} />
        </motion.div>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <h1 style={{ fontSize:24, fontFamily:'Syne, sans-serif', marginBottom:4, color:'#0F172A', lineHeight:1.2 }}>
            {usuario?.nombre} {usuario?.apellido}
          </h1>
          <p style={{ color:'#64748B', fontSize:13, marginBottom:12 }}>{usuario?.correo}</p>
          <span style={{
            display:'inline-block', padding:'5px 16px', borderRadius:20,
            background:'rgba(46,112,255,0.10)',
            border:'1px solid rgba(46,112,255,0.2)',
            color:'#2E70FF', fontSize:11, fontWeight:700, letterSpacing:'0.08em',
          }}>{usuario?.rol || 'USUARIO'}</span>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity:0, y:12 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.18 }}
          style={{ display:'flex', gap:10, marginTop:20, justifyContent:'center' }}
        >
          {[
            { label:'Publicaciones', value: nPublicaciones, color:'#65A30D', icon:'📁' },
            { label:'Reputación', value:'★ 5.0', color:'#f59e0b', icon:'⭐' },
            { label:'Miembro', value:'Activo', color:'#2E70FF', icon:'✅' },
          ].map((s,i) => (
            <div key={i} style={{
              flex:1, maxWidth:120,
              background:'#FFFFFF',
              border:'1px solid #E2E8F0',
              borderRadius:14, padding:'12px 6px', textAlign:'center',
              boxShadow:'0 2px 8px rgba(15,23,42,0.05)',
            }}>
              <p style={{ fontSize:8, marginBottom:3 }}>{s.icon}</p>
              <p style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:'Syne', lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:10, color:'#94A3B8', marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div style={{ padding:'20px 16px', maxWidth:480, margin:'0 auto' }}>

        {/* Saldo vendedor */}
        {esVendedor && saldo !== null && (
          <motion.div
            initial={{ opacity:0, y:10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.2 }}
            style={{
              background:'linear-gradient(135deg, rgba(46,112,255,0.06) 0%, rgba(101,163,13,0.04) 100%)',
              border:'1px solid rgba(46,112,255,0.18)',
              borderRadius:20, padding:20, marginBottom:16,
              boxShadow:'0 2px 12px rgba(15,23,42,0.06)',
            }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.1em', marginBottom:4, fontWeight:600 }}>💰 SALDO PENDIENTE</p>
                <p style={{ fontSize:32, fontWeight:800, color:'#65A30D', fontFamily:'Syne' }}>
                  ${saldo?.toFixed(2)} <span style={{ fontSize:14, color:'#94A3B8', fontWeight:400 }}>USD</span>
                </p>
                <p style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>90% de tus ventas acumuladas</p>
              </div>
              <div style={{
                width:48, height:48, borderRadius:14, background:'rgba(101,163,13,0.10)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
              }}>💸</div>
            </div>

            {editPaypal ? (
              <div>
                <input placeholder="tu@paypal.com" value={nuevoCorreo}
                  onChange={e => setNuevoCorreo(e.target.value)}
                  style={{ marginBottom:10 }} />
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={handleGuardarPaypal} disabled={loading}
                    style={{ flex:1, height:40, background:'#2E70FF', color:'#fff', border:'none', borderRadius:10, fontWeight:600, cursor:'pointer', fontSize:13 }}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditPaypal(false)}
                    style={{ flex:1, height:40, background:'#F8FAFC', color:'#64748B', border:'1px solid #E2E8F0', borderRadius:10, cursor:'pointer', fontSize:13 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(46,112,255,0.15)' }}>
                <div>
                  <p style={{ fontSize:10, color:'#94A3B8', marginBottom:2 }}>Correo PayPal</p>
                  <p style={{ fontSize:13, color: correoPaypal ? '#0F172A' : '#f59e0b', fontWeight:600 }}>
                    {correoPaypal || '⚠️ Sin correo configurado'}
                  </p>
                </div>
                <button onClick={() => setEditPaypal(true)}
                  style={{ background:'rgba(46,112,255,0.10)', border:'1px solid rgba(46,112,255,0.2)', color:'#2E70FF', borderRadius:8, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                  ✏️ Editar
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Sección: Accesos */}
        <p style={{ fontSize:11, color:'#94A3B8', letterSpacing:'0.12em', fontWeight:600, marginBottom:10 }}>ACCESOS RÁPIDOS</p>

        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            onClick={() => navigate(item.path)}
            initial={{ opacity:0, x:-10 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay: 0.22 + i * 0.07 }}
            whileHover={{ x:4 }}
            whileTap={{ scale:0.98 }}
            style={{
              background:'#FFFFFF', border:'1px solid #E2E8F0',
              borderRadius:18, padding:'16px 18px', marginBottom:10,
              cursor:'pointer', display:'flex', alignItems:'center', gap:14,
              boxShadow:'0 2px 8px rgba(15,23,42,0.05)',
            }}
          >
            <div style={{
              width:44, height:44, borderRadius:14, flexShrink:0,
              background:item.bg,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
            }}>{item.icon}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#0F172A' }}>{item.label}</p>
              <p style={{ color:'#94A3B8', fontSize:12, marginTop:2 }}>{item.sub}</p>
            </div>
            <div style={{ width:28, height:28, borderRadius:8, background:'#F8FAFC', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', color:'#94A3B8', fontSize:14, fontWeight:700 }}>›</div>
          </motion.div>
        ))}

        {/* Estadísticas */}
        <motion.div
          onClick={() => setShowStats(true)}
          initial={{ opacity:0, x:-10 }}
          animate={{ opacity:1, x:0 }}
          transition={{ delay: 0.22 + menuItems.length * 0.07 }}
          whileHover={{ x:4 }}
          whileTap={{ scale:0.98 }}
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(46,112,255,0.06) 100%)',
            border:'1px solid rgba(139,92,246,0.2)',
            borderRadius:18, padding:'16px 18px', marginBottom:10,
            cursor:'pointer', display:'flex', alignItems:'center', gap:14,
            boxShadow:'0 2px 8px rgba(139,92,246,0.08)',
          }}
        >
          <div style={{
            width:44, height:44, borderRadius:14, flexShrink:0,
            background:'rgba(139,92,246,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
          }}>📊</div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:700, fontSize:14, color:'#0F172A' }}>Estadísticas</p>
            <p style={{ color:'#94A3B8', fontSize:12, marginTop:2 }}>Rendimiento y ganancias</p>
          </div>
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(139,92,246,0.10)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#8b5cf6', fontSize:14, fontWeight:700 }}>›</div>
        </motion.div>

        {/* Divider */}
        <div style={{ height:1, background:'#E2E8F0', margin:'8px 0 14px' }} />

        {/* Cerrar sesión */}
        <motion.button
          onClick={() => { logout(); navigate('/login') }}
          whileHover={{ scale:1.01 }}
          whileTap={{ scale:0.98 }}
          style={{
            width:'100%', height:50, borderRadius:16,
            background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
            color:'#ef4444', fontWeight:700, cursor:'pointer', fontSize:14,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
        >
          🚪 Cerrar sesión
        </motion.button>

        <p style={{ textAlign:'center', fontSize:11, color:'#CBD5E1', marginTop:16 }}>
          SaberShare v1.0 · {usuario?.correo}
        </p>
      </div>

      {/* Modal estadísticas */}
      <AnimatePresence>
        {showStats && (
          <EstadisticasModal
            usuarioId={usuario?.id}
            onClose={() => setShowStats(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
