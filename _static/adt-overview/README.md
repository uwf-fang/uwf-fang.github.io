# ADT Overview: Seven ADTs and Their Implementations

Interactive, framework-free HTML demo. Open `index.html` in a browser (no build step).

## Modes
1. **Learn**: pick an ADT, pick one implementation, run the operations, and see the picture, the explanation and the cost in steps.
2. **Compare implementations**: every implementation of the chosen ADT receives the same operations side by side, with step counters and a per-operation bar chart. "Run workload" replays a prepared sequence that shows the trade-offs.
3. **Cheat sheet**: all ADTs, who decides what leaves, the operations, and the cost of each implementation.
4. **Quiz**: ten questions, seven on choosing the ADT and three on choosing the implementation, followed by an end-of-quiz review list of all questions, answers, and explanations.

A *step* is one element read, written, shifted or compared, or one link followed. It is a teaching measure, not a timing benchmark.

## Operation names (aligned to the course)
| ADT | Operations |
|---|---|
| List | `append(v)`, `insertBefore(i, v)`, `remove(i)`, `get(i)` |
| Stack | `push(v)`, `pop()`, `peek()` |
| Queue | `enqueue(v)`, `dequeue()`, `peek()` |
| Deque | `enQueueFront(v)`, `enQueueBack(v)`, `deQueueFront()`, `deQueueBack()` |
| Map | `put(k, v)`, `get(k)`, `remove(k)` (keys and values are integers) |
| Set | `add(v)`, `remove(v)`, `contains(v)` (elements are integers) |
| Priority Queue | `enqueue(x, p)`, `dequeue()`, `peek()` (smallest priority number leaves first) |

## Implementations covered
| ADT | Implementations | Notes |
|---|---|---|
| List | Partially filled array, linked list | Array: O(1) `get`, O(n) insert/remove by shifting. Linked: O(1) at the ends, O(n) walk to reach an index. |
| Stack | Partially filled array, linked list | Both O(1): array works at the end, linked list at the head. |
| Queue | Partially filled array, linked list, **circular** partially filled array | Plain array makes `dequeue` O(n); the circular array fixes this with modulo indices. |
| Deque | Partially filled array, (doubly) linked list | Array: front operations O(n). Doubly linked: all four O(1). |
| Map | Hash table, binary search tree | Hash: O(1) average, no order. BST: O(h), sorted keys, degenerates on sorted input. |
| Set | Hash table, binary search tree | Same trade-off as Map, with values only. |
| Priority Queue | Unsorted array, sorted array, binary heap | Dijkstra: unsorted array gives O(V²) (dense graphs), heap gives O((V+E) log V) (sparse graphs). |

Simplifications: the hash table has 7 fixed buckets with chaining and does not rehash; the BST is not self-balancing; the list-based Stack and Queue use a singly linked list with head and tail pointers, and the Deque uses a doubly linked list.

## Files
- `index.html`: shell
- `style.css`: visual style from [`../docs/style.md`](../docs/style.md) (white background, charcoal titles, dark blue accent, green/red for correct/wrong)
- `impls.js`: the data structures (array, circular array, linked list, hash table, BST, heap) with step counting
- `adts.js`: ADT catalog: operation names, implementations, cost facts, workloads
- `app.js`: the four modes

## Next
Optional video versions (Hyperframes and Remotion) reusing `impls.js` and `adts.js` plus the same design tokens, for comparison.
