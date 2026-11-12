// Chapter 4: jet and ink. A longfin squid squeezes its mantle and fires water out of the funnel; for
// an escape, one impulse in the giant axons squeezes the whole mantle at once, the squid blanches,
// squirts an ink decoy and jets away tail first (the "blanch–ink–jet" sequence named by Hanlon &
// Messenger 1996, Cephalopod Behaviour; search summary). Numbers:
//  - Jet: jet() in squid.js (mantle tube R = 2.5 cm, length 18 cm, funnel 1.5 cm across, mass 150 g;
//    illustrative sizes for a squid with a ~20 cm mantle; u = ΔV/(A t), F = ρ A u²).
//  - Giant axons: axonSpeed() in squid.js (conduction ∝ √diameter, about 20 m/s at 0.5 mm). Fibre
//    lengths 4–18 cm with diameters 0.1–0.5 mm, thicker for the longer ones, after Pumphrey & Young
//    1938 ("the larger fibres run the greater distances"); the particular values are illustrative.
//  - Ink pseudomorphs: mucus-rich blobs of ink that hold a squid-like shape and draw attacks (reviews
//    of cephalopod ink; Wood et al. 2010 showed a reef squid's pseudomorph delays a predatory grunt).
//  - Flying squid: Muramatsu et al. 2013 (Marine Biology) photographed small ommastrephid squid off
//    Japan gliding about 30 m at up to about 11 m/s after jetting out of the water (Hokkaido
//    University press release; not checked against the paper).
import { THREE, M, approach, clamp, sphere } from '../kit.js';
import { Squid, jet, axonSpeed, JET, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, viewFixer, fitBoard, seaLook, snow } from '../squid.js';

const FIB = [0.04, 0.07, 0.1, 0.13, 0.16, 0.18].map((L, i) => ({ L, d: 0.1 + 0.4 * i / 5 }));
const SLOW = 200;   // nerve pulses are shown 200× slower

export default {
  id: 'jet',
  short: 'Jet and ink',
  title: 'Jet power, and a decoy made of ink',
  subtitle: 'Squeeze the mantle and water shoots out of the funnel. For a getaway, giant nerves fire, the squid goes pale, leaves an inky double and is gone.',
  view: { pos: [1.0, 3.0, 9.6], target: [0.8, 2.9, 0], narrow: { pos: [-0.6, 2.4, 8.2], target: [-0.6, 1.8, 0] } },
  learn: `<p>A fish swims by sending a wave down its body and tail (<a href="/fishswimclear/#wave">FishSwimClear</a>). A squid can flap its <b>fins</b> for slow cruising, but for speed it uses <b>jet propulsion</b>. It lets water into its mantle, closes the gap round its neck, and squeezes. The water rushes out of the <b>funnel</b>, and the squid shoots the other way. With the funnel aimed forward it goes backward, tail first; it can bend the funnel to steer.</p>
    <p>The push depends on how much water leaves and how fast. Squeeze more water out through the same small funnel in less time and the jet is faster, and the push grows with the <b>square</b> of the jet speed. Jets are costly, though: a squid uses more energy than a fish to travel the same distance. Some ocean squid jet right out of the water and <b>glide</b> on their fins: in 2013 Japanese scientists photographed small flying squid travelling about <b>30 metres</b> through the air.</p>
    <p>For an escape the whole mantle must squeeze <b>at once</b>. That is the job of the <b>giant axons</b>. A thick nerve fibre carries a signal faster than a thin one, and the fibres that run furthest down the mantle are the thickest, so the signals reach near and far muscles at nearly the same moment.</p>
    <p>Then comes a trick: the squid goes <b>pale</b>, squirts a blob of <b>ink</b> mixed with sticky mucus that holds its shape like a dark copy of the squid, a <b>pseudomorph</b> or “false body”, and jets away. The predator strikes the decoy. Some squid instead release a big cloud, like a smokescreen.</p>
    <p class="tip"><b>Try it:</b> squeeze harder or faster and watch the jet and the push. Then press “Escape!” and follow the signal along the giant axons.</p>`,
  terms: [
    { t: 'Jet propulsion', d: 'Moving by pushing a fast stream of water (or gas) out the back.' },
    { t: 'Thrust', d: 'The push a jet or propeller gives. For a jet it grows with the square of its speed.' },
    { t: 'Stellate ganglion', d: 'A star-shaped knot of nerve cells on each side of the mantle, where the giant axons start.' },
    { t: 'Conduction speed', d: 'How fast a nerve signal travels along a fibre. Thicker bare fibres conduct faster.' },
    { t: 'Pseudomorph', d: 'A “false body”: a blob of ink and mucus shaped roughly like the squid, left as a decoy.' },
    { t: 'Blanch–ink–jet', d: 'A squid’s escape: turn pale, release ink, jet away.' },
  ],
  defaults: { squeeze: 0.25, time: 0.3, aim: 0, cloud: false },
  controls: [
    { key: 'squeeze', type: 'range', label: 'How hard the mantle squeezes', min: 0.05, max: 0.35, step: 0.01, fmt: (v) => Math.round(v * 100) + '% narrower', hint: 'Mantle radius made smaller by this much.' },
    { key: 'time', type: 'range', label: 'Squeeze time', min: 0.1, max: 1, step: 0.01, fmt: (v) => v.toFixed(2) + ' s' },
    { key: 'aim', type: 'range', label: 'Funnel aim', min: -0.6, max: 0.6, step: 0.01, fmt: (v) => (v === 0 ? 'straight ahead' : Math.round(Math.abs(v) * 57) + '° ' + (v > 0 ? 'up' : 'down')) },
    { key: 'cloud', type: 'toggle', label: 'Ink as a big cloud instead of a decoy' },
    { key: 'go', type: 'buttons', label: 'Escape', items: [{ label: 'Escape! (blanch, ink, jet)', act: (s, inst) => inst.escape?.() }] },
  ],
  quiz: [
    { q: 'Which way does a squid go when its funnel points forward?', options: ['Forward', 'Backward, tail first', 'Straight up', 'It spins'], answer: 1, why: 'Water shoots forward out of the funnel, so the squid is pushed the opposite way.' },
    { q: 'Why are the giant axons that run furthest the thickest?', options: ['To store ink', 'Thicker fibres conduct faster, so signals reach near and far muscles at about the same time', 'To make the squid heavier', 'They carry blood'], answer: 1, why: 'Speed rises with fibre thickness, which makes up for the longer trip.' },
    { q: 'What is an ink pseudomorph?', options: ['A type of squid', 'A blob of ink and mucus shaped like the squid, left as a decoy', 'The ink sac', 'A sucker'], answer: 1, why: 'Predators attack the “false body” while the pale squid jets away.' },
  ],
  reel: [
    { ms: 5000, caption: 'Squeeze the mantle, and water shoots from the funnel: the squid jets away tail first.', set: { aim: 0, cloud: false, time: 0.3 }, anim: { squeeze: [0.08, 0.3] }, view: { pos: [0.2, 3.0, 8.6], target: [0.0, 2.6, 0] }, spin: 0 },
    { ms: 5800, caption: 'Escape: the giant nerves fire, the squid turns pale, leaves an inky double and is gone.', set: { squeeze: 0.28, time: 0.25, cloud: false }, act: (s, inst) => inst.escape?.(), anim: {}, view: { pos: [0.6, 3.0, 9.8], target: [0.6, 2.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x061424);
    const ms = snow(root, 140, [18, 8, 10], -0.5);
    const HOME = new THREE.Vector3(-0.8, 1.5, 0);
    const sq = new Squid('loligo'); sq.group.scale.setScalar(1.1); sq.group.position.copy(HOME); sq.group.rotation.x = 0.35; root.add(sq.group); sq.setXray(0.45);
    // Jet particles.
    const NP = 90, jp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 6, 4), M.plastic(0x9fdcff, { transparent: true, opacity: 0.85, emissive: 0x204060 }), NP); root.add(jp);
    const P = Array.from({ length: NP }, () => ({ p: new THREE.Vector3(0, -50, 0), v: new THREE.Vector3(), age: 9 }));
    let nextP = 0;
    // Nerve pulses: one bright bead per giant axon.
    const beads = sq.axons.map(() => { const b = sphere(0.06, M.glow(0xffffff), 10); sq.inner.add(b); b.visible = false; return b; });
    // Ink: a pseudomorph (dark squid-shaped blob) or a cloud.
    const inkMat = new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.9, transparent: true, opacity: 0 });
    const pseudo = new THREE.Group(); root.add(pseudo);
    const pb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), inkMat); pb.scale.set(2.4, 0.85, 0.85); pb.position.x = 0.5; pseudo.add(pb);
    const ph = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 14), inkMat); ph.position.x = -0.45; pseudo.add(ph);
    const cloud = new THREE.InstancedMesh(new THREE.SphereGeometry(0.35, 12, 8), inkMat, 40); root.add(cloud);
    const cl = Array.from({ length: 40 }, () => [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, 0.6 + Math.random()]);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const lb = { jet: L('Jet of water', [0, 0, 0], 'hot'), ink: L('Ink decoy', [0, 0, 0]), ax: L('Giant axons', [0, 0, 0], 'hot') };

    const cur = { esc: -1 };
    const chart = board(root, 4.4, 3.6, 740, 600, (g, w, h) => {
      panel(g, w, h); head(g, 'Giant axons: near and far, nearly together', 'Time for the signal to reach each part of the mantle');
      const x0 = 250, x1 = w - 40, T = (ms) => x0 + (x1 - x0) * Math.min(1, ms / 22);
      txt(g, '0', x0 - 4, 110, COL.soft, '17px sans-serif'); txt(g, '10 ms', T(10) - 20, 110, COL.soft, '17px sans-serif'); txt(g, '20 ms', T(20) - 20, 110, COL.soft, '17px sans-serif');
      let y = 140;
      FIB.forEach((f) => {
        const tg = f.L / axonSpeed(f.d) * 1000, tt = f.L / axonSpeed(0.1) * 1000;
        txt(g, `${Math.round(f.L * 100)} cm, ${f.d.toFixed(2)} mm`, 30, y + 14, COL.soft, '18px sans-serif');
        g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0, y, T(tt) - x0, 9);
        g.fillStyle = COL.gold; g.fillRect(x0, y + 11, T(tg) - x0, 9);
        y += 40;
      });
      txt(g, '■ graded fibres, as in squid', 30, y + 14, COL.gold, 'bold 18px sans-serif'); txt(g, '■ if every fibre were 0.1 mm thin', 330, y + 14, 'rgba(255,255,255,.55)', 'bold 18px sans-serif');
      wrap(g, 'Speed ∝ √(thickness), about 20 m/s at 0.5 mm. Fibre sizes illustrative, after Pumphrey and Young 1938.', 30, y + 50, 680, 20, COL.soft, '16px sans-serif');
      wrap(g, 'Fish wave their bodies instead: see FishSwimClear.', 30, y + 92, 680, 20, COL.cool, '17px sans-serif');
    }, [5.2, 3.0, -1.0]);

    let t = 0, pt = 0, sq_c = 0, esc = -1, vx = 0, blanch = 0, inkA = 0, cyc = 0;
    const tmp = new THREE.Vector3(), dir = new THREE.Vector3();
    const fixView = viewFixer(stage, this.view);
    return {
      escape() { esc = 0; vx = 0; sq.group.position.copy(HOME); pseudo.position.copy(HOME).add(new THREE.Vector3(-0.9, -0.25, 0)); pseudo.scale.setScalar(1); inkA = 0; },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.2, 5.2, -1.0] : [3.6, 4.9, -1.0], lay === 'tall' ? 0.7 : 1.05);
        ms.tick(dt);
        // Breathing jets: squeeze over s.time, refill over 0.8 s (shown at real speed).
        let squeeze = s.squeeze, period = s.time + 0.8;
        let jetting = false, k = 0;
        if (esc >= 0) {
          esc += dt;
          // 0–1.8 s: nerve pulses (shown 200× slowed); blanch; 1.8 s: ink; 1.9 s: big squeeze; drift back after 7.5 s.
          blanch = approach(blanch, esc < 7 ? 1 : 0, 6, dt);
          if (esc > 1.8 && esc < 2.4) { inkA = approach(inkA, 0.92, 8, dt); }
          if (esc > 1.9 && esc < 1.9 + s.time) { jetting = true; k = (esc - 1.9) / s.time; squeeze = Math.max(0.28, s.squeeze); }
          const j = jet(squeeze, s.time);
          if (jetting) vx += j.a * dt * 0.6; vx = approach(vx, 0, 1.2, dt);
          sq.group.position.x += vx * dt;
          if (esc > 7.5) { sq.group.position.lerp(HOME, 1 - Math.exp(-1.5 * dt)); inkA = approach(inkA, 0, 1, dt); }
          pseudo.scale.setScalar(1 + Math.max(0, esc - 2) * 0.08);
          if (esc > 11) esc = -1;
        } else {
          blanch = approach(blanch, 0, 4, dt); inkA = approach(inkA, 0, 2, dt);
          cyc = (cyc + dt) % period; jetting = cyc < s.time; k = cyc / s.time;
        }
        sq_c = approach(sq_c, jetting ? squeeze * Math.sin(Math.PI * Math.min(1, k) / 2 + 0.2) : 0, 14, dt);
        sq.setJet(sq_c, -s.aim);
        pt += dt; if (pt > 1 / 24) { pt = 0; sq.paint({ mode: esc >= 0 ? 'calm' : 'wave', t, open: 0.6, blanch }); }
        sq.animate(t, { swim: 0.7, fin: esc >= 0 ? 0.2 : 0.8 });
        // Jet particles from the funnel tip, forward (−X) and bent by the aim.
        const j = jet(squeeze, s.time), sp = clamp(j.u, 0.3, 12) * 0.6;
        if (jetting) for (let n = 0; n < 3; n++) {
          const q = P[nextP++ % NP]; sq.funnelWorld(q.p); dir.set(-1, 0, 0).applyQuaternion(sq.funnel.getWorldQuaternion(new THREE.Quaternion()));
          q.v.copy(dir).multiplyScalar(sp * (0.8 + Math.random() * 0.4)).add(new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3)); q.age = 0;
        }
        const o = new THREE.Object3D();
        P.forEach((q, i) => { q.age += dt; q.p.addScaledVector(q.v, dt); q.v.multiplyScalar(Math.exp(-2.5 * dt)); o.position.copy(q.p); o.scale.setScalar(q.age < 1.2 ? 1 - q.age / 1.4 : 0.001); o.updateMatrix(); jp.setMatrixAt(i, o.matrix); });
        jp.instanceMatrix.needsUpdate = true;
        // Nerve beads (shown 200× slower).
        sq.axons.forEach((a, i) => {
          const b = beads[i], f = FIB[i % 6], tt = f.L / axonSpeed(f.d) * SLOW;
          const u = esc >= 0 ? clamp(esc / tt, 0, 1) : -1;
          b.visible = u >= 0 && u < 1; if (b.visible) a.curve.getPointAt(u, b.position);
          a.mesh.material.opacity = esc >= 0 && esc < 2 ? 1 : 0.7;
        });
        // Ink.
        inkMat.opacity = inkA;
        pseudo.visible = !s.cloud && inkA > 0.02;
        cloud.visible = s.cloud && inkA > 0.02;
        if (cloud.visible) { cl.forEach((c, i) => { const g = 1 + Math.max(0, esc - 1.8) * 0.5; o.position.set(HOME.x - 0.3 + c[0] * g, HOME.y + c[1] * g, c[2] * g); o.scale.setScalar(c[3] * g); o.updateMatrix(); cloud.setMatrixAt(i, o.matrix); }); cloud.instanceMatrix.needsUpdate = true; }
        sq.funnelWorld(tmp); lb.jet.position.copy(tmp).add(new THREE.Vector3(-1.0, -0.35, 0)); lb.jet.visible = jetting || esc < 0;
        lb.ink.position.copy(HOME).add(new THREE.Vector3(0, -0.8, 0)); lb.ink.visible = inkA > 0.3; lb.ink.element.textContent = s.cloud ? 'Ink cloud: a smokescreen' : 'Ink decoy (pseudomorph)';
        lb.ax.position.copy(sq.group.position).add(new THREE.Vector3(1.4, 0.9, 0.3)); lb.ax.visible = esc >= 0 && esc < 2;
        cur.esc = esc;
      },
      readout: (s) => {
        const j = jet(s.squeeze, s.time), far = FIB[5], near = FIB[0];
        if (cur.esc >= 0 && cur.esc < 2.4) return `<div class="big">Escape: one signal, the whole mantle</div>
          <div class="row"><span>Thickest axon (${far.d} mm)</span><b>about ${axonSpeed(far.d).toFixed(0)} m/s</b></div>
          <div class="row"><span>Signal reaches the far mantle</span><b>${(far.L / axonSpeed(far.d) * 1000).toFixed(1)} ms</b></div>
          <div class="row"><span>…and the near mantle</span><b>${(near.L / axonSpeed(near.d) * 1000).toFixed(1)} ms</b></div>
          <div class="row"><span>Shown</span><b>${SLOW}× slower</b></div>
          <small>Conduction grows with the square root of fibre thickness. Calibrated to about 20 m/s at 0.5 mm.</small>`;
        return `<div class="big">Jet speed ${j.u.toFixed(1)} m/s</div>
          <div class="row"><span>Water pushed out</span><b>${Math.round(j.dV * 1e6)} mL of ${Math.round(j.V * 1e6)} mL</b></div>
          <div class="row"><span>Push (thrust) during the squeeze</span><b>${j.F.toFixed(1)} N</b></div>
          <div class="row"><span>u = ΔV ÷ (A × t)</span><b>${Math.round(j.dV * 1e6)} mL ÷ (${(JET.A * 1e4).toFixed(2)} cm² × ${s.time.toFixed(2)} s)</b></div>
          <div class="row"><span>Thrust = ρ A u²</span><b>grows with jet speed squared</b></div>
          <small>Illustrative squid with a 20 cm mantle and 1.5 cm funnel; average over the squeeze.</small>`;
      },
    };
  },
};
