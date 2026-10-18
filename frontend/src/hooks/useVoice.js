import { useState, useRef } from 'react';

// Play a subtle auditory chime for young learners (no external sound files required)
function playTone(freq = 600, duration = 0.15) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // AudioContext blocked or unavailable
  }
}

export function useVoice({ onTranscript, language = 'en-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const recRef = useRef(null);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Speech recognition not supported on this browser/device');
      return;
    }
    try {
      const rec = new SR();
      rec.lang = language;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        playTone(680, 0.12); // pleasant start chime
        setIsListening(true);
      };
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) onTranscript?.(transcript);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      rec.onerror = (e) => {
        console.warn('[Speech Recognition Error]', e.error);
        setIsListening(false);
      };
      recRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('[Speech Start Error]', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    playTone(440, 0.1); // stop chime
    try {
      recRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
  };

  const speak = (text, lang = language) => {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // cancel any active speech

      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9; // slightly slower for young school children

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Find best matching voice for Marathi, Hindi, or Indian English
        const matchingVoice = voices.find(
          (v) =>
            v.lang === lang ||
            v.lang.startsWith(lang.split('-')[0]) ||
            v.name.toLowerCase().includes(lang.includes('hi') ? 'hindi' : lang.includes('mr') ? 'marathi' : 'india')
        );
        if (matchingVoice) u.voice = matchingVoice;
      }

      window.speechSynthesis.speak(u);
    } catch (err) {
      console.warn('[Speech Synthesis Error]', err);
    }
  };

  return { isListening, startListening, stopListening, speak };
}
