// DOM layer: HUD and overlay screens. Element ids are the contract with
// index.html; see README "Design hand-off" for the full list.
// Best score is saved in the browser (localStorage); no server involved.

const $ = (id) => document.getElementById(id);
const BEST_KEY = 'deepbite.best';

function loadBest() {
  try { return Number(localStorage.getItem(BEST_KEY) || 0); } catch { return 0; }
}
function saveBest(v) {
  try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* private mode: ignore */ }
}

export class UI {
  constructor() {
    this.el = {
      hud: $('hud'), score: $('score'), combo: $('combo'), level: $('level'),
      health: $('bar-health'), hunger: $('bar-hunger'), stamina: $('bar-stamina'),
      boostBtn: $('boost-btn'), pauseBtn: $('pause-btn'), muteBtn: $('mute-btn'),
      menu: $('screen-menu'), pause: $('screen-pause'), over: $('screen-over'),
      best: $('menu-best'),
      overScore: $('over-score'), overBest: $('over-best'), overStats: $('over-stats'),
    };
    this.best = loadBest();
    this.el.best.textContent = this.best.toLocaleString();
    this._last = {};
  }

  show(screen) {
    for (const s of ['menu', 'pause', 'over']) this.el[s].hidden = s !== screen;
    const playing = screen === null || screen === 'pause';
    this.el.hud.hidden = !playing;
    this.el.boostBtn.hidden = !(screen === null && this.touch);
  }

  setTouch(on) { this.touch = on; }

  setMuted(m) {
    this.el.muteBtn.setAttribute('aria-pressed', String(m));
    this.el.muteBtn.textContent = m ? 'Sound: off' : 'Sound: on';
  }

  // Called every frame; only touches the DOM when values change.
  updateHud(game) {
    const s = game.shark;
    this._set('score', game.score, (v) => { this.el.score.textContent = v.toLocaleString(); });
    this._set('combo', game.combo, (v) => { this.el.combo.textContent = v > 1 ? `x${v}` : ''; });
    this._set('level', game.level, (v) => { this.el.level.textContent = `Lv ${v}`; });
    this._bar('health', s.health);
    this._bar('hunger', s.hunger);
    this._bar('stamina', s.stamina);
  }

  _set(key, v, fn) { if (this._last[key] !== v) { this._last[key] = v; fn(v); } }
  _bar(key, value) {
    const v = Math.round(Math.max(0, value));
    this._set(key, v, () => {
      const el = this.el[key];
      el.style.setProperty('--value', v / 100);
      el.setAttribute('aria-valuenow', v);
      el.classList.toggle('low', v < 25);
    });
  }

  showGameOver(summary) {
    const isBest = summary.score > this.best;
    if (isBest) { this.best = summary.score; saveBest(this.best); this.el.best.textContent = this.best.toLocaleString(); }
    this.el.overScore.textContent = summary.score.toLocaleString();
    this.el.overBest.textContent = isBest ? 'New best!' : `Best: ${this.best.toLocaleString()}`;
    this.el.overStats.textContent = `Level ${summary.level} · ${summary.eaten} fish · ${summary.duration}s`;
    this.show('over');
  }
}
