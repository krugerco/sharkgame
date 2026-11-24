// DOM layer: HUD, overlays, leaderboard. Element ids are the contract with
// index.html — see README "Design hand-off" for the full list.

import { fetchScores, submitScore } from './api.js';

const $ = (id) => document.getElementById(id);
const BEST_KEY = 'deepbite.best';
const NAME_KEY = 'deepbite.name';

export class UI {
  constructor() {
    this.el = {
      hud: $('hud'), score: $('score'), combo: $('combo'), level: $('level'),
      health: $('bar-health'), hunger: $('bar-hunger'), stamina: $('bar-stamina'),
      boostBtn: $('boost-btn'), pauseBtn: $('pause-btn'), muteBtn: $('mute-btn'),
      menu: $('screen-menu'), pause: $('screen-pause'), over: $('screen-over'), board: $('screen-board'),
      best: $('menu-best'),
      overScore: $('over-score'), overBest: $('over-best'), overStats: $('over-stats'),
      form: $('submit-form'), nameInput: $('name-input'), submitMsg: $('submit-msg'),
      overList: $('over-leaderboard'), boardList: $('board-list'),
    };
    this.best = Number(localStorage.getItem(BEST_KEY) || 0);
    this.el.nameInput.value = localStorage.getItem(NAME_KEY) || '';
    this.el.best.textContent = this.best;
    this._last = {};
  }

  show(screen) {
    for (const s of ['menu', 'pause', 'over', 'board']) this.el[s].hidden = s !== screen;
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
    if (isBest) { this.best = summary.score; localStorage.setItem(BEST_KEY, String(this.best)); this.el.best.textContent = this.best; }
    this.el.overScore.textContent = summary.score.toLocaleString();
    this.el.overBest.textContent = isBest ? 'New best!' : `Best: ${this.best.toLocaleString()}`;
    this.el.overStats.textContent = `Level ${summary.level} · ${summary.eaten} fish · ${summary.duration}s`;
    this.el.submitMsg.textContent = '';
    this.el.form.hidden = summary.score <= 0;
    this.el.form.querySelector('button').disabled = false;
    this._summary = summary;
    this.show('over');
    this.loadLeaderboard(this.el.overList, 5);
  }

  bindSubmit() {
    this.el.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = this.el.nameInput.value.trim();
      if (!name || !this._summary) return;
      localStorage.setItem(NAME_KEY, name);
      const btn = this.el.form.querySelector('button');
      btn.disabled = true;
      this.el.submitMsg.textContent = 'Submitting…';
      try {
        const { rank } = await submitScore({ name, ...this._summary });
        this.el.submitMsg.textContent = rank ? `You placed #${rank}!` : 'Submitted!';
        this.el.form.hidden = true;
        this.loadLeaderboard(this.el.overList, 5);
      } catch (err) {
        this.el.submitMsg.textContent = err.message;
        btn.disabled = false;
      }
    });
  }

  async loadLeaderboard(listEl, limit = 20) {
    listEl.innerHTML = '<li class="muted">Loading…</li>';
    try {
      const scores = await fetchScores(limit);
      listEl.innerHTML = '';
      if (!scores.length) { listEl.innerHTML = '<li class="muted">No scores yet. Be the first!</li>'; return; }
      for (const s of scores) {
        const li = document.createElement('li');
        const name = document.createElement('span'); name.className = 'name'; name.textContent = s.name;
        const score = document.createElement('span'); score.className = 'pts'; score.textContent = s.score.toLocaleString();
        li.append(name, score);
        listEl.append(li);
      }
    } catch (err) {
      listEl.innerHTML = '';
      const li = document.createElement('li'); li.className = 'muted'; li.textContent = err.message;
      listEl.append(li);
    }
  }
}
