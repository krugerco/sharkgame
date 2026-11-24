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
    return `<path d="M ${x} 0 L ${x + w} 0 L ${x + w * 3.4 - 100} 1080 L ${x + w * 1.4 - 260} 1080 Z" fill="url(#bg-ray)" opacity="${0.35 + (i % 3) * 0.12}"/>`;
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
      <feTurbulence type="turbulence" baseFrequency="0.012 0.03" numOctaves="2" seed="3" result="t"/>
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
      <path d="${d}" filter="url(#sb-t)" fill="#000"/>`;
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
  </defs>
  <g opacity="0.55">${farRocks}</g>
  ${kelp}
  <path d="${ridge}" fill="url(#sb-sand)"/>
  <path d="${ridge}" filter="url(#sb-t)" fill="#000"/>
  ${rocks}
</svg>`;
}

module.exports = {
  shark: { svg: shark(), w: 512, h: 256, anchor: [0.62, 0.5], role: 'player' },
  shark_bite: { svg: shark({ bite: true }), w: 512, h: 256, anchor: [0.62, 0.5], role: 'player (bite frame)' },
  sardine: { svg: sardine(), w: 128, h: 64, anchor: [0.5, 0.5], role: 'small prey' },
  tuna: { svg: tuna(), w: 256, h: 128, anchor: [0.5, 0.5], role: 'large prey' },
  jellyfish: { svg: jellyfish(), w: 128, h: 256, anchor: [0.5, 0.2], role: 'hazard' },
  turtle: { svg: turtle(), w: 256, h: 128, anchor: [0.5, 0.5], role: 'neutral / bonus' },
  seal: { svg: seal(), w: 256, h: 128, anchor: [0.5, 0.5], role: 'large prey' },
  background_ocean: { svg: oceanBackground(), w: 1920, h: 1080, anchor: [0, 0], role: 'background' },
  seabed: { svg: seabed(), w: 1920, h: 300, anchor: [0, 1], role: 'foreground tile (tiles horizontally)' },
};
