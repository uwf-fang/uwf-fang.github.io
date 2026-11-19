# ADT Overview: Seven ADTs and Their Implementations

Interactive, framework-free HTML demo. Open `index.html` in a browser (no build step).

For an HTTP preview, run `python3 -m http.server 8766 --bind 127.0.0.1`
from the `interactive/` repository, then open
http://127.0.0.1:8766/adt-overview/index.html.

## Modes
1. **Learn**: pick an ADT, pick one implementation, run the operations, and see the picture, the explanation and the cost in steps.
2. **Compare implementations**: every implementation of the chosen ADT receives the same operations side by side, with step counters and a per-operation bar chart. "Run workload" replays a prepared sequence that shows the trade-offs.
3. **Cheat sheet**: all ADTs, who decides what leaves, the operations, and the cost of each implementation.
4. **Quiz**: eleven questions, seven on choosing the ADT and four on choosing the implementation, followed by an end-of-quiz review list of all questions, answers, and explanations.

A *step* is one element read, written, shifted or compared, or one link followed. It is a teaching measure, not a timing benchmark.

Operation arguments sit with the buttons that use them in **Use the current
list/set/…**. **Replace current data** contains **Load example** and the Clear
button, with a note that they replace contents and reset counts. In Compare mode,
manual arguments and operations form one group; the prepared workload and its
replacement actions form a separate group.

## Operation names (aligned to the course)
| ADT | Operations |
|---|---|
| List | `append(v)`, `insertBefore(i, v)`, `remove(i)`, `get(i)`, `isEmpty()` |
| Stack | `push(v)`, `pop()`, `peek()`, `isEmpty()` |
| Queue | `enqueue(v)`, `dequeue()`, `peek()`, `isEmpty()` |
| Deque | `enQueueFront(v)`, `enQueueBack(v)`, `deQueueFront()`, `deQueueBack()`, `isEmpty()` |
| Map | `put(k, v)`, `get(k)`, `remove(k)`, `isEmpty()` (keys and values are integers) |
| Set | `add(v)`, `remove(v)`, `contains(v)`, `isEmpty()` (elements are integers) |
| Priority Queue | `enqueue(x, p)`, `dequeue()`, `peek()`, `isEmpty()` (smallest priority number leaves first) |

## Implementations covered
| ADT | Implementations | Notes |
|---|---|---|
| List | Partially filled array, linked list | Array: Θ(1) `get`, Θ(n) insert/remove by shifting. Linked: Θ(1) at head/tail ends, Θ(n) walk to reach an index. Both Θ(1) `isEmpty()`. Note: In this demo, `insertBefore(size, v)` allows appending right after the last index; alternatively, ADT designs can achieve all insertions using `prepend(v)` with `insertAfter(i, v)`. |
| Stack | Partially filled array, linked list | Both Θ(1) amortized: array works at the end, linked list at the head. Both Θ(1) `isEmpty()`. |
| Queue | Partially filled array, linked list, **circular** partially filled array | Plain array makes `dequeue` Θ(n); the circular array fixes this with modulo indices (Θ(1)); linked list operates at head (dequeue/peek) and tail (enqueue) in Θ(1). All Θ(1) `isEmpty()`. |
| Deque | Partially filled array, (doubly) linked list | Array: front operations Θ(n) (not a good fit; note: a **circular array** can achieve Θ(1) amortized at both ends). Doubly linked: all four end ops (head and tail) Θ(1). Both Θ(1) `isEmpty()`. |
| Map | Hash table, binary search tree | Hash: Θ(1) average, no order. BST: Θ(h), sorted keys, degenerates on sorted input. Both Θ(1) `isEmpty()`. |
| Set | Hash table, binary search tree, Boolean array (bounded domain) | Hash and BST have the same trade-offs as Map, with values only. Boolean array: Θ(1) worst-case `add`, `remove`, and `contains` for the fixed domain `0..15`; Θ(U) storage. All Θ(1) `isEmpty()`. |
| Priority Queue | Unsorted array, sorted array, binary heap | Unsorted array: enqueue Θ(1), dequeue/peek Θ(n). Sorted array: enqueue Θ(n), dequeue/peek Θ(1). Heap: enqueue/dequeue Θ(log n), peek Θ(1). All Θ(1) `isEmpty()`. |

Simplifications: the hash table has 7 fixed buckets with chaining and does not rehash; the BST is not self-balancing; the Boolean Set uses a fixed universe of 16 values and does not pack bits; the list-based Stack and Queue use a singly linked list with head and tail pointers, and the Deque uses a doubly linked list.

## Boolean-array Set

Choose **Set**, then **Boolean array (bounded domain)** in Learn mode. Every
value from 0 to 15 has its own slot. `true` means present; `false` means absent.
Operations highlight the addressed slot even when the value is absent or an
addition repeats an existing member. A maintained count provides `size` and
`isEmpty()` without scanning the array.

This representation fits small, fixed domains with a known index for each
possible value, such as seat numbers or vertex IDs. It reserves a slot for every
possible value, so a large or sparse domain can waste space even when the set
has few members. Let U be the domain size and n the member count: storage and
initialization are Θ(U), and clearing or listing members scans Θ(U) slots.
This model uses Boolean entries, not a packed bitset or a byte-size estimate.

Learn mode preserves the broader integer domain of hash table and BST. Compare
mode restricts all three Sets to `0..15` and rejects invalid input before changing
any implementation or its history. The 13-operation workload includes zero,
collisions, a duplicate addition, deletion, a failed membership check, and
`isEmpty()`. Its final members are `{0, 3, 5, 7, 8, 9, 12}`. Load example runs only
the insertion operations, so its eight members also include 14.

The Boolean model counts one entry read for membership or a no-op, one read plus
one write for a changed entry, and one member-count read for `isEmpty()`. Scalar
count updates, initialization, and diagram rendering are excluded from the
workload bars. The cost note states these exclusions beside the comparison.
The quiz compares a large sparse domain with a small fixed domain.

Run `node --test tests/*.test.cjs` from `interactive/` for algorithm checks.

## Files
- `index.html`: shell
- `style.css`: visual style from [`../docs/style.md`](../docs/style.md) (white background, charcoal titles, dark blue accent, green/red for correct/wrong)
- `impls.js`: the data structures (array, circular array, linked list, hash table, BST, Boolean Set, heap) with step counting
- `adts.js`: ADT catalog: operation names, implementations, cost facts, workloads
- `app.js`: the four modes, comparison input validation, and quiz

## Next
Optional video versions (Hyperframes and Remotion) reusing `impls.js` and `adts.js` plus the same design tokens, for comparison.
