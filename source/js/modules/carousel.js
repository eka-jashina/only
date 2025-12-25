function createCarousel(container) {
  const track = container.querySelector('.carousel__track');
  const slides = Array.from(track.children);
  const btnPrev = container.querySelector('.carousel__button--prev');
  const btnNext = container.querySelector('.carousel__button--next');
  const viewport = container.querySelector('.carousel__viewport');

  const slideWidth = slides[0].offsetWidth;
  const gap = parseFloat(getComputedStyle(track).gap);
  const step = slideWidth + gap;

  let index = 0;

  function visibleCount() {
    return Math.floor((viewport.offsetWidth + gap) / step);
  }

  function update() {
    track.style.transform = `translateX(${-index * step}px)`;

    const maxIndex = slides.length - visibleCount();

    btnPrev.disabled = index === 0;
    btnNext.disabled = index >= maxIndex;

    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-roledescription', `Показан слайд ${index + 1} из ${slides.length}`);
  }

  function goPrev() {
    if (index > 0) {
      index--;
      update();
    }
  }

  function goNext() {
    const maxIndex = slides.length - visibleCount();
    if (index < maxIndex) {
      index++;
      update();
    }
  }

  btnPrev.addEventListener('click', goPrev);
  btnNext.addEventListener('click', goNext);

  // Управление клавиатурой
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  });

  window.addEventListener('resize', update);

  update();
}

export { createCarousel };
