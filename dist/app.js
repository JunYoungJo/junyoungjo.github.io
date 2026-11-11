(() => {
  'use strict';
  const doc = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ } };
  const setTheme = theme => {
    doc.dataset.theme = theme;
    if (themeButton) {
      themeButton.setAttribute('aria-label', theme === 'dark' ? themeButton.dataset.lightLabel : themeButton.dataset.darkLabel);
      themeButton.title = themeButton.getAttribute('aria-label');
    }
  };
  setTheme(doc.dataset.theme || (scheme.matches ? 'dark' : 'light'));
  themeButton?.addEventListener('click', () => {
    const next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    write('portfolio-theme', next); setTheme(next);
  });
  scheme.addEventListener('change', event => { if (!read('portfolio-theme')) setTheme(event.matches ? 'dark' : 'light'); });
  document.querySelector('[data-language]')?.addEventListener('click', event => write('portfolio-language', event.currentTarget.dataset.language));

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuButton && nav) {
    doc.classList.add('js-menu');
    const closeMenu = () => { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.header-inner')) closeMenu(); });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  }

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    doc.classList.add('js-motion');
  }

  document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-preview]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
    document.querySelectorAll('[data-preview-panel]').forEach(panel => { panel.hidden = panel.dataset.previewPanel !== button.dataset.preview; });
  }));

  const directory = document.querySelector('[data-directory]');
  if (directory) {
    const search = directory.querySelector('[data-search]');
    const sort = directory.querySelector('[data-sort]');
    const grid = directory.querySelector('[data-project-grid]');
    const cards = [...grid.querySelectorAll('[data-project]')];
    const count = directory.querySelector('[data-result-count]');
    let status = 'all';
    const update = () => {
      const term = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach(card => {
        card.hidden = !(status === 'all' || card.dataset.status === status) || !card.dataset.search.includes(term);
        if (!card.hidden) visible++;
      });
      const ordered = sort.value === 'name' ? [...cards].sort((a,b) => a.dataset.name.localeCompare(b.dataset.name)) : cards;
      ordered.forEach(card => grid.append(card));
      count.textContent = `${visible} ${count.dataset.label}`;
      directory.querySelector('[data-empty]').hidden = visible !== 0;
    };
    directory.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      status = button.dataset.filter;
      directory.querySelectorAll('[data-filter]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
      update();
    }));
    search.addEventListener('input', update); sort.addEventListener('change', update);
    directory.querySelector('[data-reset]').addEventListener('click', () => {
      status = 'all'; search.value = ''; sort.value = 'default';
      directory.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
      update(); search.focus();
    });
    update();
  }

  const cover = document.querySelector('[data-cover]');
  if (cover) {
    const original = cover.dataset.src;
    document.querySelectorAll('[data-screen-theme]').forEach(button => button.addEventListener('click', () => {
      const src = button.dataset.screenTheme === 'light' ? cover.dataset.lightSrc : original;
      cover.querySelector('img').src = src; cover.dataset.src = src;
      document.querySelectorAll('[data-screen-theme]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
    }));
  }

  const dialog = document.querySelector('.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    let returnFocus;
    document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
      returnFocus = button;
      const img = dialog.querySelector('img'); img.src = button.dataset.src; img.alt = button.dataset.alt;
      dialog.querySelector('p').textContent = button.dataset.alt;
      dialog.showModal(); document.body.classList.add('modal-open');
    }));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); returnFocus?.focus({ preventScroll: true }); });
  }
})();
