// Sound layer. Placeholder SFX are synthesized with WebAudio.
// Designer/sound assets: drop files in /assets/audio/ and list them in
// /assets/audio/manifest.json as { "chomp": "chomp.mp3", "music": "loop.mp3", ... }.
// Any listed sound replaces its synthesized fallback automatically.

export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.buffers = {};
    this.music = null;
    try { this.muted = localStorage.getItem('deepbite.muted') === '1'; } catch { this.muted = false; }
  }

  // Must be called from a user gesture (browser autoplay rules).
  async unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.6;
    this.master.connect(this.ctx.destination);
    this._loadManifest();
  }

  async _loadManifest() {
    try {
      const res = await fetch('/assets/audio/manifest.json');
      if (!res.ok) return;
      const manifest = await res.json();
      await Promise.all(Object.entries(manifest).map(async ([name, file]) => {
        const buf = await fetch(`/assets/audio/${file}`).then((r) => r.arrayBuffer());
        this.buffers[name] = await this.ctx.decodeAudioData(buf);
      }));
      if (this.buffers.music && this._wantMusic) this.startMusic();
    } catch { /* no custom audio — fallbacks are used */ }
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('deepbite.muted', m ? '1' : '0'); } catch { /* ignore */ }
    if (this.master) this.master.gain.value = m ? 0 : 0.6;
  }

  startMusic() {
    this._wantMusic = true;
    if (!this.ctx || !this.buffers.music || this.music) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers.music;
    src.loop = true;
    const g = this.ctx.createGain(); g.gain.value = 0.35;
    src.connect(g).connect(this.master);
    src.start();
    this.music = src;
  }
  stopMusic() { this._wantMusic = false; this.music?.stop(); this.music = null; }

  play(name, opts = {}) {
    if (!this.ctx || this.muted) return;
    if (this.buffers[name]) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      src.playbackRate.value = opts.rate || 1;
      src.connect(this.master);
      src.start();
      return;
    }
    const fn = this[`_synth_${name}`];
    if (fn) fn.call(this, opts);
  }

  _tone(type, f0, f1, dur, vol = 0.3, delay = 0) {
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  _noise(dur, vol = 0.3, filterFreq = 1200) {
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
  }

  _synth_chomp({ rate = 1 } = {}) { this._noise(0.08, 0.35, 900 * rate); this._tone('sine', 180 * rate, 60, 0.1, 0.35); }
  _synth_golden() { [660, 880, 1320].forEach((f, i) => this._tone('triangle', f, f, 0.12, 0.2, i * 0.06)); }
  _synth_hurt() { this._tone('sawtooth', 220, 70, 0.25, 0.25); }
  _synth_bump() { this._tone('sine', 120, 80, 0.1, 0.2); }
  _synth_boom() { this._noise(0.6, 0.6, 400); this._tone('sine', 90, 30, 0.5, 0.5); }
  _synth_levelup() { [440, 554, 659, 880].forEach((f, i) => this._tone('square', f, f, 0.1, 0.12, i * 0.08)); }
  _synth_gameover() { [392, 330, 262, 196].forEach((f, i) => this._tone('triangle', f, f * 0.98, 0.25, 0.2, i * 0.18)); }
}
