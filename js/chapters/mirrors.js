// Chapter 2: tunable mirrors. A squid iridophore's stack of reflectin plates (lamellae) and watery gaps,
// drawn to scale (1 unit = 650 nm in thickness; the plates are drawn wider than real), with white light
// in and the reflected band out. The reflectance comes from an exact multilayer (transfer-matrix) model
// in squid.js (stack(), iridColour()), and its constants and sources are listed there: Ghoshal et al.
// 2013 (live Doryteuthis opalescens: lamella index 1.405 average, up to 1.44; tuning 675 → 425 nm as
// lamellae thin from ~150 to 80 nm and gaps from ~120 to 50 nm; 8–9 pairs), DeMartini, Krogstad &
// Morse 2013 PNAS (acetylcholine → reflectin condenses → water leaves → plates thinner and denser),
// Wardill et al. 2012 Proc R Soc B (nerves drive the red → blue shift; colour change ~17 s, brightness
// ~32 s in D. pealeii). The "Fire the nerve" button runs the change about 4× faster than real.
// Chameleon comparison: ChameleonClear's crystal() model (guanine n = 1.83 in a 3D lattice that
// spreads apart when excited, shifting to longer waves; Teyssier et al. 2015).
import { THREE, M, approach, clamp, arrow, sphere } from '../kit.js';
import { stack, iridColour, achState, lambdaRgb, css, bandName, hueName, LAMBDAS, N_GAP, N_PAIRS, Squid, board, panel, head, txt, wrap, swatch, COL, layoutOf, reelZoom, viewFixer, fitBoard, seaLook } from '../squid.js';

const SC = 1 / 650, LX = 0.4, LY = 1.9, PW = 2.4, PD = 1.5;

export default {
  id: 'mirrors',
  short: 'Tunable mirrors',
  title: 'Mirrors a squid can tune',
  subtitle: 'Stacks of protein plates thinner than a soap film reflect one colour. A nerve signal squeezes water out and the colour slides from red to blue.',
  view: { pos: [1.4, 3.0, 11.0], target: [1.2, 2.5, 0], narrow: { pos: [0.0, 3.4, 11.5], target: [0.0, 2.6, 0] } },
  learn: `<p>Look closely at a live squid and you see shimmering stripes and spots of pink, gold, green and blue. They are not pigment. They come from <b>iridophores</b>: cells holding stacks of very thin plates, each about <b>a tenth of a micrometre</b> thick, made of a protein called <b>reflectin</b>, with thin gaps of watery fluid between them.</p>
    <p>Each plate reflects a tiny bit of light. The reflections from plate after plate line up and <b>add together</b> for one wavelength, the one that fits twice the plate-plus-gap spacing, and cancel for the rest. This is <b>thin-film interference</b>, the colour of a soap bubble (<a href="/waveclear/#limits">WaveClear</a> shows waves adding and cancelling). Tilt the stack and the light crosses it at a slant, so the colour shifts toward blue: that shimmer is <b>iridescence</b>.</p>
    <p>Here is the squid’s trick. A nerve releases <b>acetylcholine</b>. It makes reflectin <b>clump together</b>, and water leaves the plates. The plates get <b>thinner</b>, the gaps shrink and the plates get <b>denser</b>. Thinner layers pick out shorter waves, so the colour slides from <b>red to orange, green and blue</b>, and because the plates now stand out more from the fluid, it gets <b>brighter</b> too. Wash the signal away and the plates soak up water and swell back.</p>
    <p>It is slow for a squid: about <b>17 seconds</b> for the colour shift and half a minute for the brightness in one lab study, compared with a fraction of a second for the pigment sacs above (<a href="/octopusclear/">OctopusClear</a>). A chameleon does something like the reverse: its stiff <b>guanine crystals</b> sit in a 3D lattice that <b>spreads apart</b> when it is excited, so its colour slides toward red (<a href="/chameleonclear/#crystal">ChameleonClear</a>). Guanine bends light much more than reflectin, so a few crystal layers are enough; a squid needs about <b>eight plates</b>.</p>
    <p class="tip"><b>Try it:</b> press “Fire the nerve” and watch water leave the plates and the colour slide to blue. Then tilt the light, and try one plate against twelve.</p>`,
  terms: [
    { t: 'Reflectin', d: 'A protein found only in cephalopods that builds their reflecting plates.' },
    { t: 'Lamella', d: 'One thin plate in an iridophore’s stack. The plural is lamellae.' },
    { t: 'Thin-film interference', d: 'Light reflected from the top and bottom of thin layers adding up for some colours and cancelling for others.' },
    { t: 'Iridescence', d: 'Colour that changes as you look from a different angle.' },
    { t: 'Acetylcholine', d: 'A chemical messenger released by nerves. In squid skin it tells iridophores to change.' },
    { t: 'Refractive index', d: 'How much a material slows light: about 1.38 to 1.44 for squid plates, 1.33 for water.' },
    { t: 'Bragg reflector', d: 'A stack of alternating layers that strongly reflects the wavelength that fits its spacing.' },
  ],
  defaults: { ach: 0, d1: 140, d2: 108, n1: 1.38, N: N_PAIRS, theta: 0, run: 0 },
  onChange(s, key) {
    if (key === 'ach') Object.assign(s, achState(s.ach));
    if (key === 'd1' || key === 'd2') s.run = 0;
  },
  controls: [
    { key: 'ach', type: 'range', label: 'Nerve signal (acetylcholine)', min: 0, max: 1, step: 0.01, ends: ['none', 'strong'], fmt: (v) => Math.round(v * 100) + '%', hint: 'Moves plate thickness, gap and density together, along the range measured in live squid.' },
    { key: 'go', type: 'buttons', label: 'Nerve', items: [{ label: 'Fire the nerve', act: (s) => { s.run = 1; } }, { label: 'Wash it out', act: (s) => { s.run = -1; } }] },
    { key: 'd1', type: 'range', label: 'Plate thickness', min: 60, max: 160, step: 1, fmt: (v) => Math.round(v) + ' nm' },
    { key: 'd2', type: 'range', label: 'Gap between plates', min: 40, max: 130, step: 1, fmt: (v) => Math.round(v) + ' nm' },
    { key: 'N', type: 'range', label: 'Number of plates', min: 1, max: 12, step: 1, fmt: (v) => String(Math.round(v)) },
    { key: 'theta', type: 'range', label: 'Angle of the light', min: 0, max: 50, step: 1, fmt: (v) => Math.round(v) + '°', ends: ['straight on', 'slanted'] },
  ],
  quiz: [
    { q: 'What do squid iridophores use to make colour?', options: ['Red and blue pigments', 'Stacks of thin reflectin plates that reflect one colour by interference', 'Glowing bacteria', 'Tiny mirrors of metal'], answer: 1, why: 'Reflections from many thin plates add up for one wavelength, set by their thickness and spacing.' },
    { q: 'When acetylcholine reaches the iridophores, what happens to the colour?', options: ['It slides from red toward blue and gets brighter', 'It slides from blue to red', 'It turns black', 'Nothing'], answer: 0, why: 'Reflectin clumps, water leaves, the plates get thinner and denser: shorter waves are reflected, more strongly.' },
    { q: 'How is a chameleon’s tuning different from a squid’s?', options: ['There is no difference', 'A chameleon’s guanine crystals spread apart when excited, so its colour shifts toward red', 'Chameleons use bacteria', 'Chameleons change faster than squid chromatophores'], answer: 1, why: 'Chameleon crystals move apart (longer waves); squid plates shrink (shorter waves).' },
  ],
  reel: [
    { ms: 5600, caption: 'Squid skin hides stacks of protein plates thinner than a soap film. They reflect one colour.', set: { theta: 0, N: N_PAIRS, run: 0, ach: 0, d1: 140, d2: 108, n1: 1.38 }, anim: {}, view: { pos: [0.4, 3.4, 8.0], target: [0.4, 2.6, 0] }, spin: 0 },
    { ms: 6200, caption: 'A nerve signal squeezes water out: the plates thin and the colour slides from red to blue.', set: { theta: 0, N: N_PAIRS, run: 0 }, anim: { ach: [0, 1] }, view: { pos: [0.4, 3.4, 8.0], target: [0.4, 2.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x071420);
    const MAXN = 12;
    const plateMat = M.plastic(0xffffff, { roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.88, emissive: 0x000000 });
    const plates = Array.from({ length: MAXN }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(PW, 1, PD), plateMat); root.add(m); return m; });
    const cell = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), M.clear(0x9fd6ff, 0.07)); root.add(cell);
    // Reflectin inside the plates: dots that spread out when hydrated and clump when signalled.
    const NR = MAXN * 14, rdots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), M.plastic(0x5a6cff, { roughness: 0.3 }), NR); root.add(rdots);
    const home = Array.from({ length: NR }, (_, i) => [(((i * 37) % 14) / 13 - 0.5) * (PW - 0.3), (((i * 53) % 11) / 10 - 0.5) * (PD - 0.3)]);
    const clump = home.map(([x, z]) => [Math.round(x / 0.6) * 0.6, Math.round(z / 0.6) * 0.6]);
    // Water leaving the plates.
    const NW = 60, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), M.plastic(0x6cc4ff, { transparent: true, opacity: 0.85 }), NW); root.add(drops);
    const dr = Array.from({ length: NW }, (_, i) => ({ k: i % MAXN, side: i % 2 ? 1 : -1, z: ((i * 29) % 13) / 12 - 0.5, p: 0 }));
    const rin = arrow(0xffffff, 2.2, 0.3, 0.05), rout = arrow(0xff5a40, 2.2, 0.3, 0.07), rgo = arrow(0x777777, 1.2, 0.2, 0.03);
    root.add(rin, rout, rgo);
    const mini = new Squid('loligo', { xray: false }); mini.group.scale.setScalar(0.55); mini.group.position.set(LX - 3.6, 0.9, 0.6); mini.group.rotation.set(0.5, 0.25, 0.25); root.add(mini.group);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const lb = { in: L('White light in', [0, 0, 0]), out: L('', [0, 0, 0], 'hot'), plate: L('Reflectin plate', [0, 0, 0]), gap: L('Watery gap', [0, 0, 0]), dims: L('', [0, 0, 0]), mini: L('Slow stripe: iridophores<br>Fast spots: pigment sacs', [LX - 3.4, 0.05, 0.6]) };

    const cur = { d1: 140, d2: 108, n1: 1.38, N: N_PAIRS, theta: 0 };
    const chart = board(root, 4.6, 4.0, 760, 660, (g, w, h) => {
      panel(g, w, h); head(g, 'How much light the stack reflects', 'Exact multilayer model, at each wavelength');
      const x0 = 70, x1 = w - 30, y0 = 300, y1 = 95, X = (l) => x0 + (x1 - x0) * (l - 380) / 350, RM = 0.6, Y = (v) => y0 - (y0 - y1) * Math.min(1, v / RM);
      for (let l = 380; l < 730; l += 2) { g.fillStyle = css(lambdaRgb(l)); g.fillRect(X(l), y0 + 6, X(l + 2) - X(l) + 1, 10); }
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
      [400, 500, 600, 700].forEach((l) => txt(g, l + '', X(l) - 18, y0 + 40, COL.soft, '18px sans-serif'));
      [0, 0.2, 0.4, 0.6].forEach((v) => txt(g, Math.round(v * 100) + '%', 18, Y(v) + 6, COL.soft, '17px sans-serif'));
      txt(g, 'nm', x1 - 26, y0 + 40, COL.soft, '18px sans-serif');
      const a = stack({ ...achState(0), N: cur.N, theta: cur.theta }), b = stack({ ...achState(1), N: cur.N, theta: cur.theta }), c = iridColour(cur);
      const line = (arr, col, wd = 3.5, dash = []) => { g.setLineDash(dash); g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); arr.forEach((v, i) => { const x = X(LAMBDAS[i]), y = Y(v); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]); };
      line(a.R, 'rgba(255,120,90,.55)', 2, [7, 6]); line(b.R, 'rgba(120,150,255,.55)', 2, [7, 6]);
      g.fillStyle = 'rgba(163,230,53,.22)'; g.beginPath(); g.moveTo(X(380), y0); c.R.forEach((v, i) => g.lineTo(X(LAMBDAS[i]), Y(v))); g.lineTo(X(730), y0); g.fill(); line(c.R, COL.lime);
      txt(g, '- - no signal', x0 + 10, y1 - 6, 'rgba(255,140,110,.9)', 'bold 18px sans-serif'); txt(g, '- - full signal', x0 + 150, y1 - 6, 'rgba(140,160,255,.9)', 'bold 18px sans-serif'); txt(g, '■ now', x0 + 300, y1 - 6, COL.lime, 'bold 18px sans-serif');
      swatch(g, c.rgb, 30, 380, 150, 92, 'Colour you see');
      txt(g, 'How fast each layer changes', 220, 398, COL.text, 'bold 22px sans-serif');
      const rows = [['Pigment sacs (muscles)', 'under 1 s', 0.06, COL.water], ['Iridophore colour (squid)', 'about 17 s', 0.42, COL.lime], ['Iridophore brightness', 'about 32 s', 0.8, COL.lime], ['Chameleon crystals', 'seconds to minutes', 1, COL.gold]];
      rows.forEach(([n, v, k, col], i) => { const y = 428 + i * 50; txt(g, n, 220, y, COL.soft, '18px sans-serif'); g.fillStyle = col; g.fillRect(220, y + 8, Math.max(6, 300 * k), 14); txt(g, v, 230 + Math.max(6, 300 * k), y + 21, COL.text, '17px sans-serif'); });
      wrap(g, 'Wardill et al. 2012 (squid); ChameleonClear for chameleons.', 30, 640, 700, 20, COL.soft, '16px sans-serif');
    }, [5.4, 2.6, -1.0]);
    let drawn = '', aNow = 0, t = 0, prevA = 0, pt = 0;
    const st = { d1: 140, d2: 108, n1: 1.38, N: N_PAIRS, theta: 0 };
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.4, 6.6, -1.0] : [5.4, 2.6, -1.0], lay === 'tall' ? 0.72 : 1.3);
        // The nerve button runs the signal up or down (real: ~17 s for colour; here ~4 s).
        if (s.run) { s.ach = clamp(s.ach + s.run * dt / 4, 0, 1); Object.assign(s, achState(s.ach)); if (s.ach === 0 || s.ach === 1) s.run = 0; }
        for (const k of ['d1', 'd2', 'n1', 'theta']) st[k] = approach(st[k], s[k], 7, dt);
        st.N = Math.round(s.N);
        aNow = clamp((RELAX_D1 - st.d1) / (RELAX_D1 - 88), 0, 1);
        const N = st.N, t1 = st.d1 * SC, t2 = st.d2 * SC, H = N * t1 + (N - 1) * t2;
        const c = iridColour(st), rgb = c.peak > 730 || c.peak < 380 ? [0.4, 0.1, 0.2] : lambdaRgb(c.peak);
        plateMat.color.setRGB(0.75 + 0.25 * rgb[0], 0.75 + 0.25 * rgb[1], 0.75 + 0.25 * rgb[2], THREE.SRGBColorSpace);
        plateMat.emissive.setRGB(rgb[0] * (0.12 + c.Rpk), rgb[1] * (0.12 + c.Rpk), rgb[2] * (0.12 + c.Rpk), THREE.SRGBColorSpace);
        const yTop = LY + H / 2, o = new THREE.Object3D();
        plates.forEach((p, k) => { p.visible = k < N; p.scale.y = t1; p.position.set(LX, yTop - t1 / 2 - k * (t1 + t2), 0); });
        cell.scale.set(PW + 0.4, H + 0.5, PD + 0.4); cell.position.set(LX, LY, 0);
        let n = 0;
        for (let k = 0; k < MAXN; k++) for (let j = 0; j < 14; j++) {
          const hm = home[k * 14 + j], cl = clump[k * 14 + j], a = aNow;
          if (k < N) o.position.set(LX + hm[0] + (cl[0] - hm[0]) * a * 0.85, yTop - t1 / 2 - k * (t1 + t2), hm[1] + (cl[1] - hm[1]) * a * 0.85); else o.position.set(0, -50, 0);
          o.scale.setScalar(0.7 + 0.6 * a); o.updateMatrix(); rdots.setMatrixAt(n++, o.matrix);
        }
        rdots.instanceMatrix.needsUpdate = true;
        // Drops stream out sideways while the plates shrink and back in while they swell.
        const da = (aNow - prevA) / Math.max(1e-4, dt); prevA = aNow;
        dr.forEach((d, i) => {
          d.p = clamp(d.p + (da > 0.02 ? 1 : da < -0.02 ? -1 : -0.25) * dt * (0.6 + (i % 5) * 0.15), 0, 1);
          o.position.set(LX + d.side * (PW / 2 + 0.05 + d.p * 1.2), yTop - t1 / 2 - (d.k % N) * (t1 + t2), d.z * PD);
          o.scale.setScalar(d.p > 0.02 && d.p < 0.98 ? 1 : 0.001); o.updateMatrix(); drops.setMatrixAt(i, o.matrix);
        });
        drops.instanceMatrix.needsUpdate = true;
        // Rays: white in at the angle, the reflected band out at the mirror angle.
        const th = (st.theta + 22) * Math.PI / 180, hit = new THREE.Vector3(LX, yTop - t1 / 2, 0.9), Lr = 1.9;   // drawn 22° wider so the rays don't overlap
        const from = new THREE.Vector3(LX - Math.sin(th) * Lr - 0.0001, yTop + Math.cos(th) * Lr, 0.9);
        rin.position.copy(from); rin.lookAt(hit); rin.rotateX(Math.PI / 2); rin.set(from.distanceTo(hit) - 0.05);
        rout.position.copy(hit); rout.lookAt(LX + Math.sin(th) * Lr + 0.0001, yTop + Math.cos(th) * Lr, 0.9); rout.rotateX(Math.PI / 2); rout.set(1.9);
        rout.children.forEach((m) => m.material.color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace));
        rout.scale.setScalar(0.6 + 1.2 * Math.sqrt(c.Rpk));
        rgo.position.set(LX + 0.15, LY - H / 2 - 0.25, 0.9); rgo.rotation.set(0, 0, Math.PI - 0.25); rgo.set(1.0);
        lb.in.position.set(from.x - 0.3, from.y + 0.25, 0.9);
        lb.out.position.set(LX + Math.sin(th) * Lr + 0.6, yTop + Math.cos(th) * Lr + 0.25, 0.9);
        lb.out.element.innerHTML = `Reflected: <b>${Math.round(c.peak)} nm, ${bandName(c.peak)}</b>`;
        lb.plate.position.set(LX - PW / 2 - 0.85, yTop - t1 / 2, 0); lb.gap.position.set(LX + PW / 2 + 0.8, yTop - t1 - t2 / 2 - 0.05, 0);
        lb.gap.visible = N > 1 && lay !== 'narrow'; lb.plate.visible = lay !== 'narrow'; lb.in.visible = lay !== 'narrow';
        lb.dims.position.set(LX, LY - H / 2 - 0.55, 1.2); lb.dims.element.innerHTML = `${N} plates · ${Math.round(st.d1)} nm thick · ${Math.round(st.d2)} nm gaps`;
        // Mini squid: slow stripe colour, fast chromatophore waves.
        pt += dt; if (pt > 1 / 24) { pt = 0; mini.paint({ mode: 'wave', t, irid: c.rgb, stripe: clamp(0.35 + 2 * c.Rpk, 0, 1) }); }
        mini.animate(t, { swim: 0.6, fin: 0.5 });
        lb.mini.visible = lay === 'wide';
        Object.assign(cur, st);
        const key = [st.d1.toFixed(0), st.d2.toFixed(0), st.n1.toFixed(3), N, st.theta.toFixed(0)].join();
        if (key !== drawn) { drawn = key; chart.redraw(); }
      },
      readout: () => {
        const c = iridColour(st);
        return `<div class="big">Stack reflects <span style="color:${css(c.rgb)}">${bandName(c.peak)}</span></div>
          <div class="row"><span>Peak wavelength</span><b>${Math.round(c.peak)} nm</b></div>
          <div class="row"><span>Light reflected at the peak</span><b>${Math.round(c.Rpk * 100)}%</b></div>
          <div class="row"><span>Plate index n₁ · gap n₂</span><b>${st.n1.toFixed(3)} · ${N_GAP}</b></div>
          <div class="row"><span>Straight on, 2(n₁d₁ + n₂d₂)</span><b>${Math.round(2 * (st.n1 * st.d1 + N_GAP * st.d2))} nm</b></div>
          <small>Multilayer model with ranges measured in live squid (Ghoshal et al. 2013). Looks ${hueName(c.rgb)} over dark skin.</small>`;
      },
    };
  },
};
const RELAX_D1 = 140;
