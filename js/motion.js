const REVEAL_SELECTOR = "[data-reveal]";
const STAGGER_SELECTOR = "[data-stagger]";
const ENTER_ROOT_MARGIN = "20% 0px 55% 0px";

export function initMotion() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.querySelectorAll(`${REVEAL_SELECTOR}, ${STAGGER_SELECTOR}, ${STAGGER_SELECTOR} > *`).forEach((el) => {
            el.classList.add("has-entered", "is-in-view");
        });
        return;
    }

    initScrollReveal();
    initStaggerIndexes();
    initHeroSocialStagger();
    ensureApproachingVisible();

    window.addEventListener("scroll", onScrollSafety, { passive: true });
    window.addEventListener("resize", onScrollSafety, { passive: true });
}

export function refreshScrollMotion() {
    ensureApproachingVisible();
}

let safetyFrame = 0;
function onScrollSafety() {
    cancelAnimationFrame(safetyFrame);
    safetyFrame = requestAnimationFrame(ensureApproachingVisible);
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

function markInView(element, inView) {
    if (inView) {
        element.classList.add("has-entered", "is-in-view");
        return;
    }
    element.classList.remove("is-in-view");
}

function initScrollReveal() {
    const elements = document.querySelectorAll(REVEAL_SELECTOR);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                markInView(entry.target, entry.isIntersecting);
            });
        },
        {
            threshold: 0,
            rootMargin: ENTER_ROOT_MARGIN,
        },
    );

    elements.forEach((el) => {
        observer.observe(el);
        if (isApproachingViewport(el)) {
            markInView(el, true);
        }
    });
}

function isApproachingViewport(element) {
    const rect = element.getBoundingClientRect();
    const lead = window.innerHeight * 0.55;
    const trail = window.innerHeight * 0.2;
    return rect.top < window.innerHeight + lead && rect.bottom > -trail;
}

function ensureApproachingVisible() {
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (isApproachingViewport(el)) {
            markInView(el, true);
        }
    });
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

    refreshScrollMotion();
}

export function staggerSocialLinks(container) {
    container?.querySelectorAll(".social-link").forEach((link, index) => {
        link.style.setProperty("--link-index", String(index));
    });
}
