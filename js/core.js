// 공통 도구: 소리, 저장, 화면 전환, 라운드 진행
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  A.$ = $;
  A.el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  A.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  A.rand = (n) => Math.floor(Math.random() * n);
  A.img = (w, cls = '') => `<img class="pic ${cls}" src="images/${w.id}.webp" alt="${w.en}" draggable="false">`;

  /* ---------- 저장 (별) ---------- */
  const KEY = A.storageKey('stars');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
  A.getStars = (k) => saved[k] || 0;
  A.saveStars = (k, n) => {
    if (n <= (saved[k] || 0)) return;
    saved = { ...saved, [k]: n };
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* 저장 불가 기기는 무시 */ }
  };
  A.resetStars = () => {
    saved = {};
    try { localStorage.removeItem(KEY); } catch (e) { /* 저장 불가 기기는 무시 */ }
  };
  A.sumStars = (prefix) => Object.keys(saved).filter(k => k.startsWith(prefix)).reduce((s, k) => s + saved[k], 0);

  /* ---------- 소리: 기기 내장 음성(speechSynthesis) ---------- */
  let voice = null;
  const pickVoice = () => {
    if (!('speechSynthesis' in window)) return;
    // 폰 안에 내려받아 둔 음성만 쓴다 (이름만 있는 네트워크 음성은 소리가 안 날 수 있다)
    const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang) && v.localService !== false);
    voice = vs.find(v => /en-US/i.test(v.lang) && /(female|samantha|google us|zira|aria|jenny)/i.test(v.name))
      || vs.find(v => /en-US/i.test(v.lang)) || vs[0] || null;
  };
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  // 소리 재생은 이 함수 한 곳만 거친다 (나중에 mp3 파일로 바꾸기 쉽게)
  // text: 문장 하나, 또는 [{text, node}] 목록. 목록은 한 줄씩 차례로 읽으며, 읽는 동안 그 node에 'reading' 효과를 준다.
  // queue=true 이면 하던 말이 끝난 뒤에 이어서 말한다
  const RATE_WORD = 0.75;       // 단어 하나는 조금만 느리게
  const RATE_SENTENCE = 0.65;   // 문장(대사)은 더 천천히
  const NO_START_MS = 1200;     // 읽기 시작 신호가 이만큼 안 오면 글자 수로 어림해서 효과를 준다
  const MS_PER_CHAR = 95;
  const CANCEL_GAP_MS = 60;     // cancel 뒤 잠깐 쉬고 말한다
  const RETRY_MS = 1800;        // 이 시간 안에 안 읽기 시작하면 기본 음성으로 다시
  const rateOf = (text) => (/\s/.test(text.trim()) ? RATE_SENTENCE : RATE_WORD);
  let lit = null;               // 지금 효과를 받는 { node, id }
  let utterId = 0;
  const light = (node, id) => {
    lit?.node.classList.remove('reading');
    lit = node ? { node, id } : null;
    node?.classList.add('reading');
  };
  const unlight = (id) => { if (lit && lit.id === id) light(null); };
  A.speak = (input, queue = false) => {
    if (!('speechSynthesis' in window) || !input) return;
    const parts = (Array.isArray(input) ? input : [input]).map(p => (typeof p === 'string' ? { text: p } : p)).filter(p => p.text);
    if (!parts.length) return;
    try {
      let started = false;
      const ids = parts.map(() => ++utterId);
      const sayAll = (useVoice) => {
        parts.forEach((part, k) => {
          const u = new SpeechSynthesisUtterance(part.text);
          u.lang = 'en-US';
          u.rate = rateOf(part.text);
          u.pitch = 1.1;
          if (useVoice && voice) u.voice = voice;
          u.onstart = () => { started = true; if (part.node) light(part.node, ids[k]); };
          if (part.node) u.onend = u.onerror = () => unlight(ids[k]);
          speechSynthesis.speak(u);
        });
      };
      if (queue) sayAll(true);
      else {
        const busy = speechSynthesis.speaking || speechSynthesis.pending;
        speechSynthesis.cancel(); light(null);
        // 일부 안드로이드 기기는 cancel 바로 뒤의 speak를 무시한다
        if (busy) setTimeout(() => sayAll(true), CANCEL_GAP_MS); else sayAll(true);
      }
      // 지정한 음성이 소리를 못 내는 기기: 음성을 지정하지 않고 폰 기본 음성으로 한 번 더
      if (voice && !queue) {
        setTimeout(() => {
          if (started) return;
          speechSynthesis.cancel();
          sayAll(false);
        }, RETRY_MS);
      }
      // 기기에 따라 시작 신호가 안 올 때: 글자 수로 어림해서 차례로 효과를 준다
      if (parts.some(p => p.node)) {
        setTimeout(() => {
          if (started) return;
          let at = 0;
          parts.forEach((part, k) => {
            const ms = part.text.length * MS_PER_CHAR / rateOf(part.text) * 0.8;
            if (part.node) {
              setTimeout(() => light(part.node, ids[k]), at);
              setTimeout(() => unlight(ids[k]), at + ms);
            }
            at += ms;
          });
        }, NO_START_MS);
      }
    } catch (e) { /* 소리 실패해도 놀이는 계속 */ }
  };
  A.say = (w, queue = false) => A.speak(w.say, queue);
  // 문장 만들기: 단수는 "This is an apple.", 복수(w.plural)는 "These are jeans." 식으로 쓴다
  // 관사가 비어 있는 단어(w.art === '': 색깔, 셀 수 없는 말)는 관사 없이 "This is red." 로 쓴다
  // name 은 화면에 보일 이름(w.en) 또는 읽을 이름(w.say)
  const withArt = (w, name) => (w.art ? `${w.art} ${name}` : name);
  A.isLine = (w, name) => (w.plural ? `These are ${name}.` : `This is ${withArt(w, name)}.`);
  A.askLine = (w, name) => (w.plural ? `Are these ${name}?` : `Is it ${withArt(w, name)}?`);
  A.itLine = (w, name) => (w.plural ? `They are ${name}.` : `It's ${withArt(w, name)}.`);
  A.whatLine = (w) => (w.plural ? 'What are these?' : 'What is this?');

  /* ---------- 효과음: 파일 없이 브라우저가 직접 만든다 (WebAudio) ---------- */
  let audio = null;
  const tone = (freq, start, len, type = 'sine', vol = 0.18) => {
    if (!audio) return;
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq;
    const t0 = audio.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    o.connect(g).connect(audio.destination);
    o.start(t0); o.stop(t0 + len + 0.05);
  };
  A.sfx = (kind) => {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      if (kind === 'ok') { tone(784, 0, 0.18); tone(988, 0.1, 0.18); tone(1319, 0.2, 0.3); }   // 띠리링
      else if (kind === 'bad') { tone(330, 0, 0.16, 'triangle', 0.2); tone(262, 0.14, 0.26, 'triangle', 0.2); }   // 뿅
      else if (kind === 'flip') tone(660, 0, 0.08, 'triangle', 0.12);
    } catch (e) { /* 소리 못 내는 기기는 그냥 넘어간다 */ }
  };

  /* ---------- 영어 칭찬·격려 ---------- */
  const PRAISE = [['Great job!', '잘했어요!'], ['Awesome!', '멋져요!'], ['Well done!', '참 잘했어요!'], ['Yay!', '야호!'], ['Super!', '최고!']];
  const CHEER = [['Try again!', '다시 해봐요!'], ['You can do it!', '할 수 있어요!'], ['Almost!', '거의 다 왔어요!']];
  const pickOf = (list) => list[A.rand(list.length)];
  // 화면 가운데에 영어 말풍선(작은 한글 뜻 포함)을 잠깐 보여 준다
  const popText = (pair, cls) => {
    document.querySelectorAll('.praise').forEach(n => n.remove());
    const b = A.el('div', `praise ${cls}`, `<b>${pair[0]}</b><small>${pair[1]}</small>`);
    document.body.append(b);
    setTimeout(() => b.remove(), 1100);
  };
  A.cheer = (first, speak = true) => {
    const pair = pickOf(PRAISE);
    A.sfx('ok');
    popText(pair, first ? 'good star' : 'good');
    if (speak) A.speak(pair[0]);
  };
  A.oops = (speak = true) => {
    const pair = pickOf(CHEER);
    A.sfx('bad');
    popText(pair, 'try');
    if (speak) A.speak(pair[0]);
  };
  A.target = null;   // 스피커 버튼이 다시 들려줄 소리
  A.targetText = null;

  /* ---------- 가만히 있으면 스피커가 반짝 ---------- */
  let idleTimer = null;
  const IDLE_MS = 6000;
  A.pokeIdle = () => {
    const sp = $('#speaker');
    if (sp) sp.classList.remove('pulse');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      const s = $('#speaker');
      if (s && !s.hidden) s.classList.add('pulse');
    }, IDLE_MS);
  };
  document.addEventListener('pointerdown', () => A.pokeIdle(), true);

  /* ---------- 화면 ---------- */
  A.app = $('#app');

  /* ---------- 긴 영어 단어: 칸을 넘치면 그 칸만 글자를 줄인다 (짧은 단어는 그대로) ----------
     CSS 는 nowrap 으로 두 줄 꺾임을 막고, 여기서는 넘치는 칸만 글자 크기를 맞춘다. */
  const FIT_SELECTOR = '.chip span, .word-en, .btn.sentence';
  const FIT_MIN_PX = 6;      // 이보다 더 줄이지 않는다
  const FIT_MARGIN = 0.97;   // 딱 맞으면 반올림 때문에 다시 넘칠 수 있어서 3% 여유를 둔다
  const fitOne = (el) => {
    el.style.fontSize = '';  // 먼저 CSS가 정한 기본 크기로 되돌린다
    const cs = getComputedStyle(el);
    // 칩의 글자(span)는 글자 길이만큼만 차지하므로, 글자가 들어갈 폭은 칩(부모) 안쪽으로 잰다
    const box = el.matches('.chip span') ? el.parentElement : el;
    const boxCs = getComputedStyle(box);
    const inner = box.clientWidth - parseFloat(boxCs.paddingLeft) - parseFloat(boxCs.paddingRight);
    const range = document.createRange();
    range.selectNodeContents(el);
    const textW = range.getBoundingClientRect().width;
    if (!(inner > 0) || textW <= inner) return;
    el.style.fontSize = Math.max(FIT_MIN_PX, parseFloat(cs.fontSize) * inner / textW * FIT_MARGIN) + 'px';
  };
  const fitTree = (root) => {
    if (root.nodeType !== 1) return;
    if (root.matches(FIT_SELECTOR)) fitOne(root);
    root.querySelectorAll(FIT_SELECTOR).forEach(fitOne);
  };
  A.fitAll = () => fitTree(A.app);
  new MutationObserver(recs => recs.forEach(r => r.addedNodes.forEach(fitTree)))
    .observe(A.app, { childList: true, subtree: true });
  window.addEventListener('resize', A.fitAll);
  if (document.fonts) document.fonts.addEventListener('loadingdone', A.fitAll);   // 글꼴이 늦게 와도 다시 맞춘다

  A.show = (node) => {
    A.app.replaceChildren(node);
    A.pokeIdle();
    window.scrollTo(0, 0);
  };
  // 위쪽 바: 뒤로가기, 제목, 스피커
  A.topbar = (title, onBack, withSpeaker) => {
    const bar = A.el('div', 'topbar');
    const back = A.el('button', 'btn round', onBack ? '⬅' : '🏠');
    back.setAttribute('aria-label', '뒤로');
    back.onclick = () => { speechSynthesis.cancel?.(); (onBack || A.home)(); };
    const t = A.el('div', 'title', title);
    bar.append(back, t);
    if (withSpeaker) {
      const sp = A.el('button', 'btn round speaker', '🔊');
      sp.id = 'speaker';
      sp.setAttribute('aria-label', '소리 듣기');
      sp.onclick = () => {
        if (A.target) A.say(A.target); else if (A.targetText) A.speak(A.targetText);
      };
      bar.append(sp);
    } else {
      bar.append(A.el('div', 'spacer'));
    }
    return bar;
  };

  /* ---------- 칭찬 이펙트 ---------- */
  A.burst = (first) => {
    const b = A.el('div', 'burst', first ? '⭐' : '👍');
    document.body.append(b);
    setTimeout(() => b.remove(), 650);
  };
  const PRAISE_GAP_MS = 700;   // 칭찬 말이 끝나고 다음 단어 소리가 이어서 나온다
  A.shake = (node) => {
    node.classList.remove('shake');
    void node.offsetWidth;
    node.classList.add('shake');
  };

  // 소리가 완전히 멈출 때까지 기다렸다가 fn 실행 (소리가 멈춘 채로 두 번 연속 확인되면 통과, 너무 오래 걸리면 포기)
  const SPEECH_POLL_MS = 200, SPEECH_IDLE_POLLS = 2, SPEECH_WAIT_MAX_MS = 9000;
  const whenSpeechDone = (fn) => {
    if (!('speechSynthesis' in window)) { fn(); return; }
    const t0 = Date.now();
    let idle = 0;
    const tick = () => {
      idle = (speechSynthesis.speaking || speechSynthesis.pending) ? 0 : idle + 1;
      if (idle >= SPEECH_IDLE_POLLS || Date.now() - t0 > SPEECH_WAIT_MAX_MS) { fn(); return; }
      setTimeout(tick, SPEECH_POLL_MS);
    };
    tick();
  };

  /* ---------- 문제 돌리기 ----------
     renderQ(word, api): 문제 화면을 stage에 그린다.
     api.ok(): 정답 → 바로 다음 문제.  api.bad(): 오답 → 소리 다시, 벌점 없음. */
  A.rounds = (ctx, renderQ, textFn) => {
    const order = A.shuffle(ctx.words);
    let i = 0, stars = 0;
    let afterPraise = false;
    const next = () => {
      if (i >= order.length) return ctx.finish(stars, order.length);
      const queue = afterPraise;
      afterPraise = false;
      const w = order[i];
      A.target = textFn ? null : w;
      A.targetText = textFn ? textFn(w) : null;
      ctx.progress(i, order.length);
      ctx.stage.replaceChildren();
      let tried = false, locked = false;
      const api = {
        // waitSpeech: 말이 다 끝난 뒤에 다음 문제로 (묻고 답하기처럼 말이 긴 게임용)
        ok(delay = 550, waitSpeech = false) {
          if (locked) return;
          locked = true;
          if (!tried) stars++;
          A.burst(!tried);
          A.cheer(!tried);
          afterPraise = true;
          i++;
          setTimeout(() => (waitSpeech ? whenSpeechDone(next) : next()), Math.max(delay, PRAISE_GAP_MS));
        },
        bad(node) {
          tried = true;
          if (node) A.shake(node);
          A.oops();
          if (textFn) A.speak(textFn(w), true); else A.say(w, true);
        },
      };
      renderQ(w, api);
      if (textFn) A.targetText = textFn(w);   // 보기까지 정해진 뒤의 문장으로 다시 읽어 준다
      if (textFn) A.speak(textFn(w), queue); else A.say(w, queue);   // 문제가 나오면 소리가 바로 나온다
    };
    next();
  };

  // 정답 + 오답 후보 만들기 (같은 주제 안에서 뽑는다)
  A.choices = (w, ctx, n) => {
    let others = ctx.pool.filter(x => x.id !== w.id);
    if (others.length < n - 1) others = others.concat(A.allWords().filter(x => x.id !== w.id && !others.includes(x)));
    return A.shuffle([w, ...A.shuffle(others).slice(0, n - 1)]);
  };
  A.allWords = () => A.THEMES.flatMap(t => t.words);
  A.games = {};
})();
