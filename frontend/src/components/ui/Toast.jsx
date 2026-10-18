// Thin wrapper — we use react-hot-toast; this is a helper
import toast from 'react-hot-toast';

export const notify = {
  success: (msg) => toast.success(msg, { style:{ borderRadius:'12px', fontFamily:'Nunito,sans-serif', fontWeight:700 } }),
  error:   (msg) => toast.error(msg,   { style:{ borderRadius:'12px', fontFamily:'Nunito,sans-serif', fontWeight:700 } }),
  info:    (msg) => toast(msg,          { icon:'ℹ️', style:{ borderRadius:'12px', fontFamily:'Nunito,sans-serif', fontWeight:700 } }),
  xp:      (amt) => toast(`⭐ +${amt} XP earned!`, { icon:'🎉', style:{ borderRadius:'12px', background:'#6C63FF', color:'#fff', fontWeight:700 } }),
};
