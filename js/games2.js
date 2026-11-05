// 레벨 2 놀이: 오엑스, 복권 긁기
(function () {
  const { el, img } = A;

  A.games.ox = {
    name: '오엑스 (O X)', icon: '⭕', level: 2, desc: '들은 소리와 그림이 같으면 O',
    start(ctx) {
      A.rounds(ctx, (w, api) => {
        const same = Math.random() < 0.5;
        const shown = same ? w : A.choices(w, ctx, 2).find(x => x.id !== w.id);
        const card = el('div', 'oxpic', img(shown, 'hero') + `<div class="word-en">${shown.en}</div>`);
        const row = el('div', 'oxrow');
        const yes = el('button', 'btn ox o', 'O');
        const no = el('button', 'btn ox x', 'X');
        yes.onclick = () => (same ? api.ok() : api.bad(yes));
        no.onclick = () => (!same ? api.ok() : api.bad(no));
        row.append(yes, no);
        ctx.stage.append(card, row);
      });
    },
  };

  A.games.scratch = {
    name: '복권 긁기', icon: '🎟️', level: 2, desc: '손가락으로 긁고, 맞는 카드를 눌러요',
    start(ctx) {
      A.rounds(ctx, (w, api) => {
        const grid = el('div', 'choices n3 scratchgrid');
        A.choices(w, ctx, 3).forEach(c => {
          const box = el('div', 'scard', img(c) + `<span class="lbl">${c.en}</span>`);
          const cv = el('canvas');
          box.append(cv);
          grid.append(box);
          requestAnimationFrame(() => setupScratch(box, cv, c, w, api));
        });
        ctx.stage.append(grid, el('div', 'hint', '👆 손가락으로 쓱쓱 긁어 보세요!'));
      });
    },
  };

  function setupScratch(box, cv, c, w, api) {
    const W = (cv.width = box.clientWidth), H = (cv.height = box.clientHeight);
    const g = cv.getContext('2d', { willReadFrequently: true });
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#c9d1e0'); grad.addColorStop(0.5, '#eef1f8'); grad.addColorStop(1, '#aab4c8');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = '#7b87a1'; g.font = `bold ${Math.round(W * 0.5)}px sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', W / 2, H / 2);
    g.globalCompositeOperation = 'destination-out';
    let opened = false, down = false, wasOpened = false, sx = 0, sy = 0, moved = 0, strokes = 0;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const dot = (x, y) => { g.beginPath(); g.arc(x, y, Math.max(8, W * 0.06), 0, 7); g.fill(); };
    const revealedRatio = () => {
      const d = g.getImageData(0, 0, W, H).data;
      let clear = 0, total = 0;
      for (let p = 3; p < d.length; p += 64) { total++; if (d[p] < 40) clear++; }
      return clear / total;
    };
    cv.addEventListener('pointerdown', (e) => {
      down = true; wasOpened = opened; [sx, sy] = pos(e); moved = 0;
      cv.setPointerCapture(e.pointerId);
      dot(sx, sy);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!down || opened) return;
      const [x, y] = pos(e);
      moved += Math.hypot(x - sx, y - sy); sx = x; sy = y;
      dot(x, y);
      if (++strokes % 6 === 0 && revealedRatio() > 0.35) {
        opened = true;
        cv.classList.add('gone');
      }
    });
    cv.addEventListener('pointerup', () => {
      down = false;
      if (moved > 12) return;           // 긁은 것이면 선택으로 보지 않는다
      if (!wasOpened) {                  // 아직 안 열린 카드를 눌렀을 때
        A.shake(box);
        A.say(w);
        return;
      }
      if (c.id === w.id) api.ok(); else api.bad(box);
    });
  }
})();
