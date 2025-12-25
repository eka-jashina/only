const videoWrapper = document.querySelector('.hero__video');

let scale = 1;
let targetScale = 1;
let phase = 'idle';

// утилиты

function applyScale() {
  videoWrapper.style.transform = `scale(${scale})`;
}

function getFullScreenScale() {
  const rect = videoWrapper.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const sw = vw / rect.width;
  const sh = vh / rect.height;

  return Math.max(sw, sh);
}

function animate() {
  const speed = 0.06;

  scale += (targetScale - scale) * speed;

  if (Math.abs(scale - targetScale) < 0.01) {
    scale = targetScale;
    phase = 'idle';
  }

  applyScale();

  if (phase !== 'idle') {
    requestAnimationFrame(animate);
  }
}

// логика

function grow() {
  targetScale = getFullScreenScale();
  phase = 'grow';
  requestAnimationFrame(animate);
}

function shrink() {
  targetScale = 1;
  phase = 'shrink';
  requestAnimationFrame(animate);
}

// обсерверы

function initVideoObservers(videoStart, videoEnd) {
  // --- START OBSERVER ---
  const observerGrow = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        grow();
      } else {
        shrink();
      }
    },
    {
      threshold: 0,
      rootMargin: '-50px 0px 0px 0px', // тот же start-offset
    }
  );

  // --- END OBSERVER ---
  const observerShrink = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        shrink();
      }
    },
    {
      threshold: 0,
      rootMargin: '0px 0px -300px 0px',
    }
  );

  observerGrow.observe(videoStart);
  observerShrink.observe(videoEnd);
}

export { initVideoObservers };
