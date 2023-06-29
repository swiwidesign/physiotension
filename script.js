window.addEventListener("DOMContentLoaded", (event) => {
  // LENIS
  "use strict";

  if (Webflow.env("editor") === undefined) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      wheelMultiplier: 0.7,
      infinite: false,
      gestureOrientation: "vertical",
      normalizeWheel: false,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    $("[data-lenis-start]").on("click", function () {
      lenis.start();
    });
    $("[data-lenis-stop]").on("click", function () {
      lenis.stop();
    });
    $("[data-lenis-toggle]").on("click", function () {
      $(this).toggleClass("stop-scroll");
      if ($(this).hasClass("stop-scroll")) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    function connectToScrollTrigger() {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
    }
    // Uncomment this if using GSAP ScrollTrigger
    connectToScrollTrigger();
  }

  gsap.registerPlugin(ScrollTrigger);

  //MATCHMEDIA
  gsap.matchMediaRefresh();

  // TEXT SPLIT ANIMATION
  let typeSplit;

  // Split the text up
  function runSplit() {
    typeSplit = new SplitType("[text-split]", {
      types: "words, chars, lines",
      tagName: "span"
    });
  }
  runSplit();

  // Update on window resize
  let windowWidth = window.innerWidth;

  function checkWidth() {
    if (windowWidth !== window.innerWidth) {
      windowWidth = window.innerWidth;
      typeSplit.revert();
      runSplit();
    }
  }

  window.addEventListener("resize", checkWidth);

  // GENERAL CODE
  // parallax
  gsap
    .matchMedia()
    .add(
      "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
      () => {
        // apply parallax effect to any element with a data-speed attribute
        gsap.utils.toArray("[data-speed]").forEach((el) => {
          gsap.to(el, {
            y: function () {
              return (
                (1 - parseFloat(el.getAttribute("data-speed"))) *
                (ScrollTrigger.maxScroll(window) -
                  (this.scrollTrigger ? this.scrollTrigger.start : 0))
              );
            },
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "max",
              invalidateOnRefresh: true,
              scrub: true
            }
          });
        });
      }
    );

  //Button

  let buttonSplit = new SplitType("[button-split]", {
    types: "words, chars",
    tagName: "span"
  });
  gsap
    .matchMedia()
    .add(
      "(min-width: 992px) and (prefers-reduced-motion: no-preference)",
      () => {
        $(".button").each(function (index) {
          let listOne = $(this).find(
            ".button_textwrapper .heading-medium.is-1 .char"
          );
          let listTwo = $(this).find(
            ".button_textwrapper .heading-medium.is-2 .char"
          );

          // Button Timeline

          let tl = gsap.timeline({ paused: true });
          tl.to(listOne, {
            translateY: "-100%",
            stagger: { each: 0.02 },
            ease: "power3.out",
            duration: 0.4
          });
          tl.to(
            listTwo,
            {
              translateY: "-100%",
              stagger: { each: 0.02 },
              ease: "power3.out",
              duration: 0.4
            },
            "<10%"
          );
          $(this).on("mouseenter", function () {
            tl.restart();
          });
          $(this).on("mouseleave", function () {
            tl.reverse();
          });
        });
      }
    );

  //Intro all pages
  let tlintro = gsap
    .timeline({
      delay: 0.4,
      ease: Power4.easeOut
    })
    .from(".container.is-hero", {
      scale: 0.75,
      duration: 1
    })
    .from(
      "[nav]",
      {
        yPercent: -100,
        duration: 0.6
      },
      "<"
    )
    .from(
      "[hero_logo-right]",
      {
        yPercent: -100,
        duration: 0.6
      },
      "-=0.6"
    )
    .from(
      "[hero_logo-left]",
      {
        yPercent: 100,
        duration: 0.6
      },
      "<"
    );

  //LANDING PAGE
  let heroscroll = gsap
    .timeline({
      scrollTrigger: {
        trigger: "[hero_section]",
        //start: "bottom 80%",
        start: "clamp(bottom bottom)",
        end: "bottom 80%",
        scrub: true,
        ease: "none",
        pin: "[hero_section]"
      }
    })
    .to("[hero_logo-right]", {
      xPercent: 200,
      duration: 0.4
    })
    .to(
      "[hero_logo-left]",
      {
        xPercent: -200,
        duration: 0.4
      },
      "<"
    );
});
