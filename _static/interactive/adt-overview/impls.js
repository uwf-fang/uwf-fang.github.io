// Concrete data structures behind the ADTs. Every mutating method reports `steps`
// (one element read, written, shifted, compared, or link followed) so that
// implementations can be compared by cost.

const isNum = (s) => s !== '' && s !== null && !isNaN(Number(s));
const cmpKeys = (a, b) => Number(a) - Number(b); // keys are integers
const itemHTML = (v) => (v && typeof v === 'object' && 'x' in v ? `${v.x}<small>p=${v.p}</small>` : String(v));

/* ---------- Partially filled array (grows by doubling) ---------- */
class ArraySeq {
  constructor(cap = 6) { this.cap = cap; this.data = []; this.type = 'array'; }
  size() { return this.data.length; }
  insertAt(i, v) {
    let steps = 0, note = '';
    const n = this.data.length;
    if (n === this.cap) { steps += n; this.cap *= 2; note += `Array was full: capacity doubled to ${this.cap} (copied ${n} elements). `; }
    const shifts = n - i;
    if (shifts > 0) note += `${shifts} element(s) shifted right. `;
    steps += shifts + 1;
    this.data.splice(i, 0, v);
    return { steps, note };
  }
  removeAt(i) {
    const v = this.data[i], shifts = this.data.length - 1 - i;
    this.data.splice(i, 1);
    return { v, steps: shifts + 1, note: shifts > 0 ? `${shifts} element(s) shifted left. ` : '' };
  }
  get(i) { return { v: this.data[i], steps: 1, note: '' }; }
  render(hl, labels = {}) {
    const slots = [];
    for (let i = 0; i < this.cap; i++) {
      const filled = i < this.data.length;
      slots.push(`<div class="slot"><div class="lab">${labels[i] || ''}</div><div class="cell${filled ? '' : ' empty-slot'}${hl === i ? ' hl' : ''}">${filled ? itemHTML(this.data[i]) : ''}<span class="idx">${i}</span></div></div>`);
    }
    return `<div class="row arr">${slots.join('')}</div><div class="meta">size = ${this.data.length}, capacity = ${this.cap}</div>`;
  }
}

/* ---------- Circular partially filled array (queue) ---------- */
class CircSeq {
  constructor(cap = 6) { this.cap = cap; this.slots = new Array(cap).fill(null); this.front = 0; this.n = 0; this.type = 'circular'; }
  size() { return this.n; }
  enqueue(v) {
    let steps = 0, note = '';
    if (this.n === this.cap) {
      const old = [];
      for (let k = 0; k < this.n; k++) old.push(this.slots[(this.front + k) % this.cap]);
      this.cap *= 2; this.slots = new Array(this.cap).fill(null);
      old.forEach((x, k) => (this.slots[k] = x));
      this.front = 0; steps += this.n;
      note += `Array was full: capacity doubled to ${this.cap} and elements copied in order. `;
    }
    const idx = (this.front + this.n) % this.cap;
    this.slots[idx] = v; this.n++; steps += 1;
    if (idx < this.front) note += 'The rear wrapped around to the start of the array. ';
    return { steps, note, idx };
  }
  dequeue() {
    const v = this.slots[this.front], at = this.front;
    this.slots[this.front] = null; this.front = (this.front + 1) % this.cap; this.n--;
    return { v, steps: 1, note: 'Only the front index moved: nothing was shifted. ', idx: at };
  }
  peekFront() { return { v: this.slots[this.front], steps: 1, idx: this.front }; }
  toArray() { const r = []; for (let k = 0; k < this.n; k++) r.push(this.slots[(this.front + k) % this.cap]); return r; }
  render(hl) {
    const rearIdx = (this.front + this.n - 1 + this.cap) % this.cap;
    const slots = this.slots.map((v, i) => {
      const labels = [];
      if (this.n && i === this.front) labels.push('front');
      if (this.n && i === rearIdx) labels.push('rear');
      return `<div class="slot"><div class="lab">${labels.join(' / ')}</div><div class="cell${v === null ? ' empty-slot' : ''}${hl === i ? ' hl' : ''}">${v === null ? '' : itemHTML(v)}<span class="idx">${i}</span></div></div>`;
    });
    return `<div class="row arr">${slots.join('')}</div><div class="meta">size = ${this.n}, capacity = ${this.cap}, front index = ${this.front}</div>`;
  }
}

/* ---------- Linked list (singly with tail pointer, or doubly) ---------- */
class LinkedSeq {
  constructor(doubly = false) { this.doubly = doubly; this.data = []; this.type = 'linked'; }
  size() { return this.data.length; }
  insertAt(i, v) {
    const n = this.data.length; let steps, note;
    if (i === 0) { steps = 1; note = 'Relinked the head: one step. '; }
    else if (i === n) { steps = 1; note = 'The tail pointer gives direct access to the end: one step. '; }
    else { steps = i + 1; note = `Followed ${i} link(s) from the head to reach the position. `; }
    this.data.splice(i, 0, v);
    return { steps, note };
  }
  removeAt(i) {
    const n = this.data.length, v = this.data[i]; let steps, note;
    if (i === 0) { steps = 1; note = 'Moved the head pointer: one step. '; }
    else if (i === n - 1) {
      if (this.doubly) { steps = 1; note = 'The previous link from the tail makes this one step. '; }
      else { steps = n; note = `A singly linked list must walk ${n - 1} link(s) to find the node before the tail. `; }
    } else { steps = i + 1; note = `Followed ${i} link(s) to reach the position. `; }
    this.data.splice(i, 1);
    return { v, steps, note };
  }
  get(i) { return { v: this.data[i], steps: i + 1, note: i ? `Followed ${i} link(s) from the head. ` : '' }; }
  render(hl, labels = {}) {
    if (!this.data.length) return `<div class="meta">head = null</div>`;
    const arrow = this.doubly ? '⇄' : '→';
    const nodes = this.data.map((v, i) => `<div class="node"><div class="lab">${labels[i] || ''}</div><div class="cell${hl === i ? ' hl' : ''}">${itemHTML(v)}</div></div>${i < this.data.length - 1 ? `<span class="arrow">${arrow}</span>` : '<span class="arrow">null</span>'}`);
    return `<div class="row linked">${nodes.join('')}</div><div class="meta">${this.doubly ? 'doubly' : 'singly'} linked, size = ${this.data.length}</div>`;
  }
}

/* ---------- Hash table with separate chaining ---------- */
class HashTable {
  constructor(m = 7) { this.m = m; this.b = Array.from({ length: m }, () => []); this.type = 'hash'; }
  size() { return this.b.reduce((n, c) => n + c.length, 0); }
  h(k) { const m = this.m; return ((Number(k) % m) + m) % m; } // key mod m
  find(k) {
    const i = this.h(k), ch = this.b[i]; let steps = 1;
    for (let j = 0; j < ch.length; j++) { steps++; if (ch[j].k === k) return { i, j, e: ch[j], steps }; }
    return { i, j: -1, e: null, steps };
  }
  put(k, v) {
    const f = this.find(k), where = `hash(${k}) = ${k} mod ${this.m} = ${f.i}, so bucket ${f.i}. `;
    const coll = !f.e && this.b[f.i].length ? `Collision: ${this.b[f.i].length} key(s) already chained there. ` : '';
    if (f.e) { f.e.v = v; return { found: true, steps: f.steps, note: where + 'Key found in the chain; value replaced. ' }; }
    this.b[f.i].push({ k, v });
    return { found: false, steps: f.steps + 1, note: where + coll };
  }
  get(k) { const f = this.find(k); return { found: !!f.e, v: f.e && f.e.v, steps: f.steps, note: `hash(${k}) = ${k} mod ${this.m} = ${f.i}, so bucket ${f.i}. ` }; }
  remove(k) {
    const f = this.find(k);
    if (f.e) this.b[f.i].splice(f.j, 1);
    return { found: !!f.e, v: f.e && f.e.v, steps: f.steps, note: `hash(${k}) = ${k} mod ${this.m} = ${f.i}, so bucket ${f.i}. ` };
  }
  keys() { return [].concat(...this.b).map((e) => e.k); }
  render(hl) {
    const rows = this.b.map((ch, i) => {
      const chain = ch.map((e) => `<span class="arrow">→</span><div class="cell${hl === e.k ? ' hl' : ''}">${e.k}${e.v !== null && e.v !== undefined ? `<small>${e.v}</small>` : ''}</div>`).join('');
      return `<div class="bkt"><div class="cell bidx">${i}</div>${chain}</div>`;
    });
    return `<div class="buckets">${rows.join('')}</div><div class="meta">${this.size()} key(s) in ${this.m} buckets (hash(key) = key mod ${this.m})</div>`;
  }
}

/* ---------- Binary search tree (unbalanced) ---------- */
class BST {
  constructor() { this.root = null; this.type = 'bst'; }
  size() { let c = 0; const w = (n) => { if (n) { c++; w(n.l); w(n.r); } }; w(this.root); return c; }
  height() { const h = (n) => (n ? 1 + Math.max(h(n.l), h(n.r)) : 0); return h(this.root); }
  put(k, v) {
    if (!this.root) { this.root = { k, v, l: null, r: null }; return { found: false, steps: 1, note: 'Tree was empty: new root. ' }; }
    let n = this.root, steps = 0;
    for (;;) {
      steps++; const c = cmpKeys(k, n.k);
      if (c === 0) { n.v = v; return { found: true, steps, note: `Found after ${steps} comparison(s); value replaced. ` }; }
      const s = c < 0 ? 'l' : 'r';
      if (!n[s]) { n[s] = { k, v, l: null, r: null }; return { found: false, steps: steps + 1, note: `Compared along a path of length ${steps}, then attached as a ${c < 0 ? 'left' : 'right'} child. ` }; }
      n = n[s];
    }
  }
  get(k) {
    let n = this.root, steps = 0;
    while (n) { steps++; const c = cmpKeys(k, n.k); if (c === 0) return { found: true, v: n.v, steps, note: `${steps} comparison(s) down the tree. ` }; n = c < 0 ? n.l : n.r; }
    return { found: false, v: null, steps: Math.max(steps, 1), note: `Fell off the tree after ${steps} comparison(s). ` };
  }
  remove(k) {
    let steps = 0, found = false, val = null;
    const rec = (n, key) => {
      if (!n) return null;
      steps++; const c = cmpKeys(key, n.k);
      if (c < 0) { n.l = rec(n.l, key); return n; }
      if (c > 0) { n.r = rec(n.r, key); return n; }
      if (!found) { found = true; val = n.v; }
      if (!n.l) return n.r;
      if (!n.r) return n.l;
      let s = n.r; while (s.l) { s = s.l; steps++; }
      n.k = s.k; n.v = s.v; n.r = rec(n.r, s.k);
      return n;
    };
    this.root = rec(this.root, k);
    return { found, v: val, steps: Math.max(steps, 1), note: `${steps} comparison(s). ` };
  }
  keys() { const r = []; const w = (n) => { if (n) { w(n.l); r.push(n.k); w(n.r); } }; w(this.root); return r; }
  render(hl) {
    if (!this.root) return '<span class="empty">empty tree</span>';
    let x = 0, maxD = 0; const nodes = [];
    const lay = (n, d, p) => { if (!n) return; lay(n.l, d + 1, n); n._x = x++; n._d = d; maxD = Math.max(maxD, d); nodes.push({ n, p }); lay(n.r, d + 1, n); };
    lay(this.root, 0, null);
    const W = x * 44 + 20, H = (maxD + 1) * 58 + 10;
    const px = (n) => n._x * 44 + 30, py = (n) => n._d * 58 + 26;
    const lines = nodes.filter((o) => o.p).map((o) => `<line x1="${px(o.p)}" y1="${py(o.p)}" x2="${px(o.n)}" y2="${py(o.n)}" />`).join('');
    const circles = nodes.map(({ n }) => `<g class="tn${hl === n.k ? ' hl' : ''}"><circle cx="${px(n)}" cy="${py(n)}" r="17"/><text x="${px(n)}" y="${py(n) + 5}" text-anchor="middle">${n.k}</text>${n.v !== null && n.v !== undefined ? `<text class="tv" x="${px(n)}" y="${py(n) + 31}" text-anchor="middle">${n.v}</text>` : ''}</g>`).join('');
    return `<div class="svgwrap"><svg width="${W}" height="${H + 14}" viewBox="0 0 ${W} ${H + 14}">${lines}${circles}</svg></div><div class="meta">${this.size()} key(s), height = ${this.height()}${this.height() >= 5 ? ' (degenerate: close to a linked list)' : ''}</div>`;
  }
}

/* ---------- Binary min-heap stored in an array ---------- */
class Heap {
  constructor() { this.a = []; this.type = 'heap'; }
  size() { return this.a.length; }
  enqueue(x, p) {
    const a = this.a; a.push({ x, p });
    let i = a.length - 1, steps = 1, sw = 0;
    while (i > 0) {
      const par = (i - 1) >> 1; steps++;
      if (a[par].p <= a[i].p) break;
      [a[par], a[i]] = [a[i], a[par]]; steps++; sw++; i = par;
    }
    return { steps, idx: i, note: sw ? `Sifted up ${sw} level(s). ` : 'Already in heap order: no swaps. ' };
  }
  dequeue() {
    const a = this.a, top = a[0]; let steps = 1, sw = 0;
    const last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0; const n = a.length;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < n) { steps++; if (a[l].p < a[m].p) m = l; }
        if (r < n) { steps++; if (a[r].p < a[m].p) m = r; }
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; steps++; sw++; i = m;
      }
    }
    return { v: top, steps, note: `Moved the last element to the root and sifted down ${sw} level(s). ` };
  }
  render(hl) {
    const a = this.a;
    if (!a.length) return '<span class="empty">empty heap</span>';
    const cells = a.map((e, i) => `<div class="slot"><div class="lab">${i === 0 ? 'min' : ''}</div><div class="cell${hl === i ? ' hl' : ''}">${itemHTML(e)}<span class="idx">${i}</span></div></div>`).join('');
    const levels = Math.floor(Math.log2(a.length)) + 1, W = Math.max(Math.pow(2, levels - 1) * 56, 120), H = levels * 58;
    const pos = (i) => { const d = Math.floor(Math.log2(i + 1)), k = i + 1 - Math.pow(2, d); return { x: ((k + 0.5) / Math.pow(2, d)) * W, y: d * 58 + 24 }; };
    const lines = a.map((_, i) => (i ? `<line x1="${pos((i - 1) >> 1).x}" y1="${pos((i - 1) >> 1).y}" x2="${pos(i).x}" y2="${pos(i).y}"/>` : '')).join('');
    const circles = a.map((e, i) => { const q = pos(i); return `<g class="tn${hl === i ? ' hl' : ''}"><circle cx="${q.x}" cy="${q.y}" r="18"/><text x="${q.x}" y="${q.y + 4}" text-anchor="middle" class="sm">${e.x}</text><text class="tv" x="${q.x}" y="${q.y + 32}" text-anchor="middle">p=${e.p}</text></g>`; }).join('');
    return `<div class="row arr">${cells}</div><div class="svgwrap"><svg width="${W}" height="${H + 14}" viewBox="0 0 ${W} ${H + 14}">${lines}${circles}</svg></div><div class="meta">array view on top, same heap drawn as a tree below; parent of index i is (i-1)/2</div>`;
  }
}
