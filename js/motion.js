const REVEAL_SELECTOR = "[data-reveal]";
const STAGGER_SELECTOR = "[data-stagger]";

export function initMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(`${REVEAL_SELECTOR}, ${STAGGER_SELECTOR}, ${STAGGER_SELECTOR} > *`).forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  initScrollReveal();
  initStaggerReveal();
  initStaggerIndexes();
  initHeroSocialStagger();
}

export function playThemeSweep(event) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "theme-sweep-layer";
  layer.setAttribute("aria-hidden", "true");

  const x = event?.clientX ?? window.innerWidth * 0.85;
  const y = event?.clientY ?? window.innerHeight * 0.08;
  layer.style.setProperty("--sweep-x", `${x}px`);
  layer.style.setProperty("--sweep-y", `${y}px`);

  const beam = document.createElement("div");
  beam.className = "theme-sweep-beam";

  const ring = document.createElement("div");
  ring.className = "theme-sweep-ring";

  layer.append(beam, ring);
  document.body.append(layer);

  layer.addEventListener(
    "animationend",
    (e) => {
      if (e.target === ring) layer.remove();
    },
    { once: true },
  );

  window.setTimeout(() => layer.remove(), 1200);
}

function revealElement(element) {
  element.classList.add("is-visible");
}

function initScrollReveal() {
  const elements = document.querySelectorAll(REVEAL_SELECTOR);
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealElement(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0,
      // Fire while content is still below the fold — before the user scrolls to it
      rootMargin: "0px 0px 35% 0px",
    },
  );

  elements.forEach((el) => {
    observer.observe(el);
    if (isApproachingViewport(el)) {
      revealElement(el);
    }
  });
}

function initStaggerReveal() {
  const items = document.querySelectorAll(`${STAGGER_SELECTOR} > *`);
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px 30% 0px",
    },
  );

  items.forEach((item) => {
    observer.observe(item);
    if (isApproachingViewport(item)) {
      item.classList.add("is-visible");
    }
  });
}

function isApproachingViewport(element) {
  const rect = element.getBoundingClientRect();
  const lead = window.innerHeight * 0.35;
  return rect.top < window.innerHeight + lead;
}

function initStaggerIndexes() {
  document.querySelectorAll(STAGGER_SELECTOR).forEach((container) => {
    [...container.children].forEach((child, index) => {
      child.style.setProperty("--stagger-index", String(index));
    });
  });
}

function initHeroSocialStagger() {
  document.querySelectorAll(".hero .social-link").forEach((link, index) => {
    link.style.setProperty("--link-index", String(index));
  });
}

export function animateGitHubDashboard(root) {
  if (!root) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("is-loaded");
    root.querySelectorAll(".contrib-week").forEach((week) => week.classList.add("is-animated"));
    return;
  }

  root.querySelectorAll(".github-stat").forEach((stat, index) => {
    stat.style.setProperty("--stat-index", String(index));
  });

  root.classList.add("is-loaded");

  const weeks = root.querySelectorAll(".contrib-week");
  weeks.forEach((week, weekIndex) => {
    let cellIndex = 0;
    week.querySelectorAll(".contrib-cell").forEach((cell) => {
      cell.style.setProperty("--cell-index", String(weekIndex * 7 + cellIndex));
      cellIndex += 1;
    });

    window.setTimeout(
      () => week.classList.add("is-animated"),
      200 + weekIndex * 12,
    );
  });
}

// Re-run social link stagger after dynamic render
export function staggerSocialLinks(container) {
  container?.querySelectorAll(".social-link").forEach((link, index) => {
    link.style.setProperty("--link-index", String(index));
  });
}
