import './modules/burger.js';
import {initVideoObservers} from './modules/promo-video-scale.js';
import {createCarousel} from './modules/carousel.js';
import {createSlider} from './modules/slider.js';
import './modules/animation.js';
import {dragScroll} from './modules/scroll-container.js';
import {initDynamicAdaptive} from './modules/dynamic-adaptive/init-dynamic-adaptive.js';

const videoStart = document.querySelector('.hero__title');
const videoEnd = document.querySelector('.portfolio');
const projectsCarousel = document.querySelector('.projects__carousel');
const bannersSlider = document.querySelector('.banners');

window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('load', () => {
    initVideoObservers(videoStart, videoEnd);
    initDynamicAdaptive();
  });

  createCarousel(projectsCarousel);
  createSlider(bannersSlider).init();
  dragScroll();
});

