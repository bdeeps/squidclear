// Chapter 5: squid and people. Three scenes:
//  - Light fishing: squid (and the small fish they eat) are drawn to lights at night, so fleets fish
//    with lamps. India: an order of 10 November 2017 from the Department of Animal Husbandry, Dairying
//    and Fisheries (Ministry of Agriculture and Farmers Welfare) bans bull trawling, pair trawling and
//    the use of artificial (including LED) lights by mechanised or motorised fishing craft in the
//    Exclusive Economic Zone beyond territorial waters (12 to 200 nautical miles); traditional
//    non-motorised craft are exempt (Rajya Sabha answer citing the 10.11.2017 order; Bombay High Court
//    petition text; news reports; read in search summaries). Inside 12 nautical miles coastal states
//    make the rules. Enforcement is reported to be patchy (Down To Earth).
//  - The catch: CMFRI estimated India's 2023 cephalopod landings at 2.13 lakh tonnes, 6.02% of the
//    total, the fourth-largest resource group (CMFRI annual data, search summary; the page itself
//    failed to load). An older CMFRI handbook gives squids about 48% of cephalopod landings and
//    cuttlefish 51%; CMFRI studies name the Indian squid Uroteuthis (Photololigo) duvaucelii as the
//    dominant squid, and trawls bring in 90–95% of Indian squid landings off Maharashtra (2018).
//    Exports (MPEDA, 2023–24): frozen squid was the 4th largest item, ₹3,061.46 crore (US$373.40
//    million), 5.25% of the 17,81,602 tonnes exported by quantity (press releases; search summary).
//    Purpleback flying squid (Sthenoteuthis oualaniensis) in the south-eastern Arabian Sea: mean
//    abundance 4.21 t/km² and a maximum sustainable yield estimated at 0.63 million tonnes for that
//    area (2018 CMFRI-linked study, abstract via search summary); older Soviet-era surveys put Arabian
//    Sea stocks at 0.9–1.6 million t. Still little fished in India.
//  - Care: the UK's Animal Welfare (Sentience) Act 2022 recognises cephalopods (and decapod
//    crustaceans) as sentient after the 2021 LSE review led by Jonathan Birch; the EU's lab-animal law
//    (Directive 2010/63/EU) covers cephalopods (both from memory; well documented).
import { THREE, M, approach, clamp } from '../kit.js';
import { Squid, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, focuser, viewFixer, fitBoard, seaLook, snow } from '../squid.js';

const VIEWS = {
  light: { pos: [1.4, 3.3, 9.3], target: [1.2, 2.6, 0], narrow: { pos: [0.0, 3.3, 10.0], target: [0.0, 2.6, 0] } },
  catch: { pos: [1.4, 3.5, 8.4], target: [1.2, 2.8, 0], narrow: { pos: [-0.2, 3.3, 9.2], target: [-0.2, 2.6, 0] } },
  care: { pos: [1.4, 3.5, 8.4], target: [1.2, 2.8, 0], narrow: { pos: [-0.2, 3.3, 9.2], target: [-0.2, 2.6, 0] } },
};

export default {
  id: 'people',
  short: 'Squid and people',
  title: 'Squid and people',
  subtitle: 'India’s squid catch, fishing with lights and the rules about it, a flying squid nobody fishes yet, and why squid matter in labs.',
  view: VIEWS.light,
  learn: `<p>Squid are big business. In <b>2023</b> India landed about <b>2.13 lakh tonnes</b> of cephalopods (squid, cuttlefish and octopus), about <b>6%</b> of all its sea catch, according to the <b>Central Marine Fisheries Research Institute</b> (CMFRI). Squid make up roughly half of that. The main one is the <b>Indian squid</b>, <i>Uroteuthis duvaucelii</i>, caught mostly by <b>trawl nets</b> along both coasts.</p>
    <p>Much of it is sold abroad. In 2023–24 <b>frozen squid</b> was India’s fourth-biggest seafood export, worth about <b>₹3,061 crore</b>, says the <b>Marine Products Export Development Authority</b> (MPEDA). Out in the open <b>Arabian Sea</b> swims another squid, the <b>purpleback flying squid</b>. One study estimated that more than half a million tonnes a year could be caught sustainably off India’s south-west coast and Lakshadweep, but it is hardly fished yet.</p>
    <p>Squid swim toward <b>light</b> at night, and so do the small fish they eat. Fleets in Asia hang rows of bright lamps over the side and catch squid with lines of hooks called <b>jigs</b>. Strong lights also pull in young fish of many kinds, so in <b>2017</b> India <b>banned artificial and LED lights</b> for mechanised and motorised boats in its <b>Exclusive Economic Zone</b>, from 12 to 200 nautical miles out. Closer to shore, coastal states make the rules.</p>
    <p>Squid matter in labs too. Their <b>giant axon</b> taught scientists how every nerve in your body fires (see the next chapter and <a href="/brainclear/#neurons">BrainClear</a>), and the bobtail squid is a favourite model for how animals and helpful bacteria live together. Scientists now count cephalopods as <b>sentient</b>, able to feel pain: the UK’s Animal Welfare (Sentience) Act of 2022 says so, and European lab rules protect them.</p>
    <p class="tip"><b>Try it:</b> turn up the boat’s lamps and watch the squid gather. Then move the boat out past 12 nautical miles.</p>`,
  terms: [
    { t: 'CMFRI', d: 'The Central Marine Fisheries Research Institute in Kochi, which estimates India’s sea fish catch.' },
    { t: 'MPEDA', d: 'The Marine Products Export Development Authority, which tracks India’s seafood exports.' },
    { t: 'Jigging', d: 'Fishing with lines of hooks moved up and down, often under bright lights for squid.' },
    { t: 'Exclusive Economic Zone', d: 'The sea from 12 to 200 nautical miles off a coast, where a country controls fishing.' },
    { t: 'Lakh', d: 'One hundred thousand. 2.13 lakh tonnes is 213,000 tonnes.' },
    { t: 'Sentient', d: 'Able to have feelings such as pain or pleasure.' },
  ],
  defaults: { focus: 'light', lamps: 0.6, zone: 'eez' },
  onChange(s, key) { if (key === 'lamps' || key === 'zone') s.focus = 'light'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'light', label: 'Fishing with lights' }, { v: 'catch', label: 'India’s squid catch' }, { v: 'care', label: 'Labs and welfare' }] },
    { key: 'lamps', type: 'range', label: 'Boat lamps', min: 0, max: 1, step: 0.01, fmt: (v) => (v < 0.02 ? 'off' : Math.round(v * 100) + '%') },
    { key: 'zone', type: 'seg', label: 'Where the boat is', options: [{ v: 'near', label: 'Within 12 nm' }, { v: 'eez', label: '12 to 200 nm (EEZ)' }] },
  ],
  quiz: [
    { q: 'Roughly how much cephalopod catch did India land in 2023, by CMFRI’s estimate?', options: ['About 2,000 tonnes', 'About 2.13 lakh tonnes', 'About 2 crore tonnes', 'None'], answer: 1, why: 'About 213,000 tonnes, around 6% of India’s marine catch; squid are roughly half.' },
    { q: 'What did India’s 2017 order ban in its Exclusive Economic Zone?', options: ['All fishing', 'Artificial and LED lights, and bull and pair trawling, for mechanised and motorised boats', 'Only fishing for octopus', 'Exporting squid'], answer: 1, why: 'The order targets lights and pair and bull trawling between 12 and 200 nautical miles; traditional non-motorised craft are exempt.' },
    { q: 'Which squid lives in the open Arabian Sea and is hardly fished in India?', options: ['The Hawaiian bobtail squid', 'The purpleback flying squid', 'The firefly squid', 'The giant squid'], answer: 1, why: 'Studies suggest a large stock of purpleback flying squid off India’s south-west coast.' },
  ],
  reel: [
    { ms: 5200, caption: 'Squid swim toward light, so fleets fish at night under rows of bright lamps.', set: { focus: 'light', zone: 'near' }, anim: { lamps: [0, 0.9] }, view: { pos: [0.4, 3.6, 9.0], target: [0.4, 2.8, 0] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x040b16, 22, 52);
    const G = { light: new THREE.Group(), catch: new THREE.Group(), care: new THREE.Group() };
    Object.values(G).forEach((g) => root.add(g));
    const L = (h, p, parent, c = '') => stage.label(h, p, parent, c);
    const ms = snow(root, 100, [16, 7, 10], -0.5);
    // ---------------------------------------------------------------- light fishing
    const SURF = 3.9;
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), M.ghost(0x2a4a6e, 0.35)); sea.rotation.x = -Math.PI / 2; sea.position.y = SURF; G.light.add(sea);
    const boat = new THREE.Group(); boat.position.set(-1.3, SURF, 0); G.light.add(boat);
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.55, 1.0), M.plastic(0x3d5a80)); hull.position.y = 0.05; boat.add(hull);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.7), M.plastic(0xe7e2d6)); cab.position.set(-0.6, 0.6, 0); boat.add(cab);
    const lampMat = M.glow(0xfff2c0, { transparent: true, opacity: 1 });
    const lamps = []; for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), lampMat); b.position.set(-1.3 + i * 0.37, 0.75, (i % 2 ? 0.55 : -0.55)); boat.add(b); lamps.push(b); }
    const pool = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.6, 40, 1, true), M.ghost(0xfff2c0, 0.12)); pool.position.set(-1.3, SURF - 1.8, 0); G.light.add(pool);
    const NS = 70, swarmG = new THREE.ConeGeometry(0.06, 0.36, 8); swarmG.rotateZ(Math.PI / 2);
    const sw = new THREE.InstancedMesh(swarmG, M.plastic(0xd9a89a, { roughness: 0.4 }), NS); G.light.add(sw);
    const S = Array.from({ length: NS }, (_, i) => ({ p: new THREE.Vector3(-1.3 + (Math.random() - 0.5) * 8, 0.2 + Math.random() * 2.8, (Math.random() - 0.5) * 7), ph: Math.random() * 6.28, home: new THREE.Vector3(-1.3 + (Math.random() - 0.5) * 8, 0.2 + Math.random() * 2.8, (Math.random() - 0.5) * 7) }));
    const ll = { boat: L('Lamps over the side', [0.6, SURF + 0.9, 0], G.light, 'hot'), rule: L('', [-1.3, SURF - 0.7, 1.2], G.light) };
    // ---------------------------------------------------------------- catch
    const ind = new Squid('loligo', { xray: false }); ind.group.scale.setScalar(0.9); ind.group.position.set(-1.0, 3.6, 0); ind.group.rotation.x = 0.4; G.catch.add(ind.group);
    const pur = new Squid('humboldt', { xray: false }); pur.K = { ...pur.K, base: [0.55, 0.36, 0.6] }; pur.headMat.color.setRGB(0.55, 0.36, 0.6); pur.group.scale.setScalar(0.8); pur.group.position.set(-1.0, 1.4, 0); pur.group.rotation.x = 0.4; G.catch.add(pur.group);
    L('Indian squid, <i>Uroteuthis duvaucelii</i>', [-1.0, 4.4, 0], G.catch, 'hot'); L('Purpleback flying squid', [-1.0, 0.45, 0], G.catch);
    // ---------------------------------------------------------------- care
    const lab = new Squid('loligo'); lab.group.scale.setScalar(1.0); lab.group.position.set(-0.8, 2.6, 0); lab.group.rotation.x = 0.4; G.care.add(lab.group); lab.setXray(0.6);
    L('Giant axon: a model for every nerve', [-0.2, 3.5, 0.4], G.care, 'hot');

    const st = { focus: 'light', zone: 'eez' };
    const chart = board(root, 4.4, 3.8, 740, 640, (g, w, h) => {
      panel(g, w, h);
      if (st.focus === 'catch') {
        head(g, 'India’s squid in numbers', 'CMFRI and MPEDA estimates');
        const rows = [['Cephalopod landings, 2023', '2.13 lakh tonnes', '6.02% of India’s marine catch; 4th largest group'], ['Squid share', 'about half', 'older CMFRI figure: squids 48%, cuttlefish 51%'], ['Main species', 'Indian squid', 'mostly caught by trawl nets'], ['Frozen squid exports, 2023–24', '₹3,061 crore', 'US$373 million; India’s 4th biggest seafood export'], ['Purpleback flying squid', 'little fished', 'one study: up to 0.63 million t a year could be taken off the south-west coast']];
        let y = 105;
        for (const [a, b, c] of rows) { txt(g, a, 30, y, COL.soft, '20px sans-serif'); txt(g, b, 30, y + 28, COL.hot, 'bold 26px sans-serif'); y = wrap(g, c, 30, y + 52, 680, 21, 'rgba(255,255,255,.7)', '18px sans-serif') + 14; }
      } else if (st.focus === 'care') {
        head(g, 'Squid in labs, and their welfare', '');
        let y = 100;
        for (const [a, b] of [['Nerves', 'The squid giant axon is thick enough to slide a wire inside. It showed how sodium and potassium make a nerve signal: Nobel Prize, 1963.'], ['Microbes', 'The bobtail squid and its glowing bacteria are a model for how animals and helpful microbes find and keep each other.'], ['Materials', 'Reflectin, the squid’s mirror protein, is being tested in camouflage films and even in human cells.'], ['Feelings', 'The UK’s Animal Welfare (Sentience) Act 2022 counts cephalopods as sentient, after a review of the evidence. EU lab rules protect them too.']]) { txt(g, a, 30, y, COL.hot, 'bold 22px sans-serif'); y = wrap(g, b, 30, y + 30, 680, 27) + 14; }
      } else {
        head(g, 'Fishing with lights: the rules in India', 'An order of 10 November 2017');
        let y = 110;
        const eez = st.zone === 'eez';
        txt(g, eez ? 'Here: 12 to 200 nautical miles (EEZ)' : 'Here: within 12 nautical miles', 30, y, COL.text, 'bold 23px sans-serif'); y += 36;
        y = wrap(g, eez ? 'Artificial and LED lights are banned for mechanised and motorised boats, along with bull and pair trawling. Traditional non-motorised craft are exempt.' : 'Territorial waters: each coastal state makes its own fishing rules under its marine fishing laws. Check the state’s fisheries department.', 30, y, 680, 25, eez ? COL.down : COL.cool, '22px sans-serif') + 16;
        y = wrap(g, 'Why the worry: strong lights pull in shoals of small and young fish as well as squid, and fishers with small boats say it empties the sea for them.', 30, y, 680, 27) + 14;
        wrap(g, 'Enforcement at sea is hard, and reports say the ban is often broken.', 30, y, 680, 22, COL.soft, '18px sans-serif');
      }
    }, [5.2, 3.2, -1.0]);
    let drawn = '', t = 0, lampK = 0.6, pt = 0;
    const focus = focuser(stage, G, VIEWS);
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        if (focus(s.focus)) drawn = '';
        st.focus = s.focus; st.zone = s.zone;
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.6, 8.2, -1.0] : [5.2, 3.2, -1.0], lay === 'tall' ? 0.7 : 1.3);
        ms.tick(dt);
        if (s.focus === 'light') {
          lampK = approach(lampK, s.lamps, 4, dt);
          lampMat.opacity = 0.15 + 0.85 * lampK; pool.material.opacity = 0.16 * lampK;
          const o = new THREE.Object3D(), c = new THREE.Vector3(-1.3, SURF - 1.3, 0);
          S.forEach((q, i) => {
            // Each squid is pulled toward a ring under the boat in proportion to the lamp power.
            const ring = new THREE.Vector3(c.x + Math.cos(q.ph) * (1.2 + (i % 5) * 0.25), c.y - (i % 7) * 0.22, c.z + Math.sin(q.ph) * (0.9 + (i % 4) * 0.2));
            const tgt = q.home.clone().lerp(ring, clamp(lampK * 1.15, 0, 1));
            q.ph += dt * 0.35 * (i % 2 ? 1 : -1);
            const prev = q.p.clone(); q.p.lerp(tgt, 1 - Math.exp(-1.2 * dt)); q.p.y += 0.04 * Math.sin(t * 2 + i);
            const v = q.p.clone().sub(prev);
            o.position.copy(q.p); o.rotation.set(0, Math.atan2(-v.z, -v.x) || 0, 0); o.scale.setScalar(1); o.updateMatrix(); sw.setMatrixAt(i, o.matrix);
          });
          sw.instanceMatrix.needsUpdate = true;
          boat.position.y = SURF + 0.04 * Math.sin(t * 1.2); boat.rotation.z = 0.02 * Math.sin(t * 0.9);
          const banned = s.zone === 'eez' && lampK > 0.05;
          ll.rule.element.innerHTML = banned ? '<b>Not allowed here</b> for mechanised boats' : s.zone === 'eez' ? 'Lamps off: allowed' : 'State rules apply';
          ll.rule.element.style.color = banned ? '#ff7a59' : '';
          const key = 'l' + s.zone; if (key !== drawn) { drawn = key; chart.redraw(); }
        } else if (s.focus === 'catch') {
          pt += dt; if (pt > 1 / 20) { pt = 0; ind.paint({ mode: 'wave', t, open: 0.5 }); pur.paint({ mode: 'calm', t, open: 0.6 }); }
          ind.animate(t); pur.animate(t + 1);
          if (drawn !== 'c') { drawn = 'c'; chart.redraw(); }
        } else {
          pt += dt; if (pt > 1 / 20) { pt = 0; lab.paint({ mode: 'calm', t, open: 0.4 }); }
          lab.animate(t);
          if (drawn !== 'w') { drawn = 'w'; chart.redraw(); }
        }
      },
      readout: (s) => {
        if (s.focus === 'catch') return `<div class="big">India’s squid</div>
          <div class="row"><span>Cephalopods landed, 2023</span><b>2.13 lakh t</b></div>
          <div class="row"><span>Frozen squid exports, 2023–24</span><b>₹3,061 crore</b></div>
          <div class="row"><span>Main species</span><b>Uroteuthis duvaucelii</b></div>
          <small>CMFRI landings estimate; MPEDA export figures.</small>`;
        if (s.focus === 'care') return `<div class="big">Squid in science</div>
          <div class="row"><span>Giant axon studies</span><b>Nobel Prize 1963</b></div>
          <div class="row"><span>UK law, 2022</span><b>cephalopods are sentient</b></div>
          <small>The Animal Welfare (Sentience) Act 2022 also covers crabs and lobsters.</small>`;
        const eez = s.zone === 'eez';
        return `<div class="big">${s.lamps < 0.02 ? 'Lamps off' : eez ? 'Lamps on in the EEZ: banned' : 'Lamps on near the coast'}</div>
          <div class="row"><span>Squid near the boat</span><b>${Math.round(clamp(lampK * 1.15, 0, 1) * 100)}% of the shoal</b></div>
          <div class="row"><span>EEZ rule since 2017</span><b>no artificial or LED lights</b></div>
          <div class="row"><span>Applies to</span><b>mechanised and motorised boats</b></div>
          <small>Attraction shown is illustrative. Rule: Government of India order, 10 November 2017.</small>`;
      },
    };
  },
};
