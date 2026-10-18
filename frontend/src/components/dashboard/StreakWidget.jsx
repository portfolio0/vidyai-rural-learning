import { useProgressStore } from '../../store/stores';
export default function StreakWidget() {
  const { streak, xp, level } = useProgressStore();
  const days = ['M','T','W','T','F','S','S'];
  const done  = Array.from({ length: 7 }, (_, i) => i < Math.min(streak, 7));
  return (
    <div style={{ background:'#fff', borderRadius:'20px', padding:'20px', boxShadow:'0 4px 24px rgba(108,99,255,.08)' }}>
      <div style={{ fontFamily:'Baloo 2,cursive', fontSize:'16px', fontWeight:700, marginBottom:'14px' }}>🔥 Streak & Level</div>
      <div style={{ display:'flex', gap:'16px', alignItems:'center', marginBottom:'16px' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Baloo 2,cursive', fontSize:'44px', fontWeight:800, color:'#F97316', lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:'11px', color:'#9CA3AF', fontWeight:700 }}>Day Streak</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'8px' }}>
            {days.map((d,i) => <div key={i} style={{ fontSize:'10px', fontWeight:700, color:'#9CA3AF', textAlign:'center' }}>{d}</div>)}
            {done.map((d,i) => (
              <div key={i} style={{ height:'26px', borderRadius:'6px', background:d?'#22C55E':'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }}>
                {d?'✓':''}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:700, marginBottom:'5px' }}>
          <span>Level {level}</span><span style={{ color:'#F59E0B' }}>{xp}/1500 XP</span>
        </div>
        <div style={{ height:'10px', background:'#E5E7EB', borderRadius:'5px' }}>
          <div style={{ height:'100%', width:`${Math.min(xp/1500*100,100)}%`, background:'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius:'5px', transition:'width 1s' }} />
        </div>
      </div>
    </div>
  );
}
