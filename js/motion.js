const REVEAL_SELECTOR = "[data-reveal]";
const STAGGER_SELECTOR = "[data-stagger]";

export function initMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(`${REVEAL_SELECTOR}, ${STAGGER_SELECTOR}`).forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  initScrollReveal();
  initStaggerIndexes();
}

function revealElement(element) {
  element.classList.add("is-visible");
  element.querySelectorAll(STAGGER_SELECTOR).forEach((stagger) => {
    stagger.classList.add("is-visible");
  });
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
    { threshold: 0.14, rootMargin: "0px 0px -5% 0px" },
  );

  elements.forEach((el) => observer.observe(el));
}

function initStaggerIndexes() {
  document.querySelectorAll(STAGGER_SELECTOR).forEach((container) => {
    [...container.children].forEach((child, index) => {
      child.style.setProperty("--stagger-index", String(index));
    });
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

    window.setTimeout(() => {
      week.classList.add("is-animated");
    }, 280 + weekIndex * 18);
  });
}
