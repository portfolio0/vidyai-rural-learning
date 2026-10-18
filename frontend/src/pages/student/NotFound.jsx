import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', gap:'16px' }}>
      <div style={{ fontSize:'72px' }}>🔍</div>
      <h1 style={{ fontFamily:'Baloo 2,cursive', fontSize:'28px', fontWeight:800 }}>Page Not Found</h1>
      <p style={{ color:'#6B7280' }}>This page doesn't exist or you don't have access.</p>
      <button onClick={()=>nav('/')} style={{ background:'#6C63FF', color:'#fff', border:'none', borderRadius:'40px', padding:'12px 28px', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>
        Go Home 🏠
      </button>
    </div>
  );
}
