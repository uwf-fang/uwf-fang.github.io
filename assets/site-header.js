{
  const menu = document.querySelector('.site-header .menu-toggle');
  const navigation = document.getElementById(menu.getAttribute('aria-controls'));

  function setMenuExpanded(expanded) {
    menu.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('open', expanded);
    menu.textContent = expanded ? 'Close' : 'Menu';
  }

  menu.addEventListener('click', () => {
    setMenuExpanded(menu.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenuExpanded(false);
      menu.focus();
    }
  });
}
