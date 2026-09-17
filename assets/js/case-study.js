(function () {
  const caseStudy = document.querySelector('.case-study');
  const carousel = document.querySelector('.cs-highlights-carousel');
  if (!carousel || !caseStudy) return;

  const track = carousel.querySelector('.cs-highlights-track');
  const slides = carousel.querySelectorAll('.cs-highlight-slide');
  const dotsContainer = carousel.querySelector('.cs-highlights-dots');
  const playBtn = carousel.querySelector('.cs-highlights-play');
  const viewport = carousel.querySelector('.cs-highlights-viewport');

  const SLIDE_MS = 5000;
  const GAP = 16;
  let index = 0;
  let userPaused = false;
  let hoverPaused = false;
  let timer = null;
  let fill = carousel.querySelector('.cs-dot-fill');

  function getDots() {
    return dotsContainer.querySelectorAll('.cs-highlight-dot');
  }

  function moveTrack() {
    const slide = slides[0];
    if (!slide) return;
    const offset = index * (slide.offsetWidth + GAP);
    track.style.transform = 'translateX(-' + offset + 'px)';
  }

  function rebuildActiveDot() {
    const dots = getDots();
    dots.forEach(function (dot, j) {
      var isActive = j === index;
      dot.classList.toggle('cs-highlight-dot--active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      if (isActive && !dot.querySelector('.cs-dot-fill')) {
        dot.innerHTML = '<span class="cs-dot-fill"></span>';
      } else if (!isActive) {
        dot.innerHTML = '';
      }
    });
    fill = carousel.querySelector('.cs-dot-fill');
  }

  function animateProgress() {
    if (!fill) return;
    fill.classList.remove('is-animating');
    void fill.offsetWidth;
    if (!userPaused && !hoverPaused) fill.classList.add('is-animating');
  }

  function setSlide(i) {
    index = ((i % slides.length) + slides.length) % slides.length;
    moveTrack();
    rebuildActiveDot();
    animateProgress();
  }

  function schedule() {
    clearTimeout(timer);
    if (userPaused || hoverPaused) return;
    timer = setTimeout(function () {
      setSlide(index + 1);
      schedule();
    }, SLIDE_MS);
  }

  function syncPlayback() {
    const playing = !userPaused && !hoverPaused;
    carousel.classList.toggle('is-paused', !playing);
    playBtn.classList.toggle('is-paused', userPaused);
    playBtn.setAttribute('aria-label', userPaused ? 'Play' : 'Pause');
    animateProgress();
    if (playing) schedule();
    else clearTimeout(timer);
  }

  playBtn.addEventListener('click', function () {
    userPaused = !userPaused;
    syncPlayback();
  });

  dotsContainer.addEventListener('click', function (e) {
    var dot = e.target.closest('.cs-highlight-dot');
    if (!dot) return;
    var dots = getDots();
    var i = Array.prototype.indexOf.call(dots, dot);
    if (i >= 0) {
      setSlide(i);
      syncPlayback();
    }
  });

  if (viewport) {
    viewport.addEventListener('mouseenter', function () {
      hoverPaused = true;
      syncPlayback();
    });

    viewport.addEventListener('mouseleave', function () {
      hoverPaused = false;
      syncPlayback();
    });
  }

  window.addEventListener('resize', moveTrack);

  function initScrollReveal() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reveals = document.querySelectorAll('.reveal');

    if (reduced) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  setSlide(0);
  syncPlayback();
  setTimeout(initScrollReveal, 100);
})();
