import { initGalaxy } from './galaxy.js';

const slides = document.querySelectorAll('.slide');
const nextBtns = document.querySelectorAll('[data-next]');
let current = 0;
let galaxyInstance = null;

function goToSlide(index) {
  if (index >= slides.length) return;
  slides[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');

  if (slides[current].dataset.slide === '2' && !galaxyInstance) {
    const canvas = document.getElementById('galaxy');
    // ждём, пока слайд станет видимым, чтобы canvas получил размеры
    requestAnimationFrame(() => {
      galaxyInstance = initGalaxy(canvas);
    });
  }
}

nextBtns.forEach(btn =>
  btn.addEventListener('click', () => goToSlide(current + 1))
);

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goToSlide(current + 1);
  if (e.key === 'ArrowLeft' && current > 0) goToSlide(current - 1);
});