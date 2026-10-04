// Notification alarm synthesised with the Web Audio API (no audio file needed).
// Output goes through the device's media volume, so it follows the volume
// set on the phone or laptop. A rising two-tone "chirp" pattern cuts through
// background noise without being harsh.
let ctx = null;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
};

// Browsers only allow audio after a user gesture, so unlock on first interaction.
export const unlockAudio = () => {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
};

export const alarmEnabled = () => localStorage.getItem('av_alarm') !== 'off';
export const setAlarmEnabled = (on) => localStorage.setItem('av_alarm', on ? 'on' : 'off');

export const playAlarm = () => {
  if (!alarmEnabled()) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const start = c.currentTime + 0.02;
  // [frequency Hz, offset s, length s]
  const notes = [[880, 0, 0.14], [1320, 0.16, 0.14], [880, 0.4, 0.14], [1320, 0.56, 0.22]];
  notes.forEach(([freq, at, len]) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start + at);
    gain.gain.setValueAtTime(0.0001, start + at);
    gain.gain.exponentialRampToValueAtTime(0.9, start + at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + at + len);
    osc.connect(gain).connect(c.destination);
    osc.start(start + at);
    osc.stop(start + at + len + 0.02);
  });
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
};
