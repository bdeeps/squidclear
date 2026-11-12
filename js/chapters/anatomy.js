// Chapter 1: meet a squid. A generic loliginid squid (the family of the Indian squid, Uroteuthis
// duvaucelii, and the North Atlantic longfin squid used in labs): torpedo mantle, fins, eight arms and
// two tentacles, the funnel, big eyes; X-ray shows the pen (gladius), ink sac, gills, the stellate
// ganglia and the giant axons fanning over the mantle; beside it a block of its skin cut open (see
// Squid and SkinSlab in squid.js).
// Numbers:
//  - Giant axon about 0.5 mm across: the figure caption of Hodgkin and Huxley's 1939 recording gives
//    a diameter of about 500 µm (search summary of the Physiological Society's history pages).
//  - The fibres that run furthest are the thickest: Pumphrey & Young 1938, J Exp Biol 15: 453 ("the
//    larger fibres run the greater distances"; search summary of the paper).
//  - Three hearts and copper-based blue blood (haemocyanin): textbook cephalopod anatomy.
import { THREE, M, approach, beam } from '../kit.js';
import { toast } from '../ui.js';
import { Squid, SkinSlab, LAYERS, ARM_INFO, layoutOf, reelZoom, viewFixer, seaLook, snow } from '../squid.js';

const CX = -1.9, CY = 2.1, SX = 2.1, SY = 5.5;
const MODES = { calm: 'calm', wave: 'wave', dark: 'dark', pale: 'pale' };

export default {
  id: 'anatomy',
  short: 'Meet a squid',
  title: 'Meet a squid',
  subtitle: 'A jet-powered tube with ten limbs, a giant nerve and skin that is part screen, part mirror, and sometimes a lamp.',
  view: { pos: [0.2, 4.6, 9.0], target: [0.2, 3.75, 0], narrow: { pos: [-1.5, 3.3, 8.0], target: [-1.5, 2.5, 0] } },
  learn: `<p>This is a generic <b>longfin squid</b>, the family that includes the <b>Indian squid</b> landed along India’s coasts. Its body is a muscular tube, the <b>mantle</b>, with <b>fins</b> at the back. At the front are big <b>eyes</b>, <b>eight arms</b> with suckers and <b>two long tentacles</b> that shoot out to grab prey.</p>
    <p>Under the head is the <b>funnel</b>. The squid fills its mantle with water and squeezes it out of the funnel in a <b>jet</b>. Inside, a thin <b>pen</b> stiffens the back: it is all that is left of a shell. An <b>ink sac</b> sits by the gut, and two <b>giant axons</b>, nerve fibres about half a millimetre thick, fan out over the mantle so one signal makes the whole tube squeeze at once.</p>
    <p>Now the skin. Near the top are <b>chromatophores</b>, elastic sacs of yellow, red and brown pigment pulled open by tiny muscles in a fraction of a second. <a href="/octopusclear/">OctopusClear</a> explains them in full. Below them sit the squid’s special trick: <b>iridophores</b>, stacks of thin protein plates that reflect colour like a soap film, and that the squid can <b>tune</b>. Some squid also carry <b>photophores</b>, organs that make light.</p>
    <p class="tip"><b>Try it:</b> turn on X-ray to see the giant axons and ink sac, set the skin to “waves”, and pull the skin layers apart. Tap a part to hear what it does.</p>`,
  terms: [
    { t: 'Mantle', d: 'The muscular tube of a squid’s body. Squeezing it drives the jet.' },
    { t: 'Funnel', d: 'The tube under the head (also called the siphon) that aims the jet of water.' },
    { t: 'Tentacles', d: 'The two long limbs with a sucker club at the tip that shoot out to catch prey.' },
    { t: 'Gladius', d: 'The pen: a thin, feather-shaped stiffener inside a squid’s back, left over from a shell.' },
    { t: 'Giant axon', d: 'A nerve fibre up to about half a millimetre thick that triggers the squid’s escape jet.' },
    { t: 'Chromatophore', d: 'A skin organ: an elastic pigment sac pulled open by muscles to show colour.' },
    { t: 'Iridophore', d: 'A skin cell with stacks of thin plates that reflect colour by interference.' },
    { t: 'Photophore', d: 'A light-making organ in the skin of some squid.' },
  ],
  defaults: { explode: 0.35, xray: 0, skin: 'calm' },
  controls: [
    { key: 'xray', type: 'range', label: 'X-ray', min: 0, max: 1, step: 0.01, ends: ['skin', 'insides'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'skin', type: 'seg', label: 'Skin', options: [{ v: 'calm', label: 'Calm' }, { v: 'wave', label: 'Waves' }, { v: 'dark', label: 'Dark' }, { v: 'pale', label: 'Pale' }] },
    { key: 'explode', type: 'range', label: 'Pull the skin layers apart', min: 0, max: 1, step: 0.01, ends: ['together', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'How many arms and tentacles does a squid have?', options: ['Eight arms, no tentacles', 'Eight arms and two tentacles', 'Ten arms and two tentacles', 'Six arms and four tentacles'], answer: 1, why: 'Eight arms hold food; two longer tentacles with clubs at the tips shoot out to catch it.' },
    { q: 'What is the pen (gladius) inside a squid?', options: ['A bone', 'A thin stiffener left over from a shell', 'An ink store', 'A gill'], answer: 1, why: 'Squid ancestors had shells. The pen is a thin leftover that stiffens the back.' },
    { q: 'What makes the whole mantle squeeze at once for an escape?', options: ['Hormones in the blood', 'Giant axons fanning out from the stellate ganglion', 'The tentacles', 'The ink sac'], answer: 1, why: 'Giant nerve fibres carry one fast signal to the mantle muscles, so the whole tube contracts together.' },
  ],
  reel: [
    { ms: 5200, caption: 'A squid is a muscle tube with fins, ten limbs and a funnel that fires a jet.', set: { explode: 0, xray: 0, skin: 'wave' }, anim: {}, view: { pos: [-1.0, 3.4, 7.0], target: [-1.3, 2.6, 0] }, spin: 0.25 },
    { ms: 4600, caption: 'Inside run two giant nerves, half a millimetre thick, that fire the escape jet.', set: { explode: 0, skin: 'calm' }, anim: { xray: [0, 0.9] }, view: { pos: [-1.0, 4.2, 6.6], target: [-1.3, 2.3, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage);
    const sq = new Squid('loligo'); sq.group.scale.setScalar(1.05); sq.group.position.set(CX + 0.4, CY, 0); sq.group.rotation.x = 0.45; root.add(sq.group);
    const slab = new SkinSlab({ W: 2.0, D: 1.3 }); slab.group.position.set(SX, SY, 0); slab.group.rotation.y = -0.35; root.add(slab.group);
    const ms = snow(root, 140, [18, 8, 10], -0.5);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.27, 40), M.glow(0x8ef0ff, { transparent: true, opacity: 0.8, side: THREE.DoubleSide })); ring.position.set(CX + 1.9, CY + 0.3, 0.38); root.add(ring);
    const lead = beam([CX + 2.05, CY + 0.5, 0.38], [SX - 0.6, SY - 1.9, 0.2], 0.012, M.glow(0x8ef0ff, { transparent: true, opacity: 0.5 })); root.add(lead);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const G = (h, p, c = '') => stage.label(h, p, sq.group, c);
    const tags = {
      mantle: G('Mantle', [1.4, 0.55, 0]), fin: G('Fins', [2.5, 0.5, 0.4]), arms: G('8 arms', [-1.25, 0.4, 0]),
      tent: G('2 tentacles', [-2.4, -0.3, 0.2]), funnel: G('Funnel', [-0.4, -0.5, 0.2], 'hot'), eye: G('Eye', [-0.28, 0.38, 0.3]),
      axon: G('Giant axons', [1.0, 0.55, 0.45], 'hot'), ink: G('Ink sac', [0.85, -0.48, 0.2]), pen: G('Pen', [2.0, 0.48, 0]),
      skin: L('Skin, cut open', [SX - 1.6, SY + 0.2, 0], 'hot'),
    };
    const ltags = LAYERS.map((ly) => L(ly.short, [0, 0, 0], ly.id === 'iri' ? 'hot' : ''));
    const pick = new Map();
    sq.meshes.forEach((m) => { stage.pickables.push(m); pick.set(m, m.userData.kind); });

    let t = 0, ex = 0, xr = 0, open = 0.5, pt = 0;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.25); fixView();
        ex = approach(ex, s.explode, 5, dt); slab.explode(ex);
        xr = approach(xr, s.xray, 6, dt); sq.setXray(xr);
        const want = s.skin === 'dark' ? 1 : s.skin === 'pale' ? 0.1 : 0.5;
        open = approach(open, want, 8, dt); slab.setOpen(s.skin === 'wave' ? 0.5 + 0.45 * Math.sin(t * 3) : open);
        slab.setIrid(0.35 + 0.15 * Math.sin(t * 0.3));
        pt += dt; if (pt > 1 / 30) { pt = 0; sq.paint({ mode: MODES[s.skin] || 'calm', t, open, irid: null }); }
        sq.animate(t, { swim: 1, fin: 0.6 });
        sq.group.position.y = CY + 0.06 * Math.sin(t * 0.8);
        ms.tick(dt);
        ring.lookAt(stage.camera.position);
        const narrow = layoutOf(stage) === 'narrow';
        slab.group.visible = ring.visible = lead.visible = tags.skin.visible = !narrow;
        LAYERS.forEach((ly, i) => { const lg = slab.layers[ly.id]; ltags[i].position.set(SX + 1.2, SY + lg.position.y, 0.6); ltags[i].visible = !narrow && ex > 0.15; });
        const inside = xr > 0.4;
        tags.axon.visible = tags.ink.visible = tags.pen.visible = inside;
        tags.mantle.visible = tags.fin.visible = !inside;
        tags.tent.visible = tags.eye.visible = !narrow;
      },
      readout: (s) => (s.xray > 0.4
        ? `<div class="big">Inside a squid</div>
          <div class="row"><span>Giant axons</span><b>about 0.5 mm thick</b></div>
          <div class="row"><span>Longest fibres</span><b>are the thickest</b></div>
          <div class="row"><span>Hearts</span><b>3: two for the gills, one for the body</b></div>
          <div class="row"><span>Blood</span><b>blue, with copper-based haemocyanin</b></div>
          <small>Axon size from Hodgkin and Huxley’s 1939 recording; fibre sizes after Pumphrey and Young 1938.</small>`
        : `<div class="big">A longfin squid</div>
          <div class="row"><span>Limbs</span><b>8 arms + 2 tentacles</b></div>
          <div class="row"><span>Moves by</span><b>fins, and a jet from the funnel</b></div>
          <div class="row"><span>Skin colour layers</span><b>pigment sacs over tunable mirrors</b></div>
          <div class="row"><span>Some squid also</span><b>make their own light</b></div>
          <small>A generic loliginid, the family of India’s main squid catch, Uroteuthis duvaucelii.</small>`),
      pick(o) { const k = pick.get(o); if (k && ARM_INFO[k]) toast(ARM_INFO[k]); },
    };
  },
};
