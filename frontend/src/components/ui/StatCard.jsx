export default function StatCard({ label, value, icon, gradient, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius:'20px', padding:'20px', background:gradient, color:'#fff', cursor:onClick?'pointer':'default', position:'relative', overflow:'hidden', transition:'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform='translateY(-3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
      <div style={{ fontFamily:'Baloo 2,cursive', fontSize:'32px', fontWeight:800, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'13px', opacity:.85, fontWeight:700, marginTop:'4px' }}>{label}</div>
      <div style={{ position:'absolute', right:'-8px', bottom:'-8px', fontSize:'56px', opacity:.15, pointerEvents:'none' }}>{icon}</div>
    </div>
  );
}
