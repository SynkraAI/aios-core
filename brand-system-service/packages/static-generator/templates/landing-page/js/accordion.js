/* FAQ Accordion — Vanilla JS, no framework dependency */
(function () {
  'use strict';

  document.querySelectorAll('[data-accordion-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      var panel = document.getElementById(btn.dataset.target);
      if (panel) {
        panel.hidden = expanded;
      }
    });
  });
})();
