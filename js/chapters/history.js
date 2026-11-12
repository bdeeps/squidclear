// Chapter 6: how people worked squid out. Four scenes:
// 1. Aristotle, History of Animals book IV (Thompson's translation, via penelope.uchicago.edu, and
//    another on textbase.scriptorium.ro; search summaries): two kinds of squid, the small teuthis and
//    the much bigger teuthos (up to "five ells" or cubits); the ink sac lies beneath the mouth; all of
//    them squirt ink when alarmed, the cuttlefish most of all.
// 2. Nerves. J. Z. Young described the squid giant nerve fibres in 1936 at Plymouth (Proc R Soc B
//    121: 319; Physiological Society blog; J Exp Biol 2005 retrospective). Hodgkin & Huxley,
//    "Action potentials recorded from inside a nerve fibre", Nature 144: 710–711 (1939): a fine
//    electrode threaded inside the ~0.5 mm axon; inside about −45 mV at rest, about +40 mV at the peak
//    (values from Piccolino's review of the 1939 record; search summary). Their 1952 papers gave the
//    Hodgkin–Huxley model; Nobel Prize in Physiology or Medicine 1963 with John Eccles. The spike
//    drawn is a smooth illustrative shape between those two values, about 1 ms wide.
// 3. Glowing bacteria. Nealson, Platt & Hastings 1970 (J Bacteriol 104: 313) found that Vibrio
//    (Aliivibrio) fischeri only lights up once the culture is dense: "autoinduction", now called
//    quorum sensing. The switch on the slider (a steep Hill curve) is illustrative, not their data.
//    The bobtail squid–Vibrio partnership was taken up as a model by Margaret McFall-Ngai and Edward
//    Ruby from the late 1980s (from memory; see history.json for sources).
// 4. Reflectin and new materials. Crookes et al. 2004 (Science 303: 235) named the reflectins.
//    Xu et al. 2018 (Science 359: 1495, Gorodetsky lab, UC Irvine): adaptive infrared-reflecting
//    systems inspired by cephalopods. Chatterjee et al. 2020 (Nature Communications 11: 2708): human
//    cells made to express reflectin change how they scatter light when the salt around them changes.
//    The tile here re-uses the iridophore model (stack() in squid.js) with every layer swollen or
//    shrunk by the slider's factor: illustrative.
import { THREE, M, approach, clamp, sphere } from '../kit.js';
import { Squid, iridColour, achState, css, bandName, hueName, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, focuser, viewFixer, fitBoard, seaLook, N_PAIRS } from '../squid.js';

const VIEWS = {
  aristotle: { pos: [1.4, 3.5, 8.4], target: [1.2, 2.8, 0], narrow: { pos: [-0.2, 3.3, 9.2], target: [-0.2, 2.6, 0] } },
  axon: { pos: [1.4, 3.5, 7.6], target: [1.2, 2.6, 0], narrow: { pos: [0.0, 3.3, 8.1], target: [0.0, 2.5, 0] } },
  glow: { pos: [1.4, 3.5, 7.6], target: [1.2, 2.6, 0], narrow: { pos: [0.0, 3.3, 8.1], target: [0.0, 2.5, 0] } },
  materials: { pos: [1.4, 3.5, 7.6], target: [1.2, 2.6, 0], narrow: { pos: [0.0, 3.3, 8.1], target: [0.0, 2.5, 0] } },
};
const REST = -45, PEAK = 40;
const spike = (ms) => (ms < 0 ? REST : REST + (PEAK - REST) * Math.exp(-(((ms - 0.45) / 0.22) ** 2)) - 12 * Math.max(0, Math.min(1, (ms - 0.7) / 0.4)) * Math.exp(-Math.max(0, ms - 1.1) / 1.2));
const glowOf = (logN) => 1 / (1 + Math.exp(-(logN - 7.8) * 3));

export default {
  id: 'history',
  short: 'Working it out',
  title: 'How we worked out squid',
  subtitle: 'From Aristotle’s ink sacs to the nerve fibre that explained every nerve, the bacteria that “count”, and mirrors made from squid protein.',
  view: VIEWS.aristotle,
  learn: `<p>About <b>2,350 years ago</b> the Greek thinker <b>Aristotle</b> described two kinds of squid, a small one and a much bigger one, and the <b>ink sac</b> under the mouth that all of them empty when alarmed, the cuttlefish most of all.</p>
    <p>In <b>1936</b> the British zoologist <b>J. Z. Young</b>, working at Plymouth, noticed that the pale cords running over a squid’s mantle were not blood vessels but enormous single <b>nerve fibres</b>. In <b>1939</b> <b>Alan Hodgkin</b> and <b>Andrew Huxley</b> slid a fine electrode right inside one and recorded a nerve signal from the inside for the first time. The inside swung from about <b>−45</b> to about <b>+40 millivolts</b>: it did not just switch off, it flipped. By <b>1952</b> they had worked out how sodium rushing in and potassium flowing out make the spike, and in <b>1963</b> they shared a Nobel Prize. Every nerve in your body works this way (<a href="/brainclear/#neurons">BrainClear</a>).</p>
    <p>In <b>1970</b> <b>Kenneth Nealson</b>, <b>Terry Platt</b> and <b>Woody Hastings</b> noticed that the glowing bacterium <b>Vibrio fischeri</b> only lights up when there are lots of them: each cell leaks a signal, and when the signal is strong enough they all switch on. This “counting” is now called <b>quorum sensing</b>, and it was first understood in the bacteria that bobtail squid farm. Biologists such as <b>Margaret McFall-Ngai</b> and <b>Ned Ruby</b> then made the squid a model for how animals team up with microbes.</p>
    <p>In <b>2004</b> scientists named the squid’s mirror proteins <b>reflectins</b>. Since then, labs have made reflectin films that switch how they reflect heat for <b>infrared camouflage</b>, and in <b>2020</b> even made <b>human cells</b> produce reflectin and change how see-through they are.</p>
    <p class="tip"><b>Try it:</b> startle Aristotle’s squid, fire the giant axon, crowd the bacteria until they glow, and swell the squid-inspired film.</p>`,
  terms: [
    { t: 'Action potential', d: 'The brief electrical spike that travels along a nerve fibre.' },
    { t: 'Electrode', d: 'A fine wire or glass tube that picks up voltage.' },
    { t: 'Millivolt', d: 'A thousandth of a volt. Nerve signals swing by about a hundred millivolts.' },
    { t: 'Quorum sensing', d: 'Bacteria sensing how many of them there are by the strength of a shared chemical signal.' },
    { t: 'Model organism', d: 'An animal or plant that is easy to study and teaches lessons about many others.' },
    { t: 'Bio-inspired material', d: 'A material designed by copying a trick from nature.' },
  ],
  defaults: { focus: 'aristotle', logN: 6, swell: 1 },
  onChange(s, key) { if (key === 'logN') s.focus = 'glow'; if (key === 'swell') s.focus = 'materials'; if (key === 'action') { /* set by the button */ } },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'aristotle', label: 'Aristotle' }, { v: 'axon', label: 'Giant axon' }, { v: 'glow', label: 'Quorum sensing' }, { v: 'materials', label: 'Materials' }] },
    { key: 'acts', type: 'buttons', label: 'Do it', items: [{ label: 'Startle the squid', act: (s, inst) => { s.focus = 'aristotle'; inst.startle?.(); } }, { label: 'Fire the giant axon', act: (s, inst) => { s.focus = 'axon'; inst.fire?.(); } }] },
    { key: 'logN', type: 'range', label: 'How crowded the bacteria are', min: 5, max: 10, step: 0.01, fmt: (v) => '10^' + v.toFixed(1) + ' per mL (illustrative)' },
    { key: 'swell', type: 'range', label: 'Swell or shrink the reflectin film', min: 0.7, max: 1.3, step: 0.01, fmt: (v) => (v >= 1 ? '+' : '') + Math.round((v - 1) * 100) + '% thickness' },
  ],
  quiz: [
    { q: 'What did Hodgkin and Huxley do with the squid giant axon in 1939?', options: ['Cut it in half', 'Recorded a nerve signal from inside a nerve fibre for the first time', 'Made it glow', 'Counted its cells'], answer: 1, why: 'The axon was wide enough for an electrode inside it, which showed the inside flips from negative to positive during a spike.' },
    { q: 'What is quorum sensing?', options: ['Squid voting', 'Bacteria switching something on, like light, once there are enough of them', 'A kind of sonar', 'Ink detection'], answer: 1, why: 'Each cell leaks a signal; only a crowd makes it strong enough to switch the light on.' },
    { q: 'Who first described the squid ink sac?', options: ['J. Z. Young', 'Aristotle, about 2,350 years ago', 'Hodgkin', 'Nobody has'], answer: 1, why: 'Aristotle described the ink sac under the mouth and how squid and cuttlefish squirt ink when alarmed.' },
  ],
  reel: [
    { ms: 5400, caption: 'In 1939 scientists slid a wire inside a squid’s giant nerve and recorded a nerve signal from within.', set: { focus: 'axon' }, act: (s, inst) => inst.fire?.(), anim: {}, view: { pos: [-0.8, 3.4, 6.8], target: [-1.0, 2.4, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x07111c);
    const G = { aristotle: new THREE.Group(), axon: new THREE.Group(), glow: new THREE.Group(), materials: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    G.axon.position.x = -1.0; G.axon.scale.setScalar(0.8); G.glow.position.x = -0.9; G.materials.position.x = -0.9;
    const L = (h, p, parent, c = '') => stage.label(h, p, parent, c);
    // ---------------------------------------------------------------- Aristotle
    const sq = new Squid('loligo', { xray: false }); sq.group.position.set(-0.6, 2.6, 0); sq.group.rotation.x = 0.4; G.aristotle.add(sq.group);
    const inkMat = new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.9, transparent: true, opacity: 0 });
    const ink = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 12, 8), inkMat, 30); G.aristotle.add(ink);
    const puffs = Array.from({ length: 30 }, () => [Math.random() - 0.5, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, 0.5 + Math.random()]);
    L('Ink sac, under the mouth', [-0.4, 1.7, 0.5], G.aristotle, 'hot');
    // ---------------------------------------------------------------- giant axon
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 40, 1, true), M.clear(0xffe7a8, 0.35)); ax.rotation.z = Math.PI / 2; ax.position.set(0, 2.4, 0); G.axon.add(ax);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 6, 40), M.ghost(0xffd36a, 0.12)); core.rotation.z = Math.PI / 2; core.position.copy(ax.position); G.axon.add(core);
    const elec = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 12), M.glass({ thickness: 0.05 })); elec.rotation.z = Math.PI / 2; elec.position.set(0.9, 2.4, 0); G.axon.add(elec);
    const tip = sphere(0.06, M.glow(0x8ef0ff), 10); tip.position.set(-1.2, 2.4, 0); G.axon.add(tip);
    const wave = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 10, 40), M.glow(0xffffff, { transparent: true, opacity: 0.9 })); wave.rotation.y = Math.PI / 2; wave.position.set(-3, 2.4, 0); G.axon.add(wave);
    L('Giant axon, about 0.5 mm across (drawn huge)', [0, 3.3, 0], G.axon, 'hot'); L('Fine electrode slid inside', [1.6, 1.7, 0], G.axon);
    // ---------------------------------------------------------------- glowing bacteria
    const flask = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 24), M.clear(0xcfe8ff, 0.18)); flask.position.set(0, 2.3, 0); G.glow.add(flask);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.0, 24, 1, true), M.clear(0xcfe8ff, 0.18)); neck.position.set(0, 3.8, 0); G.glow.add(neck);
    const NB = 400, bacMat = M.glow(0x7fe8ff, { transparent: true, opacity: 1 });
    const bac = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.02, 0.05, 3, 6), bacMat, NB); G.glow.add(bac);
    const bp = Array.from({ length: NB }, () => { let v; do v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1); while (v.length() > 1); return v.multiplyScalar(1.05); });
    const glowLight = new THREE.PointLight(0x7fe8ff, 0, 8); glowLight.position.set(0, 2.3, 0); G.glow.add(glowLight);
    L('A flask of <i>Vibrio fischeri</i>', [0, 0.8, 0.6], G.glow, 'hot');
    // ---------------------------------------------------------------- materials
    const tile = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 2.0), M.plastic(0xffffff, { roughness: 0.15, metalness: 0.2 })); tile.position.set(0, 2.2, 0); tile.rotation.x = 0.5; G.materials.add(tile);
    L('A reflectin-style layered film', [0, 3.3, 0], G.materials, 'hot');

    const st = { focus: 'aristotle', trace: [], logN: 6, swell: 1 };
    const chart = board(root, 4.4, 3.8, 740, 640, (g, w, h) => {
      panel(g, w, h);
      if (st.focus === 'axon') {
        head(g, 'Voltage inside the giant axon', 'Hodgkin and Huxley, Plymouth, 1939');
        const x0 = 80, x1 = w - 30, y0 = 470, y1 = 110, V = (v) => y0 - (y0 - y1) * (v + 70) / 130, T = (ms) => x0 + (x1 - x0) * ms / 4;
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
        [-50, 0, 50].forEach((v) => { txt(g, v + ' mV', 14, V(v) + 6, COL.soft, '17px sans-serif'); g.strokeStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(x0, V(v)); g.lineTo(x1, V(v)); g.stroke(); });
        [0, 1, 2, 3, 4].forEach((m) => txt(g, m + ' ms', T(m) - 14, y0 + 26, COL.soft, '17px sans-serif'));
        g.strokeStyle = COL.gold; g.lineWidth = 4; g.beginPath(); st.trace.forEach(([m, v], i) => (i ? g.lineTo(T(m), V(v)) : g.moveTo(T(m), V(v)))); g.stroke();
        txt(g, 'Rest: about −45 mV', x0 + 10, V(REST) + 28, COL.soft, '18px sans-serif'); txt(g, 'Peak: about +40 mV', T(0.7), V(PEAK) - 10, COL.hot, 'bold 20px sans-serif');
        wrap(g, 'The inside flips positive: more than just switching off. Shape drawn smooth; the end values are from the 1939 record.', 30, 545, 680, 22, COL.soft, '17px sans-serif');
      } else if (st.focus === 'glow') {
        head(g, 'Light switches on in a crowd', 'Nealson, Platt and Hastings, 1970');
        const x0 = 80, x1 = w - 30, y0 = 440, y1 = 110, X = (n) => x0 + (x1 - x0) * (n - 5) / 5, Y = (v) => y0 - (y0 - y1) * v;
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
        g.strokeStyle = COL.cool; g.lineWidth = 4; g.beginPath(); for (let n = 5; n <= 10; n += 0.05) { const x = X(n), y = Y(glowOf(n)); n === 5 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
        g.fillStyle = COL.hot; g.beginPath(); g.arc(X(st.logN), Y(glowOf(st.logN)), 10, 0, Math.PI * 2); g.fill();
        txt(g, 'more crowded →', x1 - 160, y0 + 30, COL.soft, '18px sans-serif'); txt(g, 'light', 18, y1 + 10, COL.soft, '18px sans-serif');
        wrap(g, 'Each cell leaks a signal molecule. Few cells: it washes away. Many cells: it builds up and switches on the light genes. Curve illustrative.', 30, 520, 680, 22, COL.soft, '17px sans-serif');
      } else if (st.focus === 'materials') {
        head(g, 'Mirrors made from squid protein', '');
        const c = iridColour({ n1: 1.41, d1: 110 * st.swell, d2: 85 * st.swell, N: N_PAIRS });
        g.fillStyle = css(c.rgb); g.beginPath(); g.roundRect(30, 90, 200, 140, 14); g.fill();
        txt(g, `${Math.round(c.peak)} nm, ${bandName(c.peak)}`, 250, 150, COL.text, 'bold 25px sans-serif'); txt(g, 'Swollen = redder, shrunk = bluer', 250, 182, COL.soft, '18px sans-serif');
        let y = 280;
        for (const [a, b] of [['2004', 'Reflectins named in the squid’s reflective tissues (Crookes and colleagues).'], ['2018', 'Films inspired by cephalopod skin switch how they reflect heat, for infrared camouflage (Gorodetsky lab).'], ['2020', 'Human cells made to produce reflectin change how they scatter light when the salt around them changes.']]) { txt(g, a, 30, y, COL.hot, 'bold 22px sans-serif'); y = wrap(g, b, 100, y, 610, 27) + 12; }
      } else {
        head(g, 'Aristotle on squid, about 350 BCE', 'History of Animals, book IV');
        let y = 110;
        for (const [a, b] of [['Two kinds', 'a small squid and a much larger one, said to reach about five cubits'], ['Ink', 'a sac of dark juice lies under the mouth; when alarmed, all of these animals squirt it, the cuttlefish most of all'], ['Shape', 'he noted how the fins differ: in the big one they run round more of the body']]) { txt(g, a, 30, y, COL.hot, 'bold 22px sans-serif'); y = wrap(g, b, 30, y + 30, 680, 27) + 14; }
        wrap(g, 'Which modern species he meant is still debated.', 30, y + 4, 680, 22, COL.soft, '18px sans-serif');
      }
    }, [5.2, 3.2, -1.0]);
    let drawn = '', t = 0, pt = 0, ink0 = -1, fireT = -1, glowK = 0;
    const focus = focuser(stage, G, VIEWS);
    const fixView = viewFixer(stage, this.view);
    return {
      startle() { ink0 = 0; },
      fire() { fireT = 0; st.trace = []; },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        if (focus(s.focus)) drawn = '';
        st.focus = s.focus; st.logN = s.logN; st.swell = s.swell;
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.4, 7.4, -1.0] : [5.2, 3.2, -1.0], lay === 'tall' ? 0.7 : 1.3);
        if (s.focus === 'aristotle') {
          pt += dt; if (pt > 1 / 24) { pt = 0; sq.paint({ mode: ink0 >= 0 && ink0 < 3 ? 'pale' : 'wave', t, open: 0.5 }); }
          sq.animate(t);
          if (ink0 >= 0) { ink0 += dt; if (ink0 > 6) ink0 = -1; }
          inkMat.opacity = ink0 >= 0 ? clamp(Math.min(ink0 * 3, (6 - ink0) / 2), 0, 0.9) : 0;
          const o = new THREE.Object3D(), gk = 1 + Math.max(0, ink0) * 0.4;
          puffs.forEach((p, i) => { o.position.set(-1.0 + p[0] * gk * 1.5 - Math.max(0, ink0) * 0.3, 2.2 + p[1] * gk, p[2] * gk); o.scale.setScalar(p[3] * Math.min(1, ink0 >= 0 ? ink0 * 2 : 0.001)); o.updateMatrix(); ink.setMatrixAt(i, o.matrix); });
          ink.instanceMatrix.needsUpdate = true;
          if (drawn !== 'a') { drawn = 'a'; chart.redraw(); }
        } else if (s.focus === 'axon') {
          if (fireT >= 0) {
            fireT += dt;
            const ms = fireT * 1.2;   // shown about 800× slower than real
            st.trace.push([Math.min(4, ms), spike(ms - 0.3)]);
            wave.position.x = -3 + clamp(fireT / 3.3, 0, 1) * 6; wave.visible = fireT < 3.3;
            core.material.opacity = 0.12 + 0.5 * clamp((spike(ms - 0.3) - REST) / (PEAK - REST), 0, 1);
            if (ms > 4) fireT = -1;
            chart.redraw();
          } else { wave.visible = false; core.material.opacity = 0.12; if (drawn !== 'x') { drawn = 'x'; chart.redraw(); } }
        } else if (s.focus === 'glow') {
          glowK = approach(glowK, glowOf(s.logN), 4, dt);
          const n = Math.round(clamp((s.logN - 5) / 5, 0, 1) * (NB - 30)) + 30;
          bac.count = n;
          const o = new THREE.Object3D();
          for (let i = 0; i < n; i++) { const p = bp[i]; o.position.set(p.x + 0.02 * Math.sin(t * 3 + i), 2.3 + p.y, p.z); o.rotation.set(i, i * 2, 0); o.updateMatrix(); bac.setMatrixAt(i, o.matrix); }
          bac.instanceMatrix.needsUpdate = true;
          bacMat.color.setRGB(0.2 + 0.3 * glowK, 0.25 + 0.65 * glowK, 0.3 + 0.7 * glowK);
          glowLight.intensity = 6 * glowK; flask.material.color.setRGB(0.8 - 0.3 * glowK, 0.9, 1);
          const key = 'g' + s.logN.toFixed(2); if (key !== drawn) { drawn = key; chart.redraw(); }
        } else {
          const c = iridColour({ n1: 1.41, d1: 110 * s.swell, d2: 85 * s.swell, N: N_PAIRS });
          tile.material.color.setRGB(c.rgb[0], c.rgb[1], c.rgb[2], THREE.SRGBColorSpace);
          tile.material.emissive?.setRGB(c.rgb[0] * 0.25, c.rgb[1] * 0.25, c.rgb[2] * 0.25, THREE.SRGBColorSpace);
          tile.rotation.y = 0.3 * Math.sin(t * 0.5);
          const key = 'm' + s.swell.toFixed(2); if (key !== drawn) { drawn = key; chart.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'axon') return `<div class="big">Inside a nerve, 1939</div>
          <div class="row"><span>Resting voltage inside</span><b>about −45 mV</b></div>
          <div class="row"><span>At the peak of a spike</span><b>about +40 mV</b></div>
          <div class="row"><span>Nerve fibre first described</span><b>J. Z. Young, 1936</b></div>
          <div class="row"><span>Nobel Prize</span><b>1963, Hodgkin, Huxley and Eccles</b></div>
          <small>Spike shown about 800× slower than real.</small>`;
        if (s.focus === 'glow') return `<div class="big">${glowOf(s.logN) > 0.5 ? 'Enough bacteria: lights on' : 'Too few: lights off'}</div>
          <div class="row"><span>Crowding</span><b>10^${s.logN.toFixed(1)} per mL (illustrative)</b></div>
          <div class="row"><span>Discovered</span><b>1970, Nealson, Platt and Hastings</b></div>
          <small>Now called quorum sensing. The switch point drawn is illustrative.</small>`;
        if (s.focus === 'materials') { const c = iridColour({ n1: 1.41, d1: 110 * s.swell, d2: 85 * s.swell, N: N_PAIRS }); return `<div class="big">Film looks <span style="color:${css(c.rgb)}">${hueName(c.rgb)}</span></div>
          <div class="row"><span>Reflects</span><b>${Math.round(c.peak)} nm</b></div>
          <div class="row"><span>Layers</span><b>${N_PAIRS} plates, swollen ${Math.round((s.swell - 1) * 100)}%</b></div>
          <small>Illustrative film using the squid iridophore model from chapter 2.</small>`; }
        return `<div class="big">Aristotle, about 350 BCE</div>
          <div class="row"><span>Described</span><b>two kinds of squid, and their ink</b></div>
          <div class="row"><span>Book</span><b>History of Animals</b></div>
          <small>Translations differ on which kind is the bigger one.</small>`;
      },
    };
  },
};
