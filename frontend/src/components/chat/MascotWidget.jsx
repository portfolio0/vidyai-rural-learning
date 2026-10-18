import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MESSAGES = [
  "Keep learning every day! 🌟",
  "You're doing amazing! 💪",
  "Try a quiz today! ✏️",
  "Watch a reel in 60 seconds! 🎬",
  "Ask me anything! 🤖",
  "Collect more badges! 🏅",
];

export default function MascotWidget() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showRandom = () => {
    setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    setShow(true);
    setTimeout(() => setShow(false), 4000);
  };

  useEffect(() => {
    const t1 = setTimeout(showRandom, 3000);
    const interval = setInterval(showRandom, 15000);
    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, []);

  // Do not render on the chat screen to avoid obstructing chat controls
  if (location.pathname === "/chat") {
    return null;
  }

  const bottomPos = isMobile ? "78px" : "24px";
  const rightPos = isMobile ? "14px" : "24px";
  const size = isMobile ? "48px" : "64px";
  const iconSize = isMobile ? "24px" : "32px";

  return (
    <div
      style={{
        position: 'fixed',
        bottom: bottomPos,
        right: rightPos,
        zIndex: 90,
        cursor: 'pointer',
      }}
      onClick={showRandom}
      title="Vidya Mascot"
    >
      {show && (
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '56px' : '70px',
            right: 0,
            background: '#fff',
            borderRadius: '16px',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(108,99,255,.2)',
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: 700,
            width: isMobile ? '140px' : '160px',
            color: '#1E1B4B',
          }}
        >
          {msg}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '20px',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fff',
            }}
          />
        </div>
      )}
      <div
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg,#6C63FF,#EC4899)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: iconSize,
          boxShadow: '0 8px 24px rgba(108,99,255,.4)',
          animation: 'float 3s ease-in-out infinite',
        }}
      >
        🦉
      </div>
    </div>
  );
}
