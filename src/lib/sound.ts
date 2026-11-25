/**
 * Sons gerados em WebAudio (sem arquivos baixados): zumbido do CRT e clique do power.
 * Tudo desligado por padrão; só toca depois que o visitante ativa o som.
 */
let ctx: AudioContext | null = null;
let hum: { stop: () => void } | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Clique seco de chave mecânica. */
export function playClick() {
  const ac = audio();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * 0.05);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 0.9;
  const g = ac.createGain();
  g.gain.value = 0.5;
  src.connect(bp).connect(g).connect(ac.destination);
  src.start();
}

/** "Pop" grave do tubo ligando (degauss curto). */
export function playPowerOn() {
  const ac = audio();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(70, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(38, ac.currentTime + 0.5);
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18, ac.currentTime + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.6);
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + 0.65);
}

/** Zumbido contínuo: 15,7 kHz bem baixo + 60 Hz da rede, quase inaudível. */
export function startHum() {
  const ac = audio();
  if (!ac || hum) return;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, ac.currentTime);
  master.gain.exponentialRampToValueAtTime(0.03, ac.currentTime + 0.8);
  master.connect(ac.destination);

  const mains = ac.createOscillator();
  mains.type = "sawtooth";
  mains.frequency.value = 60;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 180;
  const mainsGain = ac.createGain();
  mainsGain.gain.value = 0.6;
  mains.connect(lp).connect(mainsGain).connect(master);

  const whine = ac.createOscillator();
  whine.type = "sine";
  whine.frequency.value = 15734;
  const whineGain = ac.createGain();
  whineGain.gain.value = 0.05;
  whine.connect(whineGain).connect(master);

  mains.start();
  whine.start();
  hum = {
    stop: () => {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.25);
      mains.stop(ac.currentTime + 0.3);
      whine.stop(ac.currentTime + 0.3);
    },
  };
}

export function stopHum() {
  hum?.stop();
  hum = null;
}
