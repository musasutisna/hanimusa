/**
 * Stores data.
 */
 const STORES = {
  slide: {
    current: null,
    total: null,
    timing: null,
    domWrapper: null,
    domControl: null,
    domSlide: null,
    domMedia: null,
    domBar: null,
    live: null,
    liveStamp: null,
    liveLeft: null,
    doubleTap: null
  }
};

/**
 * Create a new slide system.
 *
 * @param   dom   wrapper container
 * @param   dom   control container
 * @param   dom   slide container
 * @param   dom   slide media container
 * @param   dom   bar container
 * @return  void
 */
const Slide = function (domWrapper, domControl, domSlide, domMedia, domBar) {
  // set slide configuration from dataset
  STORES.slide.current = null;
  STORES.slide.total = parseInt(domSlide.dataset.total) || 1;
  STORES.slide.timing = parseInt(domSlide.dataset.timing) || 10000;
  STORES.slide.domWrapper = domWrapper;
  STORES.slide.domControl = domControl;
  STORES.slide.domSlide = domSlide;
  STORES.slide.domMedia = domMedia;
  STORES.slide.domBar = domBar;
  STORES.slide.doubleTap = 0;

  // set media control
  domMedia.querySelector('button[data-type="mode"]')?.addEventListener(
    'click',
    toggleSlideMode
  );

  // create items bar
  createItembar();

  // handle slide control
  domControl.querySelector('button[data-type="previous"]')?.addEventListener(
    'click',
    previousSlide
  );
  domControl.querySelector('button[data-type="next"]')?.addEventListener(
    'click',
    nextSlide
  );
  domControl.querySelector('button[data-type="previous"]')?.addEventListener(
    'dblclick',
    tiggerActionCurrentSlide
  );
  domControl.querySelector('button[data-type="next"]')?.addEventListener(
    'dblclick',
    tiggerActionCurrentSlide
  );

  // set curent slide
  setCurrentSlide(0);
};

/**
 * Add loading panel.
 *
 * @return  void
 */
const toggleLoading = function () {
  STORES.slide.domWrapper.classList.toggle('Loading');
};

/**
 * Toggle slide mode.
 *
 * @return  void
 */
const toggleSlideMode = function () {
  if (STORES.slide.live) {
    STORES.slide.domMedia.querySelector('button[data-type="mode"]').dataset.mode = 'play';
    STORES.slide.domBar.children[STORES.slide.current].classList.add('Pause');
    destroySlideLive();
  } else {
    STORES.slide.domMedia.querySelector('button[data-type="mode"]').dataset.mode = 'pause';
    STORES.slide.domBar.children[STORES.slide.current].classList.remove('Pause');
    createSlideLive();
  }
};

/**
 * Create slide live.
 *
 * @return  void
 */
const createSlideLive = function () {
  const timing = STORES.slide.liveLeft ?
                 (STORES.slide.timing - STORES.slide.liveLeft)
                 :
                 STORES.slide.timing;

  STORES.slide.liveStamp = Date.now();
  STORES.slide.live = window.setTimeout(nextSlide, timing);
  STORES.slide.liveLeft = null;
};

/**
 * Destroy slide live.
 *
 * @param   boolean
 * @return  void
 */
const destroySlideLive = function (isPause) {
  window.clearTimeout(STORES.slide.live);

  STORES.slide.live = null;

  if (isPause) {
    STORES.slide.liveLeft = Date.now() - STORES.slide.liveStamp;
  } else {
    STORES.slide.liveLeft = null;
  }

  STORES.slide.liveStamp = null;
};

/**
 * Create items bar.
 *
 * @return  void
 */
const createItembar = function () {
  let htmlItembar = '';

  for (var index = 1; index <= STORES.slide.total; index++) {
    if (index > 1) {
      htmlItembar += '<div class="Itembar"></div>';
    } else {
      htmlItembar += '<div class="Itembar Active"></div>';
    }
  }

  STORES.slide.domBar.innerHTML = htmlItembar;
};

/**
 * Go to previous slide.
 *
 * @return  void
 */
const previousSlide = function () {
  setCurrentSlide(STORES.slide.current - 1);
};

/**
 * Go to next slide.
 *
 * @return  void
 */
const nextSlide = function () {
  setCurrentSlide(STORES.slide.current + 1);
};

/**
 * Tigger action of current slide.
 *
 * @return  void
 */
const tiggerActionCurrentSlide = function () {
  // follow slide link
  if (STORES.slide.domSlide.children[STORES.slide.current].dataset.href) {
    window.open(STORES.slide.domSlide.children[STORES.slide.current].dataset.href, 'blank')
  }
}

/**
 * Set current slide.
 *
 * @param   number
 * @return  void
 */
const setCurrentSlide = function (index) {
  if (index < 0) {
    return;
  }

  STORES.slide.domMedia.querySelector('button[data-type="mode"]').dataset.mode = 'pause';

  const lastIndex = STORES.slide.total - 1;

  if (STORES.slide.live) {
    destroySlideLive();
  }

  if (STORES.slide.current !== null) {
    if (index > STORES.slide.current) {
      STORES.slide.domBar.children[STORES.slide.current].classList.add('Pass');
    } else {
      STORES.slide.domBar.children[STORES.slide.current].classList.remove('Pass');
    }

    STORES.slide.domBar.children[STORES.slide.current].classList.remove('Active');

    if (STORES.slide.current < lastIndex) {
      STORES.slide.domSlide.children[STORES.slide.current].classList.remove('Active');
    }
  }

  if (index <= lastIndex) {
    toggleLoading();

    if (index < STORES.slide.current) {
      STORES.slide.domBar.children[index].classList.remove('Pass');
    }

    if (STORES.slide.domSlide.children[index].children[0].complete) {
      toggleLoading();

      // go to next slide on timing
      createSlideLive();

      STORES.slide.domBar.children[index].classList.add('Active');
    } else {
      STORES.slide.domSlide.children[index]
        .children[0].onload = function () {
          toggleLoading();

          // go to next slide on timing
          createSlideLive();

          STORES.slide.domBar.children[index].classList.add('Active');
        };
    }

    STORES.slide.domSlide.children[index].classList.add('Active');

    STORES.slide.current = index;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  // Initialization slide
  new Slide(
    document.getElementById('Wrapper'),
    document.getElementById('SlideControl'),
    document.getElementById('SlideItems'),
    document.getElementById('InfoControl'),
    document.getElementById('Infobar')
  );
});
