import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, width='480px' }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) { window.addEventListener('keydown', handler); document.body.style.overflow = 'hidden'; }
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [isOpen]);
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div style={{ position:'fixed', inset:0, background:'rgba(30,27,75,.6)', zIndex:999999, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', backdropFilter:'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={{ background:'#fff', borderRadius:'24px', width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.2)', animation:'slideUp .3s ease' }}>
        {title && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid #E5E7EB' }}>
            <h3 style={{ fontFamily:'Baloo 2,cursive', fontSize:'18px', fontWeight:700 }}>{title}</h3>
            <button onClick={onClose} style={{ background:'#F3F4F6', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'16px' }}>✕</button>
          </div>
        )}
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
