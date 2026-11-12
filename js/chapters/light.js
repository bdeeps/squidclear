// Chapter 3: making light. Three squid:
// 1. Hawaiian bobtail squid (Euprymna scolopes) and counter-illumination. Its light organ, inside the
//    mantle cavity on the belly, holds the glowing bacterium Vibrio (Aliivibrio) fischeri; Jones &
//    Nishiguchi 2004 (Marine Biology 144: 1151) showed the light output tracks the downwelling light,
//    which hides the squid's shadow from predators below. Each dawn the squid vents about 90–95% of
//    its bacteria (Nyholm & McFall-Ngai 1998 gave 90%; McFall-Ngai's 2014 review and Essock-Burns et
//    al. 2021 give 95%; search summaries) and the rest regrow during the day. The light model is
//    seaLight()/silhouette() in squid.js (moonlight, water clarity and leak constants are stated there
//    and are illustrative). The ink shutter and reflector are drawn as described in reviews.
// 2. Firefly squid (Watasenia scintillans): about 800–1,000 small photophores on the underside, five
//    round each eye and three large ones at the tip of each of the fourth (lowest) pair of arms; its
//    luciferin is coelenterazine disulfate and the reaction also needs ATP, Mg²⁺ and oxygen; it
//    gathers in Toyama Bay, Japan, each spring to spawn (Wikipedia; Tsuji's papers via the Toyama
//    Prefectural Fisheries Research Institute; search summaries). Counts drawn here are fewer.
// 3. Humboldt squid (Dosidicus gigas): Burford & Robison 2020 (PNAS 117: 8524, "Bioluminescent
//    backlighting illuminates the complex visual signals of a social squid in the deep sea") filmed
//    30 squid at 266–848 m; hundreds of photophores in the muscle under the skin may backlight the
//    chromatophore patterns, which flicker red and white during feeding and social encounters. The
//    flicker rate on the slider is illustrative.
// Bacterial luciferase: reduced flavin (FMNH2) + a long-chain aldehyde + oxygen → blue-green light.
import { THREE, M, approach, clamp } from '../kit.js';
import { Squid, seaLight, silhouette, MOON, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, focuser, viewFixer, fitBoard, seaLook, snow, inReel } from '../squid.js';

const VIEWS = {
  bobtail: { pos: [1.6, 3.0, 9.7], target: [1.4, 3.3, 0], narrow: { pos: [0.0, 3.0, 10.1], target: [0.0, 3.4, 0] } },
  firefly: { pos: [1.4, 3.5, 7.6], target: [1.2, 2.9, 0], narrow: { pos: [-0.2, 3.3, 8.3], target: [-0.2, 2.8, 0] } },
  humboldt: { pos: [1.4, 3.5, 8.3], target: [1.2, 2.9, 0], narrow: { pos: [-0.2, 3.3, 9.2], target: [-0.2, 2.8, 0] } },
};
const lux = (E) => (E >= 0.01 ? E.toFixed(2) : E.toFixed(4)) + ' lux';
const shade = (E) => clamp((Math.log10(Math.max(1e-5, E)) + 4) / 3.6, 0, 1);   // eye-like log brightness

export default {
  id: 'light',
  short: 'Making light',
  title: 'Squid that make their own light',
  subtitle: 'A squid that farms glowing bacteria to erase its shadow, a squid covered in blue lights, and giants that flash in the dark.',
  view: VIEWS.bobtail,
  learn: `<p>At night in shallow Hawaiian water, the thumb-sized <b>Hawaiian bobtail squid</b> hunts above the sand. Moonlight falls from above, so a fish looking up would see the squid as a dark <b>shadow</b> against the bright surface. The squid erases it. In a <b>light organ</b> on its belly it farms glowing bacteria, <b>Vibrio fischeri</b>, and lets their light shine down, matched to the moonlight. This is <b>counter-illumination</b>.</p>
    <p>The organ is built like a lamp. A <b>reflector</b> behind the bacteria sends light downward, a <b>lens</b> spreads it, and an <b>ink shutter</b> can close round it like an eyelid, so the squid sets how much light leaks out. Experiments showed its glow rises and falls with the light from above. Each <b>dawn</b> the squid squirts about <b>90 to 95%</b> of its bacteria out into the sea, and the rest regrow during the day, ready for night.</p>
    <p>The <b>firefly squid</b> of Japan makes its own light. Its belly is speckled with hundreds of tiny blue <b>photophores</b>, and the tips of its lowest arms carry three big ones each. Every spring huge numbers gather in <b>Toyama Bay</b> to spawn, lighting up the water. Deep in the Pacific, the big <b>Humboldt squid</b> flicker red and white with their pigment sacs, and lights under the skin may <b>backlight</b> the patterns so other squid can read them in the dark.</p>
    <p>How does living light work? A molecule called a <b>luciferin</b> reacts with oxygen, helped by an enzyme, a <b>luciferase</b>, and the energy comes out as light instead of heat. Bacteria use one recipe; firefly squid use another, with a luciferin called coelenterazine. A jellyfish uses a protein, GFP, to turn its blue light green (<a href="/jellyfishclear/#history">JellyfishClear</a>).</p>
    <p class="tip"><b>Try it:</b> slide the moon from dark to full and watch the squid’s glow match it. Switch matching off and see the shadow appear in the fish’s view. Then press “Dawn”.</p>`,
  terms: [
    { t: 'Counter-illumination', d: 'Glowing on the underside to match the light from above, so no shadow shows from below.' },
    { t: 'Bioluminescence', d: 'Light made by a living thing through a chemical reaction.' },
    { t: 'Photophore', d: 'A light organ in the skin.' },
    { t: 'Symbiosis', d: 'Two different living things living closely together, often both gaining.' },
    { t: 'Luciferin', d: 'The molecule that gives off light when it reacts with oxygen.' },
    { t: 'Luciferase', d: 'The enzyme that speeds up the light-making reaction.' },
    { t: 'Lux', d: 'A unit of how much light falls on a surface. Full moonlight is a fraction of one lux.' },
  ],
  defaults: { focus: 'bobtail', moon: 0.12, depth: 3, match: true, organ: 0.2, flash: 2, glow: true },
  onChange(s, key) { if (key === 'moon' || key === 'depth' || key === 'match' || key === 'organ' || key === 'action') s.focus = 'bobtail'; if (key === 'flash') s.focus = 'humboldt'; if (key === 'glow') s.focus = 'firefly'; if (key === 'organ') s.match = false; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'bobtail', label: 'Bobtail squid' }, { v: 'firefly', label: 'Firefly squid' }, { v: 'humboldt', label: 'Humboldt squid' }] },
    { key: 'moon', type: 'log', label: 'Moonlight at the surface', min: 0.001, max: 0.3, fmt: (v) => lux(v), ends: ['no moon', 'full moon'] },
    { key: 'depth', type: 'range', label: 'Depth of the squid', min: 0.5, max: 20, step: 0.1, fmt: (v) => v.toFixed(1) + ' m' },
    { key: 'match', type: 'toggle', label: 'Squid matches the light' },
    { key: 'organ', type: 'range', label: 'Light organ by hand', min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'dawn', type: 'buttons', label: 'Bacteria', items: [{ label: 'Dawn: vent the bacteria', act: (s, inst) => inst.vent?.() }] },
    { key: 'glow', type: 'toggle', label: 'Firefly squid lights on' },
    { key: 'flash', type: 'range', label: 'Humboldt flicker (illustrative)', min: 0, max: 4, step: 0.1, fmt: (v) => v.toFixed(1) + ' per second' },
  ],
  quiz: [
    { q: 'Why does the bobtail squid glow on its belly at night?', options: ['To see the sand', 'To match the moonlight so a fish below sees no shadow', 'To warm up', 'To attract a mate only'], answer: 1, why: 'Counter-illumination: light from the belly fills in the shadow the squid would cast against the moonlit surface.' },
    { q: 'Where does the bobtail squid’s light come from?', options: ['Its own photophores', 'Glowing Vibrio fischeri bacteria living in its light organ', 'Reflected moonlight', 'Electric organs'], answer: 1, why: 'The squid farms the bacteria, and controls their light with a reflector, lens and ink shutter.' },
    { q: 'What does the bobtail squid do every dawn?', options: ['Grows new arms', 'Vents most of its bacteria into the sea, and the rest regrow by night', 'Changes into a fish', 'Buries its eggs'], answer: 1, why: 'About 90 to 95% are expelled at dawn; the remainder multiply during the day.' },
  ],
  reel: [
    { ms: 6000, caption: 'Seen from below, a bobtail squid would cast a shadow. Glowing bacteria on its belly erase it.', set: { focus: 'bobtail', match: true, depth: 3 }, anim: { moon: [0.002, 0.25, true] }, view: { pos: [0.6, 2.6, 8.4], target: [0.4, 3.6, 0] }, spin: 0.2 },
    { ms: 5000, caption: 'The firefly squid makes its own blue light, and lights up Japan’s Toyama Bay each spring.', set: { focus: 'firefly', glow: true }, anim: {}, view: { pos: [0.2, 3.2, 6.6], target: [0.0, 2.9, 0] }, spin: 0.35 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x050d18, 20, 50);
    const G = { bobtail: new THREE.Group(), firefly: new THREE.Group(), humboldt: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    const L = (h, p, parent, c = '') => stage.label(h, p, parent, c);
    const ms = snow(root, 120, [16, 9, 10], -0.5);
    // ---------------------------------------------------------------- bobtail
    const SQ = [0, 3.6, 0];
    const bob = new Squid('bobtail'); bob.group.scale.setScalar(1.35); bob.group.position.set(...SQ); bob.group.rotation.y = 0.35; G.bobtail.add(bob.group); bob.setXray(0.45); bob.axons.forEach((a) => (a.mesh.visible = false)); bob.inner.children.forEach((c) => { if (c.userData.kind === 'axon') c.visible = false; });
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), M.ghost(0x7fa8d8, 0.25)); surf.rotation.x = Math.PI / 2; surf.position.y = 7.2; G.bobtail.add(surf);
    const moonM = M.glow(0xf4f1dc, { transparent: true, opacity: 1, fog: false }); const moon = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), moonM); moon.position.set(2.6, 8.0, -3); G.bobtail.add(moon);
    const rays = []; for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.32, 6.5, 10, 1, true), M.ghost(0xbcd6ff, 0.1)); r.position.set(-3 + i * 1.2, 4.0, -0.6 + (i % 2) * 0.8); r.rotation.z = 0.12; G.bobtail.add(r); rays.push(r); }
    const sand = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), M.matte(0x2b2a24)); sand.rotation.x = -Math.PI / 2; sand.position.y = -0.4; G.bobtail.add(sand);
    // A fish below, looking up.
    const fish = new THREE.Group(); fish.position.set(1.6, 0.6, 1.2); G.bobtail.add(fish);
    const fb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), M.plastic(0x7d8a96)); fb.scale.set(1.6, 0.6, 0.45); fish.add(fb);
    const ft = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 4), M.plastic(0x6d7a86)); ft.rotation.z = Math.PI / 2; ft.position.x = 1.0; ft.scale.z = 0.3; fish.add(ft);
    const fe = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), M.plastic(0x101010)); fe.position.set(-0.5, 0.1, 0.2); fish.add(fe);
    fish.rotation.z = 0.5;
    const sight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 6), M.ghost(0xffb547, 0.5)); G.bobtail.add(sight);
    const bacteria = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 6, 4), M.glow(0x7fe8ff, { transparent: true, opacity: 0.8 }), 120); G.bobtail.add(bacteria);
    const bac = Array.from({ length: 120 }, (_, i) => ({ v: new THREE.Vector3((Math.random() - 0.5) * 0.6, -Math.random() * 0.3, (Math.random() - 0.5) * 0.6), p: new THREE.Vector3(0, -50, 0) }));
    const bl = { moon: L('Moonlight from above', [2.6, 7.3, -3], G.bobtail), organ: L('Light organ: bacteria, reflector, ink shutter', [SQ[0] - 2.6, SQ[1] - 1.0, 0.6], G.bobtail, 'hot'), fish: L('A fish looking up', [1.6, -0.1, 1.2], G.bobtail) };
    // ---------------------------------------------------------------- firefly
    const ff = new Squid('firefly', { xray: false }); ff.group.scale.setScalar(1.2); ff.group.position.set(-0.9, 3.0, 0); ff.group.rotation.set(0.75, 0.3, 0.05); G.firefly.add(ff.group);
    L('Hundreds of tiny photophores on the belly', [0.3, 1.9, 0.8], G.firefly); L('Three big lights at each lowest arm tip', [-2.9, 2.3, 0.8], G.firefly, 'hot');
    // ---------------------------------------------------------------- humboldt
    const hb = new Squid('humboldt', { xray: false }); hb.group.scale.setScalar(0.95); hb.group.position.set(-1.5, 3.0, 0); hb.group.rotation.set(0.4, 0.2, 0); G.humboldt.add(hb.group);
    L('Pigment sacs flicker red and white', [0.2, 4.0, 0.4], G.humboldt, 'hot'); L('Lights in the muscle may backlight the pattern', [0.0, 1.9, 0.6], G.humboldt);

    const st = { focus: 'bobtail', bg: 0, organ: 0, belly: 0, contrast: 0, bact: 1 };
    const chart = board(root, 4.4, 3.8, 740, 640, (g, w, h) => {
      panel(g, w, h);
      if (st.focus === 'bobtail') {
        head(g, 'What the fish sees looking up', 'Brightness on an eye-like (log) scale');
        const cx = 200, cy = 330, R = 170, sky = Math.round(255 * shade(st.bg)), bel = Math.round(255 * shade(st.belly));
        g.fillStyle = `rgb(${Math.round(sky * 0.75)},${Math.round(sky * 0.88)},${sky})`; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgb(${Math.round(bel * 0.75)},${Math.round(bel * 0.9)},${bel})`;
        g.beginPath(); g.ellipse(cx, cy + 10, 46, 62, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(cx - 58, cy + 16, 26, 14, -0.3, 0, Math.PI * 2); g.ellipse(cx + 58, cy + 16, 26, 14, 0.3, 0, Math.PI * 2); g.fill();
        for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(cx + k * 6, cy - 46); g.lineTo(cx + k * 14, cy - 110); g.lineWidth = 7; g.strokeStyle = g.fillStyle; g.stroke(); }
        g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        const x = 400; let y = 130;
        txt(g, 'Light from above, at the squid', x, y, COL.soft, '20px sans-serif'); txt(g, lux(st.bg), x, y + 26, COL.text, 'bold 25px sans-serif'); y += 72;
        txt(g, 'Light from the squid’s belly', x, y, COL.soft, '20px sans-serif'); txt(g, lux(st.belly), x, y + 26, COL.text, 'bold 25px sans-serif'); y += 72;
        txt(g, 'Contrast', x, y, COL.soft, '20px sans-serif');
        const c = st.contrast, ok = Math.abs(c) < 0.2;
        txt(g, (c >= 0 ? '+' : '') + Math.round(c * 100) + '%', x, y + 30, ok ? COL.up : COL.down, 'bold 34px sans-serif'); y += 66;
        wrap(g, ok ? 'Hidden: the belly matches the sky.' : c < 0 ? 'A dark shadow: easy to spot.' : 'Too bright: a glowing blob.', x, y, 310, 24, ok ? COL.up : COL.down, 'bold 21px sans-serif');
        txt(g, `Bacteria in the organ: ${Math.round(st.bact * 100)}% of a full night load`, 30, 560, COL.soft, '20px sans-serif');
        wrap(g, 'Model: moonlight dims with depth in clear water; the belly passes 5% of the light above plus the organ’s glow. Illustrative constants.', 30, 590, 680, 20, COL.soft, '16px sans-serif');
      } else if (st.focus === 'firefly') {
        head(g, 'Firefly squid, Watasenia scintillans', 'About 7 cm long, western Pacific');
        let y = 110;
        for (const [a, b] of [['Small photophores', 'about 800 to 1,000 on the underside'], ['Round each eye', '5 larger ones'], ['Lowest arm tips', '3 very large ones each, the brightest'], ['Its chemistry', 'a luciferin called coelenterazine (as a disulfate), with oxygen and ATP, the cell’s energy molecule'], ['Toyama Bay, Japan', 'each spring the squid come up to spawn and the bay glows blue']]) { txt(g, a, 30, y, COL.hot, 'bold 22px sans-serif'); y = wrap(g, b, 30, y + 30, 680, 27) + 12; }
        wrap(g, 'Many deep-sea squid glow on the belly too, which may also hide their shadow.', 30, y + 6, 680, 22, COL.soft, '18px sans-serif');
      } else {
        head(g, 'Humboldt squid, Dosidicus gigas', 'Up to about 1.5 m long, eastern Pacific');
        let y = 110;
        for (const [a, b] of [['Filmed', '30 squid, 266 to 848 m deep, by robot submarines (Burford and Robison 2020)'], ['Flicker', 'pigment sacs flash the body red and white, and other patterns, while hunting and meeting other squid'], ['Backlight', 'hundreds of photophores in the muscle under the skin may light the patterns from behind, so they show in the dark'], ['Meaning', 'possibly warnings or intentions, like a car’s turn signal; nobody has decoded them yet']]) { txt(g, a, 30, y, COL.hot, 'bold 22px sans-serif'); y = wrap(g, b, 30, y + 30, 680, 27) + 12; }
      }
    }, [5.2, 3.4, -1.0]);
    let drawn = '', t = 0, pt = 0, bact = 1, vent = -1, oNow = 0.2, shut = 0, flashPh = 0;
    const focus = focuser(stage, G, VIEWS);
    const fixView = viewFixer(stage, this.view);
    return {
      vent() { vent = 0; bac.forEach((b) => { b.p.set(SQ[0] - 0.3, SQ[1] - 0.4, 0); b.v.set(-0.8 - Math.random() * 1.2, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.8); }); },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        if (focus(s.focus)) drawn = '';
        st.focus = s.focus;
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.6, 7.6, -1.0] : [5.2, 3.4, -1.0], lay === 'tall' ? 0.7 : 1.3);
        ms.tick(dt);
        if (s.focus === 'bobtail') {
          // Dawn venting: bacteria drop to ~7%, then regrow (a day compressed into about 10 s).
          if (vent >= 0) { vent += dt; bact = vent < 1 ? approach(bact, 0.07, 6, dt) : Math.min(1, bact + dt * bact * 0.45 * (1 - bact) + dt * 0.004); if (bact > 0.985 && vent > 2) vent = -1; }
          const bg = seaLight(s.moon, s.depth), maxOrgan = 0.3 * bact;
          const want = s.match ? Math.max(0, bg * (1 - MOON.leak)) : s.organ * 0.3;
          oNow = approach(oNow, Math.min(maxOrgan, want), 3, dt);
          const sil = silhouette(bg, oNow);
          Object.assign(st, { bg, organ: oNow, belly: sil.belly, contrast: sil.contrast, bact });
          const k = clamp(shade(oNow) * 1.1, 0, 1);
          shut = approach(shut, oNow < 0.6 * maxOrgan ? 1 - oNow / Math.max(1e-6, maxOrgan) : 0, 4, dt);
          bob.setOrgan(k * (0.3 + 0.7 * bact), shut);
          moonM.opacity = 0.15 + 0.85 * shade(s.moon); rays.forEach((r) => (r.material.opacity = 0.03 + 0.14 * shade(bg)));
          pt += dt; if (pt > 1 / 24) { pt = 0; bob.paint({ mode: 'calm', open: 0.4, t }); }
          bob.animate(t, { swim: 0.8, fin: 1 });
          bob.group.position.y = SQ[1] + 0.08 * Math.sin(t * 0.9);
          const eye = new THREE.Vector3(1.2, 0.85, 1.4), tgt = new THREE.Vector3(SQ[0], SQ[1] - 0.6, 0);
          sight.position.copy(eye).add(tgt).multiplyScalar(0.5); sight.scale.y = eye.distanceTo(tgt); sight.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tgt.clone().sub(eye).normalize());
          const o = new THREE.Object3D();
          bac.forEach((b, i) => { if (vent >= 0 && vent < 4) b.p.addScaledVector(b.v, dt); else b.p.set(0, -50, 0); o.position.copy(b.p); o.scale.setScalar(vent >= 0 && vent < 4 ? 1 - vent / 4 : 0.001); o.updateMatrix(); bacteria.setMatrixAt(i, o.matrix); });
          bacteria.instanceMatrix.needsUpdate = true;
          bl.organ.visible = bl.fish.visible = lay !== 'narrow';
          const key = [st.bg.toExponential(2), st.belly.toExponential(2), Math.round(bact * 100)].join();
          if (key !== drawn) { drawn = key; chart.redraw(); }
        } else if (s.focus === 'firefly') {
          pt += dt; if (pt > 1 / 24) { pt = 0; ff.paint({ mode: 'calm', open: 0.45, t }); }
          const tw = 0.75 + 0.25 * Math.sin(t * 3);
          ff.setPhoto(s.glow ? tw : 0); ff.animate(t, { swim: 1, fin: 0.8 });
          ff.tips?.forEach((b, i) => b.scale.setScalar(0.8 + 0.5 * Math.max(0, Math.sin(t * 2 + i))));
          if (drawn !== 'ff') { drawn = 'ff'; chart.redraw(); }
        } else {
          flashPh += dt * s.flash * Math.PI * 2;
          const f = s.flash > 0.05 ? 0.5 + 0.5 * Math.sin(flashPh) : 0.4;
          pt += dt; if (pt > 1 / 30) { pt = 0; hb.paint({ mode: 'flash', flash: f, t }); }
          hb.setPhoto(0.35 + 0.25 * (1 - f)); hb.animate(t, { swim: 1, fin: 0.7 });
          if (drawn !== 'hb') { drawn = 'hb'; chart.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'bobtail') {
          const c = st.contrast, ok = Math.abs(c) < 0.2;
          return `<div class="big">${ok ? 'Shadow erased' : c < 0 ? 'Shadow showing' : 'Glowing too bright'}</div>
            <div class="row"><span>Moonlight at ${s.depth.toFixed(1)} m</span><b>${lux(st.bg)}</b></div>
            <div class="row"><span>Light organ adds</span><b>${lux(st.organ)}</b></div>
            <div class="row"><span>Contrast seen from below</span><b>${c >= 0 ? '+' : ''}${Math.round(c * 100)}%</b></div>
            <div class="row"><span>Bacteria load</span><b>${Math.round(st.bact * 100)}%</b></div>
            <small>Light-matching shown by Jones and Nishiguchi 2004. Light levels from a simple model with illustrative constants.</small>`;
        }
        if (s.focus === 'firefly') return `<div class="big">Firefly squid</div>
            <div class="row"><span>Photophores</span><b>about 800–1,000 small + big arm-tip ones</b></div>
            <div class="row"><span>Light</span><b>blue, made by the squid itself</b></div>
            <small>Counts from published descriptions of Watasenia scintillans; fewer are drawn here.</small>`;
        return `<div class="big">Humboldt squid</div>
            <div class="row"><span>Flicker shown</span><b>${s.flash.toFixed(1)} per second (illustrative)</b></div>
            <div class="row"><span>Filmed at</span><b>266–848 m deep</b></div>
            <small>Burford and Robison 2020, PNAS: backlit pigment patterns in the dark.</small>`;
      },
    };
  },
};
