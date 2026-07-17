// Generates a self-contained inline SVG "field badge" illustration for a species.
// No external image requests are ever made — everything renders from these shapes,
// which is what lets the whole app work with zero connectivity.

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function el(cx, cy, rx, ry, fill, opts = '') {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${opts}/>`;
}
function rr(x, y, w, h, r, fill, rot = 0, cx, cy) {
  const t = rot ? `transform="rotate(${rot} ${cx} ${cy})"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${t}/>`;
}
function tri(pts, fill) {
  return `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}"/>`;
}
function path(d, fill, opts = '') {
  return `<path d="${d}" fill="${fill}" ${opts}/>`;
}

// scattered spots / rosettes clipped to an ellipse region
function spots(cx, cy, rx, ry, color, count, r) {
  let out = '';
  let seed = cx * 13 + cy * 7 + count;
  function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand();
    const x = cx + Math.cos(a) * rx * d * 0.85;
    const y = cy + Math.sin(a) * ry * d * 0.85;
    out += el(x, y, r * (0.6 + rand() * 0.6), r * (0.5 + rand() * 0.5), color);
  }
  return out;
}
function stripes(x, y, w, h, color, count, angle = 20) {
  let out = `<g transform="rotate(${angle} ${x + w / 2} ${y + h / 2})">`;
  const gap = w / count;
  for (let i = 0; i < count; i++) {
    out += rr(x + i * gap, y - h * 0.3, gap * 0.42, h * 1.6, 2, color);
  }
  out += '</g>';
  return out;
}

function legs(x0, topY, botY, spacing, color, n = 4, w = 7) {
  let out = '';
  for (let i = 0; i < n; i++) out += rr(x0 + i * spacing, topY, w, botY - topY, w / 2, color);
  return out;
}

const HORNS = {
  straight: (x, y, color) => path(`M${x} ${y} L${x - 4} ${y - 22} M${x + 10} ${y} L${x + 14} ${y - 22}`, 'none', `stroke="${color}" stroke-width="4" stroke-linecap="round"`),
  lyre: (x, y, color) => path(`M${x} ${y} C ${x - 14} ${y - 14}, ${x - 6} ${y - 26}, ${x - 2} ${y - 34} M${x + 12} ${y} C ${x + 26} ${y - 14}, ${x + 18} ${y - 26}, ${x + 14} ${y - 34}`, 'none', `stroke="${color}" stroke-width="4" stroke-linecap="round"`),
  spiral: (x, y, color) => path(`M${x} ${y} C ${x - 16} ${y - 10}, ${x + 10} ${y - 18}, ${x - 6} ${y - 30} C ${x - 14} ${y - 38}, ${x + 2} ${y - 42}, ${x - 2} ${y - 48} M${x + 12} ${y} C ${x + 28} ${y - 10}, ${x + 2} ${y - 18}, ${x + 18} ${y - 30} C ${x + 26} ${y - 38}, ${x + 10} ${y - 42}, ${x + 14} ${y - 48}`, 'none', `stroke="${color}" stroke-width="3.5" stroke-linecap="round"`),
  ringed: (x, y, color) => path(`M${x} ${y} L${x} ${y - 34} M${x + 12} ${y} L${x + 12} ${y - 34}`, 'none', `stroke="${color}" stroke-width="5" stroke-linecap="round"`),
  short: (x, y, color) => path(`M${x} ${y} L${x - 3} ${y - 10} M${x + 10} ${y} L${x + 13} ${y - 10}`, 'none', `stroke="${color}" stroke-width="4" stroke-linecap="round"`),
  none: () => '',
};

function bgBadge(paletteA, paletteB) {
  return `<defs><radialGradient id="bg" cx="35%" cy="30%" r="80%">
    <stop offset="0%" stop-color="${paletteA}"/><stop offset="100%" stop-color="${paletteB}"/>
  </radialGradient></defs>
  <circle cx="100" cy="80" r="80" fill="url(#bg)"/>`;
}

function wrap(inner, bg1, bg2) {
  return `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img">
    ${bgBadge(bg1, bg2)}
    <g>${inner}</g>
  </svg>`;
}

// ---- Archetypes ----

function quadruped(p) {
  const c = p.color, dark = shade(c, -40), light = shade(c, 30);
  const legTop = 95, legBot = p.tall ? 138 : 130, spacing = p.size === 'xl' ? 22 : p.size === 's' ? 13 : 17;
  const bodyRx = p.size === 'xl' ? 46 : p.size === 's' ? 26 : 36;
  const bodyRy = p.size === 'xl' ? 26 : p.size === 's' ? 16 : 20;
  const bodyCx = 100, bodyCy = 92;
  const legX0 = bodyCx - spacing * 1.5;
  const headR = p.size === 'xl' ? 16 : 13;
  let out = '';
  out += legs(legX0, legTop, legBot, spacing, dark, 4, p.size === 's' ? 5 : 7);
  const neckLen = p.giraffe ? 46 : p.longNeck ? 22 : 8;
  const chestX = bodyCx + bodyRx * 0.55, chestY = bodyCy - bodyRy * 0.6;
  const headCx = chestX + neckLen * 0.75 + 10;
  const headCy = chestY - neckLen - 6;
  // neck drawn as a thick rounded stroke so it always joins body to head cleanly
  out += path(`M${chestX} ${chestY} L${headCx - 4} ${headCy + 4}`, 'none', `stroke="${c}" stroke-width="${headR * 1.15}" stroke-linecap="round"`);
  out += el(bodyCx, bodyCy, bodyRx, bodyRy, c);
  if (p.pattern === 'stripes') out += `<clipPath id="clip1"><ellipse cx="${bodyCx}" cy="${bodyCy}" rx="${bodyRx}" ry="${bodyRy}"/></clipPath><g clip-path="url(#clip1)">${stripes(bodyCx - bodyRx, bodyCy - bodyRy, bodyRx * 2, bodyRy * 2, dark, 7)}</g>`;
  if (p.pattern === 'spots') out += `<clipPath id="clip1b"><ellipse cx="${bodyCx}" cy="${bodyCy}" rx="${bodyRx}" ry="${bodyRy}"/></clipPath><g clip-path="url(#clip1b)">${spots(bodyCx, bodyCy, bodyRx, bodyRy, dark, 14, 5)}</g>`;
  if (p.pattern === 'patches') out += `<clipPath id="clip1c"><ellipse cx="${bodyCx}" cy="${bodyCy}" rx="${bodyRx}" ry="${bodyRy}"/></clipPath><g clip-path="url(#clip1c)">${spots(bodyCx, bodyCy, bodyRx, bodyRy, dark, 6, 10)}</g>`;
  // mane halo sits behind the head so the head silhouette still reads on top
  if (p.mane) out += el(headCx - 4, headCy + 3, headR * 1.7, headR * 1.55, p.maneColor || dark);
  // head + ears (drawn after the mane so the face stays visible)
  out += el(headCx, headCy, headR, headR * 0.8, c);
  out += tri([[headCx - 10, headCy - 6], [headCx - 15, headCy - 20], [headCx - 2, headCy - 10]], c);
  out += tri([[headCx + 5, headCy - 9], [headCx + 11, headCy - 22], [headCx + 13, headCy - 9]], c);
  if (p.horn && HORNS[p.horn]) out += HORNS[p.horn](headCx + 5, headCy - headR * 0.7, p.hornColor || light);
  if (p.tusks) out += path(`M${headCx - 4} ${headCy + 5} Q ${headCx - 15} ${headCy + 14} ${headCx - 11} ${headCy + 24}`, 'none', `stroke="${light}" stroke-width="4" stroke-linecap="round"`);
  // tail
  out += path(`M${bodyCx - bodyRx} ${bodyCy - 4} Q ${bodyCx - bodyRx - 16} ${bodyCy + 10} ${bodyCx - bodyRx - 10} ${bodyCy + (p.tailTuft ? 30 : 22)}`, 'none', `stroke="${dark}" stroke-width="4" stroke-linecap="round"`);
  if (p.tailTuft) out += el(bodyCx - bodyRx - 10, bodyCy + 30, 5, 6, dark);
  return out;
}

function elephant(p) {
  const c = p.color, dark = shade(c, -30), darker = shade(c, -50);
  let out = '';
  out += legs(70, 100, 138, 22, dark, 4, 14);
  // large flappy ear, drawn first so the head sits in front of it
  out += path(`M138 56 Q 168 48 178 74 Q 182 96 156 92 Q 138 88 138 56 Z`, shade(c, 10));
  out += el(100, 92, 46, 30, c);
  out += el(150, 80, 22, 20, c); // head
  out += path(`M164 90 Q 180 100 176 118 Q 174 130 188 134`, 'none', `stroke="${darker}" stroke-width="10" stroke-linecap="round" fill="none"`); // trunk
  if (p.tusks) out += path(`M160 100 Q 168 110 163 120 M166 101 Q 176 110 171 122`, 'none', `stroke="#f2ead9" stroke-width="4" stroke-linecap="round"`);
  out += el(158, 74, 3, 4, '#2a2620'); // eye
  return out;
}

function rhino(p) {
  const c = p.color, dark = shade(c, -30);
  let out = '';
  out += legs(66, 102, 138, 24, dark, 4, 15);
  out += el(102, 94, 50, 26, c);
  out += el(150, 84, 20, 16, c);
  out += tri([[144, 70], [156, 62], [156, 76]], c);
  out += path(`M162 82 L172 60 L166 84Z`, shade(c, 25));
  if (p.secondHorn) out += path(`M156 84 L162 70 L160 86Z`, shade(c, 25));
  return out;
}

function hippo(p) {
  const c = p.color, dark = shade(c, -25);
  let out = '';
  out += legs(64, 108, 138, 26, dark, 4, 16);
  out += el(102, 96, 54, 30, c);
  out += el(155, 90, 24, 20, c);
  out += el(146, 76, 5, 4, dark); out += el(160, 76, 5, 4, dark); // eyes bumps
  out += tri([[140, 70], [148, 62], [150, 72]], c);
  out += tri([[160, 70], [168, 62], [166, 72]], c);
  return out;
}

function primate(p) {
  const c = p.color, dark = shade(c, -35), face = p.faceColor || '#3a3229';
  let out = '';
  out += el(100, 108, 34, 26, c);
  out += legs(84, 118, 138, 32, dark, 2, 10);
  out += el(112, 62, 20, 20, c);
  out += el(112, 68, 12, 12, face);
  out += tri([[96, 96], [80, 118], [98, 116]], c);
  out += path(`M132 78 Q 148 92 140 118`, 'none', `stroke="${dark}" stroke-width="7" stroke-linecap="round"`);
  return out;
}

function smallMammal(p) {
  const c = p.color, dark = shade(c, -30);
  let out = '';
  out += legs(78, 106, 130, 44, dark, 2, 8);
  out += el(105, 100, 42, 18, c);
  out += el(154, 92, 14, 12, c);
  out += tri([[150, 82], [156, 74], [160, 84]], dark);
  if (p.bands) out += `<clipPath id="clipsm"><ellipse cx="105" cy="100" rx="42" ry="18"/></clipPath><g clip-path="url(#clipsm)">${stripes(63, 82, 84, 36, dark, 5, 0)}</g>`;
  if (p.twoTone) out += path(`M65 88 Q105 78 145 88 L145 100 Q105 92 65 100 Z`, p.stripeColor || '#e2ddcf');
  out += path(`M63 96 Q 46 100 44 116`, 'none', `stroke="${dark}" stroke-width="6" stroke-linecap="round"`);
  return out;
}

function reptileCroc(p) {
  const c = p.color, dark = shade(c, -25);
  let out = '';
  out += rr(50, 96, 110, 22, 12, c);
  out += el(150, 100, 26, 12, c);
  out += tri([[172, 96], [196, 100], [172, 106]], c);
  for (let i = 0; i < 5; i++) out += tri([[62 + i * 18, 88], [70 + i * 18, 78], [78 + i * 18, 88]], dark);
  out += legs(66, 112, 128, 40, dark, 2, 8);
  out += el(44, 98, 6, 5, dark);
  return out;
}

function reptileSnake(p) {
  const c = p.color, dark = shade(c, -25);
  let out = path(`M30 120 Q 70 70 100 110 Q 130 150 160 100 Q 178 76 188 88`, 'none', `stroke="${c}" stroke-width="18" stroke-linecap="round" fill="none"`);
  out += path(`M30 120 Q 70 70 100 110 Q 130 150 160 100 Q 178 76 188 88`, 'none', `stroke="${dark}" stroke-width="18" stroke-linecap="round" fill="none" stroke-dasharray="4 20"`);
  out += el(190, 87, 6, 5, c);
  return out;
}

function reptileLizard(p) {
  const c = p.color, dark = shade(c, -25);
  let out = '';
  out += path(`M60 100 Q 20 106 8 122`, 'none', `stroke="${c}" stroke-width="8" stroke-linecap="round" fill="none"`);
  out += el(95, 98, 40, 15, c);
  out += el(148, 92, 14, 10, c);
  out += legs(72, 108, 126, 40, dark, 2, 6);
  if (p.pattern === 'spots') out += spots(95, 98, 40, 15, dark, 8, 4);
  return out;
}

function birdStand(p) {
  const c = p.color, dark = shade(c, -30), accent = p.accent || '#e2b13c';
  const legH = p.legLen || 34;
  let out = '';
  out += rr(94, 112, 6, legH, 3, p.legColor || dark);
  out += rr(112, 112, 6, legH, 3, p.legColor || dark);
  out += el(105, 96, p.bodyRx || 32, p.bodyRy || 22, c);
  const neckTopY = 96 - (p.bodyRy || 22) - (p.neckLen || 34);
  out += rr(118, neckTopY, 10, (p.bodyRy || 22) + (p.neckLen || 34), 5, p.neckColor || c, -8, 123, 96);
  out += el(128, neckTopY - 2, 12, 10, p.headColor || c);
  out += tri([[136, neckTopY - 4], [156, neckTopY], [136, neckTopY + 4]], accent);
  if (p.crest) out += path(`M126 ${neckTopY - 10} Q 122 ${neckTopY - 22} 118 ${neckTopY - 26}`, 'none', `stroke="${p.crestColor || accent}" stroke-width="3" stroke-linecap="round"`);
  if (p.pattern === 'patches') out += spots(105, 96, p.bodyRx || 32, p.bodyRy || 22, dark, 8, 6);
  return out;
}

function birdPerch(p) {
  const c = p.color, dark = shade(c, -30), accent = p.accent || '#e2b13c';
  let out = '';
  out += rr(96, 118, 5, 16, 2, dark);
  out += rr(108, 118, 5, 16, 2, dark);
  out += el(104, 104, 30, 24, c);
  out += el(122, 78, 17, 15, p.headColor || c);
  out += tri([[136, 76], [p.hooked ? 150 : 154, p.hooked ? 84 : 78], [136, 82]], accent);
  if (p.hooked) out += path(`M148 82 Q 154 88 146 90`, accent);
  out += path(`M78 100 Q 60 108 62 128`, 'none', `stroke="${dark}" stroke-width="6" stroke-linecap="round"`);
  if (p.pattern === 'iridescent') out += el(112, 96, 16, 12, shade(c, 40));
  if (p.pattern === 'patches') out += spots(104, 104, 30, 24, dark, 8, 4);
  if (p.belly) out += el(108, 112, 16, 10, p.belly);
  return out;
}

const BUILDERS = {
  quadruped, elephant, rhino, hippo, primate,
  smallMammal, reptileCroc, reptileSnake, reptileLizard,
  birdStand, birdPerch,
};

function renderIcon(spec) {
  const inner = BUILDERS[spec.shape](spec);
  return wrap(inner, spec.bg1 || '#e7d9b0', spec.bg2 || '#c9a84c');
}

if (typeof window !== 'undefined') window.renderIcon = renderIcon;
if (typeof module !== 'undefined') module.exports = { renderIcon };
