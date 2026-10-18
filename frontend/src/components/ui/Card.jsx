export default function Card({ children, style={}, onClick, hover=true, padding='20px', color }) {
  const base = { background: color || '#fff', borderRadius:'20px', padding, boxShadow:'0 4px 24px rgba(108,99,255,.08)', transition:'all .2s', ...(onClick && { cursor:'pointer' }) };
  return (
    <div style={{ ...base, ...style }}
      onClick={onClick}
      onMouseEnter={e => hover && onClick && (e.currentTarget.style.transform='translateY(-3px)', e.currentTarget.style.boxShadow='0 8px 32px rgba(108,99,255,.16)')}
      onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)', e.currentTarget.style.boxShadow='0 4px 24px rgba(108,99,255,.08)')}>
      {children}
    </div>
  );
}
