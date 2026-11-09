# DSA Interactive Demonstrations Bundle

This directory is a **self-contained, standalone static web application bundle** designed to be dropped directly into any web server or Sphinx documentation project.

Navigation and bundled assets use **relative paths**, requiring no server-side build steps or external JavaScript dependencies. Pages request optional Google Fonts and use local system-font fallbacks when those fonts are unavailable.

---

## Interface consistency

See [the interface review and control guide](UI-GUIDE.md) for button roles, playback behavior, accessibility rules, per-lab findings, and verification scope. Shared control styling and state presentation live in `lab-ui.css` and `lab-ui.js`.

## Browsing the lab

Open `index.html` to browse sixteen demonstrations across Foundations, Misc. data structures, Trees, Graphs, Sorting, Algorithm analysis, and Case studies. Search and topic filters can be combined. Trees and graphs have dedicated groups; Misc. data structures currently covers hashing. Case studies groups Huffman coding, bin packing, and maximum subarray around the problems they solve. Asymptotic bounds and recurrence trees remain in Algorithm analysis. With JavaScript disabled, the hub still displays all demonstration links.

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

These additions received source review. Browser interaction and automated regression tests have not been run for this batch. The earlier verification record in `UI-GUIDE.md` describes the original ten labs only.
