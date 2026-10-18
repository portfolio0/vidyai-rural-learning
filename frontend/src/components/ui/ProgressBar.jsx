export default function ProgressBar({ value=0, max=100, color='#6C63FF', height=8, bg='#E5E7EB', label, style={} }) {
  const pct = Math.min(Math.max(value / max * 100, 0), 100);
  return (
    <div style={style}>
      {label && <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:700, marginBottom:'4px', color:'#6B7280' }}>
        <span>{label}</span><span style={{ color }}>{Math.round(pct)}%</span>
      </div>}
      <div style={{ height, borderRadius:height/2, background:bg, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, borderRadius:height/2, background:color, transition:'width 1s ease' }} />
      </div>
    </div>
  );
}
