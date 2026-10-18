import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/stores';
import api from '../../services/api';
import { setAppLanguage } from '../../i18n';

const steps = ['welcome','class','language','meet'];

export default function Onboarding() {
  const [step, setStep]     = useState(0);
  const [cls, setCls]       = useState(5);
  const [lang, setLang]     = useState('en');
  const { user, updateUser } = useAuthStore();
  const nav                 = useNavigate();

  const finish = async () => {
    try {
      await api.put('/student/profile', { class: cls, language: lang });
    } catch (e) {
      console.error('Failed to save profile during onboarding:', e);
    }
    setAppLanguage(lang);
    updateUser({ class: cls, language: lang });
    nav('/');
  };

  const Card = ({ children }) => (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#6C63FF,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ background:'#fff', borderRadius:'28px', padding:'40px', width:'100%', maxWidth:'440px', textAlign:'center' }}>
        {children}
      </div>
    </div>
  );

  const Btn = ({ onClick, children, color='#6C63FF' }) => (
    <button onClick={onClick} style={{ width:'100%', padding:'14px', borderRadius:'40px', border:'none', background:color, color:'#fff', fontWeight:800, fontSize:'16px', cursor:'pointer', marginTop:'8px' }}>{children}</button>
  );

  if (step === 0) return <Card>
    <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎓</div>
    <h1 style={{ fontFamily:'Baloo 2,cursive', fontSize:'28px', fontWeight:800, color:'#6C63FF', marginBottom:'8px' }}>Welcome to VidyAI!</h1>
    <p style={{ color:'#6B7280', marginBottom:'24px' }}>India's AI-powered learning platform for rural students 🇮🇳</p>
    <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', marginBottom:'24px' }}>
      {['📱 Works Offline','🤖 AI Tutor','🏆 Fun Learning','🌐 3 Languages'].map(tag => (
        <span key={tag} style={{ background:'#EEF0FF', color:'#6C63FF', borderRadius:'40px', padding:'6px 14px', fontSize:'13px', fontWeight:700 }}>{tag}</span>
      ))}
    </div>
    <Btn onClick={() => setStep(1)}>Get Started 🚀</Btn>
  </Card>;

  if (step === 1) return <Card>
    <div style={{ fontSize:'64px', marginBottom:'16px' }}>📚</div>
    <h2 style={{ fontFamily:'Baloo 2,cursive', fontSize:'24px', fontWeight:800, marginBottom:'8px' }}>What class are you in?</h2>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'8px', margin:'20px 0' }}>
      {[1,2,3,4,5,6,7,8,9,10].map(c => (
        <div key={c} onClick={() => setCls(c)}
          style={{ padding:'10px', borderRadius:'12px', border:`2px solid ${cls===c?'#6C63FF':'#E5E7EB'}`, background:cls===c?'#EEF0FF':'#fff', color:cls===c?'#6C63FF':'#374151', fontWeight:700, cursor:'pointer', fontSize:'15px' }}>
          {c}{c===1?'st':c===2?'nd':c===3?'rd':'th'}
        </div>
      ))}
    </div>
    <Btn onClick={() => setStep(2)}>Continue →</Btn>
  </Card>;

  if (step === 2) return <Card>
    <div style={{ fontSize:'64px', marginBottom:'16px' }}>🗣️</div>
    <h2 style={{ fontFamily:'Baloo 2,cursive', fontSize:'24px', fontWeight:800, marginBottom:'16px' }}>Choose your language</h2>
    <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
      {[['en','🇬🇧 English'],['mr','🇮🇳 मराठी'],['hi','🇮🇳 हिंदी']].map(([code,label]) => (
        <div key={code} onClick={() => setLang(code)}
          style={{ flex:1, padding:'16px', borderRadius:'12px', border:`2px solid ${lang===code?'#6C63FF':'#E5E7EB'}`, background:lang===code?'#EEF0FF':'#fff', color:lang===code?'#6C63FF':'#374151', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
          {label}
        </div>
      ))}
    </div>
    <Btn onClick={() => setStep(3)}>Continue →</Btn>
  </Card>;

  return <Card>
    <div style={{ fontSize:'64px', marginBottom:'16px' }}>🦉</div>
    <h2 style={{ fontFamily:'Baloo 2,cursive', fontSize:'24px', fontWeight:800, marginBottom:'8px' }}>Meet Vidya!</h2>
    <p style={{ color:'#6B7280', marginBottom:'16px' }}>Your AI tutor — ask me anything in English, Marathi, or Hindi!</p>
    <div style={{ background:'#EEF0FF', borderRadius:'16px', padding:'16px', marginBottom:'20px', textAlign:'left' }}>
      <div style={{ background:'#6C63FF', color:'#fff', borderRadius:'12px 12px 12px 4px', padding:'12px 16px', fontSize:'14px', display:'inline-block', maxWidth:'90%' }}>
        Namaste {user?.name}! 🙏 I'm Vidya. Let's start learning together! What do you want to study today?
      </div>
    </div>
    <Btn onClick={finish} color='#22C55E'>Start Learning! 🎉</Btn>
  </Card>;
}
