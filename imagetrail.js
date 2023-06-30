{
  // body element
  const body = document.body;

  // helper functions
  const MathUtils = {
    // linear interpolation
    lerp: (a, b, n) => (1 - n) * a + n * b,
    // distance between two points
    distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
  };

  // get the mouse position

  const getMousePos = (ev = {}) => {
    return {
      x: ev.pageX || 0,
      y: ev.pageY || 0
    };
  };
  var x, y;
  // mousePos: current mouse position
  // cacheMousePos: previous mouse position
  // lastMousePos: last last recorded mouse position (at the time the last image was shown)
  let mousePos = (lastMousePos = cacheMousePos = { x: 0, y: 0 });

  // update the mouse position
  window.addEventListener("mousemove", (ev) => {
    mousePos = getMousePos(ev);
  });

  // Respect scroll with image trail
  /*
  let lastScrollY = window.scrollY || 0;
  window.addEventListener("scroll", (ev) => {
    mousePos = {
      ...mousePos,
      y: mousePos.y + window.scrollY - lastScrollY
    };

    lastScrollY = window.scrollY;
  });*/

  // gets the distance from the current mouse position to the last recorded mouse position
  const getMouseDistance = () => {
    const distance = MathUtils.distance(
      mousePos.x,
      mousePos.y,
      lastMousePos.x,
      lastMousePos.y
    );

    return distance;
  };

  class Image {
    constructor(el) {
      this.DOM = { el: el };
      // image deafult styles
      this.defaultStyle = {
        scale: 1,
        x: 0,
        y: 0,
        opacity: 0
      };
      // get sizes/position
      this.getRect();
      // init/bind events
      this.initEvents();
    }
    initEvents() {
      // on resize get updated sizes/position
      window.addEventListener("resize", () => this.resize());
    }
    resize() {
      // reset styles
      gsap.set(this.DOM.el, this.defaultStyle);
      // get sizes/position
      this.getRect();
    }
    getRect() {
      this.rect = this.DOM.el.getBoundingClientRect();
    }
    isActive() {
      // check if image is animating or if it's visible
      return gsap.isTweening(this.DOM.el) || this.DOM.el.style.opacity != 0;
    }
  }

  class ImageTrail {
    constructor() {
      // images container
      this.DOM = { content: document.querySelector(".footer_trail") };
      // array of Image objs, one per image element
      this.images = [];
      [...this.DOM.content.querySelectorAll("img")].forEach((img) =>
        this.images.push(new Image(img))
      );
      // total number of images
      this.imagesTotal = this.images.length;
      // upcoming image index
      this.imgPosition = 0;
      // zIndex value to apply to the upcoming image
      this.zIndexVal = 1;
      // THRESHOLD mouse distance required to show the next image
      this.threshold = 150;
      // render the images
      requestAnimationFrame(() => this.render());
    }
    getClientRect() {
      return document
        .querySelector(".footer_trail")
        .parentElement.getBoundingClientRect();
    }
    render() {
      // get distance between the current mouse position and the position of the previous image
      let distance = getMouseDistance();
      const clientRect = this.getClientRect();

      // cache previous mouse position
      cacheMousePos.x = MathUtils.lerp(
        cacheMousePos.x || mousePos.x,
        mousePos.x,
        0.1
      );

      cacheMousePos.y = MathUtils.lerp(
        cacheMousePos.y || mousePos.y,
        mousePos.y,
        0.1
      );

      // if the mouse moved more than [this.threshold] then show the next image
      if (distance > this.threshold) {
        this.showNextImage();
      }

      // check when mousemove stops and all images are inactive (not visible and not animating)
      const isIdle = !this.images.some((image) => {
        return image.isActive();
      });

      // reset z-index initial value
      if (isIdle && this.zIndexVal !== 1) {
        this.zIndexVal = 1;
      }

      // loop..
      requestAnimationFrame(() => this.render());
    }
    showNextImage() {
      // show image at position [this.imgPosition]
      const img = this.images[this.imgPosition];
      const clientRect = this.getClientRect();

      const mouseOffset = {
        x: clientRect.left + window.scrollX,
        y: clientRect.top + window.scrollY
      };

      // kill any tween on the image
      gsap.killTweensOf(img.DOM.el);

      const frames = [
        // show the image
        {
          startAt: { opacity: 0, scale: 0 },
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: cacheMousePos.x - mouseOffset.x,
          y: Math.min(
            clientRect.height - img.rect.height,
            Math.max(0, cacheMousePos.y - mouseOffset.y)
          )
        },
        // animate position
        {
          ease: Expo.easeOut,
          x: mousePos.x - mouseOffset.x,
          y: Math.min(
            clientRect.height - img.rect.height,
            Math.max(0, mousePos.y - mouseOffset.y)
          )
        },

        // then make it disappear
        {
          ease: Expo.easeOut,
          opacity: 0
        }
      ];

      gsap
        .timeline()
        // how long for the image to show
        .set(img.DOM.el, frames[0], 0)
        // how fast are the images following the mouse
        .to(img.DOM.el, 0.8, frames[1], 0)
        // how long for the images to disappear
        .to(img.DOM.el, 0, frames[2], 0.8);

      ++this.zIndexVal;
      this.imgPosition =
        this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
      lastMousePos = mousePos;
    }
  }

  /***********************************/
  /********** Preload stuff **********/

  // Preload images
  const preloadImages = () => {
    return new Promise((resolve, reject) => {
      imagesLoaded(document.querySelectorAll(".content__img"), resolve);
    });
  };

  // And then..
  preloadImages().then(() => {
    // Remove the loader
    document.body.classList.remove("loading");
    new ImageTrail();
  });
}
