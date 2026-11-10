# Interactive teaching lab

This independent repository owns the deployable, build-free visualization bundle.
Keep course plans and implementation records in the parent workspace's planning repository.

- Prioritize ADTs, data structures, and algorithms in DSA lessons. Do not add C++ memory, pointer, ownership, or Rule-of-Three lessons.
- Present priority queues as ADTs; show heap storage only in lessons specifically about heaps.
- Heights count edges throughout: empty tree −1, leaf 0.
- Use `%` for remainder notation; explain any negative-key adjustment separately.
- Keep deterministic algorithms in `lesson-algorithms.js` independent of the DOM and recorded playback.
- Edit `catalog.json`, then run `python3 scripts/sync_catalog.py` to refresh the static hub, navigation, and browser catalog. The deployed bundle requires no build step.
- Run `node --test tests/*.test.cjs` for algorithm changes, then inspect affected pages in a browser.
- Do not commit without an explicit user request.
