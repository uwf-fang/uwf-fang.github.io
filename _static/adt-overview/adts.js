// ADT definitions. Each ADT lists its operations (course naming) and its implementations.
// An implementation's make() returns { ops, render(hl), size() }; every op returns { msg, steps, hl, ok }.
const svg = (inner) => `<svg viewBox="0 0 64 64" fill="none" stroke="#2b2f33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const ICONS = {
  list: svg('<rect x="10" y="12" width="44" height="10"/><rect x="10" y="27" width="44" height="10"/><rect x="10" y="42" width="44" height="10"/><path d="M16 17h8M16 32h8M16 47h8" stroke="#1f3a8a"/>'),
  stack: svg('<ellipse cx="32" cy="46" rx="20" ry="5"/><ellipse cx="32" cy="36" rx="20" ry="5"/><ellipse cx="32" cy="26" rx="20" ry="5"/><path d="M32 6v10M28 12l4 4 4-4" stroke="#1e6b3a"/>'),
  queue: svg('<circle cx="14" cy="26" r="5"/><path d="M8 44c0-8 12-8 12 0"/><circle cx="32" cy="26" r="5"/><path d="M26 44c0-8 12-8 12 0"/><circle cx="50" cy="26" r="5"/><path d="M44 44c0-8 12-8 12 0"/><path d="M6 54h52M52 58l6-4-6-4" stroke="#1f3a8a"/>'),
  deque: svg('<rect x="14" y="24" width="36" height="16"/><path d="M24 24v16M32 24v16M40 24v16"/><path d="M4 32h8M8 28l-4 4 4 4M60 32h-8M56 28l4 4-4 4" stroke="#1f3a8a"/>'),
  map: svg('<rect x="8" y="14" width="18" height="12"/><rect x="38" y="14" width="18" height="12"/><rect x="8" y="38" width="18" height="12"/><rect x="38" y="38" width="18" height="12"/><path d="M26 20h12M26 44h12" stroke="#1f3a8a"/>'),
  set: svg('<circle cx="32" cy="32" r="22"/><circle cx="24" cy="26" r="3"/><circle cx="40" cy="28" r="3"/><circle cx="30" cy="42" r="3"/><circle cx="42" cy="42" r="3" stroke="#9b1c1c"/><path d="M39 39l6 6" stroke="#9b1c1c"/>'),
  pq: svg('<path d="M10 52h44"/><rect x="14" y="36" width="8" height="16"/><rect x="28" y="24" width="8" height="28"/><rect x="42" y="12" width="8" height="40" stroke="#1e6b3a"/><path d="M46 6l3 4 3-4" stroke="#1e6b3a"/>')
};

const R = (msg, steps, hl, ok = true) => ({ msg, steps, hl, ok });
const bad = (msg) => ({ msg, steps: 0, hl: null, ok: false });
const idxOf = (b) => parseInt(b, 10);

/* ----- sequence-based ADTs on ArraySeq / LinkedSeq ----- */
function seqLabels(kind, type, n) {
  const L = {};
  const add = (i, t) => { if (i >= 0 && i < n) L[i] = L[i] ? L[i] + ' / ' + t : t; };
  if (type === 'linked') {
    add(0, 'head');
    add(n - 1, 'tail');
  } else {
    if (kind === 'stack') add(n - 1, 'top');
    if (kind === 'queue') { add(0, 'front'); add(n - 1, 'rear'); }
    if (kind === 'deque') { add(0, 'front'); add(n - 1, 'back'); }
  }
  return L;
}
function seqADT(kind, seq) {
  const n = () => seq.size();
  const put = (i, v, text) => { const r = seq.insertAt(i, v); return R(`${text} ${r.note}`, r.steps, i); };
  const take = (i, text) => { const r = seq.removeAt(i); return R(`${text(r.v)} ${r.note}`, r.steps, null); };
  const look = (i, text) => { const r = seq.get(i); return R(`${text(r.v)} ${r.note}`, r.steps, i); };
  const empty = (what) => bad(`${what} is empty: this operation is an error.`);
  const ops = {};
  ops.isEmpty = () => R(n() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${n()}).`, 1, null);
  if (kind === 'list') {
    ops.append = (a) => put(n(), a, `Appended <b>${a}</b> at index ${n()}.`);
    ops.insertBefore = (a, b) => {
      const i = idxOf(b);
      if (isNaN(i) || i < 0 || i > n()) return bad(`Index must be between 0 and ${n()} (0 to ${n() - 1} before an existing element, or ${n()} to append right after the last element).`);
      if (i === n()) return put(i, a, `Index ${i} is right after the last index: appended <b>${a}</b> at the end.`);
      return put(i, a, `Inserted <b>${a}</b> before index ${i}; <b>${a}</b> now sits at index ${i}.`);
    };
    ops.remove = (a, b) => { const i = idxOf(b); if (isNaN(i) || i < 0 || i >= n()) return bad(`No element at that index (size ${n()}).`); return take(i, (v) => `Removed <b>${v}</b> from index ${i}.`); };
    ops.get = (a, b) => { const i = idxOf(b); if (isNaN(i) || i < 0 || i >= n()) return bad(`No element at that index (size ${n()}).`); return look(i, (v) => `get(${i}) returns <b>${v}</b>.`); };
  } else if (kind === 'stack') {
    const top = () => (seq.type === 'array' ? n() - 1 : 0);
    ops.push = (a) => put(seq.type === 'array' ? n() : 0, a, `Pushed <b>${a}</b> onto the top.`);
    ops.pop = () => (n() ? take(top(), (v) => `pop() returned <b>${v}</b>, the newest element.`) : empty('Stack'));
    ops.peek = () => (n() ? look(top(), (v) => `peek() returns <b>${v}</b> without removing it.`) : empty('Stack'));
  } else if (kind === 'queue') {
    ops.enqueue = (a) => put(n(), a, `<b>${a}</b> joined the rear.`);
    ops.dequeue = () => (n() ? take(0, (v) => `dequeue() returned <b>${v}</b>, the oldest element.`) : empty('Queue'));
    ops.peek = () => (n() ? look(0, (v) => `peek() returns <b>${v}</b> without removing it.`) : empty('Queue'));
  } else if (kind === 'deque') {
    ops.enQueueFront = (a) => put(0, a, `<b>${a}</b> inserted at the front.`);
    ops.enQueueBack = (a) => put(n(), a, `<b>${a}</b> inserted at the back.`);
    ops.deQueueFront = () => (n() ? take(0, (v) => `deQueueFront() returned <b>${v}</b>.`) : empty('Deque'));
    ops.deQueueBack = () => (n() ? take(n() - 1, (v) => `deQueueBack() returned <b>${v}</b>.`) : empty('Deque'));
  }
  return { ops, size: n, render: (hl) => seq.render(hl, seqLabels(kind, seq.type, n())) };
}

function circularQueue() {
  const c = new CircSeq(6);
  const ops = {
    isEmpty: () => R(c.size() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${c.size()}).`, 1, null),
    enqueue: (a) => { const r = c.enqueue(a); return R(`<b>${a}</b> joined the rear. ${r.note}`, r.steps, r.idx); },
    dequeue: () => { if (!c.size()) return bad('Queue is empty: this operation is an error.'); const r = c.dequeue(); return R(`dequeue() returned <b>${r.v}</b>. ${r.note}`, r.steps, null); },
    peek: () => { if (!c.size()) return bad('Queue is empty.'); const r = c.peekFront(); return R(`peek() returns <b>${r.v}</b> without removing it.`, r.steps, r.idx); }
  };
  return { ops, size: () => c.size(), render: (hl) => c.render(hl) };
}

/* ----- dictionary-based ADTs on HashTable / BST ----- */
const toInt = (x) => (/^-?\d+$/.test(String(x).trim()) ? String(parseInt(x, 10)) : null);
const INT_MSG = 'This demo allows integers only (for example 42 or -7).';
function mapADT(d) {
  const ops = {
    isEmpty: () => R(d.size() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${d.size()}).`, 1, null),
    put: (a0, b0) => { const a = toInt(a0), v = toInt(b0); if (a === null) return bad(`Key must be an integer. ${INT_MSG}`); if (v === null) return bad(`Value must be an integer. ${INT_MSG}`); const r = d.put(a, v); return R(r.found ? `Key <b>${a}</b> already existed: value replaced by <b>${v}</b>. ${r.note}` : `New pair <b>${a} → ${v}</b> stored. ${r.note}`, r.steps, a); },
    get: (a0) => { const a = toInt(a0); if (a === null) return bad(`Key must be an integer. ${INT_MSG}`); const r = d.get(a); return r.found ? R(`get(${a}) returns <b>${r.v}</b>. ${r.note}`, r.steps, a) : { msg: `Key ${a} is not in the map: get returns null. ${r.note}`, steps: r.steps, hl: null, ok: false }; },
    remove: (a0) => { const a = toInt(a0); if (a === null) return bad(`Key must be an integer. ${INT_MSG}`); const r = d.remove(a); return r.found ? R(`Removed key <b>${a}</b> with its value ${r.v}. ${r.note}`, r.steps, null) : { msg: `Key ${a} is not in the map. ${r.note}`, steps: r.steps, hl: null, ok: false }; }
  };
  return { ops, size: () => d.size(), render: (hl) => d.render(hl) };
}
function setADT(d) {
  const ops = {
    isEmpty: () => R(d.size() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${d.size()}).`, 1, null),
    add: (a0) => { const a = toInt(a0); if (a === null) return bad(`Value must be an integer. ${INT_MSG}`); const r = d.put(a, null); return r.found ? { msg: `<b>${a}</b> is already in the set: add changes nothing. ${r.note}`, steps: r.steps, hl: a, ok: false } : R(`<b>${a}</b> added. ${r.note}`, r.steps, a); },
    remove: (a0) => { const a = toInt(a0); if (a === null) return bad(`Value must be an integer. ${INT_MSG}`); const r = d.remove(a); return r.found ? R(`<b>${a}</b> removed. ${r.note}`, r.steps, null) : { msg: `<b>${a}</b> is not in the set. ${r.note}`, steps: r.steps, hl: null, ok: false }; },
    contains: (a0) => { const a = toInt(a0); if (a === null) return bad(`Value must be an integer. ${INT_MSG}`); const r = d.get(a); return r.found ? R(`contains(${a}) is <b>true</b>. ${r.note}`, r.steps, a) : { msg: `contains(${a}) is <b>false</b>. ${r.note}`, steps: r.steps, hl: null, ok: false }; }
  };
  return { ops, size: () => d.size(), render: (hl) => d.render(hl) };
}

/* ----- priority queues ----- */
const parseP = (b) => { const p = parseFloat(b); return isNaN(p) ? null : p; };
function pqUnsorted() {
  const s = new ArraySeq(6);
  const minIdx = () => { let m = 0; s.data.forEach((e, i) => { if (e.p < s.data[m].p) m = i; }); return m; };
  const ops = {
    isEmpty: () => R(s.size() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${s.size()}).`, 1, null),
    enqueue: (a, b) => { const p = parseP(b); if (p === null) return bad('Enter a numeric priority (smaller = more urgent).'); const r = s.insertAt(s.size(), { x: a, p }); return R(`Appended <b>${a}</b> (p=${p}) at the end. ${r.note}`, r.steps, s.size() - 1); },
    dequeue: () => { if (!s.size()) return bad('Priority queue is empty.'); const n = s.size(), m = minIdx(), e = s.data[m]; s.data[m] = s.data[n - 1]; s.data.pop(); return R(`dequeue() returned <b>${e.x}</b> (p=${e.p}). Scanned all ${n} element(s) to find the minimum, then moved the last element into its slot. `, n + 1, null); },
    peek: () => { if (!s.size()) return bad('Priority queue is empty.'); const n = s.size(), m = minIdx(); return R(`peek() returns <b>${s.data[m].x}</b> (p=${s.data[m].p}) after scanning ${n} element(s). `, n, m); }
  };
  return { ops, size: () => s.size(), render: (hl) => s.render(hl) };
}
function pqSorted() {
  const s = new ArraySeq(6); // descending by priority: the minimum sits at the end
  const labels = () => (s.size() ? { [s.size() - 1]: 'min (next out)' } : {});
  const ops = {
    isEmpty: () => R(s.size() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${s.size()}).`, 1, null),
    enqueue: (a, b) => {
      const p = parseP(b); if (p === null) return bad('Enter a numeric priority (smaller = more urgent).');
      let pos = 0; while (pos < s.size() && s.data[pos].p > p) pos++;
      const compares = Math.min(pos + 1, s.size()), r = s.insertAt(pos, { x: a, p });
      return R(`Inserted <b>${a}</b> (p=${p}) at index ${pos} to keep the array sorted (${compares} comparison(s)). ${r.note}`, compares + r.steps, pos);
    },
    dequeue: () => { if (!s.size()) return bad('Priority queue is empty.'); const r = s.removeAt(s.size() - 1); return R(`dequeue() returned <b>${r.v.x}</b> (p=${r.v.p}) from the end of the array. `, r.steps, null); },
    peek: () => { if (!s.size()) return bad('Priority queue is empty.'); const e = s.data[s.size() - 1]; return R(`peek() returns <b>${e.x}</b> (p=${e.p}) at the end. `, 1, s.size() - 1); }
  };
  return { ops, size: () => s.size(), render: (hl) => s.render(hl, labels()) };
}
function pqHeap() {
  const h = new Heap();
  const ops = {
    isEmpty: () => R(h.size() === 0 ? 'isEmpty() is <b>true</b> (size is 0).' : `isEmpty() is <b>false</b> (size is ${h.size()}).`, 1, null),
    enqueue: (a, b) => { const p = parseP(b); if (p === null) return bad('Enter a numeric priority (smaller = more urgent).'); const r = h.enqueue(a, p); return R(`Inserted <b>${a}</b> (p=${p}) at the end, then restored heap order. ${r.note}`, r.steps, r.idx); },
    dequeue: () => { if (!h.size()) return bad('Priority queue is empty.'); const r = h.dequeue(); return R(`dequeue() returned <b>${r.v.x}</b> (p=${r.v.p}). ${r.note}`, r.steps, null); },
    peek: () => { if (!h.size()) return bad('Priority queue is empty.'); return R(`peek() returns <b>${h.a[0].x}</b> (p=${h.a[0].p}), the root. `, 1, 0); }
  };
  return { ops, size: () => h.size(), render: (hl) => h.render(hl) };
}

/* ----- catalog ----- */
const SEQ_NOTE = 'A step is one element read, written, shifted, compared, or one link followed.';
const ADTS = [
  {
    id: 'list', name: 'List', icon: ICONS.list,
    tagline: 'An ordered sequence where every element has a position.',
    rule: 'You choose the position', analogy: 'A numbered playlist. You can add a song anywhere and jump straight to track number 3.',
    fields: { a: 'value', b: 'index' },
    insertNote: '<b>Insertion alternatives:</b> In this demo we provide <code>append(v)</code> and <code>insertBefore(i, v)</code>. Notice that <code>insertBefore(size, v)</code> also allows adding right after the last element. Alternatively, an ADT design can achieve all insertions using <code>prepend(v)</code> (insert at the beginning) together with <code>insertAfter(i, v)</code>.',
    ops: [
      { id: 'append', label: 'append(v)', use: 'a' }, { id: 'insertBefore', label: 'insertBefore(i, v)', use: 'ab' },
      { id: 'remove', label: 'remove(i)', use: 'b' }, { id: 'get', label: 'get(i)', use: 'b' }, { id: 'isEmpty', label: 'isEmpty()', use: '' }
    ],
    impls: [
      { id: 'array', name: 'Partially filled array', make: () => seqADT('list', new ArraySeq(6)), how: 'Elements sit side by side in an array that is only partly used. A size counter marks the end. When full, the array doubles.',
        facts: [['get(i)', 'Θ(1)', 'direct indexing'], ['append(v)', 'Θ(1) amortized', 'write at the end; occasional doubling'], ['insertBefore(i, v) / remove(i)', 'Θ(n)', 'later elements shift'], ['isEmpty()', 'Θ(1)', 'check if size == 0']] },
      { id: 'linked', name: 'Linked list', make: () => seqADT('list', new LinkedSeq(false)), how: 'Each node holds a value and a link to the next node. A head and a tail pointer mark the ends.',
        facts: [['get(i)', 'Θ(n)', 'walk i links from the head'], ['append(v)', 'Θ(1)', 'tail pointer'], ['insertBefore(0, v) / remove(0)', 'Θ(1)', 'relink the head only'], ['insertBefore(i, v) / remove(i)', 'Θ(n)', 'walk to the position first (no shifting)'], ['isEmpty()', 'Θ(1)', 'check if head == null']] }
    ],
    use: ['Playlists and to-do lists you reorder', 'Any data accessed by position'],
    tryIt: ['Fill the list, then insertBefore(1, 9) in both implementations and compare the steps.', 'Try insertBefore with index equal to size: it inserts right after the last index.', 'get(4) is one step in the array but walks links in the linked list.', 'Click isEmpty() when the list is populated vs empty.'],
    workload: { text: 'append 1 to 6, insertBefore index 0 twice, remove(0), then get(3)', ops: [['append', '1'], ['append', '2'], ['append', '3'], ['append', '4'], ['append', '5'], ['append', '6'], ['insertBefore', '9', '0'], ['insertBefore', '8', '0'], ['remove', '', '0'], ['get', '', '3']] }
  },
  {
    id: 'stack', name: 'Stack', icon: ICONS.stack,
    tagline: 'Last in, first out (LIFO). Only the top is reachable.',
    rule: 'The newest element', analogy: 'A stack of plates. You only add or take the plate on top.',
    fields: { a: 'value' },
    ops: [{ id: 'push', label: 'push(v)', use: 'a' }, { id: 'pop', label: 'pop()', use: '' }, { id: 'peek', label: 'peek()', use: '' }, { id: 'isEmpty', label: 'isEmpty()', use: '' }],
    impls: [
      { id: 'array', name: 'Partially filled array', make: () => seqADT('stack', new ArraySeq(6)), how: 'The top is the last used slot. Push, pop, peek, and isEmpty only touch the end or inspect size.',
        facts: [['push / pop / peek', 'Θ(1) amortized', 'work at the end of the array'], ['push on full array', 'Θ(n)', 'doubling copies all elements'], ['isEmpty()', 'Θ(1)', 'check if size == 0']] },
      { id: 'linked', name: 'Linked list', make: () => seqADT('stack', new LinkedSeq(false)), how: 'The top is the head of the list. Push and pop relink the head.',
        facts: [['push / pop / peek', 'Θ(1)', 'work at the head'], ['capacity', 'none', 'grows one node at a time'], ['isEmpty()', 'Θ(1)', 'check if head == null']] }
    ],
    use: ['Undo history', 'Function call stack and expression evaluation'],
    tryIt: ['Push 1, 2, 3 and pop: which one returns?', 'Pop on an empty stack shows underflow.', 'Check isEmpty() before and after push.'],
    workload: { text: 'push 1 to 8, then pop four times and peek', ops: [['push', '1'], ['push', '2'], ['push', '3'], ['push', '4'], ['push', '5'], ['push', '6'], ['push', '7'], ['push', '8'], ['pop'], ['pop'], ['pop'], ['pop'], ['peek']] }
  },
  {
    id: 'queue', name: 'Queue', icon: ICONS.queue,
    tagline: 'First in, first out (FIFO). Join at the rear, leave from the front.',
    rule: 'The oldest element', analogy: 'A line at a ticket counter. Whoever arrived first is served first.',
    fields: { a: 'value' },
    ops: [{ id: 'enqueue', label: 'enqueue(v)', use: 'a' }, { id: 'dequeue', label: 'dequeue()', use: '' }, { id: 'peek', label: 'peek()', use: '' }, { id: 'isEmpty', label: 'isEmpty()', use: '' }],
    impls: [
      { id: 'array', name: 'Partially filled array', make: () => seqADT('queue', new ArraySeq(6)), how: 'The front stays at index 0. Dequeue must shift every remaining element left.',
        facts: [['enqueue', 'Θ(1) amortized', 'write at the end'], ['dequeue', 'Θ(n)', 'shift all elements left'], ['peek / isEmpty', 'Θ(1)', 'inspect index 0 or size']] },
      { id: 'linked', name: 'Linked list', make: () => seqADT('queue', new LinkedSeq(false)), how: 'The front is the head and the rear is the tail. Both ends are reachable in one step.',
        facts: [['enqueue', 'Θ(1)', 'tail pointer'], ['dequeue', 'Θ(1)', 'move the head'], ['peek / isEmpty', 'Θ(1)', 'inspect head node or check null']] },
      { id: 'circular', name: 'Circular partially filled array', make: () => circularQueue(), how: 'Front and rear indices wrap around with modulo arithmetic, so dequeue never shifts anything.',
        facts: [['enqueue / dequeue', 'Θ(1) amortized', 'advance modulo capacity'], ['peek / isEmpty', 'Θ(1)', 'inspect slots[front] or check size == 0'], ['when full', 'Θ(n)', 'doubling copies elements in order (rare)']] }
    ],
    use: ['Print jobs and customer service lines', 'Breadth-first search'],
    tryIt: ['Enqueue 6 items and dequeue 3 in each implementation.', 'In the circular array, enqueue after dequeues and watch the rear wrap around.'],
    workload: { text: 'enqueue 1 to 8, then dequeue four times', ops: [['enqueue', '1'], ['enqueue', '2'], ['enqueue', '3'], ['enqueue', '4'], ['enqueue', '5'], ['enqueue', '6'], ['enqueue', '7'], ['enqueue', '8'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue']] }
  },
  {
    id: 'deque', name: 'Deque', icon: ICONS.deque,
    tagline: 'A double-ended queue. Insert and remove at both ends.',
    rule: 'Either end, you choose', analogy: 'A train with doors at both ends. Passengers can board or leave at either end.',
    fields: { a: 'value' },
    ops: [
      { id: 'enQueueFront', label: 'enQueueFront(v)', use: 'a' }, { id: 'enQueueBack', label: 'enQueueBack(v)', use: 'a' },
      { id: 'deQueueFront', label: 'deQueueFront()', use: '' }, { id: 'deQueueBack', label: 'deQueueBack()', use: '' },
      { id: 'isEmpty', label: 'isEmpty()', use: '' }
    ],
    impls: [
      { id: 'array', name: 'Partially filled array', make: () => seqADT('deque', new ArraySeq(6)),
        extra: { title: 'Design note: Circular array for Deque', html: 'A standard partially filled array is <b>not a good fit</b> for Deque because operations at the front require shifting all elements (Θ(n)). While a <b>doubly linked list</b> achieves Θ(1) for all four ends, an array-based alternative would be a <b>circular array</b> (with both front and back indices wrapping around via modulo arithmetic), achieving Θ(1) amortized time at both ends without shifting.' },
        how: 'The front is index 0 and the back is the last used slot. Front operations must shift elements. (Note: A standard partially filled array is not a good fit for Deque; see note below.)',
        facts: [['enQueueBack / deQueueBack', 'Θ(1) amortized', 'work at the end'], ['enQueueFront / deQueueFront', 'Θ(n)', 'shift all elements'], ['isEmpty()', 'Θ(1)', 'check if size == 0']] },
      { id: 'linked', name: 'Doubly linked list', make: () => seqADT('deque', new LinkedSeq(true)), how: 'Nodes link both forward and backward, with head and tail pointers. All four operations touch only an end.',
        facts: [['all four operations', 'Θ(1)', 'head and tail with previous links'], ['singly linked alternative', 'Θ(n)', 'deQueueBack must walk to the node before the tail'], ['isEmpty()', 'Θ(1)', 'check if head == null']] }
    ],
    use: ['Sliding-window problems and palindrome checks', 'Can behave as a stack or as a queue'],
    tryIt: ['Use enQueueBack and deQueueFront: that is a queue.', 'Use enQueueBack and deQueueBack: that is a stack.', 'Compare steps between array and doubly linked list for enQueueFront.'],
    workload: { text: 'enQueueBack 1 to 4, enQueueFront 5 to 8, then deQueueFront and deQueueBack twice each', ops: [['enQueueBack', '1'], ['enQueueBack', '2'], ['enQueueBack', '3'], ['enQueueBack', '4'], ['enQueueFront', '5'], ['enQueueFront', '6'], ['enQueueFront', '7'], ['enQueueFront', '8'], ['deQueueFront'], ['deQueueFront'], ['deQueueBack'], ['deQueueBack']] }
  },
  {
    id: 'map', name: 'Map', icon: ICONS.map,
    tagline: 'Stores key-value pairs. Each key appears at most once.',
    rule: 'You name the key', analogy: 'A dictionary. Look up a word (the key) to get its definition (the value).',
    fields: { a: 'key (integer)', b: 'value (integer)' },
    intNote: 'In this demo Map keys and values are <b>integers only</b> (no characters or strings). This keeps the hash function simple and concrete.',
    ops: [{ id: 'put', label: 'put(k, v)', use: 'ab' }, { id: 'get', label: 'get(k)', use: 'a' }, { id: 'remove', label: 'remove(k)', use: 'a' }, { id: 'isEmpty', label: 'isEmpty()', use: '' }],
    impls: [
      { id: 'hash', name: 'Hash table', make: () => mapADT(new HashTable(7)), extra: { title: 'The hash function', html: 'There are <b>m = 7</b> buckets, numbered 0 to 6. The hash function is <b>hash(key) = key mod 7</b>, the remainder after dividing by 7.<br><br>Example: hash(23) = 23 mod 7 = 2, so key 23 goes to bucket 2. Negative keys use the mathematical remainder, so hash(-3) = 4.<br><br>Keys with the same remainder <b>collide</b>: for instance 9 and 16 both go to bucket 2, and are chained in that bucket.' }, how: 'The hash function hash(key) = key mod 7 turns an integer key into a bucket index. Keys that collide are chained in the same bucket.',
        facts: [['put / get / remove', 'Θ(1) average', 'hash straight to a bucket'], ['worst case (all collide)', 'Θ(n)', 'every key collides in one bucket chain'], ['isEmpty()', 'Θ(1)', 'check if total size == 0'], ['key order', 'none', 'scattered by the hash']] },
      { id: 'bst', name: 'Binary search tree', make: () => mapADT(new BST()), how: 'Smaller keys go left, larger keys go right. Each operation follows one path from the root.',
        facts: [['put / get / remove', 'Θ(h)', 'h is the tree height'], ['balanced tree', 'Θ(log n)', 'height is logarithmic'], ['sorted input, unbalanced', 'Θ(n)', 'the tree degenerates into a linear chain'], ['isEmpty()', 'Θ(1)', 'check if root == null'], ['key order', 'sorted', 'in-order traversal']] }
    ],
    use: ['Student records by ID', 'Caches and word counts'],
    tryIt: ['Fill sample, then get(36): count the comparisons in the tree and the chain in the hash table.', 'put the same key twice: the value is replaced.', 'Challenge: on an empty map, put keys 10, 20, 30, 40, 50 in increasing order. The tree becomes a chain, its worst case.'],
    workload: { text: 'put eight integer keys in a random-looking order (47, 21, 63, 8, 36, 52, 90, 15), then get(36)', ops: [['put', '47', '1'], ['put', '21', '2'], ['put', '63', '3'], ['put', '8', '4'], ['put', '36', '5'], ['put', '52', '6'], ['put', '90', '7'], ['put', '15', '8'], ['get', '36']] }
  },
  {
    id: 'set', name: 'Set', icon: ICONS.set,
    tagline: 'A collection of distinct elements. Membership is the question.',
    rule: 'You name the value', analogy: 'A guest list. A name is either on it or not, and never twice.',
    fields: { a: 'value (integer)' },
    intNote: 'In this demo Set elements are <b>integers only</b> (no characters or strings). This keeps the hash function simple and concrete.',
    ops: [{ id: 'add', label: 'add(v)', use: 'a' }, { id: 'remove', label: 'remove(v)', use: 'a' }, { id: 'contains', label: 'contains(v)', use: 'a' }, { id: 'isEmpty', label: 'isEmpty()', use: '' }],
    impls: [
      { id: 'hash', name: 'Hash table', make: () => setADT(new HashTable(7)), extra: { title: 'The hash function', html: 'There are <b>m = 7</b> buckets, numbered 0 to 6. The hash function is <b>hash(key) = key mod 7</b>, the remainder after dividing by 7.<br><br>Example: hash(23) = 23 mod 7 = 2, so key 23 goes to bucket 2. Negative keys use the mathematical remainder, so hash(-3) = 4.<br><br>Keys with the same remainder <b>collide</b>: for instance 9 and 16 both go to bucket 2, and are chained in that bucket.' }, how: 'Each integer is hashed to a bucket with hash(v) = v mod 7. Duplicates are found by scanning one short chain.',
        facts: [['add / remove / contains', 'Θ(1) average', 'hash straight to a bucket'], ['worst case (all collide)', 'Θ(n)', 'many collisions in one chain'], ['isEmpty()', 'Θ(1)', 'check if total size == 0'], ['order', 'none', 'scattered by the hash']] },
      { id: 'bst', name: 'Binary search tree', make: () => setADT(new BST()), how: 'Values are kept in a search tree. A value is a duplicate if the search path ends on an equal value.',
        facts: [['add / remove / contains', 'Θ(h)', 'h is the tree height'], ['balanced tree', 'Θ(log n)', 'height is logarithmic'], ['isEmpty()', 'Θ(1)', 'check if root == null'], ['order', 'sorted', 'in-order traversal']] }
    ],
    use: ['Unique visitors', 'Removing duplicates and set algebra'],
    tryIt: ['add 5 twice: the second add changes nothing.', 'Add 7, 14 and 21: all have remainder 0, so they collide in bucket 0.'],
    workload: { text: 'add eight integers in a random-looking order (41, 17, 58, 9, 33, 72, 25, 64), then contains(25)', ops: [['add', '41'], ['add', '17'], ['add', '58'], ['add', '9'], ['add', '33'], ['add', '72'], ['add', '25'], ['add', '64'], ['contains', '25']] }
  },
  {
    id: 'pq', name: 'Priority Queue', icon: ICONS.pq,
    tagline: 'Always serves the element with the best priority (smallest number here).',
    rule: 'The smallest priority number', analogy: 'An emergency room. The most urgent patient goes first, not the earliest arrival.',
    fields: { a: 'item', b: 'priority' },
    ops: [{ id: 'enqueue', label: 'enqueue(x, p)', use: 'ab' }, { id: 'dequeue', label: 'dequeue()', use: '' }, { id: 'peek', label: 'peek()', use: '' }, { id: 'isEmpty', label: 'isEmpty()', use: '' }],
    impls: [
      { id: 'unsorted', name: 'Unsorted array', make: () => pqUnsorted(), how: 'New items go at the end. Finding the minimum means scanning the whole array.',
        facts: [['enqueue', 'Θ(1) amortized', 'append at the end'], ['dequeue / peek', 'Θ(n)', 'scan for the minimum'], ['isEmpty()', 'Θ(1)', 'check if size == 0'], ['Dijkstra with V vertices', 'Θ(V²)', 'well-suited for dense graphs']] },
      { id: 'sorted', name: 'Sorted array', make: () => pqSorted(), how: 'The array stays sorted so the minimum is always at one end. Insertion must find the spot and shift.',
        facts: [['enqueue', 'Θ(n)', 'find spot and shift'], ['dequeue / peek', 'Θ(1)', 'minimum at the end'], ['isEmpty()', 'Θ(1)', 'check if size == 0']] },
      { id: 'heap', name: 'Binary heap', make: () => pqHeap(), how: 'A complete binary tree stored in an array where every parent is at most its children. The minimum is the root.',
        facts: [['enqueue / dequeue', 'Θ(log n)', 'sift up or down one branch'], ['peek', 'Θ(1)', 'inspect the root'], ['isEmpty()', 'Θ(1)', 'check if size == 0'], ['Dijkstra', 'Θ((V+E) log V)', 'well-suited for sparse graphs']] }
    ],
    use: ['Hospital triage and task schedulers', 'Dijkstra shortest paths'],
    tryIt: ['Enqueue tasks with priorities 5, 3, 8, 1 then dequeue repeatedly.', 'Compare how the three implementations spend steps on enqueue versus dequeue.'],
    workload: { text: 'enqueue 16 tasks with mixed priorities, then dequeue ten times', ops: [['enqueue', 't1', '9'], ['enqueue', 't2', '4'], ['enqueue', 't3', '14'], ['enqueue', 't4', '2'], ['enqueue', 't5', '11'], ['enqueue', 't6', '7'], ['enqueue', 't7', '1'], ['enqueue', 't8', '13'], ['enqueue', 't9', '5'], ['enqueue', 't10', '10'], ['enqueue', 't11', '3'], ['enqueue', 't12', '12'], ['enqueue', 't13', '6'], ['enqueue', 't14', '8'], ['enqueue', 't15', '15'], ['enqueue', 't16', '16'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue'], ['dequeue']] }
  }
];
// workload entries are [opId, a, b]; for map put the key is a and value b (see app.js normalisation)
