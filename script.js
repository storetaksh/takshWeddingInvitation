// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  initLanterns();
  initScrollAnimations();
  initScrollIndicator();
});

function initScrollIndicator() {
  const indicator = document.querySelector(".scroll-indicator");
  if (!indicator) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      indicator.classList.add("hidden");
    } else {
      indicator.classList.remove("hidden");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  // Check initial state
  handleScroll();
}

function initLanterns() {
  const container = document.getElementById("lanterns");
  const lanternCount = 20; // Increased count
  const lanterns = [];

  // Create Lantern DOM Elements
  for (let i = 0; i < lanternCount; i++) {
    // Wrapper for Parallax
    const wrapper = document.createElement("div");
    wrapper.classList.add("lantern-wrapper");

    // Image for Floating
    const img = document.createElement("img");
    img.src = "assets/images/lantern.png";
    img.classList.add("lantern");

    wrapper.appendChild(img);
    container.appendChild(wrapper);

    // Randomize initial properties
    // Mobile Detection & Size Logic
    const isMobile = window.innerWidth < 768;
    const minSize = isMobile ? 30 : 40;
    const maxSize = isMobile ? 70 : 120; // Reduced max size for mobile

    // Power distribution for size: biased towards smaller lanterns to avoid crowding
    // But ensure smallest are not too small (minSize respects this)
    const size = gsap.utils.random(minSize, maxSize);

    // POSITIONING LOGIC: Strictly Outer 30%
    // Left Zone: -10% to 30%
    // Right Zone: 70% to 110%
    // Avoid Center 40% (30% to 70%)
    let xPos = Math.random() > 0.5
      ? gsap.utils.random(-10, isMobile ? 15 : 30)
      : gsap.utils.random(isMobile ? 85 : 70, 110);

    const yPos = gsap.utils.random(-10, 80); // Keep mostly in upper/mid sky

    // DEPTH & BLUR LOGIC
    // Normalized depth (0 to 1) based on dynamic Size Range
    const normalizedDepth = (size - minSize) / (maxSize - minSize);

    // Blur: Inverse of depth. Large (close) = 0px, Small (far) = up to 4px.
    const blur = (1 - normalizedDepth) * 4;

    const depth = normalizedDepth + 0.5; // Keep existing parallax depth logic roughly same range
    const duration = gsap.utils.random(3, 6);

    // Apply initial styles to WRAPPER (positioning)
    gsap.set(wrapper, {
      position: "absolute",
      left: `${xPos}%`,
      top: `${yPos}%`,
      width: size,
      zIndex: Math.floor(depth * 10),
    });

    // Apply styles to IMAGE (visuals)
    gsap.set(img, {
      width: "100%", // Fill wrapper
      filter: `blur(${blur}px)`,
      display: "block",
    });

    lanterns.push({ wrapper: wrapper, img: img, depth: depth });

    // Floating Animation (Image only) - Continuous loop
    gsap.to(img, {
      y: -30, // Gentle float up
      x: gsap.utils.random(-20, 20),
      rotation: gsap.utils.random(-5, 5),
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  // Parallax on Scroll (Wrapper only)
  ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: 0.5, // Smooth scrubbing
    onUpdate: (self) => {
      lanterns.forEach((l) => {
        // Parallax Y movement
        // Deeper elements move faster upwards to create depth
        const movement = self.progress * 400 * l.depth;
        gsap.to(l.wrapper, {
          y: -movement,
          overwrite: "auto",
        });
      });
    },
  });
}

function initScrollAnimations() {
  // Fade In Sections
  const sections = [".fade-in", ".event-card", ".map-visual", ".couple-frame"];

  sections.forEach((selector) => {
    gsap.utils.toArray(selector).forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%", // Start when top of element hits 80% viewport
            toggleActions: "play none none none",
          },
        }
      );
    });
  });

  // Car Animation removed
}
