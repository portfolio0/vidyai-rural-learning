export default function BadgeCard({ badge }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', opacity:badge.earned?1:.4 }}>
      <div style={{ width:'54px', height:'54px', borderRadius:'50%', background:badge.color||'#EEF0FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', transition:'transform .2s', cursor:badge.earned?'pointer':'default', boxShadow:badge.earned?'0 3px 10px rgba(0,0,0,.1)':'none' }}
        onMouseEnter={e=>badge.earned&&(e.currentTarget.style.transform='scale(1.15)')}
        onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
        {badge.icon}
      </div>
      <div style={{ fontSize:'10px', fontWeight:700, textAlign:'center', maxWidth:'62px', color:'#6B7280' }}>{badge.name}</div>
      {!badge.earned && <div style={{ fontSize:'9px', color:'#9CA3AF' }}>Locked</div>}
    </div>
  );
}
