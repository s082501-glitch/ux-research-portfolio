(function () {
  const slideshows = document.querySelectorAll('.card-slideshow');
  if (!slideshows.length) return;

  slideshows.forEach(function (container) {
    const slides = Array.from(container.querySelectorAll('.slide'));
    const indicators = Array.from(container.querySelectorAll('.slideshow-indicators .indicator'));
    if (slides.length < 2) return;

    const card = container.closest('.card') || container;
    const HOLD_MS = 4500;
    const SHUFFLE_MS = 900;

    let currentIndex = slides.findIndex(function (s) {
      return s.classList.contains('active');
    });
    if (currentIndex < 0) currentIndex = 0;

    let timer = null;
    let isHovered = false;

    function setIndicators(index) {
      indicators.forEach(function (dot, i) {
        if (i === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function clearTimer() {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function scheduleNext(delay) {
      clearTimer();
      if (isHovered || document.hidden) return;
      timer = setTimeout(showNext, delay || HOLD_MS);
    }

    function showNext() {
      clearTimer();
      if (isHovered || document.hidden) return;

      const prevSlide = slides[currentIndex];
      currentIndex = (currentIndex + 1) % slides.length;
      const nextSlide = slides[currentIndex];

      // Shuffle out current slide
      prevSlide.classList.remove('active');
      prevSlide.classList.add('shuffling-out');

      // Bring in next slide
      nextSlide.classList.remove('shuffling-out');
      void nextSlide.offsetWidth; // trigger reflow
      nextSlide.classList.add('active');

      setIndicators(currentIndex);

      // Clean up shuffle-out state once transition completes
      setTimeout(function () {
        prevSlide.classList.remove('shuffling-out');
      }, SHUFFLE_MS);

      scheduleNext(HOLD_MS);
    }

    // Pause on hover
    card.addEventListener('mouseenter', function () {
      isHovered = true;
      clearTimer();
    });

    card.addEventListener('mouseleave', function () {
      isHovered = false;
      scheduleNext(HOLD_MS);
    });

    card.addEventListener('focusin', function () {
      isHovered = true;
      clearTimer();
    });

    card.addEventListener('focusout', function () {
      isHovered = false;
      scheduleNext(HOLD_MS);
    });

    // Handle tab visibility changes
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearTimer();
      } else if (!isHovered) {
        scheduleNext(HOLD_MS);
      }
    });

    // Initialize indicators and begin timer
    setIndicators(currentIndex);
    scheduleNext(HOLD_MS);
  });
})();
