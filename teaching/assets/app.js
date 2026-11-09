const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
  menu.textContent = expanded ? 'Close' : 'Menu';
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.click();
    menu.focus();
  }
});

const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(' ').includes(button.dataset.filter);
    if (!card.hidden) count++;
  });
  document.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
}));

const stepButton = document.querySelector('[data-step]');
if (stepButton) {
  const nodes = [...document.querySelectorAll('.hero-tree .node')];
  const sequence = [0, 1, 2, 3, 4, 5, 6];
  let current = -1;
  stepButton.addEventListener('click', () => {
    current++;
    if (current >= sequence.length) current = -1;
    nodes.forEach((node, index) => {
      const position = sequence.indexOf(index);
      node.classList.toggle('active', current >= 0 && position === current);
      node.classList.toggle('visited', current >= 0 && position < current);
    });
    document.querySelector('[data-traversal-status]').textContent = current < 0 ? 'Explore a tree, one step at a time.' : `Step ${current + 1} of 7 · Visit node ${nodes[sequence[current]].dataset.value}`;
    stepButton.textContent = current === 6 ? 'Reset ↺' : 'Next step →';
    document.querySelector('[data-visit-order]').textContent = current < 0 ? 'READY TO EXPLORE' : sequence.slice(0, current + 1).map(i => nodes[i].dataset.value).join('  →  ');
  });
}
