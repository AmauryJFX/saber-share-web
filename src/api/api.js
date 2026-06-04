import axios from 'axios';
const api = axios.create({ baseURL: 'https://sabersharebda-production.up.railway.app/api', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export const loginAuth = (correo, password) => api.post('/auth/login', { correo, password });
export const loginUsuario = (u) => api.get(`/usuario?user=${u}`);
export const registrarUsuario = (d) => api.post('/usuario', d);
export const getCursos = () => api.get('/curso');
export const getServicios = () => api.get('/servicio');
export const getConversacion = (u1, u2) => api.get(`/mensajes/conversacion?user1=${u1}&user2=${u2}`);
export const enviarMensaje = (d) => api.post('/mensajes', d);
export const getInbox = (id) => api.get(`/mensajes/inbox?userId=${id}`);
export const getHistorial = (id) => api.get(`/historial/usuario/${id}`);
export const getOpinionesCurso = (id) => api.get(`/opiniones/cursos/${id}`)
export const getOpinionesServicio = (id) => api.get(`/opinion_servicio/servicio/${id}`);
export const calificarCurso = (d) => api.post('/opiniones/cursos', d)
export const calificarServicio = (d) => api.post('/opinion_servicio', d);
export const getSlotsPorServicio = (id) => api.get(`/agenda/servicio/${id}`);
export const crearSlot = (d) => api.post('/agenda', d);
export const reservarSlot = (id, alumnoId) => api.put(`/agenda/reservar/${id}?idAlumno=${alumnoId}`);
export const eliminarSlot = (id) => api.delete(`/agenda/${id}`);
export const iniciarPago = (d) => api.post('/paypal/pagar', d, { timeout: 45000 });
export const confirmarPago = (pId, pyId, uId, iId, t) =>
  api.get(`/paypal/confirmar?paymentId=${pId}&PayerID=${pyId}&usuarioId=${uId}&itemId=${iId}&tipo=${t}`, { timeout: 45000 });
export const getSaldo = (id) => api.get(`/usuario/${id}/saldo`);
export const actualizarCorreoPaypal = (id, d) => api.put(`/usuario/${id}/correo-paypal`, d);
export const crearCurso = (d) => api.post('/curso', d);
export const actualizarCurso = (id, d) => api.put(`/curso/${id}`, d);
export const crearServicio = (d) => api.post('/servicio', d);
export const actualizarServicio = (id, d) => api.put(`/servicio/${id}`, d);
export const recuperarPassword = (correo) => api.post('/auth/recuperar', { correo });
export const resetPassword = (token, nuevaPassword) => api.post('/auth/reset-password', { token, nuevaPassword });