const DEFAULT = [
  { rank:1, name:'Priya Sharma', xp:1840, avatar:'P', me:false },
  { rank:2, name:'Rahul Patil',  xp:1720, avatar:'R', me:false },
  { rank:3, name:'Aarav Desai',  xp:1240, avatar:'A', me:true  },
  { rank:4, name:'Sneha More',   xp:1180, avatar:'S', me:false },
  { rank:5, name:'Arjun Naik',   xp:1050, avatar:'A', me:false },
];
export default function Leaderboard({ data = DEFAULT }) {
  const medals = ['🥇','🥈','🥉'];
  return (
    <div>
      {data.map((s) => (
        <div key={s.rank} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', borderRadius:'12px', marginBottom:'4px', background:s.me?'#EEF0FF':'transparent', border:`1px solid ${s.me?'#C7D2FE':'transparent'}` }}>
          <div style={{ fontFamily:'Baloo 2,cursive', fontSize:'18px', fontWeight:800, width:'28px', textAlign:'center' }}>{medals[s.rank-1]||s.rank}</div>
          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:s.me?'#6C63FF':'#EEF0FF', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:s.me?'#fff':'#6C63FF' }}>{s.avatar}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'14px' }}>{s.name}{s.me?' (You)':''}</div>
          </div>
          <div style={{ fontWeight:800, color:'#6C63FF', fontFamily:'Baloo 2,cursive' }}>⭐ {s.xp.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
