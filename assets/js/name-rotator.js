(function () {
  const imgs = Array.from(document.querySelectorAll('.name-rotator img'));
  if (imgs.length < 2) return;

  const HOLD_MS = 1400;
  const ENTER_MS = 230;
  const LEAVE_MS = 210;

  let current = 0;
  let timer = null;

  function clearTimers() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function showNext() {
    const curr = imgs[current];
    curr.classList.remove('visible');
    curr.classList.add('leaving');

    timer = setTimeout(function afterLeave() {
      curr.classList.remove('leaving');
      curr.classList.remove('visible');

      current = (current + 1) % imgs.length;
      const next = imgs[current];
      next.classList.remove('visible', 'leaving', 'entering');
      void next.offsetWidth;
      next.classList.add('entering');

      timer = setTimeout(function afterEnter() {
        next.classList.remove('entering');
        next.classList.add('visible');
        timer = setTimeout(showNext, HOLD_MS);
      }, ENTER_MS);
    }, LEAVE_MS);
  }

  imgs.forEach(function (img) {
    img.classList.remove('entering', 'leaving', 'visible');
  });
  imgs[0].classList.add('visible');
  timer = setTimeout(showNext, HOLD_MS);
})();
