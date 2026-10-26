/* Vantage Agent product page — the phone demo.
 *
 * Each feature in the two columns owns one scene: a timeline of what the
 * agent says, what the owner types and where the owner taps, in seconds from
 * the scene's start. The player schedules those events, builds the rows and
 * lets CSS do the motion (agent rows grow from their corner, the owner's rise,
 * the thread rides up as it fills). Scenes play in order and loop; clicking a
 * feature jumps to its scene. Everything is invented demo data. */
(function () {
  'use strict';

  const OWNER = 'Dana';
  const AGENT = 'Nova';
  // How long a bubble takes to "arrive" after the one before it — longer
  // text, longer pause, within bounds, so a run of bubbles reads naturally.
  const PACE = { base: 0.3, perChar: 0.0025, min: 0.35, max: 0.9, cardExtra: 0.45, dots: 0.95 };
  const HOLD = 3.4;   // seconds the finished scene stays before moving on

  const SCENES = {
    brief: {
      cover: { kind: 'lock', noticeAt: 0.4, pressAt: 2.0, date: 'Tuesday, March 10', time: '7:42',
        words: `Morning, ${OWNER}. 6 new leads overnight and 1 thing needs you.` },
      taps: [{ at: 2.0, on: 'notice' }],
      messages: [
        { from: 'agent', at: 2.6, label: { state: 'done', text: 'Morning brief' }, parts: [{ list: [
          '[[Leads]] 6 trial sign-ups overnight. 4 booked a class, and I texted the other 2.',
          '[[Meta ads]] The spring promo is at $11 a lead, down from $16.',
          '[[Reviews]] 2 new five-star Google reviews. Replies are drafted.',
          '[[needs|Budget]] The promo can take more spend. That needs your OK.',
        ] }] },
        { from: 'me', at: 6.4, typed: 1.0, text: 'Nice. Post the review replies.' },
        { from: 'agent', at: 8.3, typing: true, parts: ['Both are posted. I thanked Sam for the shout-out about the 6 a.m. class.'] },
      ],
    },
    build: {
      messages: [
        { from: 'me', at: 0.4, typed: 1.7, text: 'Make a landing page for the spring promo. First week free.' },
        { from: 'agent', at: 2.8, label: { state: 'working>done@7.6', text: 'Spring promo page' }, parts: [
          { card: 'steps', steps: [['Reading your website', 0], ['Pulling your class schedule', 1.1], ['Writing the page in your voice', 2.2], ['Publishing it', 3.4]], doneAt: 4.5 },
        ] },
        { from: 'agent', at: 7.6, parts: [
          'It’s live. I used your real class times and the coach photos from your site.',
          { card: 'artifact', thumb: 'page', title: 'Spring promo: first week free', sub: 'yourgym.com/spring · live' },
          'Want me to point the Meta ads at it?',
        ] },
        { from: 'me', at: 11.6, typed: 0.4, text: 'Yes.' },
        { from: 'agent', at: 12.8, typing: true, parts: ['Done. Both ad sets now send people to the new page.'] },
      ],
    },
    numbers: {
      messages: [
        { from: 'agent', at: 0.3, label: { state: 'done', text: 'Weekly report' }, parts: [
          'Spring promo, last 7 days:',
          { card: 'chart', title: 'Leads per day', big: '41 leads', sub: '$11.20 each · your target is $15', bars: [3, 4, 4, 6, 7, 8, 9], x: ['Mon', 'Sun'] },
          'Cost per lead dropped 30% after the new page went up.',
        ] },
        { from: 'me', at: 6.4, typed: 0.8, text: 'And Google Ads?' },
        { from: 'agent', at: 8.2, typing: true, parts: [
          '9 calls at $24 each. Meta is doing the heavy lifting.',
          'I’d move $10 a day from Google to Meta. Want me to?',
        ] },
      ],
    },
    approve: {
      taps: [{ at: 5.4, on: 'budget' }],
      messages: [
        { from: 'agent', at: 0.3, label: { state: 'needs>done@5.8', text: 'Meta ad budget' }, parts: [
          'The spring promo is beating your $15 target. I’d raise the budget so it reaches more people.',
          { card: 'approve', id: 'budget', big: '$60 a day', note: 'Waiting on you', sub: 'Meta · Spring promo',
            line: ['Daily budget', '$40 → $60'], go: 'Approve', no: 'Not now', badge: 'Approved', pressed: 5.4, done: 5.8 },
        ] },
        { from: 'agent', at: 7.0, typing: true, parts: ['Done. I’ll check it tomorrow and pull it back if leads cost more than $15.'] },
      ],
    },
    accounts: {
      taps: [{ at: 5.6, on: 'mailchimp' }],
      messages: [
        { from: 'me', at: 0.4, typed: 1.4, text: 'Can you send this month’s newsletter?' },
        { from: 'agent', at: 2.5, typing: true, parts: [
          'Yes, once Mailchimp is connected. You sign in with your own account, and I never see your password.',
          { card: 'connect', id: 'mailchimp', service: 'Mailchimp', logo: 'img/logos/mailchimp.svg', sub: 'Lists, campaigns and reports',
            go: 'Connect', badge: 'Connected', pressed: 5.6, done: 6.1 },
        ] },
        { from: 'agent', at: 7.4, typing: true, parts: ['Connected. Your list has 2,310 people. I’ll have a draft for you by noon.'] },
      ],
    },
    live: {
      messages: [
        { from: 'me', at: 0.4, typed: 1.4, text: 'Follow up with everyone who missed their trial class.' },
        { from: 'agent', at: 2.4, label: { state: 'working>done@6.9', text: 'Missed-class follow-up' }, parts: [
          { card: 'steps', steps: [['Checking yesterday’s class roster', 0], ['Found 5 no-shows', 1.0], ['Writing a text for each, in your voice', 2.0], ['Sending from your business number', 3.2]], doneAt: 4.3 },
        ] },
        { from: 'agent', at: 7.2, parts: ['All 5 texts are sent. 2 people have already rebooked for Thursday.'] },
      ],
    },
  };

  // ---------- tiny DOM helpers ----------
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /** "[[needs|Budget]] text" → tag chips + escaped text. */
  const rich = (s) => esc(s).replace(/\[\[(?:(needs)\|)?([^\]]+)\]\]/g, (_, needs, t) => `<span class="tag${needs ? ' needs' : ''}">${t}</span>`);
  const ICON = {
    check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>',
    spin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5"/></svg>',
    hand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v6M5.5 3.5V8M10.5 3.5V8M13 5.5v4a4.5 4.5 0 0 1-9 0V9l-1.5-2"/></svg>',
    chev: '<svg viewBox="0 0 8 14" width="8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l6 6-6 6"/></svg>',
  };

  // ---------- the phone ----------
  function buildPhone(root) {
    root.innerHTML = `
      <div class="ph-island"></div>
      <div class="ph-status"><span>9:41</span><span class="icons">
        <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7.3a6 6 0 0 1 8 0"/><circle cx="8" cy="10.2" r="1.2" fill="currentColor" stroke="none"/></svg>
        <svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2.5" y="2.5" width="17" height="7" rx="2"/><rect x="24.8" y="4" width="1.7" height="4" rx=".8" opacity=".4"/></svg>
      </span></div>
      <div class="ph-head">
        <svg class="back" viewBox="0 0 10 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 1.5L1.5 9l7 7.5"/></svg>
        <img class="av" src="img/app-icon-96.png" alt="">
        <div class="who"><b>${AGENT}</b><span><i class="dot"></i><em class="st">Online</em></span></div>
        <div class="more"><svg viewBox="0 0 16 4" fill="currentColor"><circle cx="2" cy="2" r="1.8"/><circle cx="8" cy="2" r="1.8"/><circle cx="14" cy="2" r="1.8"/></svg></div>
      </div>
      <div class="ph-viewport"><div class="ph-thread"></div></div>
      <div class="ph-composer">
        <svg class="plus" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 2v14M2 9h14"/></svg>
        <div class="field"><span class="ph-hint">Message ${AGENT}</span><span class="typed"></span><i class="caret"></i></div>
        <div class="act">
          <svg class="mic" viewBox="0 0 16 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="1.5" width="6" height="11" rx="3"/><path d="M2 10a6 6 0 0 0 12 0M8 16v2.5"/></svg>
          <svg class="send" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13.5V2.5M3 7.5l5-5 5 5"/></svg>
        </div>
      </div>
      <div class="ph-tabs">
        <div class="on"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h8A2.5 2.5 0 0 1 17 5.5v5a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 3v-3A2.5 2.5 0 0 1 4 10.5z"/><path d="M19 8v6.5A2.5 2.5 0 0 1 16.5 17H11l-1.5 1.3A2.5 2.5 0 0 0 11 19h5l3.5 2.5V19A2.5 2.5 0 0 0 22 16.5v-6A2.5 2.5 0 0 0 19 8z" opacity=".5"/></svg>Agents</div>
        <div><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>Library</div>
        <div><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4" height="9" rx="1.5"/><rect x="10" y="7" width="4" height="14" rx="1.5"/><rect x="17" y="3" width="4" height="18" rx="1.5"/></svg>Reports</div>
        <div><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm9 3.5l-2.1-.8a7 7 0 0 0-.7-1.7l.9-2-1.6-1.6-2 .9a7 7 0 0 0-1.7-.7L13 3h-2l-.8 2.1a7 7 0 0 0-1.7.7l-2-.9-1.6 1.6.9 2a7 7 0 0 0-.7 1.7L3 11v2l2.1.8c.2.6.4 1.2.7 1.7l-.9 2 1.6 1.6 2-.9c.5.3 1.1.5 1.7.7L11 21h2l.8-2.1c.6-.2 1.2-.4 1.7-.7l2 .9 1.6-1.6-.9-2c.3-.5.5-1.1.7-1.7L21 13z" opacity=".85"/></svg>Settings</div>
      </div>
      <div class="ph-home"></div>
      <div class="ph-lock"><div class="date"></div><div class="time"></div>
        <div class="notice"><img src="img/app-icon-96.png" alt=""><div style="flex:1"><div class="t"><b>${AGENT}</b><span>now</span></div><p></p></div></div>
      </div>
      <div class="ph-touch"></div>
      <div class="ph-note">It's a demo. Pick a feature to jump to it.</div>`;
    return {
      root,
      thread: root.querySelector('.ph-thread'),
      viewport: root.querySelector('.ph-viewport'),
      composer: root.querySelector('.ph-composer'),
      typed: root.querySelector('.typed'),
      lock: root.querySelector('.ph-lock'),
      notice: root.querySelector('.notice'),
      touch: root.querySelector('.ph-touch'),
      status: root.querySelector('.who .st'),
      dot: root.querySelector('.who .dot'),
      note: root.querySelector('.ph-note'),
    };
  }

  // ---------- the player ----------
  function Player(ui, { reduced }) {
    let timers = [];
    let targets = {};
    let labels = [];
    const at = (sec, fn) => { timers.push(setTimeout(fn, reduced ? 0 : sec * 1000)); };
    const stop = () => { timers.forEach(clearTimeout); timers = []; };

    function ride() {
      const room = ui.viewport.clientHeight;
      const need = ui.thread.scrollHeight;
      ui.thread.style.transform = `translateY(${Math.min(0, room - need)}px)`;
    }
    function add(el, me) {
      const row = h('div', `row${me ? ' me' : ''}${reduced ? '' : ' arrive'}`);
      row.appendChild(el);
      ui.thread.appendChild(row);
      ride();
      return row;
    }
    function setBusy(busy) {
      ui.status.textContent = busy ? 'Working…' : 'Online';
      ui.dot.classList.toggle('busy', busy);
    }
    function tap(el) {
      if (!el || reduced) return;
      const r = el.getBoundingClientRect();
      const p = ui.root.getBoundingClientRect();
      ui.touch.style.left = `${r.left - p.left + r.width / 2}px`;
      ui.touch.style.top = `${r.top - p.top + r.height / 2}px`;
      ui.touch.classList.remove('go'); void ui.touch.offsetWidth; ui.touch.classList.add('go');
    }

    function label(spec, t0) {
      const [first, later] = String(spec.state).split('>');
      const el = h('div', `label ${first}`);
      const paint = (state) => {
        el.className = `label ${state}`;
        el.innerHTML = `<span class="tile">${state === 'working' ? ICON.spin : state === 'needs' ? ICON.hand : ICON.check}</span>${esc(spec.text)}`;
      };
      paint(first);
      if (later) {
        const [state, when] = later.split('@');
        at(Number(when), () => paint(state));
      }
      return el;
    }

    function card(spec, t) {
      if (spec.card === 'artifact') {
        return h('div', 'card art', `<div class="thumb ${spec.thumb}"><i></i><i></i><i></i><i></i><i></i></div>
          <div><b>${esc(spec.title)}</b><span>${esc(spec.sub)}</span></div><span class="chev">${ICON.chev}</span>`);
      }
      if (spec.card === 'chart') {
        const max = Math.max(...spec.bars);
        const bars = spec.bars.map((b, i) => `<i style="height:${Math.round((b / max) * 100)}%;animation-delay:${(i * 0.06).toFixed(2)}s"></i>`).join('');
        return h('div', 'card', `<div class="k"><span class="note">${esc(spec.title)}</span></div>
          <div class="big">${esc(spec.big)}</div><div class="sub">${esc(spec.sub)}</div>
          <div class="chart">${bars}</div><div class="chart-x"><span>${spec.x[0]}</span><span>${spec.x[1]}</span></div>`);
      }
      if (spec.card === 'steps') {
        const el = h('div', 'card steps');
        spec.steps.forEach(([text, off], i) => {
          at(t + off, () => {
            const prev = el.lastElementChild;
            if (prev) prev.classList.add('ok');
            el.appendChild(h('div', 'st', `<i class="ring"></i><span>${esc(text)}</span>`));
            ride();
          });
        });
        at(t + spec.doneAt, () => { const last = el.lastElementChild; if (last) last.classList.add('ok'); });
        return el;
      }
      if (spec.card === 'approve') {
        const el = h('div', 'card', `<div class="k"><span class="big">${esc(spec.big)}</span><span class="note">${esc(spec.note)}</span><span class="done-badge">${esc(spec.badge)}</span></div>
          <div class="sub">${esc(spec.sub)}</div>
          <div class="line"><span>${esc(spec.line[0])}</span><b>${esc(spec.line[1])}</b></div>
          <div class="btns"><span class="go">${esc(spec.go)}</span><span class="no">${esc(spec.no)}</span></div>`);
        targets[spec.id] = () => el.querySelector('.go');
        at(spec.pressed, () => el.classList.add('pressed'));
        at(spec.done, () => { el.classList.add('done'); requestAnimationFrame(ride); });
        return el;
      }
      if (spec.card === 'connect') {
        const el = h('div', 'card conn', `<div class="k"><div class="who"><span class="lg"><img src="${spec.logo}" alt=""></span><div><b>${esc(spec.service)}</b><div class="sub">${esc(spec.sub)}</div></div></div><span class="done-badge">${esc(spec.badge)}</span></div>
          <div class="btns"><span class="go">${esc(spec.go)}</span></div>`);
        targets[spec.id] = () => el.querySelector('.go');
        at(spec.pressed, () => el.classList.add('pressed'));
        at(spec.done, () => { el.classList.add('done'); requestAnimationFrame(ride); });
        return el;
      }
      return h('div', 'card');
    }

    function bubble(part) {
      if (part && part.list) return h('div', 'bub', `<ul>${part.list.map((l) => `<li><span>${rich(l)}</span></li>`).join('')}</ul>`);
      return h('div', 'bub', rich(part));
    }

    function agentMessage(m) {
      let t = m.at;
      if (m.typing) {
        let dots;
        at(t, () => { setBusy(true); dots = add(h('div', 'typing', '<i></i><i></i><i></i>')); });
        t += PACE.dots;
        at(t, () => { if (dots) dots.remove(); });
      } else {
        at(t, () => setBusy(true));
      }
      if (m.label) {
        const when = t;
        at(when, () => add(label(m.label, when)));
      }
      m.parts.forEach((part, i) => {
        if (i > 0) {
          const prev = m.parts[i - 1];
          const len = typeof prev === 'string' ? prev.length : 60;
          t += Math.min(PACE.max, Math.max(PACE.min, PACE.base + PACE.perChar * len)) + (typeof prev === 'string' ? 0 : PACE.cardExtra);
        }
        const when = t;
        at(when, () => add(typeof part === 'string' || part.list ? bubble(part) : card(part, when)));
      });
      at(t + 0.4, () => setBusy(false));
      return t;
    }

    function ownerMessage(m) {
      const per = m.typed / Math.max(1, m.text.length);
      at(m.at, () => { ui.composer.classList.add('focused'); });
      for (let i = 1; i <= m.text.length; i += 1) {
        at(m.at + per * i, () => { ui.typed.textContent = m.text.slice(0, i); ui.composer.classList.add('has-words'); });
      }
      const sent = m.at + m.typed + 0.3;
      at(sent, () => {
        ui.typed.textContent = '';
        ui.composer.classList.remove('has-words', 'focused');
        add(h('div', 'bub', esc(m.text)), true);
      });
      return sent;
    }

    function cover(c) {
      ui.lock.querySelector('.date').textContent = c.date;
      ui.lock.querySelector('.time').textContent = c.time;
      ui.notice.querySelector('p').textContent = c.words;
      ui.lock.classList.add('in');
      ui.notice.classList.remove('in');
      targets.notice = () => ui.notice;
      at(c.noticeAt, () => ui.notice.classList.add('in'));
      at(c.pressAt + 0.15, () => ui.lock.classList.remove('in'));
    }

    /** Play one scene from the top; returns its length in seconds. */
    function play(scene) {
      stop();
      targets = {};
      ui.thread.innerHTML = '';
      ui.thread.style.transform = 'translateY(0)';
      ui.typed.textContent = '';
      ui.composer.classList.remove('has-words', 'focused');
      ui.lock.classList.remove('in');
      setBusy(false);
      let end = 0;
      if (scene.cover) { cover(scene.cover); end = scene.cover.pressAt; }
      for (const m of scene.messages) end = Math.max(end, m.from === 'me' ? ownerMessage(m) : agentMessage(m));
      for (const tp of scene.taps || []) at(tp.at, () => tap(targets[tp.on] && targets[tp.on]()));
      return end + HOLD;
    }

    return { play, stop };
  }

  // ---------- features ↔ scenes ----------
  function init() {
    const mock = document.querySelector('.ph');
    if (!mock) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ui = buildPhone(mock);
    const player = Player(ui, { reduced });
    const features = [...document.querySelectorAll('.feature[data-scene]')];
    let index = 0;
    let advance = null;
    let visible = false;

    function show(i) {
      index = (i + features.length) % features.length;
      clearTimeout(advance);
      const scene = SCENES[features[index].dataset.scene];
      const secs = player.play(scene);
      features.forEach((f, n) => {
        f.classList.toggle('is-active', n === index);
        f.setAttribute('aria-pressed', n === index ? 'true' : 'false');
        if (n === index) {
          f.style.setProperty('--dur', `${secs}s`);
          const bar = f.querySelector('.bar');
          bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
        }
      });
      if (!reduced) advance = setTimeout(() => show(index + 1), secs * 1000);
    }

    features.forEach((f, n) => f.addEventListener('click', () => show(n)));
    let noteTimer;
    mock.addEventListener('click', () => {
      mock.classList.remove('shake'); void mock.offsetWidth; mock.classList.add('shake');
      ui.note.classList.add('in');
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => ui.note.classList.remove('in'), 1800);
    });

    // Only play while the demo is on screen; start each visit from the scene
    // the visitor last saw, from its beginning.
    new IntersectionObserver((entries) => {
      const now = entries.some((e) => e.isIntersecting);
      if (now && !visible) show(index);
      if (!now && visible) { clearTimeout(advance); player.stop(); }
      visible = now;
    }, { threshold: 0.25 }).observe(mock);
    // Re-lay the thread only when the width really changes: phones fire
    // resize as the address bar collapses, and a restart then is a glitch.
    let lastWidth = window.innerWidth;
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        if (visible) show(index);
      }, 250);
    });
  }

  function reveal() {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', () => { init(); reveal(); });
})();
