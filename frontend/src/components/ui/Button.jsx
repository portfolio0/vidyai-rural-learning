export default function Button({ children, onClick, variant='primary', size='md', disabled, fullWidth, style={} }) {
  const base = { border:'none', borderRadius:'40px', cursor:disabled?'not-allowed':'pointer', fontFamily:'Nunito,sans-serif', fontWeight:700, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'all .2s', opacity: disabled ? .6 : 1 };
  const variants = {
    primary: { background:'#6C63FF', color:'#fff', boxShadow:'0 4px 14px rgba(108,99,255,.35)' },
    secondary:{ background:'#EEF0FF', color:'#6C63FF' },
    success:  { background:'#22C55E', color:'#fff' },
    danger:   { background:'#EF4444', color:'#fff' },
    outline:  { background:'transparent', color:'#6C63FF', border:'2px solid #6C63FF' },
    ghost:    { background:'transparent', color:'#6B7280' },
  };
  const sizes = { sm:{ padding:'6px 14px', fontSize:'13px' }, md:{ padding:'10px 20px', fontSize:'14px' }, lg:{ padding:'14px 28px', fontSize:'16px' } };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...sizes[size], ...(fullWidth && { width:'100%' }), ...style }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.transform='translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
      {children}
    </button>
  );
}
