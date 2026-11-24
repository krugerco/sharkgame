// Entry point: wires Game + Input + UI + Audio together and runs the loop.

import { Game } from './game.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { loadArt } from './art.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const input = new Input(canvas);
const ui = new UI();
const audio = new Audio();
let dpr = 1;
let mode = 'menu'; // menu | playing | paused | over

const vibrate = (ms) => navigator.vibrate?.(ms);

const game = new Game((type, data) => {
  switch (type) {
    case 'eat': audio.play('chomp', { rate: 1 + Math.min(data.combo, 8) * 0.05 }); break;
    case 'golden': audio.play('golden'); break;
    case 'bump': audio.play('bump'); break;
    case 'hurt': audio.play('hurt'); vibrate(80); break;
    case 'boom': audio.play('boom'); vibrate([60, 40, 120]); break;
    case 'levelup': audio.play('levelup'); break;
    case 'gameover':
      audio.play('gameover'); vibrate(200);
      setTimeout(() => { mode = 'over'; ui.showGameOver(data); }, 1200);
      break;
  }
});

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  game.resize(w, h);
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 100));
resize();

function start() {
  audio.unlock();
  audio.startMusic();
  input.reset();
  game.demo = false;
  game.reset();
  ui.setTouch(input.isTouch);
  mode = 'playing';
  ui.show(null);
}

function pause() {
  if (mode !== 'playing') return;
  mode = 'paused';
  input.reset();
  ui.show('pause');
}
function resume() {
  if (mode !== 'paused') return;
  mode = 'playing';
  ui.show(null);
}
function toMenu() { mode = 'menu'; game.demo = true; game.reset(); ui.show('menu'); }

input.onPause = () => (mode === 'playing' ? pause() : resume());
input.bindBoostButton(ui.el.boostBtn);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

document.addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  audio.unlock();
  switch (action) {
    case 'play': start(); break;
    case 'pause': pause(); break;
    case 'resume': resume(); break;
    case 'menu': toMenu(); break;
    case 'mute': audio.setMuted(!audio.muted); ui.setMuted(audio.muted); break;
  }
});
ui.setMuted(audio.muted);

// Fixed-timestep simulation, rendered every animation frame.
const STEP = 1 / 120;
let last = performance.now();
let acc = 0;
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (mode === 'playing' || mode === 'over' || mode === 'menu') {
    acc += dt;
    while (acc >= STEP) {
      // menu: let the world idle in the background with an attract-mode shark
      game.update(STEP, mode === 'menu' ? idleInput : input);
      acc -= STEP;
    }
  }
  game.render(ctx, dpr);
  if (mode === 'playing') ui.updateHud(game);
  requestAnimationFrame(frame);
}

// Attract-mode input: the shark lazily swims right on the title screen.
const idleInput = {
  pointer: { active: false }, boost: false,
  keyDirection: () => ({ x: 1, y: Math.sin(performance.now() / 1500) * 0.3 }),
};

game.demo = true;
loadArt().finally(() => {
  ui.show('menu');
  requestAnimationFrame(frame);
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Test/debug hook: /?debug exposes internals for automated play-testing.
if (new URLSearchParams(location.search).has('debug')) window.__deepbite = { game, ui, input, get mode() { return mode; } };
