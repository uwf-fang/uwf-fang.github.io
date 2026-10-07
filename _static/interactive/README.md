# DSA Interactive Demonstrations Bundle

This directory is a **self-contained, standalone static web application bundle** designed to be dropped directly into any web server or Sphinx documentation project.

All assets, links, scripts, and stylesheets within this folder use strictly **relative paths**, requiring zero server-side build steps or external JavaScript dependencies.

---

## Directory Structure

```
interactive/
├── index.html                 <- Master Interactive Hub (entry point)
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

All modules in this bundle comply with [`../docs/style.md`](../docs/style.md):
- **Background**: Pure `#FFFFFF` without texture
- **Typography**: Montserrat (headings), Roboto (body), Courier Prime (code/metrics) via Google Fonts
- **Palette**: Dark charcoal (`#1E2022`), Dark Blue (`#003366`), Dark Green (`#1E5631`), Dark Red (`#8B0000`)
- **Outlines**: Minimalist 1.5px solid line-art borders
