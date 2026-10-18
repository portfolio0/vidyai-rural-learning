import { useProgressStore } from '../../store/stores';
const LEVEL_XP = [0,100,250,500,1000,1800,3000,5000,8000,12000];
export default function XPBar({ compact=false }) {
  const { xp, level, streak, coins } = useProgressStore();
  const nextXP = LEVEL_XP[Math.min(level, LEVEL_XP.length-1)] || 1500;
  const pct    = Math.min(xp / nextXP * 100, 100);
  if (compact) return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      <span style={{ background:'#FEF9C3', color:'#B45309', borderRadius:'40px', padding:'5px 12px', fontSize:'12px', fontWeight:700 }}>⭐ {xp.toLocaleString()} XP</span>
      <span style={{ background:'#FFEDD5', color:'#C2410C', borderRadius:'40px', padding:'5px 12px', fontSize:'12px', fontWeight:700 }}>🔥 {streak}d</span>
    </div>
  );
  return (
    <div style={{ background:'#fff', borderRadius:'16px', padding:'14px 18px', boxShadow:'0 2px 12px rgba(108,99,255,.08)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
        <span style={{ fontWeight:800, fontSize:'14px' }}>Level {level}</span>
        <span style={{ fontSize:'12px', color:'#9CA3AF' }}>{xp}/{nextXP} XP</span>
      </div>
      <div style={{ height:'8px', background:'#E5E7EB', borderRadius:'4px' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#6C63FF,#EC4899)', borderRadius:'4px', transition:'width 1s' }} />
      </div>
      <div style={{ display:'flex', gap:'12px', marginTop:'8px', fontSize:'12px', fontWeight:700 }}>
        <span>🔥 {streak} streak</span>
        <span>🪙 {coins} coins</span>
      </div>
    </div>
  );
}
