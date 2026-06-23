import { config } from "./config.js";

const MAGNETIC_SELECTOR = "[data-magnetic]";
const MAGNETIC_STRENGTH = 0.32;

let enabled = false;
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;
let ringX = 0;
let ringY = 0;
let dotX = 0;
let dotY = 0;
let frameId = 0;

let glowEl;
let ringEl;
let dotEl;
let layerEl;
const boundMagnetic = new WeakSet();

export function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    enabled = true;
    document.documentElement.classList.add("has-cursor-fx");

    createLayer();
    bindMagneticElements();
    bindPointer();

    frameId = requestAnimationFrame(tick);
}

function createLayer() {
    layerEl = document.createElement("div");
    layerEl.className = "cursor-fx";
    layerEl.setAttribute("aria-hidden", "true");

    glowEl = document.createElement("div");
    glowEl.className = "cursor-glow";

    ringEl = document.createElement("div");
    ringEl.className = "cursor-ring";

    dotEl = document.createElement("div");
    dotEl.className = "cursor-dot";

    layerEl.append(glowEl, ringEl, dotEl);
    document.body.append(layerEl);
}

function bindPointer() {
    document.addEventListener(
        "mousemove",
        (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            const nx = mouseX / window.innerWidth - 0.5;
            const ny = mouseY / window.innerHeight - 0.5;
            document.documentElement.style.setProperty("--pointer-x", nx.toFixed(4));
            document.documentElement.style.setProperty("--pointer-y", ny.toFixed(4));
        },
        { passive: true },
    );

    document.addEventListener("mousedown", () => {
        ringEl?.classList.add("is-pressed");
        dotEl?.classList.add("is-pressed");
    });

    document.addEventListener("mouseup", () => {
        ringEl?.classList.remove("is-pressed");
        dotEl?.classList.remove("is-pressed");
    });

    document.addEventListener(
        "mouseover",
        (event) => {
            const interactive = event.target.closest("a, button, [data-magnetic], .contrib-cell");
            ringEl?.classList.toggle("is-hovering", Boolean(interactive));
        },
        { passive: true },
    );

    document.addEventListener("mouseleave", () => {
        ringEl?.classList.remove("is-hovering", "is-pressed");
        dotEl?.classList.remove("is-pressed");
    });
}

function bindMagneticElements() {
    document.querySelectorAll(MAGNETIC_SELECTOR).forEach((element) => {
        if (boundMagnetic.has(element)) return;
        boundMagnetic.add(element);

        element.addEventListener("mousemove", (event) => onMagneticMove(element, event));
        element.addEventListener("mouseleave", () => onMagneticLeave(element));
    });
}

export function bindMagneticElement(element) {
    if (!enabled || !element || boundMagnetic.has(element)) return;
    element.setAttribute("data-magnetic", "");
    boundMagnetic.add(element);
    element.addEventListener("mousemove", (event) => onMagneticMove(element, event));
    element.addEventListener("mouseleave", () => onMagneticLeave(element));
}

function onMagneticMove(element, event) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (event.clientX - centerX) * MAGNETIC_STRENGTH;
    const offsetY = (event.clientY - centerY) * MAGNETIC_STRENGTH;

    element.style.setProperty("--mx", `${offsetX.toFixed(2)}px`);
    element.style.setProperty("--my", `${offsetY.toFixed(2)}px`);
    element.classList.add("is-magnetic-active");
}

function onMagneticLeave(element) {
    element.style.setProperty("--mx", "0px");
    element.style.setProperty("--my", "0px");
    element.classList.remove("is-magnetic-active");
}

function tick() {
    if (!enabled) return;

    glowX += (mouseX - glowX) * 0.14;
    glowY += (mouseY - glowY) * 0.14;
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    glowEl.style.transform = `translate(${glowX}px, ${glowY}px)`;
    ringEl.style.transform = `translate(${ringX}px, ${ringY}px)`;
    dotEl.style.transform = `translate(${dotX}px, ${dotY}px)`;

    frameId = requestAnimationFrame(tick);
}

export function refreshCursorTargets() {
    if (!enabled) return;
    bindMagneticElements();
}

export function destroyCursor() {
    enabled = false;
    cancelAnimationFrame(frameId);
    layerEl?.remove();
    document.documentElement.classList.remove("has-cursor-fx");
}
