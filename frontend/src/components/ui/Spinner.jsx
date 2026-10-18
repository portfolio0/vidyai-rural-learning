export default function Spinner({ size=32, color='#6C63FF' }) {
  return (
    <div style={{ width:size, height:size, border:`3px solid #E5E7EB`, borderTop:`3px solid ${color}`, borderRadius:'50%', animation:'spin 1s linear infinite' }} />
  );
}
