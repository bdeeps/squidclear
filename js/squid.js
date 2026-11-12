// SquidClear's shared parts: the colour model for a squid's tunable mirrors (a multilayer
// thin-film stack → a spectrum → a colour you can see), the light-matching model for counter-
// illumination, the jet and giant-axon numbers, a procedural squid (loliginid, bobtail, firefly
// and Humboldt shapes), a cut-open slab of squid skin, and the board and layout helpers the
// chapters use (the same ones as ChameleonClear and JellyfishClear).
//
// The iridophore model (stack() below):
//  - Squid iridophores (iridocytes) hold stacks of thin plates (lamellae) made of membrane filled
//    with reflectin protein, separated by thin gaps of watery fluid. Ghoshal, DeMartini, Eck & Morse
//    2013 ("Optical parameters of the tunable Bragg reflectors in squid", J R Soc Interface 10:
//    20130386; abstract read at icb.ucsb.edu) measured single stacks in live California market squid
//    (Doryteuthis opalescens) and fitted a transfer-matrix model: lamella refractive index 1.405 ±
//    0.012 on average, up to about 1.44; to tune from 675 nm (red) to 425 nm (blue) the lamellae thin
//    from about 150 to 80 nm and the gaps from about 120 to 50 nm; 8 or 9 plate–gap pairs reflect.
//  - We use the same kind of model: the exact transfer-matrix (characteristic-matrix) reflectance of
//    N lamellae (index n1, thickness d1) and N gaps (n2 = 1.335, our assumption for the extracellular
//    fluid, close to sea water) inside cell fluid of the same index, for light at angle θ (average of
//    the two polarisations). Peak of the first-order band: λ = 2 (n1 d1 cosθ1 + n2 d2 cosθ2).
//  - The nerve signal (acetylcholine, ACh) path: DeMartini, Krogstad & Morse 2013 (PNAS 110: 2552;
//    press release and abstract) showed that ACh makes reflectin condense and water leave the
//    lamellae, which shrink, so they get thinner and denser; washing it out lets them swell back.
//    Wardill et al. 2012 (Proc R Soc B 279: 4243) showed nerves drive the shift from red to blue in
//    Doryteuthis pealeii; in their data the colour shift took about 17 s and the rise in brightness
//    about 32 s (search summary of their dataset). Our relaxed and activated end points are chosen
//    inside Ghoshal et al.'s ranges so the model peaks at 675 nm and 425 nm as they measured:
//      relaxed: n1 = 1.38, d1 = 140 nm, d2 = 108 nm  → 2(1.38·140 + 1.335·108) ≈ 675 nm
//      activated: n1 = 1.44, d1 = 88 nm, d2 = 64 nm  → 2(1.44·88 + 1.335·64) ≈ 424 nm
//    n1 = 1.38 for swollen lamellae is our assumption (below their live-cell mean of 1.405); 1.44 is
//    their measured maximum. The higher index contrast is why the activated stack is also brighter.
//  - The spectrum → screen colour code is ChameleonClear's (js/cham.js): CIE 1931 colour-matching
//    functions (the analytic fit of Wyman, Sloan & Shirley 2013, JCGT 2(2)), a 6500 K light, sRGB.
import { THREE, M, clamp, sphere, beam } from './kit.js';

export const TAU = Math.PI * 2;
export const N_GAP = 1.335;
export const RELAXED = { n1: 1.38, d1: 140, d2: 108 }, ACTIVE = { n1: 1.44, d1: 88, d2: 64 };
export const N_PAIRS = 8;
export function achState(a) {
  a = clamp(a, 0, 1);
  return { n1: RELAXED.n1 + (ACTIVE.n1 - RELAXED.n1) * a, d1: RELAXED.d1 + (ACTIVE.d1 - RELAXED.d1) * a, d2: RELAXED.d2 + (ACTIVE.d2 - RELAXED.d2) * a };
}

// ---------------------------------------------------------------- spectra and colour (from cham.js)
const L0 = 380, L1 = 730, DL = 5, NL = (L1 - L0) / DL + 1;
export const LAMBDAS = Array.from({ length: NL }, (_, i) => L0 + i * DL);
const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
const CMF = LAMBDAS.map((l) => [
  1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
  0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
  1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
]);
const planck = (l, T) => { const x = l * 1e-9; return 1 / (x ** 5 * (Math.exp(1.4388e-2 / (x * T)) - 1)); };
const ILL = (() => { const a = LAMBDAS.map((l) => planck(l, 6500)); const m = a[Math.round((560 - L0) / DL)]; return a.map((v) => v / m); })();
const YW = LAMBDAS.reduce((acc, _, i) => acc + ILL[i] * CMF[i][1], 0);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function xyzToRgb([X, Y, Z], gain = 1) {
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  r *= gain; gg *= gain; b *= gain;
  const mx = Math.max(r, gg, b, 1);
  return [r, gg, b].map((c) => clamp(gam(Math.max(0, c / mx)), 0, 1));
}
export function spectrumToRgb(R, gain = 1.45) {
  const xyz = [0, 0, 0];
  R.forEach((v, i) => { for (let k = 0; k < 3; k++) xyz[k] += v * ILL[i] * CMF[i][k]; });
  return xyzToRgb(xyz.map((v) => v / YW), gain);
}
export function lambdaRgb(l) {
  if (l > 730) return [0.45, 0.05, 0.05];
  if (l < 380) return [0.35, 0.1, 0.5];
  const i = clamp(Math.round((l - L0) / DL), 0, NL - 1), [X, Y, Z] = CMF[i];
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  const mn = Math.min(r, gg, b); if (mn < 0) { r -= mn; gg -= mn; b -= mn; }
  const mx = Math.max(r, gg, b) || 1;
  return [r, gg, b].map((c) => gam(c / mx));
}
export const css = (rgb) => `rgb(${rgb.map((c) => Math.round(clamp(c, 0, 1) * 255)).join(',')})`;
export const meanVisible = (R) => R.reduce((a, v, i) => a + v * ILL[i] * CMF[i][1], 0) / YW;
export function hueName(rgb) {
  const [r, g2, b] = rgb, mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2;
  if (mx < 0.16) return 'almost black';
  if (mx - mn < 0.08) return l > 0.7 ? 'whitish' : 'grey';
  let h = mx === r ? ((g2 - b) / (mx - mn)) % 6 : mx === g2 ? (b - r) / (mx - mn) + 2 : (r - g2) / (mx - mn) + 4; h *= 60; if (h < 0) h += 360;
  const n = h < 14 ? 'red' : h < 38 ? 'orange' : h < 62 ? 'yellow' : h < 82 ? 'yellow-green' : h < 150 ? 'green' : h < 190 ? 'turquoise' : h < 250 ? 'blue' : h < 290 ? 'violet' : h < 335 ? 'pink' : 'red';
  return (mx < 0.38 ? 'dark ' : '') + n;
}
export const bandName = (l) => (l < 380 ? 'ultraviolet' : l < 450 ? 'violet' : l < 495 ? 'blue' : l < 565 ? 'green' : l < 590 ? 'yellow' : l < 625 ? 'orange' : l < 720 ? 'red' : 'near-infrared');

// ---------------------------------------------------------------- thin-film stack (transfer matrix)
// Reflectance of N lamellae (n1, d1) and N gaps (n2, d2) in a medium of index n2, at angle θ (deg)
// measured in that medium, for wavelength l (nm). Characteristic-matrix method (Born & Wolf, ch. 1.6),
// averaged over s and p polarisation.
function rStack(l, { n1, d1, n2 = N_GAP, d2, N, theta = 0 }) {
  const n0 = n2, s0 = Math.sin(theta * Math.PI / 180), c0 = Math.cos(theta * Math.PI / 180);
  const c1 = Math.sqrt(Math.max(0, 1 - (n0 * s0 / n1) ** 2));
  let out = 0;
  for (const pol of [0, 1]) {
    const eta = (n, c) => (pol ? n / c : n * c);
    const e0 = eta(n0, c0), e1 = eta(n1, c1), e2 = eta(n2, c0);
    // complex 2×2 matrix as [a, b, c, d] with each entry [re, im]
    let A = [1, 0], B = [0, 0], C = [0, 0], D = [1, 0];
    const mul = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
    const add = (x, y) => [x[0] + y[0], x[1] + y[1]];
    const layer = (n, d, c, e) => {
      const dl = TAU * n * d * c / l, cs = Math.cos(dl), sn = Math.sin(dl);
      const a = [cs, 0], b = [0, sn / e], cc = [0, e * sn], dd = [cs, 0];
      const nA = add(mul(A, a), mul(B, cc)), nB = add(mul(A, b), mul(B, dd)), nC = add(mul(C, a), mul(D, cc)), nD = add(mul(C, b), mul(D, dd));
      A = nA; B = nB; C = nC; D = nD;
    };
    for (let k = 0; k < N; k++) { layer(n1, d1, c1, e1); if (k < N - 1) layer(n2, d2, c0, e2); }
    const es = e0;
    // r = (e0·A + e0·es·B − C − es·D) / (e0·A + e0·es·B + C + es·D)
    const t1 = add([e0 * A[0], e0 * A[1]], [e0 * es * B[0], e0 * es * B[1]]), t2 = add(C, [es * D[0], es * D[1]]);
    const num = [t1[0] - t2[0], t1[1] - t2[1]], den = add(t1, t2);
    out += (num[0] ** 2 + num[1] ** 2) / (den[0] ** 2 + den[1] ** 2);
  }
  return out / 2;
}
export function stack(p) {
  const q = { n2: N_GAP, theta: 0, ...p };
  const R = LAMBDAS.map((l) => rStack(l, q));
  const th = q.theta * Math.PI / 180, c1 = Math.sqrt(Math.max(0, 1 - (q.n2 * Math.sin(th) / q.n1) ** 2));
  const peak = 2 * (q.n1 * q.d1 * c1 + q.n2 * q.d2 * Math.cos(th));
  const Rpk = rStack(peak, q);
  return { R, peak, Rpk, period: q.d1 + q.d2, contrast: q.n1 - q.n2 };
}
// What you see: a little scattered light from the skin plus the stack's reflection over dark skin.
export function iridColour(p, gain = 2.4) {
  const st = stack(p);
  const R = st.R.map((v) => 0.015 + v);
  return { ...st, rgb: spectrumToRgb(R, gain), Rvis: meanVisible(st.R) };
}

// ---------------------------------------------------------------- counter-illumination
// Downwelling moonlight at depth z: E = E0 · exp(−K z). Full-moon illuminance at the surface is
// about 0.1–0.3 lux (we use 0.25 lux for a bright full moon; textbook range); a clear night sky with no
// moon is around 0.001 lux. K = 0.05 per metre is an illustrative value for clear tropical water
// near Hawaii (blue-green light). The squid's belly, seen from below, sends down only a little
// scattered light (we take 5% of what falls on its back) plus its light organ's glow. Contrast with
// the background = (belly − background) / background. Jones & Nishiguchi 2004 (Marine Biology 144:
// 1151) showed the Hawaiian bobtail squid's light-organ output tracks the downwelling light.
export const MOON = { full: 0.25, none: 0.001, K: 0.05, leak: 0.05 };
export function seaLight(moon, depth) { return Math.max(1e-5, moon) * Math.exp(-MOON.K * depth); }
export function silhouette(bg, organ) { const belly = bg * MOON.leak + organ; return { belly, contrast: (belly - bg) / bg }; }

// ---------------------------------------------------------------- jet and giant axon
// Jet: the mantle is a tube of radius R and length Lm. Squeezing its radius by a fraction c pushes out
// ΔV = π R² Lm (1 − (1 − c)²) through a funnel of area A in time t, so the mean jet speed is
// u = ΔV / (A t) and the thrust F = ρ A u². Illustrative sizes for a squid with a 20 cm mantle:
// R = 2.5 cm, Lm = 18 cm, funnel 1.5 cm across, t = 0.3 s (our assumptions; squid escape jets
// squeeze the mantle by roughly a quarter in published studies such as Gosline & DeMont 1985, from
// memory, so treat c ≈ 0.25 as typical). Sea water ρ = 1025 kg/m³.
export const JET = { R: 0.025, Lm: 0.18, A: Math.PI * 0.0075 ** 2, rho: 1025, mass: 0.15 };
export function jet(c, t) {
  const V = Math.PI * JET.R ** 2 * JET.Lm, dV = V * (1 - (1 - c) ** 2), u = dV / (JET.A * Math.max(0.05, t));
  return { V, dV, u, F: JET.rho * JET.A * u * u, a: (JET.rho * JET.A * u * u) / JET.mass };
}
// Giant axon: an unmyelinated fibre conducts faster the thicker it is, roughly as √diameter (cable
// theory). Calibrated to about 20 m/s for a 0.5 mm squid giant axon (Hodgkin & Huxley 1952 measured
// about 21 m/s near 18 °C in a fibre about half a millimetre thick; from memory of their paper).
export const axonSpeed = (dmm) => 20 * Math.sqrt(Math.max(1e-4, dmm) / 0.5);

// ---------------------------------------------------------------- shapes
function latheXZ(profile, zs, mat, seg = 48) {
  const geo = new THREE.LatheGeometry(profile.map(([x, r]) => new THREE.Vector2(Math.max(0.001, r), x)), seg);
  geo.rotateZ(-Math.PI / 2); geo.scale(1, zs, 1); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m;
}
function taperTube(points, r0, r1, mat, seg = 40) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const RS = 10, geo = new THREE.TubeGeometry(curve, seg, 1, RS, false), pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, r = r0 + (r1 - r0) * u; curve.getPointAt(u, c);
    for (let j = 0; j <= RS; j++) { const k = i * (RS + 1) + j; v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c); pos.setXYZ(k, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
}
function flat(pts, depth, mat) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: depth * 0.5, bevelThickness: depth * 0.5, bevelSegments: 2 });
  geo.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
}
let _seed = 11; const rnd = () => ((_seed = (_seed * 16807) % 2147483647) / 2147483647);

// ---------------------------------------------------------------- the squid
// Local frame: arms toward −X, the pointed mantle tip toward +X, back (dorsal) up +Y, belly −Y, the
// animal's left side +Z. Squid swim both ways; the jet from the funnel (under the head, pointing
// forward) drives them tail-first. Kinds: 'loligo' (a generic loliginid like the Indian squid),
// 'bobtail' (Euprymna: round body, ear fins), 'firefly' (Watasenia: photophores), 'humboldt'.
const KINDS = {
  loligo: { ML: 3.0, R: 0.36, prof: [[0, 0.33], [0.3, 0.36], [1.2, 0.35], [2.0, 0.28], [2.6, 0.17], [3.0, 0.02]], fin: [[1.55, 0], [2.2, 0.62], [3.0, 0.02]], head: 0.3, arm: 0.85, tent: 1.9, base: [0.95, 0.78, 0.72], chrom: 0.9, eye: 0.15 },
  bobtail: { ML: 1.15, R: 0.5, prof: [[0, 0.42], [0.2, 0.5], [0.6, 0.52], [0.95, 0.38], [1.15, 0.03]], ear: true, head: 0.36, arm: 0.5, tent: 0.85, base: [0.85, 0.72, 0.62], chrom: 1.3, eye: 0.17 },
  firefly: { ML: 2.0, R: 0.3, prof: [[0, 0.28], [0.3, 0.3], [1.0, 0.28], [1.6, 0.17], [2.0, 0.02]], fin: [[1.2, 0], [1.75, 0.5], [2.0, 0.02]], head: 0.26, arm: 0.65, tent: 1.0, base: [0.42, 0.42, 0.62], chrom: 1.1, eye: 0.14 },
  humboldt: { ML: 3.2, R: 0.42, prof: [[0, 0.38], [0.4, 0.42], [1.5, 0.42], [2.4, 0.32], [2.9, 0.15], [3.2, 0.02]], fin: [[2.2, 0], [2.75, 0.75], [3.2, 0.02]], head: 0.34, arm: 1.0, tent: 1.5, base: [0.9, 0.55, 0.5], chrom: 1.2, eye: 0.15 },
};
export const ARM_INFO = {
  mantle: 'The <b>mantle</b> is a muscular tube. Squeezing it pushes water out of the <b>funnel</b>: jet propulsion.',
  fin: 'The <b>fins</b> flap for gentle swimming and steering. For a fast getaway the squid jets instead.',
  arm: 'Eight <b>arms</b> lined with suckers hold prey. In many squid the suckers have toothed horny rings.',
  tent: 'Two long <b>tentacles</b> shoot out to grab prey with the club at the tip, then pull it to the arms.',
  head: 'Big <b>eyes</b> and a large brain sit in the head. The beak, like a parrot’s, is hidden between the arms.',
  funnel: 'The <b>funnel</b> (siphon) points the jet. Aimed forward it drives the squid backward, tail first.',
  axon: 'The <b>giant axons</b> run from the stellate ganglion across the mantle. One signal makes the whole mantle squeeze at once.',
  ink: 'The <b>ink sac</b> opens into the gut near the funnel, so ink leaves with the jet.',
  pen: 'The <b>pen</b> (gladius) is a thin, feather-shaped stiffener of chitin and protein under the back: all that is left of a shell.',
  gill: 'Two <b>gills</b> in the mantle cavity take oxygen from the water the mantle pumps through.',
  organ: 'The <b>light organ</b> holds glowing bacteria. A reflector behind and an ink shutter around it set how much light goes down.',
};

export class Squid {
  constructor(kind = 'loligo', { xray = true } = {}) {
    const K = (this.K = KINDS[kind]); this.kind = kind;
    const g = (this.group = new THREE.Group());
    this.meshes = [];
    const add = (m, k, parent = g) => { m.userData.kind = k; parent.add(m); this.meshes.push(m); return m; };
    // Skin: a canvas texture of chromatophore spots wrapped round the mantle (u around, v along).
    this.cv = document.createElement('canvas'); this.cv.width = 512; this.cv.height = 256;
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace;
    this.skin = new THREE.MeshStandardMaterial({ map: this.tex, roughness: 0.38, metalness: 0.05, transparent: true, opacity: 1, side: THREE.DoubleSide });
    this.headMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(...K.base), roughness: 0.42, transparent: true });
    this.mantleG = new THREE.Group(); g.add(this.mantleG);
    this.mantle = add(latheXZ(K.prof, 1, this.skin, 56), 'mantle', this.mantleG);
    this.fins = [];
    if (K.ear) {
      for (const s of [1, -1]) {
        const f = add(new THREE.Mesh(new THREE.CircleGeometry(0.28, 28), this.headMat), 'fin', this.mantleG);
        f.material = this.headMat; f.scale.set(1, 0.08, 1); f.geometry.rotateX(-Math.PI / 2);
        f.position.set(0.55, 0.12, s * (K.R + 0.2)); f.userData.side = s; this.fins.push(f);
      }
    } else {
      for (const s of [1, -1]) {
        const pts = K.fin.map(([x, w]) => [x, w]);
        const f = flat(pts, 0.05, this.headMat); f.rotation.x = s * Math.PI / 2; f.position.z = s * K.R * 0.35;
        const pivot = new THREE.Group(); pivot.add(f); this.mantleG.add(pivot); f.userData.kind = 'fin'; this.meshes.push(f);
        pivot.userData.side = s; this.fins.push(pivot);
      }
    }
    // Head, eyes, arms, tentacles, funnel.
    const hx = -K.head * 0.9;
    this.head = add(sphere(K.head, this.headMat, 28), 'head'); this.head.scale.set(1.25, 0.85, 0.95); this.head.position.x = hx;
    this.eyes = [1, -1].map((s) => {
      const e = add(sphere(K.eye, M.plastic(0xd8e2ea, { roughness: 0.15, metalness: 0.3 }), 20), 'head'); e.position.set(hx + 0.02, 0.04, s * K.head * 0.72);
      const p = sphere(K.eye * 0.6, M.plastic(0x0a0a10, { roughness: 0.1 }), 16); p.position.set(0, 0, s * K.eye * 0.55); e.add(p);
      return e;
    });
    this.arms = [];
    const ax = hx - K.head * 1.05;
    for (let i = 0; i < 10; i++) {
      const tent = i >= 8, ang = tent ? -Math.PI / 2 + (i === 8 ? 0.55 : -0.55) : (i + 0.5) * TAU / 8;
      const L = tent ? K.tent : K.arm * (0.75 + 0.25 * Math.abs(Math.sin(ang))), r0 = K.head * (tent ? 0.13 : 0.2);
      const cy = Math.sin(ang) * K.head * 0.45, cz = Math.cos(ang) * K.head * 0.5;
      const pts = [[0, 0, 0], [-L * 0.35, Math.sin(ang) * 0.08, Math.cos(ang) * 0.08], [-L * 0.7, Math.sin(ang) * 0.1, Math.cos(ang) * 0.1], [-L, Math.sin(ang) * 0.06, Math.cos(ang) * 0.06]];
      const piv = new THREE.Group(); piv.position.set(ax, cy, cz); g.add(piv);
      const arm = taperTube(pts, r0, r0 * 0.15, this.headMat); arm.userData.kind = tent ? 'tent' : 'arm'; this.meshes.push(arm); piv.add(arm);
      if (tent) { const club = sphere(r0 * 1.6, this.headMat, 12); club.scale.set(2.6, 0.7, 1); club.position.set(-L + 0.1, pts[3][1], pts[3][2]); club.userData.kind = 'tent'; this.meshes.push(club); piv.add(club); }
      piv.userData = { ang, tent, ph: rnd() * TAU, L, tip: new THREE.Vector3(-L, pts[3][1], pts[3][2]) };
      this.arms.push(piv);
    }
    this.funnelPiv = new THREE.Group(); this.funnelPiv.position.set(0.05, -K.R * 0.95, 0); g.add(this.funnelPiv);
    const fg = new THREE.CylinderGeometry(K.R * 0.18, K.R * 0.32, K.head * 1.3, 18, 1, true); fg.rotateZ(Math.PI / 2); fg.translate(-K.head * 0.65, 0, 0);
    this.funnel = add(new THREE.Mesh(fg, this.headMat), 'funnel', this.funnelPiv);
    this.funnelTip = new THREE.Vector3(-K.head * 1.3, 0, 0);
    // Insides (X-ray): pen, ink sac, gills, stellate ganglia and giant axons, light organ.
    this.inner = new THREE.Group(); g.add(this.inner);
    const ML = K.ML, R = K.R;
    if (kind !== 'bobtail') {
      const pen = flat([[0.05, 0], [0.5, 0.07], [ML * 0.75, 0.12], [ML * 0.97, 0]], 0.012, M.plastic(0xf1e7c2, { roughness: 0.3, transparent: true, opacity: 0.9 }));
      pen.rotation.x = -Math.PI / 2; pen.position.y = R * 0.82; pen.scale.z = 1; add(pen, 'pen', this.inner);
      const pen2 = pen.clone(); pen2.scale.y = -1; add(pen2, 'pen', this.inner);
    }
    this.inkSac = add(sphere(R * 0.22, M.plastic(0x15151c, { roughness: 0.2 }), 16), 'ink', this.inner); this.inkSac.scale.set(2.2, 0.8, 1); this.inkSac.position.set(ML * 0.28, -R * 0.35, 0);
    add(beam([ML * 0.2, -R * 0.35, 0], [0.08, -R * 0.62, 0], R * 0.045, M.plastic(0x22222a), 8), 'ink', this.inner);
    for (const s of [1, -1]) {
      const gl = add(sphere(R * 0.2, M.plastic(0xf08aa6, { roughness: 0.5 }), 14), 'gill', this.inner); gl.scale.set(ML * 0.9, 0.5, 0.6); gl.position.set(ML * 0.25, -R * 0.1, s * R * 0.5);
    }
    this.axonMat = M.glow(0xffd36a, { transparent: true, opacity: 0.95 });
    this.axons = [];
    for (const s of [1, -1]) {
      const sg = add(sphere(R * 0.12, M.glow(0xffb547), 12), 'axon', this.inner); sg.position.set(ML * 0.06, R * 0.45, s * R * 0.62);
      for (let k = 0; k < 6; k++) {
        const fr = 0.25 + k * 0.13, len = ML * fr, a = 0.65 - k * 0.22;
        const pts = [[ML * 0.06, R * 0.45, s * R * 0.62]];
        for (let j = 1; j <= 6; j++) {
          const x = ML * 0.06 + len * j / 6, rr = latR(K.prof, x) * 0.93, ang = a * (1 - j / 10);
          pts.push([x, rr * Math.sin(ang), s * rr * Math.cos(ang)]);
        }
        const d = 0.08 + 0.92 * (fr - 0.25) / 0.65;   // thicker for the fibres that run furthest
        const tb = taperTube(pts, R * (0.025 + 0.03 * d), R * 0.012, this.axonMat, 24); tb.userData.kind = 'axon'; this.meshes.push(tb); this.inner.add(tb);
        this.axons.push({ mesh: tb, len, d, s, curve: new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))) });
      }
    }
    if (kind === 'bobtail') {
      this.organ = new THREE.Group(); this.organ.position.set(ML * 0.35, -R * 0.55, 0); this.inner.add(this.organ);
      const refl = new THREE.Mesh(new THREE.SphereGeometry(R * 0.32, 24, 12, 0, TAU, 0, Math.PI / 2), M.metal(0xdfe8ff, { roughness: 0.2, side: THREE.DoubleSide }));
      this.organ.add(refl); refl.userData.kind = 'organ'; this.meshes.push(refl);
      this.organGlowMat = M.glow(0x7fe8ff, { transparent: true, opacity: 0.9 });
      for (const s of [1, -1]) { const lobe = sphere(R * 0.14, this.organGlowMat, 16); lobe.position.set(0, -R * 0.06, s * R * 0.13); lobe.scale.set(1.3, 0.8, 1); this.organ.add(lobe); }
      this.shutter = new THREE.Mesh(new THREE.TorusGeometry(R * 0.26, R * 0.07, 10, 28), M.matte(0x111116)); this.shutter.rotation.x = Math.PI / 2; this.shutter.position.y = -R * 0.12; this.organ.add(this.shutter);
      this.beamMat = M.ghost(0x7fe8ff, 0.25);
      this.beam = new THREE.Mesh(new THREE.ConeGeometry(R * 0.9, R * 4, 28, 1, true), this.beamMat); this.beam.position.y = -R * 2.3; this.beam.renderOrder = 5; this.organ.add(this.beam);
    }
    // Photophores (firefly and Humboldt): glowing dots on the belly; firefly also has arm-tip organs.
    this.photo = null;
    if (kind === 'firefly' || kind === 'humboldt') {
      const n = kind === 'firefly' ? 260 : 320;
      this.photoMat = M.glow(kind === 'firefly' ? 0x4fa8ff : 0x9fd8ff, { transparent: true, opacity: 1 });
      this.photo = new THREE.InstancedMesh(new THREE.SphereGeometry(R * 0.035, 6, 4), this.photoMat, n);
      const o = new THREE.Object3D();
      for (let i = 0; i < n; i++) {
        const x = 0.05 + rnd() * ML * 0.9, rr = latR(K.prof, x) * 1.01, a = -Math.PI / 2 + (rnd() - 0.5) * (kind === 'firefly' ? 2.2 : 5.6);
        o.position.set(x, rr * Math.sin(a), rr * Math.cos(a)); o.updateMatrix(); this.photo.setMatrixAt(i, o.matrix);
      }
      this.mantleG.add(this.photo);
      if (kind === 'firefly') {
        this.tips = [];
        for (const piv of this.arms.filter((p) => !p.userData.tent && Math.sin(p.userData.ang) < -0.5)) {
          for (let k = 0; k < 3; k++) { const b = sphere(K.head * 0.09, this.photoMat, 10); b.position.copy(piv.userData.tip).add(new THREE.Vector3(0.05 + k * 0.08, 0, 0)); piv.add(b); this.tips.push(b); }
        }
      }
    }
    this.inner.visible = xray;
    this.spots = Array.from({ length: Math.round(420 * K.chrom) }, () => {
      const v = rnd(), u = rnd(), dorsal = Math.cos((u - 0.75) * TAU);
      return { u, v, r: 4.5 + rnd() * 7, col: rnd() < 0.45 ? [120, 40, 30] : rnd() < 0.6 ? [190, 70, 40] : [215, 150, 60], dorsal: clamp(0.35 + 0.65 * dorsal, 0, 1), ph: rnd() * TAU };
    });
    this.state = { mode: 'calm', t: 0, open: 0.5, blanch: 0, irid: null, stripe: 0.6, flash: 0 };
    this.paint();
  }
  // Paint the chromatophore skin. mode: 'calm' | 'wave' | 'dark' | 'pale' | 'flash'.
  paint(o = {}) {
    Object.assign(this.state, o);
    const S = this.state, gx = this.cv.getContext('2d'), w = this.cv.width, h = this.cv.height, b = this.K.base;
    gx.fillStyle = `rgb(${b.map((c) => Math.round(c * 235)).join(',')})`; gx.fillRect(0, 0, w, h);
    // Iridophore stripes along the sides (fixed bands at u = 0.08 and 0.42 near the fins' line).
    if (S.irid) {
      const c = S.irid.map((x) => Math.round(x * 255));
      for (const u0 of [0.02, 0.48]) { const grd = gx.createLinearGradient(u0 * w - 30, 0, u0 * w + 30, 0); grd.addColorStop(0, `rgba(${c},0)`); grd.addColorStop(0.5, `rgba(${c},${0.95 * S.stripe})`); grd.addColorStop(1, `rgba(${c},0)`); gx.fillStyle = grd; gx.fillRect(u0 * w - 30, h * 0.05, 60, h * 0.9); }
      const grd = gx.createLinearGradient(0.98 * w - 30, 0, 0.98 * w + 30, 0); grd.addColorStop(0, `rgba(${c},0)`); grd.addColorStop(0.5, `rgba(${c},${0.95 * S.stripe})`); grd.addColorStop(1, `rgba(${c},0)`); gx.fillStyle = grd; gx.fillRect(0.98 * w - 30, h * 0.05, 60, h * 0.9);
    }
    for (const p of this.spots) {
      let e;
      if (S.mode === 'wave') e = 0.25 + 0.75 * Math.max(0, Math.sin(TAU * (p.v * 2.5 - S.t * 0.9))) ** 3;
      else if (S.mode === 'dark') e = 1;
      else if (S.mode === 'pale') e = 0.12;
      else if (S.mode === 'flash') e = 0.15 + 0.85 * S.flash;
      else e = S.open;
      e *= 1 - 0.85 * S.blanch;
      const r = p.r * (0.25 + 0.9 * e) * (0.5 + 0.5 * p.dorsal);
      gx.fillStyle = `rgba(${p.col.join(',')},${0.85 * (0.3 + 0.7 * p.dorsal)})`;
      gx.beginPath(); gx.arc(p.u * w, (1 - p.v) * h, r, 0, TAU); gx.fill();
    }
    this.tex.needsUpdate = true;
    if (S.mode === 'flash') { const k = 0.6 + 0.4 * S.flash; this.headMat.color.setRGB(b[0] * k, b[1] * (1.2 - 0.5 * S.flash), b[2] * (1.2 - 0.6 * S.flash)); }
    else { const k = 1 - 0.35 * (S.mode === 'dark' ? 1 : S.open * 0.5) * (1 - S.blanch); this.headMat.color.setRGB(b[0] * k + 0.1 * S.blanch, b[1] * k + 0.12 * S.blanch, b[2] * k + 0.12 * S.blanch); }
  }
  setXray(k) {
    this.inner.visible = k > 0.02;
    const op = 1 - 0.78 * k;
    this.skin.opacity = op; this.headMat.opacity = Math.max(0.35, op);
    this.skin.depthWrite = this.headMat.depthWrite = op > 0.95;
  }
  // c: mantle squeeze 0–0.35. aim: funnel angle (rad), 0 = forward.
  setJet(c, aim = 0) { const k = 1 - c; this.mantle.scale.set(1, k, k); this.funnelPiv.rotation.z = aim; }
  setPhoto(k) { if (this.photoMat) { this.photoMat.opacity = clamp(k, 0, 1); this.photo.visible = k > 0.01; this.tips?.forEach((b) => (b.visible = k > 0.01)); } }
  setOrgan(k, shutter) {
    if (!this.organ) return;
    this.organGlowMat.color.setRGB(0.5 * k + 0.05, 0.9 * k + 0.05, 1.0 * k + 0.08);
    this.beamMat.opacity = 0.5 * k * (1 - 0.8 * shutter);
    this.shutter.scale.setScalar(1 - 0.45 * shutter);
  }
  funnelWorld(v = new THREE.Vector3()) { return this.funnel.localToWorld(v.copy(this.funnelTip)); }
  animate(t, { swim = 1, fin = 1 } = {}) {
    for (const p of this.arms) { const u = p.userData; p.rotation.z = 0.05 * Math.sin(t * 1.3 + u.ph) * swim; p.rotation.y = 0.05 * Math.cos(t * 1.1 + u.ph) * swim; }
    for (const f of this.fins) {
      const s = f.userData.side, a = 0.28 * Math.sin(t * 4.2) * fin;
      if (this.K.ear) f.rotation.x = s * a; else f.rotation.x = s * a;
    }
  }
}
function latR(prof, x) {
  for (let i = 1; i < prof.length; i++) if (x <= prof[i][0]) { const [x0, r0] = prof[i - 1], [x1, r1] = prof[i]; return r0 + (r1 - r0) * (x - x0) / (x1 - x0); }
  return prof[prof.length - 1][1];
}

// ---------------------------------------------------------------- skin cut open
// A block of squid skin, top to bottom: clear outer skin, chromatophore organs (yellow, red, brown
// pigment sacs: OctopusClear explains them), iridophores (stacks of reflectin plates), a photophore in
// some species (a light-making cup with a reflector and lens), and mantle muscle. Width along X.
export const LAYERS = [
  { id: 'epi', name: 'Outer skin (epidermis)', short: 'Outer skin', h: 0.2 },
  { id: 'chr', name: 'Chromatophores: pigment sacs pulled open by muscles', short: 'Pigment sacs', h: 0.34 },
  { id: 'iri', name: 'Iridophores: tunable stacks of reflectin plates', short: 'Tunable mirrors', h: 0.5 },
  { id: 'pho', name: 'Photophores in some squid: light organs', short: 'Light organ (some)', h: 0.46 },
  { id: 'mus', name: 'Mantle muscle', short: 'Muscle', h: 0.42 },
];
export class SkinSlab {
  constructor({ W = 3.0, D = 1.7 } = {}) {
    this.W = W; this.D = D;
    const g = (this.group = new THREE.Group());
    this.layers = {}; let y = 0;
    for (const L of LAYERS) { const lg = new THREE.Group(); lg.position.y = -y - L.h / 2; g.add(lg); this.layers[L.id] = lg; L.y = -y - L.h / 2; y += L.h; }
    const slab = (h, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(W, h * 0.96, D), mat); m.receiveShadow = true; return m; };
    this.layers.epi.add(slab(0.2, M.clear(0xe8f2f0, 0.3, { roughness: 0.1 })));
    this.layers.mus.add(slab(0.42, M.matte(0xe6c9c0)));
    for (let i = 0; i < 9; i++) { const f = beam([-W / 2 + 0.05, -0.12 + (i % 3) * 0.12, -D / 2 + 0.1 + i * (D - 0.2) / 8], [W / 2 - 0.05, -0.12 + (i % 3) * 0.12, -D / 2 + 0.1 + i * (D - 0.2) / 8], 0.03, M.matte(0xd49f92), 6); this.layers.mus.add(f); }
    // Chromatophores: flattened discs of three colours.
    const cols = [0xf2c13a, 0xd9542f, 0x5a2a1c], o = new THREE.Object3D();
    this.chr = cols.map((c) => { const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 18), M.plastic(c, { roughness: 0.4 }), 12); this.layers.chr.add(m); return m; });
    this.chrPos = [];
    for (let i = 0; i < 36; i++) this.chrPos.push([-W / 2 + 0.22 + (i % 9) * ((W - 0.44) / 8) + (Math.floor(i / 9) % 2) * 0.1, 0, -D / 2 + 0.25 + Math.floor(i / 9) * ((D - 0.5) / 3)]);
    this.layers.chr.add(slab(0.34, M.clear(0xfff2e0, 0.06)));
    // Iridophores: small stacks of thin plates, coloured by the band they reflect.
    this.iriMat = M.plastic(0xff6040, { emissive: 0x401810, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.9 });
    this.iri = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.022, 0.3), this.iriMat, 12 * 7);
    this.iriCells = [];
    for (let c = 0; c < 12; c++) this.iriCells.push([-W / 2 + 0.35 + (c % 6) * ((W - 0.7) / 5), -D / 2 + 0.45 + Math.floor(c / 6) * (D - 0.9)]);
    this.layers.iri.add(this.iri, slab(0.5, M.clear(0xdfe8ef, 0.1)));
    // Photophore: a reflector cup, glowing core and a lens.
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 12, 0, TAU, Math.PI / 2, Math.PI / 2), M.metal(0xe6eeff, { roughness: 0.15, side: THREE.DoubleSide }));
    cup.position.y = 0.1; this.layers.pho.add(cup);
    this.phoMat = M.glow(0x6fd8ff); const core = sphere(0.1, this.phoMat, 16); core.position.y = 0.04; this.layers.pho.add(core);
    const lens = sphere(0.12, M.clear(0xffffff, 0.35), 16); lens.scale.set(1, 0.5, 1); lens.position.y = 0.17; this.layers.pho.add(lens);
    this.layers.pho.add(slab(0.46, M.clear(0xcfe0ff, 0.06)));
    this.setIrid(0); this.setOpen(0.5);
  }
  setOpen(k) {
    const o = new THREE.Object3D(); const n = [0, 0, 0];
    this.chrPos.forEach((p, i) => { const c = i % 3, s = 0.35 + 1.1 * k * (0.7 + 0.3 * Math.sin(i * 2.1)); o.position.set(...p); o.scale.set(s, 1, s); o.updateMatrix(); this.chr[c].setMatrixAt(n[c]++, o.matrix); });
    this.chr.forEach((m) => { m.count = 12; m.instanceMatrix.needsUpdate = true; });
  }
  setIrid(a) {
    const st = achState(a), pk = 2 * (st.n1 * st.d1 + N_GAP * st.d2), col = lambdaRgb(pk);
    this.iriMat.color.setRGB(col[0], col[1], col[2], THREE.SRGBColorSpace); this.iriMat.emissive.setRGB(col[0] * (0.15 + 0.3 * a), col[1] * (0.15 + 0.3 * a), col[2] * (0.15 + 0.3 * a), THREE.SRGBColorSpace);
    const o = new THREE.Object3D(); let n = 0, gap = (st.d1 + st.d2) / 248 * 0.055;
    for (const [x, z] of this.iriCells) for (let k = 0; k < 7; k++) { o.position.set(x, (k - 3) * gap, z); o.updateMatrix(); this.iri.setMatrixAt(n++, o.matrix); }
    this.iri.instanceMatrix.needsUpdate = true;
  }
  explode(k) { let i = 0; for (const L of LAYERS) { this.layers[L.id].position.y = L.y + (2 - i) * k * 0.42; i++; } }
}

// ---------------------------------------------------------------- boards (as in ChameleonClear)
export const COL = { hot: '#ffb547', cool: '#8ef0ff', up: '#5ce1a9', down: '#ff7a59', water: '#6cc4ff', red: '#ff5a8a', gold: '#f2c24b', violet: '#c49bff', lime: '#a3e635', soft: 'rgba(255,255,255,.6)', text: '#e8eef8' };
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const gx = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = (...a) => { draw(gx, pxW, pxH, ...a); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  m.position.set(...pos); m.renderOrder = 10; root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function panel(gx, w, h) { gx.clearRect(0, 0, w, h); gx.fillStyle = 'rgba(10,12,18,.88)'; gx.beginPath(); gx.roundRect(0, 0, w, h, 18); gx.fill(); }
export function head(gx, t, sub = '') {
  gx.fillStyle = COL.text; gx.font = 'bold 29px sans-serif'; gx.fillText(t, 22, 40);
  if (sub) { gx.font = '20px sans-serif'; gx.fillStyle = COL.soft; gx.fillText(sub, 22, 64); }
}
export function txt(gx, s, x, y, col = 'rgba(255,255,255,.82)', font = '22px sans-serif') { gx.fillStyle = col; gx.font = font; gx.fillText(s, x, y); }
export function wrap(gx, s, x, y, maxW, lh = 27, col = 'rgba(255,255,255,.82)', font = '22px sans-serif') {
  gx.fillStyle = col; gx.font = font; let line = '', yy = y;
  for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (gx.measureText(t).width > maxW && line) { gx.fillText(line, x, yy); line = word; yy += lh; } else line = t; }
  if (line) gx.fillText(line, x, yy);
  return yy + lh;
}
export function swatch(gx, rgb, x, y, w, h, label) {
  gx.fillStyle = css(rgb); gx.beginPath(); gx.roundRect(x, y, w, h, 12); gx.fill();
  gx.strokeStyle = 'rgba(255,255,255,.35)'; gx.lineWidth = 2; gx.stroke();
  if (label) txt(gx, label, x, y + h + 24, COL.text, '18px sans-serif');
}

// ---------------------------------------------------------------- layout helpers (as in ChameleonClear)
export const inReel = () => document.body.classList.contains('gb-reel');
export function layoutOf(stage) {
  const w = stage.host.clientWidth, h = stage.host.clientHeight || 1;
  if (inReel() && w / h < 0.8) return 'tall';
  return w < 560 ? 'narrow' : 'wide';
}
export function viewFor(stage, v) { const lay = layoutOf(stage); return v[lay] || v; }
export function viewFixer(stage, view) {
  let done = false;
  return () => {
    if (done) return; done = true;
    const lay = layoutOf(stage);
    if (lay !== 'wide' && view[lay] && !inReel()) stage.setView(view[lay].pos, view[lay].target, 0.01);
  };
}
export function focuser(stage, groups, views) {
  let cur = '';
  return (f, force = false) => {
    if (f === cur && !force) return false;
    cur = f;
    for (const k in groups) groups[k].visible = k === f;
    if (!inReel()) { const v = viewFor(stage, views[f]); stage.setView(v.pos, v.target, 1.0); }
    return true;
  };
}
const _v = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3();
export function fitBoard(stage, mesh, base, scale = 1) {
  const cam = stage.camera;
  mesh.visible = layoutOf(stage) !== 'narrow';
  if (!mesh.visible) return;
  mesh.position.set(...base); mesh.scale.setScalar(scale); mesh.updateMatrixWorld(true);
  const p = mesh.geometry.parameters, hw = p.width / 2, hh = p.height / 2;
  cam.updateMatrixWorld(); _r.setFromMatrixColumn(cam.matrixWorld, 0); _u.setFromMatrixColumn(cam.matrixWorld, 1);
  for (let it = 0; it < 8; it++) {
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      _v.set(sx * hw, sy * hh, 0).applyMatrix4(mesh.matrixWorld).project(cam);
      x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y);
    }
    const wN = x1 - x0, hN = y1 - y0;
    if (wN > 1.25 || hN > 0.9) { const k = Math.min(1.25 / wN, 0.9 / hN); mesh.scale.multiplyScalar(k); mesh.updateMatrixWorld(true); continue; }
    let dx = 0, dy = 0;
    if (x1 > 0.97) dx = 0.97 - x1; if (x0 + dx < -0.97) dx = -0.97 - x0;
    if (y1 > 0.86) dy = 0.86 - y1;
    if (x0 + dx < 0.2 && y1 + dy > 0.3 && y0 + dy < 0.98) {
      if (wN > 0.77) { mesh.scale.multiplyScalar(0.77 / wN); mesh.updateMatrixWorld(true); continue; }
      dx = 0.2 - x0;
    }
    if (!dx && !dy) break;
    const d = mesh.position.distanceTo(cam.position), th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * d;
    mesh.position.addScaledVector(_r, dx * th * cam.aspect).addScaledVector(_u, dy * th);
    mesh.updateMatrixWorld(true);
  }
}
export function reelZoom(stage, z) {
  const lay = layoutOf(stage), want = lay === 'tall' ? z : 1;
  if (stage.camera.zoom !== want) { stage.camera.zoom = want; stage.camera.updateProjectionMatrix(); }
  const [x, y] = lay === 'narrow' ? [0, -0.24] : lay === 'wide' ? [0.08, -0.1] : [0, 0];
  if (!stage.shift || stage.shift[0] !== x || stage.shift[1] !== y) stage.setShift(x, y);
}
// Deep-sea backdrop. The stage resets background and fog on chapter close.
export function seaLook(stage, col = 0x06121f, near = 18, far = 48) { stage.scene.background = new THREE.Color(col); stage.scene.fog = new THREE.Fog(col, near, far); }
// A drifting cloud of marine snow for depth.
export function snow(root, n = 160, box = [16, 9, 10], y0 = 0) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 5, 4), M.glow(0x9fc4dd, { transparent: true, opacity: 0.5 }), n);
  const pts = Array.from({ length: n }, () => [(rnd() - 0.5) * box[0], y0 + rnd() * box[1], (rnd() - 0.5) * box[2]]);
  const o = new THREE.Object3D();
  m.tick = (dt) => { pts.forEach((p, i) => { p[1] -= dt * 0.05; if (p[1] < y0) p[1] += box[1]; o.position.set(...p); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.instanceMatrix.needsUpdate = true; };
  m.tick(0); root.add(m); return m;
}
