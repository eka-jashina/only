const burger = document.querySelector('.header__burger');
const menu = document.querySelector('.nav');
const body = document.querySelector('body');

burger.addEventListener('click', () => {
  burger.classList.toggle('header__burger--active');
  menu.classList.toggle('nav--shown');
  body.classList.toggle('body--no-scroll');
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('.nav__link')) {
    menu.classList.remove('nav--shown');
    burger.classList.remove('header__burger--active');
    body.classList.remove('body--no-scroll');
  }
});
