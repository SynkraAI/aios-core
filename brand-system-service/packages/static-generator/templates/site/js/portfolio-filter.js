/* Portfolio Filtering — Vanilla JS, no framework dependency */
(function () {
  'use strict';

  var filterButtons = document.querySelectorAll('[data-filter]');
  var portfolioCards = document.querySelectorAll('[data-category]');

  if (!filterButtons.length || !portfolioCards.length) return;

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var category = btn.dataset.filter;

      // Update active state
      filterButtons.forEach(function (b) {
        b.classList.remove('portfolio-filters__btn--active');
      });
      btn.classList.add('portfolio-filters__btn--active');

      // Filter cards
      portfolioCards.forEach(function (card) {
        if (category === 'all' || card.dataset.category === category) {
          card.hidden = false;
          card.style.display = '';
        } else {
          card.hidden = true;
          card.style.display = 'none';
        }
      });
    });
  });
})();
