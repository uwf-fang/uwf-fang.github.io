# DSA Interactive Demonstrations Bundle

This directory is a **self-contained, standalone static web application bundle** designed to be dropped directly into any web server or Sphinx documentation project.

Navigation and bundled assets use **relative paths**, requiring no server-side build steps or external JavaScript dependencies. Pages request optional Google Fonts and use local system-font fallbacks when those fonts are unavailable.

---

## Interface consistency

See [the interface review and control guide](UI-GUIDE.md) for button roles, playback behavior, accessibility rules, per-lab findings, and verification scope. Shared control styling and state presentation live in `lab-ui.css` and `lab-ui.js`.

## Browsing the lab

Open `index.html` to browse twenty-five demonstrations across Foundations, Misc. data structures, Trees, Graphs, Sorting, Algorithm analysis, and Case studies. Search and topic filters can be combined. Trees and graphs have dedicated groups; Misc. data structures currently covers hashing. Case studies groups Huffman coding, bin packing, and maximum subarray around the problems they solve. Asymptotic bounds and recurrence trees remain in Algorithm analysis. With JavaScript disabled, the hub still displays all demonstration links.

Every demonstration has an All demonstrations link and a compact Browse labs menu. The menu groups links by topic and supports keyboard navigation through the browser's native disclosure control.

The earlier five additions live in this folder: `hash-table-lab.html`, `binary-heap-visualizer.html`, `bst-traversal-visualizer.html`, `huffman-coding.html`, and `bin-packing.html`. These are the canonical copies to edit or deploy.

## Directory Structure

```
interactive/
├── index.html                 <- Master Interactive Hub (entry point)
├── hash-table-lab.html        <- Hashing, collision resolution & load factor
├── binary-heap-visualizer.html <- Priority queue operations, tree & array
├── bst-traversal-visualizer.html <- BST operations, traversals & tree zoom
├── huffman-coding.html        <- Huffman tree construction & encoding
├── bin-packing.html           <- Online & offline packing heuristics
├── graph-traversal.html       <- BFS/DFS, frontier, parents & discovery order
├── graph-representations.html <- Matrix/list storage & operation comparison
├── asymptotic-bounds.html     <- Big O, Theta & Omega bounds
├── recurrence-tree.html       <- Divide-and-conquer tree & level sums
├── maximum-subarray.html      <- Brute force, divide/conquer & Kadane
├── avl-rotation.html          <- AVL insertion/deletion/search & rotations
├── explorer.js               <- Shared frame player, graph & tree drawing
├── explorer.css              <- Shared layouts for the six active additions
├── shared-nav.css             <- Shared course navigation bar & style tokens
├── card-sort.html             <- Automated Card Sort Visualizer (stability tracking)
├── movable-cards.html         <- Hands-on Card Sorting Practice Workbench
├── dijkstra.html              <- Single-Source Dijkstra Shortest Path Visualizer
├── problem-type-paradigm.html <- Problem Types & Algorithmic Paradigms Explorer
├── adt-overview/              <- 7-ADT Comparative Explorer
│   ├── index.html             <- ADT Explorer entry page
│   ├── app.js                 <- ADT UI controller & quiz logic
│   ├── adts.js                <- ADT definitions & workloads
│   ├── impls.js               <- Underlying data structure implementations
│   └── style.css              <- ADT Explorer styling
└── README.md                  <- This guide (Sphinx integration instructions)
```

---

## Sphinx Integration Guide

You can easily integrate this entire `interactive/` folder into your Sphinx documentation website using one of the following methods:

### Method 1: Drop into Sphinx `_static/` Directory (Recommended)

1. Copy the entire `interactive/` folder into your Sphinx project's static folder:
   ```bash
   cp -r interactive/ /path/to/sphinx-project/_static/
   ```

2. In your Sphinx `conf.py`, ensure the static path is configured:
   ```python
   html_static_path = ['_static']
   ```

3. Link to the hub or individual tools from any documentation page:
   * **In reStructuredText (`.rst`)**:
     ```rst
     * `DSA Interactive Hub <_static/interactive/index.html>`_
     * `Card Sort Visualizer <_static/interactive/card-sort.html>`_
     * `Dijkstra Visualizer <_static/interactive/dijkstra.html>`_
     * `Problem Paradigms <_static/interactive/problem-type-paradigm.html>`_
     * `ADT Explorer <_static/interactive/adt-overview/index.html>`_
     ```
   * **In MyST Markdown (`.md`)**:
     ```markdown
     - [DSA Interactive Hub](_static/interactive/index.html)
     - [Card Sort Visualizer](_static/interactive/card-sort.html)
     - [Dijkstra Visualizer](_static/interactive/dijkstra.html)
     ```

### Method 2: Embed Directly in Sphinx Pages via `<iframe>`

If you want an interactive demo embedded inline inside a Sphinx documentation page:

* **In reStructuredText (`.rst`)**:
  ```rst
  .. raw:: html

     <iframe src="_static/interactive/card-sort.html" width="100%" height="750px" style="border: 1.5px solid #1E2022; border-radius: 8px;"></iframe>
  ```

* **In MyST Markdown (`.md`)**:
  ```html
  <iframe src="_static/interactive/card-sort.html" width="100%" height="750px" style="border: 1.5px solid #1E2022; border-radius: 8px;"></iframe>
  ```

---

## Design System & Compliance

The bundle follows the supplied white-background educational style:
- **Background**: Pure `#FFFFFF` without texture
- **Typography**: Montserrat (headings), Roboto (body), Courier Prime (code/metrics) via Google Fonts
- **Palette**: Dark charcoal (`#1E2022`), Dark Blue (`#003366`), Dark Green (`#1E5631`), Dark Red (`#8B0000`)
- **Outlines**: Minimalist 1.5px solid line-art borders

## Additional teaching labs

The six active additions use the supplied white-background style, local shared controls, responsive panels, accessible form labels, and visible input errors. Five use Back/Step/Play/Reset; the asymptotic-bounds lab updates immediately as its parameters change. Back and Reset restore recorded states, including the same input graph or tree. Each AVL operation must complete before another begins; setup buttons can replace the operation with a fresh dataset.

| Page | Scope and model |
| --- | --- |
| `graph-traversal.html` | BFS queue and recursive DFS call stack; alphabetical neighbors; editable simple directed/undirected graphs; optional traversal forest for disconnected components; parent, distance/depth, discovery and completion records. |
| `graph-representations.html` | The same graph as matrix and sorted adjacency lists; sparse/dense/disconnected presets; sequential edge lookup and neighbor enumeration; logical storage counts and inspected-entry costs. No weighted edges or self-loops. |
| `asymptotic-bounds.html` | O/Theta/Omega for known positive growth functions; adjustable constants and threshold; finite counterexamples separated from analytic classification by limiting growth. Optional logarithmic cost axis. |
| `recurrence-tree.html` | T(n) = aT(n/b) + n^c (log_b n)^k, T(1)=1, and n=b^L; exact level sums and Master-method classification. Wide levels collapse visually while retaining exact counts. |
| `maximum-subarray.html` | Nonempty maximum subarray using quadratic incremental brute force, divide and conquer, and Kadane. Identical tie-breaking: earliest start, then earliest end. Counts measure element-sum additions only. |
| `avl-rotation.html` | Insert/remove/search, LL/RR/LR/RL presets and a deletion case; bottom-up balance checks; separate single-rotation frames; unique keys; up to 20 nodes. Height(empty)=−1, height(leaf)=0 (edge count), and BF=height(left)-height(right). |

The algorithm controllers are inline in their HTML pages; `explorer.js` handles recorded-state playback and SVG presentation. They use no external JavaScript libraries and work as static files or through the same static server as the existing bundle. B-tree work is deferred.

The initial six-lab addition received source review. The November 10 expansion adds algorithm regression tests and browser interaction checks; see the current verification record in `UI-GUIDE.md`.

## November 2026 teaching expansion

The hub now contains **25 labs** with keyword, topic, course, and chapter filters. All labs include a learning objective, a conceptual question with feedback, an optional challenge, a compact teaching view, and input-settings links. Randomly generated states are not included in settings links. DSA lessons focus on ADTs, data structures, and algorithms; C++ memory, pointer, and ownership lessons are outside scope.

| New lab | Main interaction |
| --- | --- |
| [Recursion Call Stack](recursion-explorer.html) | Recursive linear/binary search and Fibonacci; active calls, pending work, returns, and complete call tree |
| [List ADT Sequence Puzzles](list-adt-puzzle.html) | Rotate, reverse, and interleave sequences using remove and insert operations |
| [N-Queens Backtracking](n-queens.html) | Predict candidate safety, inspect conflicts, prune, backtrack, and enumerate solutions for N=3–6 |
| [LCS & Traceback](lcs.html) | Naive recursion, memoization, tabulation, cell predictions, and subsequence reconstruction |
| [Matrix-Chain Multiplication](matrix-chain.html) | Candidate split costs, triangular DP tables, and optimal parentheses/tree |
| [Amortized Array Growth](amortized-array.html) | Actual/total costs, doubling versus fixed increments, and potential accounting |
| [Heapify & Heapsort](heapify-heapsort.html) | Bottom-up heapify, repeated root removal, heap/array views, and construction-cost comparison |
| [Calculator Lexer](lexer-explorer.html) | Character-level scanning, typed token spans, and lexical errors |
| [Grammar, Parse Tree & AST](grammar-explorer.html) | Leftmost/rightmost derivations, precedence/associativity, and AST evaluation with variable bindings |

Existing labs also gain targeted improvements: consistent edge-count heights (empty −1, leaf 0), a Priority Queue ADT presentation in Dijkstra, individual hash probes/search/deletion/tombstones/rehashing with `%` formulas, circular queue/deque models, sorting pseudocode and replay, named BST deletion cases, AVL rotation prediction and a deletion cascade, graph frontier questions, Huffman decoding, exact small-instance packing comparisons, and Kadane state/cost views.

### Running and checking

No package installation or build is required. Serve the bundle directly:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/`. For development:

```sh
node --test tests/*.test.cjs
python3 scripts/sync_catalog.py
```

`catalog.json` owns titles, course/chapter mappings, objectives, questions, explanations, and challenges. The sync script refreshes the static hub/navigation and `lab-catalog.js`; users can still browse all links without JavaScript. `lesson-algorithms.js` contains deterministic models, `lesson-pages.js` renders the new lessons, and `legacy-lessons.js` extends existing diagrams. Keep the entire bundle together.

Follow-up topics remain deferred: radix sort, MST, topological ordering, B-trees, Bellman–Ford/Floyd–Warshall, combinatorics, randomized trials, genetic algorithms, and dedicated LL(1)/LR parser traces. The old pointer-workbench draft remains withdrawn.

### Playback without scrolling back to setup

In playback lessons, Back, Step, Play/Pause, and speed float at the bottom when the original controls scroll out of view. The original and floating controls stay synchronized. A visible hint also documents **← Back**, **→ Step**, and **Space Play/Pause** outside form controls. Typing and native slider/button keys are preserved.
