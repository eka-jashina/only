function createSlider(container) {
  const track = container.querySelector('.slider__track');
  const slides = Array.from(container.querySelectorAll('.slider__slide'));
  const pagination = container.querySelector('.slider__pagination');

  let current = 0;
  let bullets = [];

  let startX = 0;
  let startY = 0;
  let startTranslate = 0;
  let currentTranslate = 0;

  let isDragging = false;
  let hasMoved = false;
  let startTime = 0;

  // вспомогательные функции

  const getPoint = (e) =>
    e.type.includes('mouse')
      ? { x: e.pageX, y: e.pageY }
      : { x: e.touches[0].clientX, y: e.touches[0].clientY };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateBullets = () => {
    bullets.forEach((b, i) =>
      b.classList.toggle('slider__bullet--active', i === current)
    );
  };

  const setSliderPosition = () => {
    track.style.transform = `translateX(${currentTranslate}px)`;
  };

  const goTo = (index, focusSlide = false) => {
    current = index;
    currentTranslate = -index * container.offsetWidth;
    track.style.transition = '';
    setSliderPosition();
    updateBullets();

    slides.forEach((slide) => {
      slide.removeAttribute('tabindex');
      slide.classList.remove('slider__slide--active');
    });

    const active = slides[current];
    active.classList.add('slider__slide--active');

    if (focusSlide) {
      active.setAttribute('tabindex', '-1');
      active.focus();
    }
  };

  // логика свайпа

  function start(e) {
    const point = getPoint(e);

    startX = point.x;
    startY = point.y;
    startTranslate = currentTranslate;
    startTime = Date.now();

    isDragging = true;
    hasMoved = false;

    track.style.transition = 'none';
  }

  function move(e) {
    if (!isDragging) {
      return;
    }

    const point = getPoint(e);
    const diffX = Math.abs(point.x - startX);
    const diffY = Math.abs(point.y - startY);

    if (diffX > 5 || diffY > 5) {
      hasMoved = true;
    }

    if (diffY > diffX && diffY > 10) {
      isDragging = false;
      return;
    }

    if (diffX > diffY && diffX > 10) {
      e.preventDefault();

      const diff = point.x - startX;
      const width = container.offsetWidth;

      const max = 0;
      const min = -(slides.length - 1) * width;

      currentTranslate = clamp(startTranslate + diff, min, max);

      setSliderPosition(false);
    }
  }

  function end() {
    if (!isDragging) {
      return;
    }
    isDragging = false;

    if (!hasMoved) {
      hasMoved = false;
      return;
    }

    const movedBy = currentTranslate - startTranslate;
    const isFast = Date.now() - startTime < 300;

    if (Math.abs(movedBy) > 50 || (Math.abs(movedBy) > 20 && isFast)) {
      if (movedBy < 0 && current < slides.length - 1) {
        current++;
      } else if (movedBy > 0 && current > 0) {
        current--;
      }
    }

    goTo(current);

    setTimeout(() => (hasMoved = false), 80);
  }

  // инициализация
  function init() {
    if (container.dataset.sliderInit === 'true') {
      return;
    }
    container.dataset.sliderInit = 'true';

    // делаем слайдер фокусируемым
    container.tabIndex = 0;
    container.setAttribute('role', 'region');
    container.setAttribute('aria-roledescription', 'carousel');
    container.setAttribute('aria-label', 'Слайдер');

    // пагинация
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'slider__bullet';
      if (i === 0) {
        btn.classList.add('slider__bullet--active');
      }
      btn.addEventListener('click', () => goTo(i, true));
      pagination.appendChild(btn);
    });

    bullets = Array.from(pagination.children);

    // свайпы
    container.addEventListener('mousedown', start, { passive: false });
    container.addEventListener('touchstart', start, { passive: false });
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', end);
    document.addEventListener('touchend', end);

    // клавиатура
    container.addEventListener('keydown', (e) => {
      const el = document.activeElement;
      const tag = el.tagName.toLowerCase();
      if (['a', 'button', 'input', 'textarea', 'select'].includes(tag)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (current < slides.length - 1) {
          goTo(current + 1, true);
        }
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (current > 0) {
          goTo(current - 1, true);
        }
      }
    });
  }

  return { init };
}

export { createSlider };
