//var apiPrefix = 'http://121.42.56.160/thulab/index.php/api/';
//var apiPrefix = 'http://139.224.191.140/thulab/index.php/api/';
var apiPrefix = 'http://182.92.169.58/thulab/index.php/api/';

(function () {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function initFooterReveal() {
    var footer = document.querySelector('.main-footer');
    if (!footer) return;

    var ticking = false;

    function update() {
      var rect = footer.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      var revealDistance = Math.min(footer.offsetHeight || 1, viewportHeight * 0.42);
      var visibleHeight = viewportHeight - rect.top;
      var progress = clamp(visibleHeight / revealDistance, 0, 1);

      footer.style.setProperty('--footer-progress', progress.toFixed(3));
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterReveal);
  } else {
    initFooterReveal();
  }
})();
