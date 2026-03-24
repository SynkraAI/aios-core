/* Hamburger Menu Toggle — Vanilla JS, no framework dependency */
(function () {
  'use strict';

  var hamburger = document.querySelector('[data-hamburger-toggle]');
  var overlay = document.getElementById('nav-overlay');

  if (!hamburger || !overlay) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('nav-overlay--open');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('nav-overlay--open');
    document.body.classList.remove('nav-open');
  }

  hamburger.addEventListener('click', function () {
    var isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('nav-overlay--open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Close when clicking overlay links
  overlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });
})();
