import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import {
    loadGitHubDashboard,
    writeGitHubCache,
} from "../js/github.js";
import { GITHUB_TEMPLATE_IDS } from "./fixtures/github-template-ids.js";

const cacheStorage = new Map();
const elementsById = new Map();
let fetchCalls = [];
let originalFetch;

globalThis.sessionStorage = {
    getItem(key) {
        return cacheStorage.get(key) ?? null;
    },
    setItem(key, value) {
        cacheStorage.set(key, value);
    },
    removeItem(key) {
        cacheStorage.delete(key);
    },
    clear() {
        cacheStorage.clear();
    },
};

globalThis.window = {
    requestAnimationFrame(callback) {
        callback();
    },
};

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isElement(node) {
    return node?.nodeType === 1;
}

function camelCaseDataAttr(name) {
    return name.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function createFragment(childNodes) {
    const fragment = {
        nodeType: 11,
        childNodes,
        get firstElementChild() {
            return childNodes.find(isElement) ?? null;
        },
        querySelector(selector) {
            return fragment.querySelectorAll(selector)[0] ?? null;
        },
        querySelectorAll(selector) {
            const results = [];
            for (const child of childNodes) {
                if (isElement(child)) {
                    if (matchesSelector(child, selector)) results.push(child);
                    results.push(...child.querySelectorAll(selector));
                }
            }
            return results;
        },
        cloneNode(deep) {
            return createFragment(childNodes.map((child) => cloneNode(child, deep)));
        },
    };
    return fragment;
}

function cloneNode(node, deep) {
    if (!node) return null;
    if (node.nodeType === 3) {
        return { nodeType: 3, textContent: node.textContent };
    }
    if (node.nodeType === 11) {
        return createFragment(node.childNodes.map((child) => cloneNode(child, true)));
    }

    const clone = createElement(node.tagName.toLowerCase(), {
        id: node.id || undefined,
        class: node.className || undefined,
        role: node.getAttribute?.("role") || undefined,
        href: node.href || undefined,
    });
    clone.hidden = node.hidden;
    clone.tabIndex = node.tabIndex;
    clone.src = node.src;
    clone.title = node.title;
    clone._textContent = node._textContent;
    Object.assign(clone.dataset, { ...node.dataset });
    for (const [name, value] of node.attributes ?? []) {
        clone.setAttribute(name, value);
    }
    for (const [name, value] of Object.entries(node.style?._vars ?? {})) {
        clone.style.setProperty(name, value);
    }
    if (deep) {
        for (const child of node.childNodes) {
            clone.appendChild(cloneNode(child, true));
        }
    }
    return clone;
}

function createElement(tag, options = {}, children = []) {
    const el = {
        nodeType: 1,
        tagName: tag.toUpperCase(),
        className: options.class ?? "",
        id: options.id ?? "",
        childNodes: [],
        attributes: new Map(),
        dataset: { ...(options.dataset ?? {}) },
        style: {
            _vars: {},
            setProperty(name, value) {
                this._vars[name] = value;
            },
        },
        hidden: false,
        tabIndex: -1,
        href: options.href ?? "",
        src: "",
        title: "",
        listeners: new Map(),
        parentNode: null,
        _textContent: "",
        classList: {
            contains(name) {
                return el.className.split(/\s+/).filter(Boolean).includes(name);
            },
        },
        get textContent() {
            if (el._textContent) return el._textContent;
            return el.childNodes.map((child) => child.textContent ?? "").join("");
        },
        set textContent(value) {
            el._textContent = value;
            el.childNodes = [];
        },
        get firstElementChild() {
            return el.childNodes.find(isElement) ?? null;
        },
        append(...nodes) {
            for (const node of nodes) {
                el.appendChild(node);
            }
        },
        appendChild(node) {
            node.parentNode = el;
            el.childNodes.push(node);
            return node;
        },
        replaceChildren(...nodes) {
            el.childNodes = [];
            el._textContent = "";
            for (const node of nodes.flat()) {
                if (node?.nodeType === 11) {
                    for (const child of [...node.childNodes]) {
                        el.appendChild(child);
                    }
                } else if (node) {
                    el.appendChild(node);
                }
            }
        },
        setAttribute(name, value) {
            el.attributes.set(name, String(value));
            if (name.startsWith("data-")) {
                el.dataset[camelCaseDataAttr(name)] = String(value);
            }
        },
        getAttribute(name) {
            return el.attributes.get(name) ?? null;
        },
        addEventListener(type, listener) {
            if (!el.listeners.has(type)) el.listeners.set(type, []);
            el.listeners.get(type).push(listener);
        },
        querySelector(selector) {
            return el.querySelectorAll(selector)[0] ?? null;
        },
        querySelectorAll(selector) {
            const results = [];
            const walk = (node) => {
                if (!isElement(node)) return;
                if (matchesSelector(node, selector)) results.push(node);
                for (const child of node.childNodes) walk(child);
            };
            walk(el);
            return results;
        },
        cloneNode(deep) {
            return cloneNode(el, deep);
        },
        focus() {
            document.activeElement = el;
        },
    };

    if (options.role) el.setAttribute("role", options.role);
    if (options.id) registerElement(el);
    for (const child of children.flat()) {
        if (typeof child === "string") {
            el.appendChild({ nodeType: 3, textContent: child });
        } else if (child) {
            el.appendChild(child);
        }
    }
    return el;
}

function registerElement(el) {
    elementsById.set(el.id, el);
}

function withDataAttr(element, name) {
    element.setAttribute(`data-${name}`, "");
    return element;
}

function createTemplate(id, root) {
    const template = createElement("template", { id });
    template.content = createFragment([root]);
    return template;
}

function matchesSelector(node, selector) {
    const parts = selector.trim().split(/(?=\.|#|\[)/).filter(Boolean);
    for (const part of parts) {
        if (part.startsWith("#")) {
            if (node.id !== part.slice(1)) return false;
        } else if (part.startsWith(".")) {
            if (!node.classList.contains(part.slice(1))) return false;
        } else if (part.startsWith("[")) {
            const attrOnly = /^\[([^\]=]+)\]$/.exec(part);
            const attrEq = /^\[([^\]=]+)=["']([^"']+)["']]$/.exec(part);
            if (attrEq) {
                if (node.getAttribute(attrEq[1]) !== attrEq[2]) return false;
            } else if (attrOnly) {
                if (!node.attributes.has(attrOnly[1])) return false;
            }
        } else if (part) {
            if (node.tagName !== part.toUpperCase()) return false;
        }
    }
    return true;
}

function mountGitHubTemplates() {
    elementsById.clear();

    createTemplate(
        "github-skeleton-template",
        createElement("div", { class: "github-dashboard github-skeleton", role: "status" }),
    );
    createTemplate(
        "github-error-template",
        createElement("div", { class: "github-dashboard-error" }, [
            createElement("button", { class: "github-retry-btn" }),
            withDataAttr(createElement("a"), "github-profile-link"),
        ]),
    );
    createTemplate(
        "github-stat-template",
        createElement("div", { class: "github-stat" }, [
            createElement("span", { class: "github-stat-label" }),
            createElement("span", { class: "github-stat-value" }, [
                createElement("span", { class: "github-stat-number" }),
                createElement("span", { class: "github-stat-suffix" }),
            ]),
        ]),
    );
    createTemplate(
        "github-contrib-cell-template",
        createElement("span", { class: "contrib-cell", role: "gridcell" }),
    );
    createTemplate(
        "github-contrib-cell-empty-template",
        createElement("span", { class: "contrib-cell contrib-cell--empty" }),
    );
    createTemplate(
        "github-contrib-week-template",
        createElement("div", { class: "contrib-week", role: "row" }),
    );
    createTemplate(
        "github-contrib-month-template",
        createElement("span", { class: "contrib-month" }),
    );
    createTemplate(
        "github-contrib-empty-template",
        createElement("figure", { class: "contrib-graph" }, [
            createElement("span", { class: "contrib-graph-total" }),
        ]),
    );
    createTemplate(
        "github-contrib-graph-template",
        createElement("figure", { class: "contrib-graph" }, [
            createElement("span", { class: "contrib-graph-total" }),
            createElement("div", { class: "contrib-graph-layout" }, [
                createElement("div", { class: "contrib-months" }),
                createElement("div", { class: "contrib-body" }, [
                    createElement("div", { class: "contrib-grid", role: "grid" }),
                ]),
            ]),
        ]),
    );
    createTemplate(
        "github-dashboard-template",
        createElement("div", { class: "github-dashboard" }, [
            withDataAttr(createElement("img", { class: "profile-avatar" }), "github-avatar"),
            withDataAttr(createElement("span", { class: "github-dashboard-handle" }), "github-handle"),
            withDataAttr(createElement("a"), "github-profile-link"),
            withDataAttr(createElement("div", { class: "github-stats" }), "github-stats"),
            withDataAttr(createElement("div"), "github-contrib-mount"),
        ]),
    );

    const dashboard = createElement("div", { id: "github-dashboard" });
    const liveStatus = createElement("div", { id: "live-status" });
    registerElement(dashboard);
    registerElement(liveStatus);

    for (const id of GITHUB_TEMPLATE_IDS) {
        assert.ok(elementsById.has(id), `integration harness missing template id="${id}"`);
    }

    globalThis.document = {
        activeElement: null,
        getElementById(id) {
            return elementsById.get(id) ?? null;
        },
    };
}

function mockUser(login = "klovaaxel") {
    return {
        login,
        avatar_url: `https://example.com/${login}.png`,
        public_repos: 42,
        followers: 10,
        html_url: `https://github.com/${login}`,
    };
}

function mockActivity() {
    const contributions = [];
    for (let i = 0; i < 14; i += 1) {
        const date = new Date(2025, 5, 1 + i);
        const key = date.toISOString().slice(0, 10);
        contributions.push({ date: key, count: i % 2, level: i % 2 });
    }
    return {
        contributions,
        total: { lastYear: 100 },
    };
}

function createFetchMock({ userLogin = "klovaaxel", delayMs = 0 } = {}) {
    return async (url) => {
        fetchCalls.push(url);
        if (delayMs > 0) await delay(delayMs);
        const body = url.includes("api.github.com") ? mockUser(userLogin) : mockActivity();
        return {
            ok: true,
            json: async () => body,
        };
    };
}

function dashboardHandle() {
    return document.getElementById("github-dashboard").querySelector("[data-github-handle]");
}

describe("loadGitHubDashboard integration", { concurrency: false }, () => {
    before(() => {
        originalFetch = globalThis.fetch;
    });

    after(() => {
        globalThis.fetch = originalFetch;
        delete globalThis.document;
    });

    beforeEach(() => {
        cacheStorage.clear();
        fetchCalls = [];
        mountGitHubTemplates();
        globalThis.fetch = createFetchMock();
    });

    it("renders from cache without fetching", async () => {
        const cachedUser = mockUser("cached-user");
        const cachedActivity = mockActivity();
        writeGitHubCache(cachedUser, cachedActivity);

        await loadGitHubDashboard();

        assert.equal(fetchCalls.length, 0);
        assert.equal(dashboardHandle().textContent, "@cached-user");
        assert.ok(document.getElementById("github-dashboard").querySelector(".github-dashboard"));
    });

    it("bypasses cache and fetches fresh data", async () => {
        writeGitHubCache(mockUser("stale-user"), mockActivity());
        globalThis.fetch = createFetchMock({ userLogin: "fresh-user" });

        await loadGitHubDashboard({ bypassCache: true });

        assert.ok(fetchCalls.some((url) => url.includes("api.github.com/users/")));
        assert.ok(fetchCalls.some((url) => url.includes("github-contributions-api")));
        assert.equal(dashboardHandle().textContent, "@fresh-user");
    });

    it("discards stale in-flight load when a newer load starts", async () => {
        let userFetchCount = 0;
        globalThis.fetch = async (url) => {
            fetchCalls.push(url);
            const isUser = url.includes("api.github.com");
            if (isUser) userFetchCount += 1;
            const login = userFetchCount <= 1 ? "slow-user" : "fast-user";
            const waitMs = userFetchCount <= 1 ? 80 : 0;
            if (waitMs > 0) await delay(waitMs);
            return {
                ok: true,
                json: async () => (isUser ? mockUser(login) : mockActivity()),
            };
        };

        const slowLoad = loadGitHubDashboard();
        await delay(0);
        const fastLoad = loadGitHubDashboard({ bypassCache: true });

        await fastLoad;
        assert.equal(dashboardHandle().textContent, "@fast-user");

        await slowLoad;
        assert.equal(dashboardHandle().textContent, "@fast-user");
    });
});
