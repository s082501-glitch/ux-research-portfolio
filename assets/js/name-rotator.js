const imgs = Array.from(document.querySelectorAll('.name-rotator img'));
    let current = 0;
    const HOLD_MS  = 2800;
    const ENTER_MS = 300;
    const LEAVE_MS = 250;

    function showNext() {
      const curr = imgs[current];
      curr.classList.remove('visible');
      curr.classList.add('leaving');

      setTimeout(() => {
        curr.classList.remove('leaving');
        curr.style.opacity = '0';
        curr.style.transform = 'translateY(32px)';

        current = (current + 1) % imgs.length;
        const next = imgs[current];
        next.style.opacity = '0';
        next.style.transform = 'translateY(32px)';
        next.classList.remove('visible', 'leaving');
        void next.offsetWidth;
        next.classList.add('entering');

        setTimeout(() => {
          next.classList.remove('entering');
          next.classList.add('visible');
          setTimeout(showNext, HOLD_MS);
        }, ENTER_MS);
      }, LEAVE_MS);
    }

    imgs[0].classList.add('visible');
    setTimeout(showNext, HOLD_MS);
