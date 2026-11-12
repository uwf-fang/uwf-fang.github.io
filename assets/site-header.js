{
  const menu = document.querySelector('.site-header .menu-toggle');
  const navigation = document.getElementById(menu.getAttribute('aria-controls'));
  const projects = navigation.querySelector('.nav-projects');

  function setMenuExpanded(expanded) {
    menu.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('open', expanded);
    menu.textContent = expanded ? 'Close' : 'Menu';
    if (!expanded && projects) {
      projects.open = false;
    }
  }

  menu.addEventListener('click', () => {
    setMenuExpanded(menu.getAttribute('aria-expanded') !== 'true');
  });

  projects?.addEventListener('focusout', event => {
    if (event.relatedTarget && !projects.contains(event.relatedTarget)) {
      projects.open = false;
    }
  });

  document.addEventListener('click', event => {
    if (projects?.open && !projects.contains(event.target)) {
      projects.open = false;
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    if (projects?.open) {
      projects.open = false;
      projects.querySelector('summary').focus();
    } else if (menu.getAttribute('aria-expanded') === 'true') {
      setMenuExpanded(false);
      menu.focus();
    }
  });
}
