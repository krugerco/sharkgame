// Source for the Shark Game 2D sprite set.
// Each sprite is a side view facing RIGHT, built from layered SVG shapes:
// countershading (dark back, pale belly), soft volume shading, fin detail
// and a low-opacity skin texture made with fractal noise.
// Run `node assets/sprites/src/build.js` to regenerate the SVG/PNG files.

const texture = (id, freq = 0.9, opacity = 0.18) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7" result="n"/>
    <feColorMatrix in="n" type="matrix"
      values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0" result="a"/>
    <feComposite in="a" in2="SourceGraphic" operator="in"/>
  </filter>`;

const softShadow = (id, blur = 3) => `
  <filter id="${id}" x="-20%" y="-20%" width="140%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/>
    <feOffset dy="${blur}" result="b"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

/* ------------------------------------------------------------------ */
/* Great white shark (player)                                          */
/* ------------------------------------------------------------------ */
function shark({ bite = false } = {}) {
  // Upper body outline; the lower jaw is drawn separately so it can open.
  const body = `M 499 133
    C 491 119, 470 105, 414 96
    C 360 90, 300 90, 248 95
    C 196 100, 148 110, 106 121
    L 70 128 L 70 140
    C 118 150, 178 162, 238 166
    C 318 171, 392 166, 440 157
    C 472 151, 490 143, 499 133 Z`;

  const jawAngle = bite ? 22 : 0;
  // Lower jaw, hinged at the corner of the mouth.
  const jaw = bite
    ? `M 430 151 C 452 156, 476 153, 494 141 C 488 156, 466 166, 432 166 Z`
    : `M 430 151 C 452 154, 476 150, 494 140 C 486 149, 468 156, 436 158 Z`;

  const fin = (d, extra = '') =>
    `<path d="${d}" fill="url(#sk-fin)" ${extra}/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256" width="512" height="256">
  <defs>
    <linearGradient id="sk-body" x1="0" y1="90" x2="0" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3b4852"/>
      <stop offset="0.45" stop-color="#5d6d79"/>
      <stop offset="0.62" stop-color="#7d8c96"/>
      <stop offset="1" stop-color="#8f9ca5"/>
    </linearGradient>
    <linearGradient id="sk-belly" x1="0" y1="135" x2="0" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#e9ecec"/>
      <stop offset="1" stop-color="#c9cfd2"/>
    </linearGradient>
    <linearGradient id="sk-fin" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#56656f"/>
      <stop offset="0.7" stop-color="#3c4851"/>
      <stop offset="1" stop-color="#262f35"/>
    </linearGradient>
    <linearGradient id="sk-pec" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#55636d"/>
      <stop offset="0.75" stop-color="#3a4750"/>
      <stop offset="1" stop-color="#15191c"/>
    </linearGradient>
    <radialGradient id="sk-sheen" cx="0.62" cy="0.18" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sk-under" x1="0" y1="140" x2="0" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="sk-mouth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a1e24"/>
      <stop offset="1" stop-color="#2a0c10"/>
    </linearGradient>
    <linearGradient id="sk-len" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0d1418" stop-opacity="0.35"/>
      <stop offset="0.4" stop-color="#0d1418" stop-opacity="0"/>
      <stop offset="0.9" stop-color="#0d1418" stop-opacity="0"/>
      <stop offset="1" stop-color="#0d1418" stop-opacity="0.12"/>
    </linearGradient>
    <filter id="sk-blur" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <clipPath id="sk-clip"><path d="${body}"/></clipPath>
    ${texture('sk-tex', 1.1, 0.22)}
    ${softShadow('sk-shadow', 2)}
  </defs>

  <g filter="url(#sk-shadow)">
    <!-- far-side pectoral fin, darker and partly hidden -->
    ${fin('M 380 156 C 372 170, 360 184, 346 194 C 360 190, 378 178, 392 160 Z', 'opacity="0.55"')}

    <!-- tail (heterocercal crescent, upper lobe slightly longer) -->
    <path d="M 84 124 C 64 100, 38 64, 12 34 C 20 70, 34 108, 48 134
             C 36 156, 24 182, 18 206 C 42 186, 64 162, 84 144 Z" fill="url(#sk-fin)"/>
    <path d="M 84 124 C 64 100, 38 64, 12 34 C 26 66, 44 100, 60 128 Z" fill="#000" opacity="0.12"/>

    <!-- dorsal fin -->
    <path d="M 316 95 C 300 68, 274 40, 246 20 C 252 48, 248 74, 234 98 Z" fill="url(#sk-fin)"/>
    <path d="M 316 95 C 300 68, 274 40, 246 20 C 262 46, 278 72, 292 96 Z" fill="#fff" opacity="0.07"/>

    <!-- second dorsal + anal fin + pelvic fin -->
    ${fin('M 132 115 C 128 107, 122 101, 114 97 C 116 104, 116 112, 118 118 Z')}
    ${fin('M 126 146 C 122 154, 116 160, 108 164 C 114 157, 114 150, 112 144 Z')}
    ${fin('M 206 163 C 194 172, 182 181, 166 188 C 182 186, 198 180, 216 166 Z')}

    <!-- lower jaw (rotates open for the bite frame) -->
    <g transform="rotate(${jawAngle} 432 152)">
      ${bite ? `<path d="M 432 150 L 494 140 L 492 146 C 476 154, 452 158, 432 156 Z" fill="url(#sk-mouth)"/>` : ''}
      <path d="${jaw}" fill="url(#sk-belly)"/>
      ${bite ? lowerTeeth() : ''}
    </g>

    ${bite ? `<path d="M 430 150 C 452 154, 476 150, 494 138 L 494 146 C 474 160, 450 162, 430 158 Z" fill="url(#sk-mouth)"/>` : ''}

    <!-- body -->
    <path d="${body}" fill="url(#sk-body)"/>
    <g clip-path="url(#sk-clip)">
      <!-- countershading: irregular line between grey back and white belly -->
      <path d="M 500 140 C 482 146, 464 141, 446 146 C 428 151, 414 140, 396 143
               C 376 146, 362 139, 344 144 C 322 150, 304 142, 284 147
               C 260 153, 236 146, 212 151 C 186 156, 160 146, 134 147
               C 110 148, 88 140, 66 140 L 66 200 L 500 200 Z" fill="url(#sk-belly)"/>
      <path d="${body}" fill="url(#sk-under)"/>
      <!-- shadow band where the flank turns under, gives a rounded body -->
      <path d="M 500 138 C 470 140, 430 136, 380 138 C 300 141, 200 144, 66 137" stroke="#1d262c" stroke-width="10" fill="none" opacity="0.18" filter="url(#sk-blur)"/>
      <!-- light band along the upper back -->
      <path d="M 470 108 C 420 100, 340 97, 250 101 C 190 104, 140 113, 90 124" stroke="#c9d4da" stroke-width="9" fill="none" opacity="0.18" filter="url(#sk-blur)"/>
      <!-- tail end falls into shadow -->
      <rect x="60" y="80" width="450" height="100" fill="url(#sk-len)"/>
      <path d="${body}" fill="url(#sk-sheen)"/>
      <rect x="60" y="80" width="450" height="100" filter="url(#sk-tex)"/>
      <!-- lateral keel on the caudal peduncle -->
      <path d="M 70 134 C 90 132, 110 131, 130 132" stroke="#2c363d" stroke-width="2" fill="none" opacity="0.5"/>
    </g>

    <!-- gill slits -->
    <g stroke="#2a333a" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.75">
      <path d="M 420 112 C 416 124, 416 136, 420 148"/>
      <path d="M 410 111 C 406 124, 406 137, 410 150"/>
      <path d="M 400 110 C 396 124, 396 138, 400 152"/>
      <path d="M 390 110 C 386 124, 386 139, 390 153"/>
      <path d="M 380 110 C 376 124, 376 139, 380 153"/>
    </g>

    ${bite ? upperTeeth() : ''}

    <!-- mouth line -->
    <path d="M 492 140 C 476 150, 452 154, 430 150" stroke="#1e2428" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="${bite ? 0 : 0.85}"/>
    <!-- nostril -->
    <path d="M 486 126 C 482 126, 479 128, 478 130" stroke="#1e2428" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <!-- ampullae (sensory pores) -->
    <g fill="#1e2428" opacity="0.35">
      <circle cx="478" cy="120" r="0.9"/><circle cx="472" cy="117" r="0.9"/>
      <circle cx="484" cy="134" r="0.9"/><circle cx="476" cy="136" r="0.9"/>
      <circle cx="468" cy="133" r="0.9"/><circle cx="490" cy="129" r="0.9"/>
    </g>
    <!-- eye: flat black, small highlight -->
    <ellipse cx="458" cy="121" rx="5.2" ry="4.8" fill="#0b0d0f"/>
    <ellipse cx="458" cy="121" rx="6.6" ry="6" fill="none" stroke="#2a3238" stroke-width="1.2" opacity="0.7"/>
    <circle cx="459.8" cy="119.3" r="1.3" fill="#fff" opacity="0.8"/>

    <!-- near-side pectoral fin: long, swept back, black tip -->
    <path d="M 372 150 C 352 174, 324 202, 290 226 C 318 220, 348 196, 386 158 Z" fill="url(#sk-pec)"/>
    <path d="M 372 150 C 352 174, 324 202, 290 226 C 312 206, 340 180, 362 154 Z" fill="#fff" opacity="0.08"/>
  </g>
</svg>`;

  function upperTeeth() {
    // Serrated triangular upper teeth along the gum line.
    let t = '';
    for (let i = 0; i < 9; i++) {
      const x = 436 + i * 6.6;
      const y = 150.5 - i * 1.0 - (i > 6 ? (i - 6) * 1.6 : 0);
      const h = 6.5 - Math.abs(i - 4) * 0.35;
      t += `<path d="M ${x - 2.8} ${y} L ${x} ${y + h} L ${x + 2.8} ${y} Z" fill="#f3efe4" stroke="#b9b2a1" stroke-width="0.4"/>`;
    }
    return t;
  }
  function lowerTeeth() {
    let t = '';
    for (let i = 0; i < 8; i++) {
      const x = 440 + i * 6.4;
      const y = 155.5 - i * 1.3 - (i > 5 ? (i - 5) * 1.4 : 0);
      t += `<path d="M ${x - 2.2} ${y} L ${x} ${y - 5.5} L ${x + 2.2} ${y} Z" fill="#f3efe4" stroke="#b9b2a1" stroke-width="0.4"/>`;
    }
    return t;
  }
}

/* ------------------------------------------------------------------ */
/* Sardine (small schooling prey)                                      */
/* ------------------------------------------------------------------ */
function sardine() {
  const body = `M 120 32 C 112 22, 92 17, 66 17 C 46 17, 30 22, 18 30
    L 18 34 C 30 41, 46 45, 66 45 C 92 45, 112 41, 120 32 Z`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="sa-b" x1="0" y1="17" x2="0" y2="45" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1f4a5c"/>
      <stop offset="0.32" stop-color="#3f7b8c"/>
      <stop offset="0.45" stop-color="#b9d0d6"/>
      <stop offset="0.7" stop-color="#e6eef0"/>
      <stop offset="1" stop-color="#c6d2d6"/>
    </linearGradient>
    <linearGradient id="sa-iri" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9ef0e0" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#c8b6ff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#9ef0e0" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sa-f" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7f9aa3" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#a9bcc2" stop-opacity="0.85"/>
    </linearGradient>
    <clipPath id="sa-c"><path d="${body}"/></clipPath>
    ${texture('sa-t', 2.2, 0.16)}
  </defs>
  <!-- forked tail -->
  <path d="M 22 31 C 16 24, 10 16, 3 10 C 7 20, 9 27, 10 32 C 9 37, 7 44, 3 54 C 10 48, 16 40, 22 33 Z" fill="url(#sa-f)"/>
  <path d="M 72 18 C 68 12, 62 9, 56 8 C 58 12, 58 15, 58 18 Z" fill="url(#sa-f)"/>
  <path d="M 50 44 C 47 48, 43 50, 39 51 C 41 48, 42 46, 42 44 Z" fill="url(#sa-f)"/>
  <path d="${body}" fill="url(#sa-b)"/>
  <g clip-path="url(#sa-c)">
    <rect x="18" y="26" width="102" height="9" fill="url(#sa-iri)"/>
    <!-- row of dark spots typical of sardines -->
    <g fill="#183a48" opacity="0.6">
      <circle cx="88" cy="26" r="1.5"/><circle cx="80" cy="26.5" r="1.3"/>
      <circle cx="72" cy="27" r="1.2"/><circle cx="64" cy="27.3" r="1.1"/>
    </g>
    <rect x="16" y="14" width="106" height="34" filter="url(#sa-t)"/>
    <path d="${body}" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>
  </g>
  <!-- operculum (gill cover) -->
  <path d="M 100 21 C 96 27, 96 36, 100 42" stroke="#6b8a92" stroke-width="1.2" fill="none" opacity="0.8"/>
  <path d="M 120 32 C 116 34, 112 35, 108 35" stroke="#47606a" stroke-width="0.9" fill="none"/>
  <circle cx="110" cy="28" r="3.6" fill="#e9eef0"/>
  <circle cx="110" cy="28" r="2.4" fill="#111"/>
  <circle cx="110.8" cy="27.2" r="0.7" fill="#fff"/>
  <path d="M 84 38 C 80 42, 74 44, 70 45 C 74 42, 77 40, 80 37 Z" fill="url(#sa-f)"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Bluefin tuna (larger prey)                                          */
/* ------------------------------------------------------------------ */
function tuna() {
  const body = `M 246 66 C 236 46, 206 34, 160 33 C 118 32, 82 40, 56 54
    L 40 62 L 40 70 L 56 78 C 82 92, 118 100, 160 99 C 206 98, 236 86, 246 66 Z`;
  let finlets = '';
  for (let i = 0; i < 7; i++) {
    const x = 60 + i * 9;
    finlets += `<path d="M ${x} ${50 - i * 0.6} l -6 -5 l 4 6 Z" fill="#e8c23a"/>`;
    finlets += `<path d="M ${x} ${82 + i * 0.6} l -6 5 l 4 -6 Z" fill="#e8c23a"/>`;
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128" width="256" height="128">
  <defs>
    <linearGradient id="tu-b" x1="0" y1="33" x2="0" y2="99" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0e1f3d"/>
      <stop offset="0.35" stop-color="#1f3f73"/>
      <stop offset="0.5" stop-color="#8fa7bd"/>
      <stop offset="0.62" stop-color="#d9e2e8"/>
      <stop offset="1" stop-color="#b6c2ca"/>
    </linearGradient>
    <linearGradient id="tu-f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#20304f"/>
      <stop offset="1" stop-color="#0d1730"/>
    </linearGradient>
    <radialGradient id="tu-sh" cx="0.6" cy="0.25" r="0.55">
      <stop offset="0" stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="tu-c"><path d="${body}"/></clipPath>
    ${texture('tu-t', 1.6, 0.16)}
  </defs>
  <!-- lunate tail -->
  <path d="M 46 64 C 34 50, 22 30, 6 12 C 16 34, 22 52, 26 66 C 22 80, 16 98, 6 120 C 22 102, 34 82, 46 68 Z" fill="url(#tu-f)"/>
  <!-- first and second dorsal, anal -->
  <path d="M 178 34 C 170 22, 160 14, 148 10 C 150 18, 150 26, 146 33 Z" fill="url(#tu-f)"/>
  <path d="M 122 34 C 118 24, 112 18, 104 14 C 106 22, 104 30, 100 36 Z" fill="#d1a72a"/>
  <path d="M 120 98 C 116 108, 110 114, 102 118 C 104 110, 102 102, 98 96 Z" fill="#d1a72a"/>
  ${finlets}
  <path d="${body}" fill="url(#tu-b)"/>
  <g clip-path="url(#tu-c)">
    <!-- faint vertical silver bars -->
    <g stroke="#cfdbe4" stroke-width="2" opacity="0.25">
      ${Array.from({ length: 10 }, (_, i) => `<line x1="${80 + i * 14}" y1="70" x2="${84 + i * 14}" y2="96"/>`).join('')}
    </g>
    <path d="${body}" fill="url(#tu-sh)"/>
    <rect x="38" y="30" width="210" height="72" filter="url(#tu-t)"/>
    <path d="M 40 66 C 60 65, 80 64, 100 64" stroke="#0b1428" stroke-width="2.4" opacity="0.6"/>
  </g>
  <!-- operculum, mouth, eye -->
  <path d="M 214 44 C 204 56, 204 76, 212 90" stroke="#3b5068" stroke-width="1.6" fill="none"/>
  <path d="M 246 67 C 240 70, 232 71, 226 70" stroke="#2a3a50" stroke-width="1.4" fill="none"/>
  <circle cx="228" cy="58" r="6" fill="#d8dfe4"/>
  <circle cx="228" cy="58" r="4.2" fill="#0a0c10"/>
  <circle cx="229.5" cy="56.5" r="1.2" fill="#fff"/>
  <!-- pectoral fin -->
  <path d="M 196 68 C 180 70, 162 72, 146 76 C 162 78, 182 78, 198 74 Z" fill="url(#tu-f)"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Moon jellyfish (hazard / drifting obstacle)                         */
/* ------------------------------------------------------------------ */
function jellyfish() {
  const tentacles = Array.from({ length: 14 }, (_, i) => {
    const x = 26 + i * 5.7;
    const w = (i % 2 ? 6 : -6);
    return `<path d="M ${x} 70 C ${x + w} 100, ${x - w} 130, ${x + w * 0.6} 170 S ${x - w} 210, ${x} 244"
      stroke="#e8d9ff" stroke-width="${i % 3 ? 0.9 : 1.4}" fill="none" opacity="0.55"/>`;
  }).join('');
  const arms = [42, 58, 74, 88].map((x, i) => `
    <path d="M ${x} 66 C ${x + 10} 96, ${x - 12} 126, ${x + 6} 170 C ${x + 10} 190, ${x - 6} 210, ${x + 2} 226"
      stroke="url(#je-arm)" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M ${x} 66 C ${x + 10} 96, ${x - 12} 126, ${x + 6} 170"
      stroke="#fff" stroke-width="1" fill="none" opacity="0.4" stroke-dasharray="2 4"/>`).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 256" width="128" height="256">
  <defs>
    <radialGradient id="je-bell" cx="0.5" cy="0.25" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="0.5" stop-color="#d9c8f5" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#9c8ad8" stop-opacity="0.3"/>
    </radialGradient>
    <linearGradient id="je-arm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4c7e8"/>
      <stop offset="1" stop-color="#c9a6f0" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="je-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${tentacles}
  ${arms}
  <g filter="url(#je-glow)">
    <path d="M 10 70 C 10 30, 36 10, 64 10 C 92 10, 118 30, 118 70
             C 110 74, 104 68, 96 72 C 88 76, 80 70, 72 74 C 66 76, 62 76, 56 74
             C 48 70, 40 76, 32 72 C 24 68, 18 74, 10 70 Z" fill="url(#je-bell)"/>
    <!-- four horseshoe gonads characteristic of moon jellies -->
    <g fill="none" stroke="#e79acb" stroke-width="3.5" opacity="0.8" stroke-linecap="round">
      <path d="M 38 46 C 36 36, 46 30, 52 36"/>
      <path d="M 56 36 C 58 28, 70 28, 72 36"/>
      <path d="M 76 36 C 82 30, 92 36, 90 46"/>
      <path d="M 48 52 C 56 58, 72 58, 80 52"/>
    </g>
    <!-- radial canals -->
    <g stroke="#ffffff" stroke-width="0.7" opacity="0.4" fill="none">
      ${Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (0.08 + i * 0.105);
        return `<path d="M 64 40 L ${64 - Math.cos(a) * 54} ${40 + Math.sin(a) * 30}"/>`;
      }).join('')}
    </g>
    <path d="M 22 28 C 34 16, 52 12, 66 13" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.6" stroke-linecap="round"/>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Green sea turtle                                                    */
/* ------------------------------------------------------------------ */
function turtle() {
  // Hexagonal-ish scutes on the carapace.
  const scutes = [
    'M 96 44 C 104 32, 122 28, 136 32 L 132 52 L 104 56 Z',
    'M 136 32 C 150 28, 168 30, 178 38 L 170 56 L 132 52 Z',
    'M 178 38 C 186 44, 192 52, 194 60 L 176 66 L 170 56 Z',
    'M 104 56 L 132 52 L 136 72 L 106 76 Z',
    'M 132 52 L 170 56 L 168 74 L 136 72 Z',
    'M 170 56 L 176 66 L 194 60 C 196 68, 194 74, 190 78 L 168 74 Z',
    'M 70 64 C 76 54, 86 48, 96 44 L 104 56 L 106 76 L 76 78 Z',
  ];
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128" width="256" height="128">
  <defs>
    <radialGradient id="tt-shell" cx="0.55" cy="0.3" r="0.7">
      <stop offset="0" stop-color="#8a6a3c"/>
      <stop offset="0.6" stop-color="#5e4423"/>
      <stop offset="1" stop-color="#3a2a16"/>
    </radialGradient>
    <linearGradient id="tt-scute" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a3803f"/>
      <stop offset="0.5" stop-color="#6c4d24"/>
      <stop offset="1" stop-color="#4a3418"/>
    </linearGradient>
    <linearGradient id="tt-skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6f7a52"/>
      <stop offset="1" stop-color="#b7b48a"/>
    </linearGradient>
    <pattern id="tt-scales" width="7" height="6" patternUnits="userSpaceOnUse">
      <rect width="7" height="6" fill="url(#tt-skin)"/>
      <path d="M 0 6 C 1 2, 6 2, 7 6" fill="none" stroke="#3e4428" stroke-width="0.8" opacity="0.6"/>
    </pattern>
    ${texture('tt-t', 1.4, 0.25)}
  </defs>
  <!-- far flippers -->
  <path d="M 120 82 C 110 96, 96 110, 76 122 C 100 118, 122 104, 140 86 Z" fill="#4e5838"/>
  <path d="M 70 78 C 60 82, 50 88, 40 96 C 54 94, 66 88, 78 82 Z" fill="#4e5838"/>
  <!-- head and neck -->
  <path d="M 196 64 C 206 54, 222 50, 236 52 C 248 54, 252 62, 250 68 C 246 76, 232 80, 218 78 C 208 78, 200 74, 196 70 Z" fill="url(#tt-scales)"/>
  <path d="M 222 54 C 230 50, 240 52, 246 58 L 232 62 Z" fill="#4d5634" opacity="0.7"/>
  <path d="M 250 67 C 244 70, 236 70, 230 69" stroke="#2c3020" stroke-width="1.4" fill="none"/>
  <circle cx="234" cy="60" r="3.4" fill="#120e08"/>
  <circle cx="235" cy="59" r="1" fill="#fff" opacity="0.8"/>
  <!-- plastron (belly) -->
  <path d="M 66 74 C 90 88, 150 92, 196 76 L 194 70 C 150 82, 96 82, 68 68 Z" fill="#d8cf9a"/>
  <!-- carapace -->
  <path d="M 64 72 C 66 48, 100 26, 140 26 C 178 26, 200 50, 198 74 C 160 86, 100 86, 64 72 Z" fill="url(#tt-shell)"/>
  ${scutes.map((d) => `<path d="${d}" fill="url(#tt-scute)" stroke="#2b1e0e" stroke-width="1.6" stroke-linejoin="round"/>`).join('')}
  <g stroke="#c9a462" stroke-width="0.6" fill="none" opacity="0.45">
    <path d="M 110 50 C 116 44, 124 42, 130 44"/><path d="M 144 44 C 152 40, 162 42, 168 46"/>
    <path d="M 112 68 C 118 64, 126 64, 130 66"/><path d="M 142 66 C 150 62, 158 62, 164 66"/>
  </g>
  <path d="M 64 72 C 66 48, 100 26, 140 26 C 178 26, 200 50, 198 74 C 160 86, 100 86, 64 72 Z" filter="url(#tt-t)" fill="#000"/>
  <path d="M 96 34 C 116 26, 150 24, 174 34" stroke="#fff" stroke-width="3" fill="none" opacity="0.18" stroke-linecap="round"/>
  <!-- marginal scutes -->
  <path d="M 64 72 C 100 86, 160 86, 198 74" stroke="#2b1e0e" stroke-width="2" fill="none"/>
  <!-- near front flipper (long paddle) and rear flipper -->
  <path d="M 178 78 C 172 96, 156 112, 128 124 C 160 122, 186 104, 196 80 Z" fill="url(#tt-scales)" stroke="#3e4428" stroke-width="1"/>
  <path d="M 82 78 C 70 86, 58 92, 44 100 C 62 100, 78 92, 92 82 Z" fill="url(#tt-scales)" stroke="#3e4428" stroke-width="1"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Harbor seal                                                         */
/* ------------------------------------------------------------------ */
function seal() {
  const body = `M 246 62 C 244 50, 232 42, 216 42 C 196 42, 176 38, 150 38
    C 116 38, 82 46, 56 58 C 44 63, 34 66, 26 66 L 26 74
    C 40 76, 56 80, 76 86 C 106 94, 146 96, 180 92 C 206 89, 230 82, 242 72 C 246 68, 247 65, 246 62 Z`;
  const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const spots = Array.from({ length: 70 }, (_, i) => {
    const x = 40 + rnd(i, 1) * 196;
    const y = 42 + rnd(i, 2) * 40;
    const r = 0.8 + rnd(i, 3) * rnd(i, 4) * 3.2;
    return `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="#2a2a28" opacity="${0.35 + (i % 4) * 0.1}"/>`;
  }).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128" width="256" height="128">
  <defs>
    <linearGradient id="se-b" x1="0" y1="38" x2="0" y2="96" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#5a5a55"/>
      <stop offset="0.45" stop-color="#8d8a80"/>
      <stop offset="1" stop-color="#c9c3b4"/>
    </linearGradient>
    <radialGradient id="se-sh" cx="0.65" cy="0.2" r="0.55">
      <stop offset="0" stop-color="#fff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="se-fl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#55534d"/>
      <stop offset="1" stop-color="#2c2b28"/>
    </linearGradient>
    <clipPath id="se-c"><path d="${body}"/></clipPath>
    ${texture('se-t', 1.8, 0.2)}
  </defs>
  <!-- rear flippers (fanned, held together) -->
  <path d="M 32 66 C 22 56, 12 48, 2 44 C 8 54, 10 62, 10 70 C 10 78, 8 86, 2 96 C 14 92, 24 84, 32 74 Z" fill="url(#se-fl)"/>
  <g stroke="#1f1e1c" stroke-width="0.8" opacity="0.6" fill="none">
    <path d="M 26 68 L 6 50"/><path d="M 26 70 L 8 62"/><path d="M 26 72 L 8 80"/><path d="M 26 72 L 6 90"/>
  </g>
  <path d="${body}" fill="url(#se-b)"/>
  <g clip-path="url(#se-c)">
    ${spots}
    <path d="${body}" fill="url(#se-sh)"/>
    <rect x="20" y="36" width="230" height="64" filter="url(#se-t)"/>
  </g>
  <!-- face -->
  <ellipse cx="236" cy="62" rx="9" ry="7" fill="#6e6a60" opacity="0.6"/>
  <ellipse cx="244" cy="58" rx="2" ry="1.4" fill="#151412"/>
  <ellipse cx="220" cy="52" rx="5.2" ry="5" fill="#0c0b0a"/>
  <circle cx="221.8" cy="50.4" r="1.6" fill="#fff" opacity="0.85"/>
  <g stroke="#e9e4d6" stroke-width="0.6" opacity="0.8" fill="none" stroke-linecap="round">
    <path d="M 238 64 C 246 66, 252 70, 255 74"/><path d="M 238 65 C 246 70, 250 76, 252 80"/>
    <path d="M 236 64 C 244 64, 252 64, 256 66"/><path d="M 236 66 C 242 72, 246 78, 246 84"/>
  </g>
  <path d="M 244 66 C 240 70, 234 70, 230 68" stroke="#2e2c28" stroke-width="1.2" fill="none"/>
  <!-- fore flipper -->
  <path d="M 196 84 C 190 96, 180 104, 166 110 C 180 110, 196 102, 206 88 Z" fill="url(#se-fl)"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Background tiles                                                    */
/* ------------------------------------------------------------------ */
function oceanBackground() {
  const rays = Array.from({ length: 7 }, (_, i) => {
    const x = 120 + i * 260 + (i % 2) * 70;
    const w = 50 + (i % 3) * 30;
    // drawn three times, one tile apart, so rays crossing an edge wrap seamlessly
    return [-1920, 0, 1920].map((dx) => `<path d="M ${x + dx} 0 L ${x + dx + w} 0 L ${x + dx + w * 3.4 - 100} 1080 L ${x + dx + w * 1.4 - 260} 1080 Z" fill="url(#bg-ray)" opacity="${0.35 + (i % 3) * 0.12}"/>`).join('');
  }).join('');
  const particles = Array.from({ length: 140 }, (_, i) => {
    const x = (i * 137.5) % 1920;
    const y = (i * 263.1) % 1080;
    const r = 0.6 + (i % 5) * 0.35;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#dff6ff" opacity="${(0.08 + (i % 7) * 0.035).toFixed(3)}"/>`;
  }).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg-water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2f8fb0"/>
      <stop offset="0.35" stop-color="#14607f"/>
      <stop offset="0.75" stop-color="#0a3a52"/>
      <stop offset="1" stop-color="#05202f"/>
    </linearGradient>
    <linearGradient id="bg-ray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9f7ff" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#d9f7ff" stop-opacity="0"/>
    </linearGradient>
    <filter id="bg-blur"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="bg-caustic" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.012 0.03" numOctaves="2" seed="3" stitchTiles="stitch" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.97  0 0 0 0 1  0 0 0 -2.2 1.25"/>
    </filter>
    <linearGradient id="bg-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff"/><stop offset="0.3" stop-color="#000"/>
    </linearGradient>
    <mask id="bg-top"><rect width="1920" height="1080" fill="url(#bg-fade)"/></mask>
  </defs>
  <rect width="1920" height="1080" fill="url(#bg-water)"/>
  <rect width="1920" height="1080" filter="url(#bg-caustic)" mask="url(#bg-top)" opacity="0.18"/>
  <g filter="url(#bg-blur)">${rays}</g>
  ${particles}
</svg>`;
}

function seabed() {
  // Tileable horizontally: first and last points share the same height.
  const pts = [];
  for (let x = 0; x <= 1920; x += 80) {
    const y = 120 + Math.sin(x / 1920 * Math.PI * 4) * 22 + Math.sin(x / 1920 * Math.PI * 10) * 9;
    pts.push([x, y]);
  }
  const ridge = 'M 0 300 L ' + pts.map(([x, y]) => `${x} ${y.toFixed(1)}`).join(' L ') + ' L 1920 300 Z';
  const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  // Irregular boulders: a jittered polygon smoothed with quadratic curves.
  const rock = (x, y, r, seed, fill) => {
    const n = 9, pts = [];
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      const rr = r * (0.75 + rnd(seed, i) * 0.4);
      pts.push([x + Math.cos(a) * rr * 1.25, y + Math.sin(a) * rr * 0.8]);
    }
    let d = `M ${pts[0][0].toFixed(1)} ${(y + 40).toFixed(1)} L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1], [cx, cy] = pts[i];
      d += ` Q ${px.toFixed(1)} ${py.toFixed(1)} ${((px + cx) / 2).toFixed(1)} ${((py + cy) / 2).toFixed(1)}`;
    }
    d += ` L ${pts[n][0].toFixed(1)} ${pts[n][1].toFixed(1)} L ${pts[n][0].toFixed(1)} ${(y + 40).toFixed(1)} Z`;
    return `<path d="${d}" fill="${fill}"/>
      <path d="${d}" fill="url(#sb-rocklight)"/>
      <path d="${d}" filter="url(#sb-t)" fill="#000"/>
      <ellipse cx="${x}" cy="${y + 36}" rx="${r * 1.6}" ry="${r * 0.32 + 8}" fill="#3f5348" opacity="0.95" filter="url(#sb-soft)"/>`;
  };
  const farRocks = [[400, 120, 60], [860, 112, 40], [1320, 118, 70], [1680, 116, 44]]
    .map(([x, y, r], i) => rock(x, y, r, i + 20, '#2f4c55')).join('');
  const rocks = [[180, 150, 64], [620, 132, 40], [1020, 160, 86], [1460, 140, 52], [1780, 156, 58]]
    .map(([x, y, r], i) => rock(x, y, r, i + 1, 'url(#sb-rock)')).join('');
  // Kelp: a swaying stalk with alternating, ruffled blades and gas bladders.
  const kelp = [90, 330, 360, 780, 1180, 1210, 1600, 1840].map((x, i) => {
    const h = 170 + (i % 3) * 70;
    const sway = (i % 2 ? 1 : -1) * 22;
    const at = (t) => [x + Math.sin(t * Math.PI * 1.5) * sway * t, 160 - h * t];
    let blades = '';
    for (let j = 1; j <= 7; j++) {
      const t = j / 8, [bx, by] = at(t), s = j % 2 ? 1 : -1, L = 34 + rnd(i, j) * 18;
      blades += `<path d="M ${bx.toFixed(1)} ${by.toFixed(1)}
        c ${8 * s} -6, ${L * 0.6 * s} -14, ${L * s} -10
        c ${-4 * s} 3, ${-8 * s} 1, ${-12 * s} 4
        c ${-6 * s} 2, ${-12 * s} 6, ${-(L - 12) * s} 6 Z" fill="url(#sb-blade)" opacity="0.92"/>
        <circle cx="${(bx + 3 * s).toFixed(1)}" cy="${(by - 2).toFixed(1)}" r="2.6" fill="#8a8a3a"/>`;
    }
    const [mx, my] = at(0.5), [ex, ey] = at(1);
    return `<path d="M ${x} 160 Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"
      stroke="url(#sb-kelp)" stroke-width="5" fill="none" stroke-linecap="round"/>${blades}`;
  }).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 300" width="1920" height="300">
  <defs>
    <linearGradient id="sb-sand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7c8f7d"/>
      <stop offset="0.4" stop-color="#4f6458"/>
      <stop offset="1" stop-color="#22322f"/>
    </linearGradient>
    <linearGradient id="sb-rock" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#55706f"/>
      <stop offset="1" stop-color="#1d2a2c"/>
    </linearGradient>
    <radialGradient id="sb-rocklight" cx="0.4" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#a9cdd2" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#a9cdd2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sb-blade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5a6b25"/>
      <stop offset="0.5" stop-color="#8a8c34"/>
      <stop offset="1" stop-color="#5f6a26"/>
    </linearGradient>
    <linearGradient id="sb-kelp" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#2d4f22"/>
      <stop offset="1" stop-color="#6b9a3d"/>
    </linearGradient>
    ${texture('sb-t', 0.6, 0.35)}
    <filter id="sb-soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <g opacity="0.55">${farRocks}</g>
  ${kelp}
  <path d="${ridge}" fill="url(#sb-sand)"/>
  <path d="${ridge}" filter="url(#sb-t)" fill="#000"/>
  ${rocks}
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Shared fish builder                                                 */
/* ------------------------------------------------------------------ */
const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };

// o.body: outline path. o.colors: [back, mid, light, belly] top-to-bottom.
// o.span: [yTop, yBottom] of the body for the gradient. o.behind / o.pattern /
// o.front: extra markup (fins behind body, markings clipped to body, fins in front).
function fishSVG(o) {
  const { id, w = 256, h = 128, body, colors, span } = o;
  const [c0, c1, c2, c3] = colors;
  const fin = o.fin || [c0, c1, 0.85];
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="${id}-b" x1="0" y1="${span[0]}" x2="0" y2="${span[1]}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${c0}"/>
      <stop offset="${o.mid ?? 0.4}" stop-color="${c1}"/>
      <stop offset="${o.light ?? 0.58}" stop-color="${c2}"/>
      <stop offset="1" stop-color="${c3}"/>
    </linearGradient>
    <linearGradient id="${id}-f" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${fin[0]}" stop-opacity="${fin[2]}"/>
      <stop offset="1" stop-color="${fin[1]}" stop-opacity="${Math.min(1, fin[2] + 0.1)}"/>
    </linearGradient>
    <radialGradient id="${id}-sh" cx="0.62" cy="0.22" r="0.6">
      <stop offset="0" stop-color="#fff" stop-opacity="${o.sheen ?? 0.32}"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-u" x1="0" y1="${span[0]}" x2="0" y2="${span[1]}" gradientUnits="userSpaceOnUse">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
    </linearGradient>
    <clipPath id="${id}-c"><path d="${body}"/></clipPath>
    ${texture(`${id}-t`, o.tex ?? 1.6, 0.17)}
    ${o.defs || ''}
  </defs>
  ${o.under || ''}
  ${o.behind || ''}
  <path d="${body}" fill="url(#${id}-b)"/>
  <g clip-path="url(#${id}-c)">
    ${o.pattern || ''}
    <path d="${body}" fill="url(#${id}-u)"/>
    <path d="${body}" fill="url(#${id}-sh)"/>
    <rect width="${w}" height="${h}" filter="url(#${id}-t)"/>
    <path d="${body}" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="2.5"/>
  </g>
  ${o.gill ? `<path d="${o.gill}" stroke="#000" stroke-opacity="0.32" stroke-width="1.6" fill="none"/>` : ''}
  ${o.mouth ? `<path d="${o.mouth}" stroke="#000" stroke-opacity="0.55" stroke-width="${o.mouthW || 1.4}" fill="none" stroke-linecap="round"/>` : ''}
  ${o.eye ? eye(o.eye) : ''}
  ${o.front || ''}
</svg>`;
}

function eye([x, y, r, iris = '#c9d2d6']) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#000" stroke-opacity="0.35" stroke-width="0.8"/>
  <circle cx="${x + r * 0.08}" cy="${y}" r="${r * 0.6}" fill="#07090b"/>
  <circle cx="${x + r * 0.3}" cy="${y - r * 0.3}" r="${Math.max(0.8, r * 0.2)}" fill="#fff" opacity="0.85"/>`;
}

const forkTail = (x, cy, len, spread, notch = 0.75) =>
  `M ${x} ${cy - 1} C ${x - len * 0.25} ${cy - spread * 0.3}, ${x - len * 0.6} ${cy - spread * 0.7}, ${x - len} ${cy - spread}
   C ${x - len * 0.78} ${cy - spread * 0.5}, ${x - len * notch} ${cy - spread * 0.15}, ${x - len * notch} ${cy}
   C ${x - len * notch} ${cy + spread * 0.15}, ${x - len * 0.78} ${cy + spread * 0.5}, ${x - len} ${cy + spread}
   C ${x - len * 0.6} ${cy + spread * 0.7}, ${x - len * 0.25} ${cy + spread * 0.3}, ${x} ${cy + 1} Z`;

/* ------------------------------------------------------------------ */
/* Species used by the game                                            */
/* ------------------------------------------------------------------ */
function minnow() {
  return fishSVG({
    id: 'mn', span: [46, 82], colors: ['#4f6447', '#8fa38c', '#dfe7e3', '#f2f5f2'],
    fin: ['#9fb1a2', '#c9d6cc', 0.55],
    body: 'M 248 63 C 240 52, 208 46, 160 46 C 112 46, 74 54, 46 60 L 46 68 C 74 74, 112 82, 160 82 C 208 82, 240 74, 248 65 Z',
    behind: `<path d="${forkTail(50, 64, 42, 38)}" fill="url(#mn-f)"/>
      <path d="M 150 47 C 144 36, 136 30, 126 28 C 128 36, 128 42, 126 48 Z" fill="url(#mn-f)"/>
      <path d="M 112 79 C 108 88, 100 94, 92 96 C 96 90, 96 84, 94 78 Z" fill="url(#mn-f)"/>`,
    pattern: `<path d="M 52 64 C 110 62, 170 60, 236 60" stroke="#e8f1f6" stroke-width="7" opacity="0.75"/>
      <path d="M 52 61 C 110 59, 170 57, 230 56" stroke="#2f4033" stroke-width="1.2" opacity="0.5"/>`,
    gill: 'M 204 50 C 196 58, 196 72, 204 80', mouth: 'M 247 64 C 236 68, 222 70, 210 68',
    eye: [226, 59, 7],
    front: '<path d="M 196 72 C 186 76, 176 80, 166 84 C 176 84, 188 80, 198 75 Z" fill="url(#mn-f)"/>',
  });
}

function reef() {
  // Butterflyfish: tall, laterally compressed disc with a black eye band.
  const body = 'M 240 62 C 234 54, 226 46, 214 38 C 196 24, 172 18, 148 20 C 116 22, 90 38, 78 64 C 90 90, 116 106, 148 108 C 172 110, 196 104, 212 92 C 222 84, 232 74, 240 66 Z';
  const rows = Array.from({ length: 12 }, (_, i) => {
    const x = 90 + i * 12;
    return `<path d="M ${x} 18 L ${x + 40} 110" stroke="#c46a12" stroke-width="1.4" opacity="0.35"/>`;
  }).join('');
  return fishSVG({
    id: 'rf', span: [20, 108], colors: ['#f0b52c', '#f7d148', '#fae27a', '#f6efc8'], mid: 0.35, light: 0.65,
    fin: ['#f3c23a', '#e09a1e', 0.95], tex: 1.3,
    body,
    behind: `<path d="M 210 36 C 190 8, 140 2, 100 20 C 90 28, 84 40, 80 52 C 96 36, 130 22, 170 22 Z" fill="url(#rf-f)"/>
      <path d="M 210 36 C 190 8, 140 2, 100 20 C 90 28, 84 40, 80 52" fill="none" stroke="#2a1d10" stroke-width="2" opacity="0.6"/>
      <path d="M 198 100 C 170 120, 130 124, 96 102 C 88 94, 82 86, 80 76 C 98 92, 130 106, 168 106 Z" fill="url(#rf-f)"/>
      <path d="M 198 100 C 170 120, 130 124, 96 102 C 88 94, 82 86, 80 76" fill="none" stroke="#2a1d10" stroke-width="2" opacity="0.6"/>
      <path d="M 84 54 C 72 50, 62 46, 50 46 C 46 56, 46 72, 50 82 C 62 82, 72 78, 84 74 Z" fill="#f8eeb8" opacity="0.7"/>
      <path d="M 50 46 C 46 56, 46 72, 50 82" stroke="#e7c86a" stroke-width="2" fill="none"/>`,
    pattern: `${rows}
      <path d="M 200 22 C 210 46, 214 76, 206 106 L 190 106 C 198 76, 196 46, 186 20 Z" fill="#fbf3dc" opacity="0.9"/>
      <path d="M 222 26 C 230 48, 232 76, 224 102 L 206 104 C 214 76, 212 46, 202 22 Z" fill="#141210"/>
      <circle cx="108" cy="52" r="9" fill="#141210"/><circle cx="108" cy="52" r="11" fill="none" stroke="#fbf3dc" stroke-width="2"/>`,
    gill: 'M 196 34 C 186 54, 186 78, 196 98', mouth: 'M 240 63 L 234 65',
    eye: [215, 57, 5.5, '#2a2622'],
    front: '<path d="M 180 72 C 168 76, 158 82, 150 90 C 162 90, 174 84, 184 76 Z" fill="#fbe9a0" opacity="0.7"/>',
  });
}

function mackerel() {
  const bars = Array.from({ length: 16 }, (_, i) => {
    const x = 70 + i * 10.5;
    return `<path d="M ${x} 40 C ${x - 5} 46, ${x + 5} 52, ${x - 3} 60" stroke="#0d2427" stroke-width="2.6" fill="none" opacity="0.85"/>`;
  }).join('');
  let finlets = '';
  for (let i = 0; i < 5; i++) {
    const x = 64 + i * 8;
    finlets += `<path d="M ${x} ${52 - i * 0.8} l -5 -5 l 3 6 Z" fill="#355f60"/><path d="M ${x} ${76 + i * 0.8} l -5 5 l 3 -6 Z" fill="#9fb7b4"/>`;
  }
  return fishSVG({
    id: 'mk', span: [42, 86], colors: ['#1b5458', '#4a8a86', '#d4e0de', '#f3f5f3'], mid: 0.35, light: 0.55,
    fin: ['#2b5557', '#16393b', 0.9],
    body: 'M 248 63 C 238 50, 206 42, 160 42 C 112 42, 76 52, 50 60 L 40 62 L 40 66 L 50 68 C 76 78, 112 86, 160 86 C 206 86, 238 78, 248 65 Z',
    behind: `<path d="${forkTail(46, 64, 40, 46)}" fill="url(#mk-f)"/>
      <path d="M 176 43 C 172 32, 164 26, 154 24 C 156 32, 154 38, 150 44 Z" fill="url(#mk-f)"/>
      <path d="M 120 44 C 116 36, 110 32, 102 30 C 104 36, 104 40, 102 46 Z" fill="url(#mk-f)"/>
      <path d="M 120 84 C 116 92, 110 96, 102 98 C 104 92, 104 88, 102 82 Z" fill="#9fb7b4"/>${finlets}`,
    pattern: `${bars}<path d="M 50 63 C 100 61, 170 56, 228 54" stroke="#1b3c3e" stroke-width="1.2" opacity="0.5"/>
      <path d="M 60 70 C 120 72, 180 70, 236 66" stroke="#c9b6ff" stroke-width="5" opacity="0.18"/>`,
    gill: 'M 206 46 C 196 58, 196 72, 206 84', mouth: 'M 248 65 C 240 68, 230 69, 222 67',
    eye: [228, 58, 6],
    front: '<path d="M 198 66 C 186 66, 174 68, 162 72 C 174 74, 188 73, 200 70 Z" fill="#20484a"/>',
  });
}

function snapper() {
  const scales = `<pattern id="sn-sc" width="8" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
      <path d="M 0 7 C 1 2, 7 2, 8 7" fill="none" stroke="#7a1a20" stroke-width="0.9" opacity="0.35"/></pattern>`;
  return fishSVG({
    id: 'sn', span: [20, 106], colors: ['#a32a31', '#d9545b', '#ef9a96', '#f8d2cc'], mid: 0.38, light: 0.62,
    fin: ['#e0606a', '#b8323c', 0.9], defs: scales,
    body: 'M 246 72 C 244 60, 232 44, 212 32 C 190 20, 160 18, 132 24 C 100 32, 72 48, 52 60 L 44 62 L 44 70 L 52 72 C 72 86, 100 100, 132 104 C 168 108, 206 102, 230 90 C 240 84, 246 78, 246 72 Z',
    behind: `<path d="${forkTail(50, 66, 40, 36, 0.8)}" fill="url(#sn-f)"/>
      <path d="M 200 28 L 194 8 L 186 22 L 178 5 L 170 20 L 162 5 L 155 21 L 146 7 L 139 23 L 128 12 L 120 28 C 140 22, 170 20, 200 28 Z" fill="url(#sn-f)"/>
      <path d="M 124 27 C 110 16, 92 20, 76 40 C 88 38, 100 34, 114 32 Z" fill="url(#sn-f)"/>
      <path d="M 124 101 C 112 118, 96 118, 84 102 C 96 98, 110 98, 124 101 Z" fill="url(#sn-f)"/>`,
    pattern: `<rect width="256" height="128" fill="url(#sn-sc)"/>
      <path d="M 212 38 C 170 32, 110 42, 50 64" stroke="#7a1a20" stroke-width="1.2" fill="none" opacity="0.45"/>`,
    gill: 'M 196 36 C 184 56, 184 82, 194 98', mouth: 'M 246 72 C 238 76, 228 78, 220 76',
    eye: [220, 52, 7, '#c3222c'],
    front: `<path d="M 190 74 C 176 78, 160 84, 146 92 C 162 94, 180 88, 194 80 Z" fill="#f2a7a2" opacity="0.9"/>
      <path d="M 170 98 C 162 108, 154 114, 146 116 C 154 110, 160 104, 162 96 Z" fill="url(#sn-f)"/>`,
  });
}

function grouper() {
  const blotches = Array.from({ length: 34 }, (_, i) => {
    const x = 50 + rnd(i, 1) * 196, y = 30 + rnd(i, 2) * 76, r = 4 + rnd(i, 3) * 9;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * 1.3).toFixed(1)}" ry="${r.toFixed(1)}" fill="#24190f" opacity="${(0.25 + rnd(i, 4) * 0.3).toFixed(2)}"/>`;
  }).join('') + Array.from({ length: 50 }, (_, i) => {
    const x = 50 + rnd(i, 5) * 196, y = 30 + rnd(i, 6) * 76;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + rnd(i, 7) * 1.8).toFixed(1)}" fill="#e2d4ae" opacity="0.4"/>`;
  }).join('');
  return fishSVG({
    id: 'gp', span: [30, 108], colors: ['#3f3222', '#6e5a3f', '#9c8763', '#cbb88f'], mid: 0.35, light: 0.7,
    fin: ['#5a4a33', '#2e2416', 0.95], tex: 1.2,
    body: 'M 248 74 C 246 56, 228 40, 200 34 C 170 28, 130 30, 100 38 C 76 44, 58 54, 46 62 L 46 78 C 58 86, 76 96, 100 100 C 130 106, 176 108, 208 102 C 232 98, 248 88, 248 74 Z',
    behind: `<path d="M 50 60 C 38 54, 22 46, 8 46 C 3 60, 3 82, 8 96 C 22 96, 38 88, 50 82 Z" fill="url(#gp-f)"/>
      <path d="M 202 36 L 196 22 L 188 32 L 182 20 L 174 30 L 168 19 L 160 29 L 152 19 L 146 30 L 136 21 C 120 22, 100 28, 72 46 C 110 34, 160 30, 202 36 Z" fill="url(#gp-f)"/>
      <path d="M 122 104 C 112 120, 96 122, 84 110 C 94 104, 108 102, 122 104 Z" fill="url(#gp-f)"/>`,
    pattern: blotches,
    gill: 'M 190 40 C 176 62, 178 88, 192 100', mouth: 'M 248 77 C 240 85, 226 89, 210 87', mouthW: 3,
    eye: [222, 58, 6, '#7a5a22'],
    front: `<path d="M 186 76 C 172 82, 160 92, 152 102 C 166 102, 180 94, 190 82 Z" fill="url(#gp-f)"/>
      <path d="M 172 102 C 166 110, 158 116, 150 118 C 156 112, 160 106, 160 100 Z" fill="url(#gp-f)"/>`,
  });
}

function swordfish() {
  return fishSVG({
    id: 'sw', w: 384, h: 128, span: [40, 86], colors: ['#2a2740', '#55546f', '#aeb4c0', '#dadde2'], mid: 0.38, light: 0.6,
    fin: ['#3a3854', '#1c1a2c', 0.95],
    body: 'M 302 62 C 290 48, 262 40, 220 40 C 170 40, 120 46, 86 56 L 58 62 L 58 68 L 86 72 C 120 82, 170 88, 220 86 C 262 84, 290 76, 302 67 Z',
    defs: `<linearGradient id="sw-bill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a3850"/><stop offset="1" stop-color="#8a8ea0"/></linearGradient>`,
    behind: `<path d="M 64 64 C 52 48, 38 28, 18 8 C 28 30, 34 50, 36 65 C 34 80, 28 100, 18 120 C 38 102, 52 82, 64 66 Z" fill="url(#sw-f)"/>
      <path d="M 254 42 C 246 26, 232 10, 212 2 C 222 14, 226 28, 228 42 Z" fill="url(#sw-f)"/>
      <path d="M 96 56 C 94 52, 90 50, 86 49 L 88 57 Z" fill="url(#sw-f)"/>
      <path d="M 130 82 C 126 92, 120 98, 112 100 C 116 94, 116 88, 114 80 Z" fill="url(#sw-f)"/>
      <path d="M 296 60 C 330 61, 360 62, 383 64 C 360 65, 330 67, 296 69 Z" fill="url(#sw-bill)"/>`,
    pattern: `<path d="M 58 65 C 80 64, 100 64, 120 65" stroke="#1c1a2c" stroke-width="3" opacity="0.5"/>`,
    gill: 'M 270 46 C 260 58, 260 74, 268 84', mouth: 'M 300 68 C 292 72, 284 73, 276 72',
    eye: [284, 59, 7, '#5b6a8a'],
    front: '<path d="M 262 74 C 250 88, 238 100, 222 112 C 240 106, 256 94, 272 78 Z" fill="url(#sw-f)"/>',
  });
}

function squid() {
  const arms = Array.from({ length: 8 }, (_, i) => {
    const y0 = 56 + i * 2.3, y1 = 50 + i * 4 + Math.sin(i) * 4, a = (i % 2 ? 8 : -8);
    return `<path d="M 82 ${y0.toFixed(1)} C 64 ${(y0 + a).toFixed(1)}, 46 ${(y1 - a).toFixed(1)}, ${24 + (i % 3) * 6} ${y1.toFixed(1)}"
      stroke="url(#sq-arm)" stroke-width="${(4.5 - Math.abs(i - 3.5) * 0.4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  }).join('');
  const tentacles = [[-1, 40], [1, 92]].map(([s, y]) => `
    <path d="M 82 ${64 + s * 4} C 60 ${64 + s * 14}, 30 ${y}, 12 ${y - s * 4}" stroke="url(#sq-arm)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="12" cy="${y - s * 4}" rx="9" ry="3.6" fill="#c45b72" transform="rotate(${s * 8} 12 ${y - s * 4})"/>`).join('');
  const dots = Array.from({ length: 70 }, (_, i) => {
    const x = 104 + rnd(i, 1) * 146, y = 44 + rnd(i, 2) * 40;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + rnd(i, 3) * 2).toFixed(1)}" fill="#8c1f38" opacity="${(0.3 + rnd(i, 4) * 0.4).toFixed(2)}"/>`;
  }).join('');
  return fishSVG({
    id: 'sq', span: [44, 84], colors: ['#c4566e', '#e08a98', '#f4c4c8', '#f8dcdc'], mid: 0.35, light: 0.65,
    fin: ['#e7a0ac', '#c4566e', 0.6], sheen: 0.45,
    body: 'M 252 64 C 244 54, 206 43, 152 44 C 128 45, 112 50, 104 56 L 104 72 C 112 78, 128 83, 152 84 C 206 85, 244 74, 252 64 Z',
    defs: `<linearGradient id="sq-arm" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#d77587"/><stop offset="1" stop-color="#f0c0c6" stop-opacity="0.8"/></linearGradient>`,
    behind: `${tentacles}${arms}
      <path d="M 252 64 C 240 38, 218 28, 194 30 C 208 42, 220 54, 226 64 C 220 74, 208 86, 194 98 C 218 100, 240 90, 252 64 Z" fill="url(#sq-f)"/>
      <path d="M 108 52 C 98 50, 88 52, 80 57 L 80 71 C 88 76, 98 78, 108 76 Z" fill="#e7a3ae"/>`,
    pattern: `${dots}<path d="M 110 64 C 160 62, 210 62, 248 64" stroke="#fff" stroke-width="3" opacity="0.25"/>`,
    eye: [94, 63, 8, '#2c3b4a'],
  });
}

function golden() {
  // Golden trevally: deep, compressed jack in metallic gold, with a soft glow.
  const body = 'M 246 66 C 240 50, 220 30, 186 24 C 150 18, 106 30, 76 48 L 52 60 L 52 70 L 76 82 C 106 100, 150 110, 186 104 C 220 98, 240 82, 246 66 Z';
  let scutes = '';
  for (let i = 0; i < 9; i++) scutes += `<path d="M ${56 + i * 7} 62 l 4 3 l -4 3 Z" fill="#8a5a08" opacity="0.6"/>`;
  return fishSVG({
    id: 'gd', span: [20, 108], colors: ['#a86e0a', '#f0c23a', '#fff2ae', '#f2cf5a'], mid: 0.35, light: 0.6,
    fin: ['#f6cf4a', '#c88a12', 0.95], sheen: 0.55,
    defs: '<filter id="gd-glow" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>',
    body,
    under: `<path d="${body}" fill="#ffd23f" opacity="0.75" filter="url(#gd-glow)"/>`,
    behind: `<path d="${forkTail(56, 65, 50, 50)}" fill="url(#gd-f)"/>
      <path d="M 170 22 C 150 6, 120 4, 96 14 C 116 18, 134 24, 150 30 Z" fill="url(#gd-f)"/>
      <path d="M 168 104 C 148 120, 122 122, 100 112 C 120 108, 136 104, 150 100 Z" fill="url(#gd-f)"/>`,
    pattern: `${scutes}
      <path d="M 70 66 C 110 60, 150 46, 200 40" stroke="#fffbe0" stroke-width="7" opacity="0.4" fill="none"/>
      <g stroke="#7c4e06" stroke-width="2" opacity="0.25">${Array.from({ length: 7 }, (_, i) => `<line x1="${100 + i * 18}" y1="20" x2="${96 + i * 18}" y2="108"/>`).join('')}</g>`,
    gill: 'M 206 36 C 194 56, 194 82, 206 96', mouth: 'M 246 67 C 240 72, 232 74, 224 72',
    eye: [224, 56, 7, '#e8d27a'],
    front: '<path d="M 196 70 C 180 70, 160 74, 142 82 C 162 84, 182 80, 200 74 Z" fill="#f8d870"/>',
  });
}

function mine() {
  const horns = Array.from({ length: 8 }, (_, i) => `
    <g transform="rotate(${i * 45 + 22.5} 64 64)">
      <rect x="60" y="10" width="8" height="18" fill="url(#mi-horn)"/>
      <rect x="57.5" y="7" width="13" height="5" rx="2" fill="#2a2d30"/>
    </g>`).join('');
  const rust = Array.from({ length: 16 }, (_, i) => {
    const a = rnd(i, 1) * Math.PI * 2, d = rnd(i, 2) * 34;
    return `<ellipse cx="${(64 + Math.cos(a) * d).toFixed(1)}" cy="${(64 + Math.sin(a) * d).toFixed(1)}" rx="${(3 + rnd(i, 3) * 7).toFixed(1)}" ry="${(2 + rnd(i, 4) * 4).toFixed(1)}" fill="#7a3d1c" opacity="${(0.25 + rnd(i, 5) * 0.4).toFixed(2)}"/>`;
  }).join('');
  const rivets = Array.from({ length: 13 }, (_, i) => {
    const x = 28 + i * 6;
    const y = 64 + Math.sqrt(Math.max(0, 1 - ((x - 64) / 40) ** 2)) * 4;
    return `<circle cx="${x}" cy="${y.toFixed(1)}" r="1.4" fill="#9aa1a6"/>`;
  }).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <radialGradient id="mi-s" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stop-color="#6c747a"/><stop offset="0.5" stop-color="#3a4045"/><stop offset="1" stop-color="#15181b"/>
    </radialGradient>
    <linearGradient id="mi-horn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2a2e31"/><stop offset="0.5" stop-color="#7d858a"/><stop offset="1" stop-color="#2a2e31"/>
    </linearGradient>
    <clipPath id="mi-c"><circle cx="64" cy="64" r="40"/></clipPath>
    ${texture('mi-t', 1.4, 0.3)}
  </defs>
  ${horns}
  <circle cx="64" cy="64" r="40" fill="url(#mi-s)"/>
  <g clip-path="url(#mi-c)">
    ${rust}
    <path d="M 22 62 C 40 70, 88 70, 106 62 L 106 68 C 88 76, 40 76, 22 68 Z" fill="#23272a"/>
    ${rivets}
    <rect width="128" height="128" filter="url(#mi-t)"/>
  </g>
  <ellipse cx="50" cy="44" rx="12" ry="7" fill="#fff" opacity="0.18" transform="rotate(-30 50 44)"/>
  <circle cx="64" cy="104" r="4" fill="none" stroke="#2a2d30" stroke-width="3"/>
</svg>`;
}

function hook() {
  const worm = Array.from({ length: 9 }, (_, i) => {
    const y = 40 + i * 6;
    return `<path d="M ${i % 2 ? 22 : 42} ${y} C 32 ${y - 4}, 32 ${y + 4}, ${i % 2 ? 42 : 22} ${y + 3}" stroke="#a8545a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M ${i % 2 ? 23 : 41} ${y - 1} C 32 ${y - 5}, 32 ${y + 3}, ${i % 2 ? 41 : 23} ${y + 2}" stroke="#d9868a" stroke-width="1.5" fill="none" opacity="0.7"/>`;
  }).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128" width="64" height="128">
  <defs>
    <linearGradient id="hk-s" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6d747a"/><stop offset="0.45" stop-color="#eef2f4"/><stop offset="1" stop-color="#7d858a"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="8" r="4.2" fill="none" stroke="url(#hk-s)" stroke-width="2.4"/>
  <path d="M 32 12 L 32 94 C 32 116, 8 116, 8 94 L 8 78" stroke="url(#hk-s)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M 6 78 L 8 70 L 10 78 L 13 86 Z" fill="#d6dadd"/>
  ${worm}
</svg>`;
}

function rockSpires() {
  // Hazy distant reef silhouettes for the mid parallax layer (tiles horizontally).
  const shapes = [];
  for (let i = 0; i < 9; i++) {
    const x = i * 213 + rnd(i, 1) * 90, hgt = 140 + rnd(i, 2) * 260, wd = 90 + rnd(i, 3) * 140;
    for (const dx of [-1920, 0, 1920]) {
      const X = x + dx;
      shapes.push(`<path d="M ${X - wd} 1080 C ${X - wd * 0.6} ${1080 - hgt * 0.5}, ${X - wd * 0.3} ${1080 - hgt}, ${X} ${1080 - hgt}
        C ${X + wd * 0.2} ${1080 - hgt * 0.95}, ${X + wd * 0.5} ${1080 - hgt * 0.4}, ${X + wd} 1080 Z" fill="url(#rs-g)"/>`);
    }
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="rs-g" x1="0" y1="600" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0f4a63" stop-opacity="0.55"/><stop offset="1" stop-color="#062533" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  ${shapes.join('')}
</svg>`;
}

// meta: nose/tail = x of snout tip and tail tip in sprite px, cy = body centre y.
// front/span: how the game's collision radius r maps onto the body
// (fish: snout at +1r, tail at -1.5r; shark: snout +2r, tail -2.6r).
module.exports = {
  shark:       { svg: shark(),             w: 512, h: 256, key: 'shark',        nose: 499, tail: 12, cy: 130, front: 2.0, span: 4.6 },
  shark_bite:  { svg: shark({ bite: true }), w: 512, h: 256, key: 'shark.bite', nose: 499, tail: 12, cy: 130, front: 2.0, span: 4.6 },
  minnow:      { svg: minnow(),    w: 256, h: 128, key: 'fish.minnow',    nose: 248, tail: 8,  cy: 64 },
  sardine:     { svg: sardine(),   w: 128, h: 64,  key: 'fish.sardine',   nose: 120, tail: 3,  cy: 32 },
  reef:        { svg: reef(),      w: 256, h: 128, key: 'fish.reef',      nose: 240, tail: 50, cy: 64 },
  mackerel:    { svg: mackerel(),  w: 256, h: 128, key: 'fish.mackerel',  nose: 248, tail: 6,  cy: 64 },
  snapper:     { svg: snapper(),   w: 256, h: 128, key: 'fish.snapper',   nose: 246, tail: 10, cy: 66 },
  tuna:        { svg: tuna(),      w: 256, h: 128, key: 'fish.tuna',      nose: 246, tail: 6,  cy: 66 },
  grouper:     { svg: grouper(),   w: 256, h: 128, key: 'fish.grouper',   nose: 248, tail: 4,  cy: 70 },
  swordfish:   { svg: swordfish(), w: 384, h: 128, key: 'fish.swordfish', nose: 383, tail: 18, cy: 64, front: 1.9, span: 3.4 },
  squid:       { svg: squid(),     w: 256, h: 128, key: 'fish.squid',     nose: 252, tail: 8,  cy: 64, front: 1.2, span: 2.9 },
  golden:      { svg: golden(),    w: 256, h: 128, key: 'fish.golden',    nose: 246, tail: 6,  cy: 65 },
  // hazards: size = drawn width / r, anchor = pivot
  jellyfish:   { svg: jellyfish(), w: 128, h: 256, key: 'hazard.jelly', size: 2.37, anchor: [0.5, 0.176] },
  mine:        { svg: mine(),      w: 128, h: 128, key: 'hazard.mine',  size: 2.2,  anchor: [0.5, 0.5] },
  hook:        { svg: hook(),      w: 64,  h: 128, key: 'hazard.hook',  size: 1.52, anchor: [0.5, 0.39] },
  // backgrounds
  background_ocean: { svg: oceanBackground(), w: 1920, h: 1080, key: 'bg.far', parallax: 0.3, scale: 1 },
  rock_spires:      { svg: rockSpires(),      w: 1920, h: 1080, key: 'bg.mid', parallax: 0.55, scale: 1 },
  seabed:           { svg: seabed(),          w: 1920, h: 300,  key: 'bg.seabed', scale: 1 },
  // extra art not used by the game yet
  seal:   { svg: seal(),   w: 256, h: 128 },
  turtle: { svg: turtle(), w: 256, h: 128 },
};
