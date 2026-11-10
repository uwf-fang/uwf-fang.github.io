# Lab interface review and control guide

Reviewed October 21, 2026. This review covers all ten demonstrations and the hub: visual treatment, button roles, interaction states, input feedback, keyboard access, navigation, and responsive layout.

The collection already shared a white background and educational diagram style. The main inconsistency was behavioral: the same-looking controls could generate data, begin an operation, advance it, or remain active after there was nothing left to do. A shared presentation and playback layer now makes those roles explicit.

## Button strategy

| Role | Appearance | Behavior |
| --- | --- | --- |
| Step / Visit next / Next | Filled dark blue | Advance the current lesson by one explained action. Only available when that action is possible. |
| Begin add/remove/search; Start traversal | Blue outline | Prepare an operation. Begin does not mutate the data; Step performs its first action. |
| Play / Pause | Blue outline; tinted while playing | Continue the current operation automatically, or pause after its current action. No restart or data regeneration. |
| Reset | Neutral outline | Return to the start using the same configured inputs. |
| New deck / Generate random… / Fill sample | Neutral outline | Create a new example. Deliberately distinct from Reset. |
| Clear heap / Clear tree | Red outline | Remove all data from the current sandbox. |
| Topic, mode, and implementation choices | Neutral or blue outline; blue tint and underline when selected | Change the view or mode. Selected state is also exposed through `aria-pressed`. |
| Zoom / Fit | Compact outlined controls within the diagram panel | Change the view without changing the data or algorithm. |

Primary actions share the same dark blue, typography, border radius, and 44-pixel minimum height. Diagram view controls use a 36-pixel minimum. All interactive controls have a visible keyboard focus ring. Green and red communicate success or error together with text, rather than serving as primary action colors.

## Interaction contract

- Controls follow the order **Set up → Choose an operation → Step through** where a lab has separate operations. Simpler algorithm lessons place settings before **Step → Play → Reset**.
- Step advances one meaningful action. The granularity is stated in the page: a comparison or swap in sorting, one key insertion in hashing, one item placement in packing, one merge in Huffman, and one comparison or link change in a BST.
- While Play is running, manual stepping is disabled and the button becomes Pause. At completion, both Step and Play are disabled. The visible playback state explains whether the lesson is ready, playing, completing an animation, or finished.
- A paused asynchronous sorting action finishes safely. Reset and setup changes are temporarily unavailable during that action so an old animation cannot modify a newly reset deck.
- Changing a dataset or algorithm starts a fresh run. Clear or generation may replace a pending sandbox operation. Begin buttons are unavailable during a pending heap/BST operation.
- Invalid input receives visible feedback and disables progression. Huffman never silently substitutes its default dataset, and hashing never silently drops or truncates malformed keys.
- Playback speed moves from slow on the left to fast on the right. Reset does not change it.
- Results and errors use an appropriate live status region. The card workbench supports Enter/Space selection as well as mouse and drag interactions.
- The shared Browse labs menu closes with Escape or an outside click. Hub navigation and all bundle assets remain relative paths.

## Review by demonstration

| Demonstration | Findings and corrections |
| --- | --- |
| ADT Explorer | Aligned colors, fonts, button dimensions, and selected-mode styling. Added selected-state semantics, live operation output, and disabled quiz answers after submission. Correctness feedback stays legible. Narrow-screen controls wrap; wide comparison tables scroll inside the stage. |
| Problem Types & Paradigms | Mode selectors now look like choices rather than primary actions, expose their selected state, wrap on narrow screens, and announce the changing explanation. |
| Card Sort | Play/Pause and terminal states now follow the shared rules. Serialized asynchronous stepping and invalidated old playback loops. Reset preserves the initial deck; New deck generates another. Setup is protected during animation. |
| Card Sorting Workbench | Cards toggle independently to select any subgroup, with a visible selection count. Swap is the primary action and is enabled only for exactly two selected cards. Reset and New deck are distinct. Selection, Undo, and setup are protected during swapping. Cards support keyboard selection and visible focus. |
| Dijkstra | Stable Step/Play/Reset labels and shared completion behavior. Removed the lingering Finish label and disabled playback after completion. |
| Hash Table Lab | Standard Step/Play/Reset controls and speed adjustment. Invalid key lists receive immediate feedback. Each Step's insertion granularity is stated. Compact buckets sit beside the insertion trace on wide screens, with the trace directly above them on narrow screens. Buckets scroll within their panel; formula references follow the demonstration. |
| Binary Heap | Setup, operation, and playback controls are grouped. Begin add/remove now prepares only; Step performs append or removal before percolation. Invalid/unavailable controls are disabled. Corrected the text describing the values moving during a downward swap. A single horizontal array sits above the full-width tree, with the current step between the two views. Long arrays scroll horizontally. |
| BST & Traversals | Uses the same Begin/Step/Play rules as the heap. Prevents overlapping operations and inactive traversal steps. Changing traversal order recomputes the sequence. Random/skewed generation and zoom are retained. |
| Huffman Coding | Shared playback and completion rules; encoding becomes available after the tree is complete. Strict custom-frequency validation and escaped queue labels. Added the common zoom/Fit controls. |
| Bin Packing | Shared playback states, button roles, and reset semantics. Added a capacity bar per bin so load is explicit even though the item chips serve as labels. |
| Hub | Retained searchable topic cards and compact navigation. Navigation targets and focus behavior match the demonstrations. |

## Intentional differences

The ADT Explorer is a direct-operation sandbox, the card workbench is a manual practice tool, and the paradigm page is a conceptual lesson. They do not acquire artificial Play buttons. Their operations still use the same button roles, selection treatment, status feedback, and navigation.

Diagrams retain the visual encodings their topics need. A heap comparison, a shortest-path relaxation, and a packed item should not be forced into one diagram format. Consistency comes from the surrounding controls and from explaining each visual state.

## Verification of the original ten labs

- Inspected the initial control state of every demonstration in a desktop browser and checked all ten at a 390-pixel viewport.
- Verified completion and disabled playback in bin packing, hashing, Huffman, Dijkstra, and insertion sort; checked Play/Pause and preserving the same deck on Reset.
- Exercised heap preparation, append, percolation, and removal; exercised BST insertion, two-child removal through a successor, and traversal switching.
- Checked invalid hashing/Huffman inputs, ADT sample/workload/quiz interactions, paradigm selection, keyboard card selection, and Escape navigation.
- Checked 189 local asset/navigation targets and syntax in 14 inline or external JavaScript sources.

These are interface and focused regression checks, not an exhaustive proof of every algorithm or every possible input.

## Maintaining the system

`lab-ui.css` owns shared control presentation. `lab-ui.js` receives playback state explicitly from each algorithm controller and reflects selected modes for accessibility. Mark controls with `data-ui-role` instead of introducing new meanings for blue buttons. Keep algorithm state and stepping in the individual demonstration; do not infer it from button text or DOM mutation.

## Additional lab interaction conventions

- The six active added pages share `explorer.css`; five share recorded-state playback through `FramePlayer` in `explorer.js`. Each HTML page supplies its own algorithm states.
- Back revisits the previous action; Reset replays the current example or operation. Changing setup replaces the example. Play has the same Pause/completion semantics as the existing labs.
- Graphs put the trace beside the drawing. AVL, recurrence, and maximum subarray put the trace immediately above their principal diagram. Wide matrices, arrays, node memory, and trees scroll inside their own panels.
- The bounds lab uses immediate parameter feedback instead of artificial playback. Finite sample checks and analytic asymptotic relationships are labeled separately.
- The expanded hub has sixteen labs across seven topics: Foundations, Misc. data structures, Trees, Graphs, Sorting, Algorithm analysis, and Case studies; Browse labs includes every page, including from the nested ADT Explorer.
- The six active additions have received source review; this batch has not undergone browser interaction or automated regression testing.

## November 10, 2026 expansion verification

The collection now has 25 active labs. DSA content emphasizes ADTs and algorithms. Priority-queue lessons do not imply a heap storage layout; heap-specific lessons retain synchronized tree/array views. Heights consistently count edges: empty −1 and leaf 0. Hash formulas use `%`; negative-key adjustment is explained separately.

All labs have optional conceptual questions and challenges. New recorded lessons additionally present next-step prediction at relevant states. Questions never block stepping or autoplay. Compact view reduces setup space. Input links preserve configured values rather than arbitrary random/sandbox states.

New algorithm regression checks cover LCS against independent subsequence enumeration; matrix-chain DP against exhaustive splits; N-Queens solution counts; recursion results; amortized accounting; both heap orders and sorting; lexer/parser/evaluation cases; packing against exhaustive assignments; and hash tombstones/rehashing. Syntax and catalog checks are included.

Browser checks cover all 25 pages and shared activities; course/chapter filtering; new-lesson completion and Reset; LCS prediction/traceback; List ADT puzzle operations; hash search past a tombstone; Huffman encode/decode; bin-packing lower-bound/optimum comparison; heap/BST edge heights; BST Back; the four-rotation AVL deletion cascade; circular queue/deque models; and sorting replay. Representative new and old labs were checked at a 390-pixel viewport without page-wide horizontal overflow. These are focused checks, not an exhaustive accessibility, browser, or input proof.

### ADT workload clarification

Compare mode lists every supplied operation and its input values in numbered execution order before running. Each Run workload starts from empty implementations and resets the counters. Individual operation controls continue the current state. Every cost bar is a keyboard-operable button labeled by operation number and counted cost; selecting it shows the recorded result/explanation in all implementation panels while diagrams retain the latest state. Growth events are orange and labeled Resize.

The circular queue starts at capacity 6 and doubles when full. In its sample workload, enqueue(7) copies six existing elements and writes the new item for seven counted steps. Ordinary wraparound reuses slots with no copying. Browser checks covered all seven ADT workloads, operation selection, repeat-run/reset behavior, and the narrow-screen comparison layout. Focused tests cover valid supplied workloads and FIFO preservation across wraparound and growth.

### Problem statements, recursive arguments, and compact cost bars

The packing example states the current problem above its answers for all five modes. All subsets satisfy the 5 kg weight limit; Decision requires at least $12, while Search requires at least $10 (inclusive). Enumeration/counting explicitly include the empty bag and impose no value minimum.

Recursive search displays full signatures and arguments in pseudocode, call-stack entries, pending calls, and call-tree labels: `linearSearch(a, size, target, i)` and `binarySearch(a, size, target, lo, hi)`. Binary bounds are inclusive. ADT cost bars are narrower and frameless, retaining cost labels, operation numbers, resize color, selection underline, keyboard focus, and recorded explanations.

### Playback access while scrolling

All 21 playback lessons have a shared floating playback row. It appears at the bottom of the viewport when the original Play control scrolls above the viewport, and hides when the original row returns. It forwards Back, Step/Visit next, Play/Pause, and speed input to the existing controls; it does not maintain a second algorithm state. Enabled states, playback labels, speed, and status stay synchronized. Extra bottom space allows the final content to scroll clear of the row.

Both rows display the keyboard hint: Left Arrow for Back, Right Arrow for Step, and Space for Play/Pause outside controls. Text inputs, textareas, selects, sliders, editable content, modified shortcuts, and native Space activation retain their normal behavior. BST resolves Step to the active operation or traversal action. Conceptual lessons and manual sandboxes receive no artificial playback row.

Verification includes direct scroll jumps past the original row, a 390-pixel viewport, enabled-state synchronization on recorded LCS playback, heap Back/Step/Space play-pause and speed forwarding, and BST traversal dispatch. The shared scroll check handles jumps from below to above the viewport as well as ordinary scrolling; viewport observers alone can miss that case.
