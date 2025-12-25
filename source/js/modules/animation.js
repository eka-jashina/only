const animBlocks = document.querySelectorAll('.anim-block');

if (animBlocks.length > 0) {
  const animationObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const el = entry.target;

      if (el.classList.contains('anim-once')) {
        el.classList.add('animate');
        obs.unobserve(el);
        return;
      }

      el.classList.remove('animate');
      void el.offsetWidth;
      el.classList.add('animate');
    });
  }, { threshold: 0.3 });

  animBlocks.forEach((el) => animationObserver.observe(el));
}
