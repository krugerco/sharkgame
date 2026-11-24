// Unified keyboard / mouse / touch input.
// Exposes a direction intent and boost flag; game.js turns it into movement.

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'boost', ShiftLeft: 'boost', ShiftRight: 'boost',
};

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pointer = { active: false, x: 0, y: 0, type: 'mouse' }; // CSS px
    this.pointerBoost = false;
    this.buttonBoost = false;
    this.isTouch = matchMedia('(pointer: coarse)').matches;
    this.onPause = null;
    this._activeTouchId = null;

    addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === 'Escape' || e.code === 'KeyP') { this.onPause?.(); return; }
      const k = KEYMAP[e.code];
      if (!k) return;
      e.preventDefault();
      this.keys.add(k);
      if (k !== 'boost') this.pointer.active = false; // keyboard takes over steering
    });
    addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) this.keys.delete(k); });
    addEventListener('blur', () => { this.keys.clear(); this.pointerBoost = false; this.buttonBoost = false; });

    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        this.isTouch = true;
        if (this._activeTouchId !== null) return;
        this._activeTouchId = e.pointerId;
      } else {
        this.pointerBoost = true; // hold mouse button to boost
      }
      this._setPointer(e);
      canvas.setPointerCapture?.(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' && e.pointerId !== this._activeTouchId) return;
      if (e.pointerType !== 'touch' || this._activeTouchId !== null) this._setPointer(e);
    });
    const end = (e) => {
      if (e.pointerType === 'touch') {
        if (e.pointerId !== this._activeTouchId) return;
        this._activeTouchId = null;
        this.pointer.active = false;
      } else {
        this.pointerBoost = false;
      }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _setPointer(e) {
    this.pointer.active = true;
    this.pointer.type = e.pointerType;
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
  }

  bindBoostButton(el) {
    const on = (e) => { e.preventDefault(); this.buttonBoost = true; };
    const off = () => { this.buttonBoost = false; };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('pointerleave', off);
  }

  /** Keyboard direction as {x,y}, or null if no direction key is held. */
  keyDirection() {
    const x = (this.keys.has('right') ? 1 : 0) - (this.keys.has('left') ? 1 : 0);
    const y = (this.keys.has('down') ? 1 : 0) - (this.keys.has('up') ? 1 : 0);
    if (!x && !y) return null;
    const m = Math.hypot(x, y);
    return { x: x / m, y: y / m };
  }

  get boost() { return this.keys.has('boost') || this.pointerBoost || this.buttonBoost; }

  reset() { this.keys.clear(); this.pointerBoost = false; this.buttonBoost = false; this.pointer.active = false; this._activeTouchId = null; }
}
