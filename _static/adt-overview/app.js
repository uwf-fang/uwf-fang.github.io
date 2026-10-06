const stage = document.getElementById('stage');
let mode = 'learn';
let current = 'list';
const implSel = {};
const store = { learn: {}, cmp: {} };
const totals = {}; // compare mode: key -> { total, last, hist: [{label, steps, ok}] }

const adtOf = (id) => ADTS.find((a) => a.id === id);
const implOf = (adt) => adt.impls.find((i) => i.id === (implSel[adt.id] || adt.impls[0].id));
const inst = (which, adt, impl) => { const k = adt.id + ':' + impl.id; return store[which][k] || (store[which][k] = impl.make()); };
const resetStore = (which, adt) => adt.impls.forEach((i) => { delete store[which][adt.id + ':' + i.id]; delete totals[which + adt.id + ':' + i.id]; });

document.getElementById('modes').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  mode = b.dataset.mode;
  document.querySelectorAll('#modes button').forEach((x) => x.classList.toggle('on', x === b));
  draw();
});
function draw() { ({ learn: drawLearn, compare: drawCompare, cheat: drawCheat, quiz: drawQuiz })[mode](); }

const tabsHTML = () => `<div class="tabs" id="tabs">${ADTS.map((a) => `<button data-id="${a.id}" class="${a.id === current ? 'on' : ''}">${a.name}</button>`).join('')}</div>`;
const SKIP = ['remove', 'get', 'pop', 'peek', 'dequeue', 'front', 'deQueueFront', 'deQueueBack', 'contains', 'isEmpty'];
function sampleOps(adt) { return adt.workload.ops.filter((o) => !SKIP.includes(o[0])); }

/* ---------- Mode 1: Learn (one implementation at a time) ---------- */
function drawLearn() {
  const adt = adtOf(current), impl = implOf(adt), w = inst('learn', adt, impl);
  const key = 'learn' + adt.id + ':' + impl.id;
  const t = totals[key] || { total: 0 };
  stage.innerHTML = `
    ${tabsHTML()}
    <div class="cols">
      <div>
        <h2>${adt.name} ADT</h2>
        <p class="tagline">${adt.tagline}</p>
        <div class="analogy">${adt.icon}<div><div class="lab2">Analogy</div><p>${adt.analogy}</p></div></div>
        <div class="chips" id="chips"><span class="chiplab">Implementation</span>${adt.impls.map((i) => `<button data-impl="${i.id}" class="${i.id === impl.id ? 'on' : ''}">${i.name}</button>`).join('')}</div>
        <div class="viz" id="viz">${w.render(null)}</div>
        <div class="controls">
          <label>${adt.fields.a}<input id="inA" autocomplete="off"></label>
          ${adt.fields.b ? `<label>${adt.fields.b}<input id="inB" autocomplete="off"></label>` : ''}
          <button class="btn plain" id="fill">Fill sample</button>
          <button class="btn plain" id="clear">Clear</button>
        </div>
        <div class="ops" id="ops">${adt.ops.map((o) => `<button data-op="${o.id}">${o.label}</button>`).join('')}</div>
        <div class="out" id="out">Pick an operation to see what it does and what it costs.</div>
        <div class="legend" id="tot">Total so far: ${t.total} steps. ${SEQ_NOTE}</div>
      </div>
      <div>
        <div class="box"><h3>How it is stored</h3><p class="how">${impl.how}</p></div>
        <div class="box"><h3>Cost of the operations</h3>
          <table class="facts"><thead><tr><th>Operation</th><th>Cost</th><th>Why</th></tr></thead><tbody>${impl.facts.map((f) => `<tr><td>${f[0]}</td><td><b>${f[1]}</b></td><td>${f[2]}</td></tr>`).join('')}</tbody></table>
        </div>
        ${adt.intNote ? `<div class="box note"><h3>Integers only</h3><p class="how">${adt.intNote}</p></div>` : ''}
        ${adt.insertNote ? `<div class="box note"><h3>Insertion Design</h3><p class="how">${adt.insertNote}</p></div>` : ''}
        ${impl.extra ? `<div class="box note"><h3>${impl.extra.title}</h3><p class="how">${impl.extra.html}</p></div>` : ''}
        <div class="box"><h3>What leaves or is found</h3><p class="how">${adt.rule}</p></div>
        <div class="box"><h3>Where it is used</h3><ul>${adt.use.map((u) => `<li>${u}</li>`).join('')}</ul></div>
        <div class="box"><h3>Try this</h3><ul>${adt.tryIt.map((u) => `<li>${u}</li>`).join('')}</ul></div>
      </div>
    </div>`;
  stage.querySelector('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) { current = b.dataset.id; drawLearn(); } };
  stage.querySelector('#chips').onclick = (e) => { const b = e.target.closest('button'); if (b) { implSel[adt.id] = b.dataset.impl; drawLearn(); } };
  stage.querySelector('#ops').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const op = adt.ops.find((o) => o.id === b.dataset.op);
    const a = stage.querySelector('#inA').value.trim();
    const bb = stage.querySelector('#inB') ? stage.querySelector('#inB').value.trim() : '';
    if (op.use.includes('a') && !a) return say(`Enter a ${adt.fields.a} first.`, false);
    const r = w.ops[op.id](a, bb);
    const tt = totals[key] || (totals[key] = { total: 0 });
    tt.total += r.steps;
    stage.querySelector('#viz').innerHTML = w.render(r.hl);
    say(`${r.msg}<div class="cost">Cost: <b>${r.steps}</b> step${r.steps === 1 ? '' : 's'}</div>`, r.ok);
    stage.querySelector('#tot').textContent = `Total so far: ${tt.total} steps. ${SEQ_NOTE}`;
  };
  stage.querySelector('#fill').onclick = () => {
    resetStore('learn', adt); const nw = inst('learn', adt, impl); totals[key] = { total: 0 };
    sampleOps(adt).forEach(([id, a, b]) => { const r = nw.ops[id](a || '', b || ''); totals[key].total += r.steps; });
    drawLearn();
  };
  stage.querySelector('#clear').onclick = () => { resetStore('learn', adt); drawLearn(); };
}
function say(html, ok) { const o = stage.querySelector('#out'); o.className = 'out' + (ok ? '' : ' bad'); o.innerHTML = html; }

/* ---------- Mode 2: Compare implementations ---------- */
function drawCompare() {
  const adt = adtOf(current);
  stage.innerHTML = `
    ${tabsHTML()}
    <h2>${adt.name}: same operations, different implementations</h2>
    <p class="tagline">Every implementation receives exactly the same operations. Compare the pictures and the step counts. ${SEQ_NOTE}</p>
    ${adt.intNote ? `<p class="how" style="margin-bottom:8px">${adt.intNote} Hash table: <b>hash(key) = key mod 7</b> (7 buckets).</p>` : ''}
    <div class="controls">
      <label>${adt.fields.a}<input id="inA" autocomplete="off"></label>
      ${adt.fields.b ? `<label>${adt.fields.b}<input id="inB" autocomplete="off"></label>` : ''}
      <div class="ops" id="ops" style="margin:0">${adt.ops.map((o) => `<button data-op="${o.id}">${o.label}</button>`).join('')}</div>
    </div>
    <div class="controls" style="margin-top:2px">
      <button class="btn" id="run">Run workload</button>
      <button class="btn plain" id="reset">Reset all</button>
      <span class="legend" style="margin:0">Workload: ${adt.workload.text}.</span>
    </div>
    <div class="panels" id="panels" style="grid-template-columns: repeat(${adt.impls.length}, minmax(0, 1fr))"></div>`;
  stage.querySelector('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) { current = b.dataset.id; drawCompare(); } };
  const apply = (id, a, b) => adt.impls.forEach((impl) => {
    const w = inst('cmp', adt, impl), key = 'cmp' + adt.id + ':' + impl.id, t = totals[key] || (totals[key] = { total: 0, last: 0, hist: [] });
    const r = w.ops[id](a, b);
    t.total += r.steps; t.last = r.steps; t.msg = r.msg; t.ok = r.ok; t.hl = r.hl;
    t.hist.push({ label: id + (a ? '(' + a + (b && !adt.ops.find((o) => o.id === id).use.startsWith('b') ? ',' + b : '') + ')' : ''), steps: r.steps, ok: r.ok });
  });
  stage.querySelector('#ops').onclick = (e) => {
    const bt = e.target.closest('button'); if (!bt) return;
    const op = adt.ops.find((o) => o.id === bt.dataset.op);
    const a = stage.querySelector('#inA').value.trim(), b = stage.querySelector('#inB') ? stage.querySelector('#inB').value.trim() : '';
    if (op.use.includes('a') && !a) return;
    apply(op.id, a, b); panels();
  };
  stage.querySelector('#run').onclick = () => { adt.workload.ops.forEach(([id, a, b]) => apply(id, a || '', b || '')); panels(); };
  stage.querySelector('#reset').onclick = () => { resetStore('cmp', adt); panels(); };
  panels();
  function panels() {
    const ts = adt.impls.map((i) => totals['cmp' + adt.id + ':' + i.id]);
    const maxS = Math.max(1, ...ts.map((t) => (t ? Math.max(0, ...t.hist.map((h) => h.steps)) : 0)));
    const maxT = Math.max(1, ...ts.map((t) => (t ? t.total : 0)));
    stage.querySelector('#panels').innerHTML = adt.impls.map((impl, k) => {
      const w = inst('cmp', adt, impl), t = ts[k] || { total: 0, last: 0, hist: [] };
      const best = ts.every((x) => x) && t.total === Math.min(...ts.map((x) => x.total)) && ts.some((x) => x.total !== t.total);
      return `<div class="panel"><h3>${impl.name}</h3>
        <div class="viz2">${w.render(t.hl === undefined ? null : t.hl)}</div>
        <div class="stat"><span>Last op <b>${t.last}</b></span><span>Total <b class="${best ? 'good' : ''}">${t.total}</b> steps</span></div>
        <div class="totbar"><i style="width:${(t.total / maxT) * 100}%"></i></div>
        <div class="pmsg ${t.ok === false ? 'bad' : ''}">${t.msg || 'No operation yet.'}</div>
        <div class="bars">${t.hist.map((h) => `<span class="bar${h.ok ? '' : ' err'}" title="${h.label}: ${h.steps} step(s)" style="height:${Math.max(3, (h.steps / maxS) * 44)}px"></span>`).join('')}</div>
        <div class="barcap">${t.hist.length ? 'Steps per operation (hover for details)' : ''}</div></div>`;
    }).join('');
  }
}

/* ---------- Mode 3: Cheat sheet ---------- */
function drawCheat() {
  stage.innerHTML = `
    <h2>Seven ADTs and their implementations</h2>
    <p class="tagline">An ADT defines what operations do. An implementation decides how fast they are.</p>
    <table class="facts big">
      <thead><tr><th>ADT</th><th>Who decides what leaves</th><th>Operations</th><th>Implementation</th><th>Cost</th></tr></thead>
      <tbody>${ADTS.map((a) => a.impls.map((im, i) => `<tr class="${i === 0 ? 'first' : ''}">
        ${i === 0 ? `<td rowspan="${a.impls.length}" class="adtc"><b>${a.name}</b></td><td rowspan="${a.impls.length}">${a.rule}</td><td rowspan="${a.impls.length}" class="opsc">${a.ops.map((o) => o.label).join('<br>')}</td>` : ''}
        <td><b>${im.name}</b></td><td>${im.facts.map((f) => `<span class="mono">${f[0]}</span>: ${f[1]}`).join('<br>')}</td></tr>`).join('')).join('')}</tbody>
    </table>`;
}

/* ---------- Mode 4: Quiz ---------- */
const adtOpts = ADTS.map((a) => [a.id, a.name]);
const QUIZ = [
  { q: 'A text editor must let you press undo repeatedly to reverse your most recent edits first.', opts: adtOpts, a: 'stack', why: 'The newest action must be undone first: last in, first out.' },
  { q: 'A print server must handle jobs in the order they were submitted.', opts: adtOpts, a: 'queue', why: 'Fairness by arrival time is first in, first out.' },
  { q: 'An emergency room must treat the most critical patient next, regardless of arrival time.', opts: adtOpts, a: 'pq', why: 'The exit order is decided by priority, not arrival.' },
  { q: 'A registrar needs to fetch a student record instantly from a student ID.', opts: adtOpts, a: 'map', why: 'Unique IDs are keys that lead to values (the records).' },
  { q: 'A website wants to count how many distinct visitors came today.', opts: adtOpts, a: 'set', why: 'Only membership matters and duplicates must collapse.' },
  { q: 'A music app lets users reorder tracks and jump to the 5th track directly.', opts: adtOpts, a: 'list', why: 'Elements are ordered and accessed by position.' },
  { q: 'An algorithm checks a palindrome by comparing the first and last letters, then moving inward, removing from both ends.', opts: adtOpts, a: 'deque', why: 'It needs enQueueFront, enQueueBack, deQueueFront and deQueueBack style access at both ends.' },
  { q: 'You implement a Queue with a fixed-size array and want dequeue to never shift elements.', opts: [['array', 'Partially filled array'], ['circular', 'Circular partially filled array'], ['linked', 'Linked list']], a: 'circular', why: 'A circular array only moves the front index, using modulo arithmetic.' },
  { q: 'A Map must support listing its keys in sorted order.', opts: [['hash', 'Hash table'], ['bst', 'Binary search tree']], a: 'bst', why: 'An in-order traversal of a search tree visits keys in sorted order. A hash table scatters them.' },
  { q: 'A Set needs the fastest average membership test and order does not matter.', opts: [['hash', 'Hash table'], ['bst', 'Binary search tree']], a: 'hash', why: 'A hash table averages Θ(1) for contains.' }
];
let qi = 0, score = 0, answered = false;
const userAnswers = []; // records { chosen, ok }

function drawQuiz() {
  if (qi >= QUIZ.length) {
    const listItems = QUIZ.map((item, idx) => {
      const u = userAnswers[idx] || { chosen: null, ok: false };
      const ansOpt = item.opts.find(([id]) => id === item.a);
      const ansText = ansOpt ? ansOpt[1] : item.a;
      const chosenOpt = item.opts.find(([id]) => id === u.chosen);
      const chosenText = chosenOpt ? chosenOpt[1] : (u.chosen || 'None');
      return `
        <div class="q-review-item ${u.ok ? 'ok' : 'err'}">
          <div class="q-review-head">
            <span class="q-review-num">Question ${idx + 1}</span>
            <span class="q-review-status ${u.ok ? 'ok' : 'err'}">${u.ok ? '✓ Correct' : '✗ Incorrect (your answer: ' + chosenText + ')'}</span>
          </div>
          <div class="q-review-q">${item.q}</div>
          <div class="q-review-ans">Correct answer: <b>${ansText}</b></div>
          <div class="q-review-why">${item.why}</div>
        </div>`;
    }).join('');

    stage.innerHTML = `
      <div class="q-card">
        <h2>Result: ${score} of ${QUIZ.length}</h2>
        <p class="tagline">${score === QUIZ.length ? 'Excellent! You answered every question correctly.' : 'Review each question and explanation below, then try again.'}</p>
        <button class="btn" id="again" style="margin-bottom:18px">Try again</button>
        <div class="q-review-list">
          <h3>Question Review</h3>
          ${listItems}
        </div>
      </div>`;
    stage.querySelector('#again').onclick = () => { qi = 0; score = 0; userAnswers.length = 0; drawQuiz(); };
    return;
  }
  const item = QUIZ[qi]; answered = false;
  const kind = item.opts === adtOpts ? 'Which ADT?' : 'Which implementation?';
  stage.innerHTML = `
    <div class="q-card">
      <div class="q-bar">${kind} &nbsp;|&nbsp; Question ${qi + 1} of ${QUIZ.length} &nbsp;|&nbsp; Score ${score}</div>
      <div class="q-scn">${item.q}</div>
      <div class="q-opts" id="opts">${item.opts.map(([id, n]) => `<button data-id="${id}">${n}</button>`).join('')}</div>
      <div class="q-why" id="why"></div>
      <button class="btn" id="next" style="display:none;margin-top:10px">Next</button>
    </div>`;
  stage.querySelector('#opts').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b || answered) return;
    answered = true;
    const right = b.dataset.id === item.a;
    if (right) score++;
    userAnswers[qi] = { chosen: b.dataset.id, ok: right };
    b.classList.add(right ? 'ok' : 'no');
    stage.querySelector(`[data-id="${item.a}"]`).classList.add('ok');
    stage.querySelector('#why').innerHTML = `<b style="color:${right ? 'var(--green)' : 'var(--red)'}">${right ? 'Correct.' : 'Not quite.'}</b> ${item.why}`;
    const n = stage.querySelector('#next'); n.style.display = 'inline-block';
    n.onclick = () => { qi++; drawQuiz(); };
  };
}

draw();
