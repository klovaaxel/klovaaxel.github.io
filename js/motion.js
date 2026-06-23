const REVEAL_SELECTOR = "[data-reveal]";
const STAGGER_SELECTOR = "[data-stagger]";
const SCROLL_ROOT_MARGIN = "12% 0px 38% 0px";

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

function createScrollObserver() {
    return new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle("is-visible", entry.isIntersecting);
            });
        },
        {
            threshold: 0,
            rootMargin: SCROLL_ROOT_MARGIN,
        },
    );
}

function initScrollReveal() {
    const elements = document.querySelectorAll(REVEAL_SELECTOR);
    if (!elements.length) return;

    const observer = createScrollObserver();
    elements.forEach((el) => observer.observe(el));
}

function initStaggerReveal() {
    const items = document.querySelectorAll(`${STAGGER_SELECTOR} > *`);
    if (!items.length) return;

    const observer = createScrollObserver();
    items.forEach((item) => observer.observe(item));
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

export function setupGitHubDashboard(root) {
    if (!root) return;

    root.querySelectorAll(".github-stat").forEach((stat, index) => {
        stat.style.setProperty("--stat-index", String(index));
    });

    root.querySelectorAll(".contrib-week").forEach((week, weekIndex) => {
        let cellIndex = 0;
        week.querySelectorAll(".contrib-cell").forEach((cell) => {
            cell.style.setProperty("--cell-index", String(weekIndex * 7 + cellIndex));
            cellIndex += 1;
        });
    });
}

export function staggerSocialLinks(container) {
    container?.querySelectorAll(".social-link").forEach((link, index) => {
        link.style.setProperty("--link-index", String(index));
    });
}
