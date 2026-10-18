const COLORS = {
  purple: { bg:'#EEF0FF', color:'#6C63FF' }, green:  { bg:'#DCFCE7', color:'#16A34A' },
  yellow: { bg:'#FEF9C3', color:'#B45309' }, red:    { bg:'#FEE2E2', color:'#DC2626' },
  blue:   { bg:'#CFFAFE', color:'#0E7490' }, orange: { bg:'#FFEDD5', color:'#C2410C' },
  pink:   { bg:'#FCE7F3', color:'#BE185D' }, gray:   { bg:'#F3F4F6', color:'#6B7280' },
};
export default function Badge({ children, variant='purple', size='sm', style={} }) {
  const c = COLORS[variant] || COLORS.purple;
  const sz = size === 'sm' ? { padding:'3px 10px', fontSize:'11px' } : { padding:'6px 14px', fontSize:'13px' };
  return <span style={{ ...c, ...sz, borderRadius:'40px', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'4px', ...style }}>{children}</span>;
}
