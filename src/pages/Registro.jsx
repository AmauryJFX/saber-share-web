import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registrarUsuario } from '../api/api'
import logo from '../assets/logo_sabershare.png'

export default function Registro() {
  const [form, setForm]       = useState({ user:'', nombre:'', apellido:'', correo:'', telefono:'', password:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.user || !form.nombre || !form.correo || !form.password) {
      setError('Completa los campos obligatorios'); return
    }
    setLoading(true); setError('')
    try {
      await registrarUsuario(form)
      navigate('/login')
    } catch { setError('Error al registrar. Intenta con otro usuario.') }
    finally { setLoading(false) }
  }

  const campos = [
    { name:'user',     placeholder:'Nombre de usuario', icon:'👤', type:'text',     required: true },
    { name:'nombre',   placeholder:'Nombre',            icon:'✏️', type:'text',     required: true },
    { name:'apellido', placeholder:'Apellido',          icon:'✏️', type:'text',     required: false },
    { name:'correo',   placeholder:'Correo electrónico',icon:'📧', type:'email',    required: true },
    { name:'telefono', placeholder:'Teléfono',          icon:'📱', type:'tel',      required: false },
    { name:'password', placeholder:'Contraseña',        icon:'🔒', type:'password', required: true },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(101,163,13,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,112,255,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img
            src={logo}
            alt="SaberShare"
            style={{ width: '140px', marginBottom: '24px' }}
          />
          <h1 style={{ fontSize:32, fontFamily:'Syne, sans-serif', marginBottom:6 }}>
            <span style={{ color: '#2E70FF' }}>Saber</span>
            <span style={{ color: '#65A30D' }}>Share</span>
          </h1>
          <p style={{ color:'#94A3B8', fontSize:13 }}>Crea tu cuenta y empieza a aprender</p>
        </div>

        {/* Card */}
        <div style={{
          background:'#FFFFFF',
          border:'1px solid #E2E8F0',
          borderRadius:24, padding:28,
          boxShadow:'0 8px 32px rgba(15,23,42,0.08)',
        }}>
          <h2 style={{ fontSize:18, fontFamily:'Syne, sans-serif', marginBottom:4, color:'#0F172A' }}>Crear cuenta</h2>
          <p style={{ color:'#94A3B8', fontSize:12, marginBottom:20 }}>* Campos obligatorios</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {campos.map(c => (
              <div key={c.name}>
                <div style={{ position:'relative' }}>
                  <span style={{
                    position:'absolute', left:13, top:'50%', transform:'translateY(-50%)',
                    fontSize:15, pointerEvents:'none',
                  }}>{c.icon}</span>
                  <input
                    name={c.name} type={c.type}
                    placeholder={c.placeholder + (c.required ? ' *' : '')}
                    value={form[c.name]} onChange={handleChange}
                    style={{ paddingLeft:40, fontSize:13 }}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div style={{
                background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)',
                borderRadius:10, padding:'10px 14px',
                color:'#ef4444', fontSize:13, display:'flex', alignItems:'center', gap:8,
              }}>⚠️ {error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{
                marginTop:6, height:50, borderRadius:14, border:'none',
                background: loading
                  ? '#F1F5F9'
                  : 'linear-gradient(135deg, #65A30D 0%, #4D7C0F 100%)',
                color: loading ? '#94A3B8' : '#fff', fontWeight:700, fontSize:14,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(101,163,13,0.22)',
                transition:'all 0.2s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}>
              {loading ? 'Creando cuenta...' : '✨ Crear cuenta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:20, color:'#94A3B8', fontSize:14 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color:'#2E70FF', fontWeight:700 }}>
            Iniciar sesión →
          </Link>
        </p>
      </div>
    </div>
  )
}
