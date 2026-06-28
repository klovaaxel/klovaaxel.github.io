import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import {
    buildWeeks,
    cellCoords,
    computeStreaks,
    findCellByCoords,
    findCellInDirection,
    findFirstCellInDayRow,
    findLastCellInDayRow,
    readGitHubCache,
    sanitizeHttpsImageUrl,
    writeGitHubCache,
    wireContributionGridKeyboard,
    GITHUB_CACHE_KEY,
    GITHUB_CACHE_TTL_MS,
} from "../js/github.js";
import { escapeHtml } from "../js/html.js";

const cacheStorage = new Map();

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

function mockCell(week, day, level = 0) {
    return {
        classList: { contains: (name) => name === "contrib-cell" },
        dataset: { week: String(week), day: String(day), level: String(level) },
        tabIndex: -1,
        focus() {
            document.activeElement = this;
        },
        getAttribute(name) {
            return name === "aria-label" ? `week ${week} day ${day}` : null;
        },
    };
}

function createGridHarness(cellsData) {
    const cells = cellsData.map(({ week, day, level }) => mockCell(week, day, level));
    const keydownListeners = [];

    const grid = {
        querySelectorAll(selector) {
            if (selector.includes("gridcell")) return cells;
            return [];
        },
        addEventListener(type, listener) {
            if (type === "keydown") keydownListeners.push(listener);
        },
    };

    const container = {
        querySelector(selector) {
            if (selector.includes("contrib-grid")) return grid;
            return null;
        },
    };

    return {
        container,
        cells,
        dispatchKeydown(key, active) {
            document.activeElement = active;
            const event = { key, preventDefault() {} };
            for (const listener of keydownListeners) {
                listener(event);
            }
            return event;
        },
    };
}

describe("sanitizeHttpsImageUrl", () => {
    it("accepts https URLs", () => {
        assert.equal(
            sanitizeHttpsImageUrl("https://avatars.githubusercontent.com/u/1?v=4"),
            "https://avatars.githubusercontent.com/u/1?v=4",
        );
    });

    it("rejects javascript: and http: URLs", () => {
        assert.equal(sanitizeHttpsImageUrl("javascript:alert(1)"), "");
        assert.equal(sanitizeHttpsImageUrl("http://example.com/a.png"), "");
    });

    it("rejects empty and invalid values", () => {
        assert.equal(sanitizeHttpsImageUrl(""), "");
        assert.equal(sanitizeHttpsImageUrl(null), "");
        assert.equal(sanitizeHttpsImageUrl("not-a-url"), "");
    });
});

describe("wireContributionGridKeyboard", () => {
    before(() => {
        globalThis.document = { activeElement: null };
    });

    after(() => {
        delete globalThis.document;
    });

    it("no-ops when grid markup is missing", () => {
        assert.doesNotThrow(() => wireContributionGridKeyboard({ querySelector: () => null }));
    });

    it("sets initial roving tabindex without scrolling focus on init", () => {
        const { container, cells } = createGridHarness([
            { week: 0, day: 0, level: 0 },
            { week: 1, day: 0, level: 2 },
        ]);
        wireContributionGridKeyboard(container);
        assert.notEqual(document.activeElement, cells[1]);
        assert.equal(cells[0].tabIndex, -1);
        assert.equal(cells[1].tabIndex, 0);
    });

    it("moves focus on arrow keys and prevents default", () => {
        const { container, cells, dispatchKeydown } = createGridHarness([
            { week: 0, day: 0, level: 1 },
            { week: 1, day: 0, level: 1 },
        ]);
        wireContributionGridKeyboard(container);
        const event = dispatchKeydown("ArrowRight", cells[0]);
        assert.equal(document.activeElement, cells[1]);
        assert.equal(cells[1].tabIndex, 0);
    });

    it("moves to row ends with Home and End", () => {
        const { container, cells, dispatchKeydown } = createGridHarness([
            { week: 0, day: 3, level: 1 },
            { week: 2, day: 3, level: 1 },
            { week: 4, day: 3, level: 1 },
        ]);
        wireContributionGridKeyboard(container);
        dispatchKeydown("End", cells[1]);
        assert.equal(document.activeElement, cells[2]);
        dispatchKeydown("Home", cells[2]);
        assert.equal(document.activeElement, cells[0]);
    });

    it("ignores keydown when focus is outside the grid", () => {
        const { container, cells, dispatchKeydown } = createGridHarness([
            { week: 0, day: 0, level: 1 },
            { week: 1, day: 0, level: 1 },
        ]);
        wireContributionGridKeyboard(container);
        const outsider = { classList: { contains: () => false } };
        dispatchKeydown("ArrowRight", outsider);
        assert.equal(document.activeElement, outsider);
        assert.equal(cells[1].tabIndex, -1);
    });
});

describe("contribution grid cell navigation", () => {
    // Day 3 column: week 2 is hidden (future); weeks 0, 1, 3 have gridcells.
    const cells = [mockCell(0, 0), mockCell(0, 3), mockCell(1, 3), mockCell(3, 0), mockCell(3, 3)];

    it("findCellByCoords returns a cell at exact coordinates", () => {
        assert.equal(findCellByCoords(cells, 1, 3), cells[2]);
        assert.equal(findCellByCoords(cells, 2, 3), undefined);
    });

    it("cellCoords reads week and day from dataset", () => {
        assert.deepEqual(cellCoords(mockCell(4, 2)), { week: 4, day: 2 });
    });

    it("findCellInDirection skips hidden positions horizontally", () => {
        const start = mockCell(1, 3);
        assert.equal(findCellInDirection(cells, start, "ArrowLeft"), cells[1]);
        assert.equal(findCellInDirection(cells, start, "ArrowRight"), cells[4]);
    });

    it("findCellInDirection returns null at grid edge", () => {
        const start = mockCell(0, 0);
        assert.equal(findCellInDirection(cells, start, "ArrowLeft"), null);
        assert.equal(findCellInDirection(cells, start, "ArrowUp"), null);
    });

    it("findCellInDirection moves vertically skipping hidden days", () => {
        const weekCells = [mockCell(3, 0), mockCell(3, 3)];
        const start = mockCell(3, 3);
        assert.equal(findCellInDirection(weekCells, start, "ArrowUp"), weekCells[0]);
        assert.equal(findCellInDirection(weekCells, start, "ArrowDown"), null);
    });

    it("findFirstCellInDayRow skips leading hidden weeks", () => {
        assert.equal(findFirstCellInDayRow(cells, 3), cells[1]);
    });

    it("findLastCellInDayRow skips trailing hidden weeks", () => {
        assert.equal(findLastCellInDayRow(cells, 3), cells[4]);
    });

    it("findFirstCellInDayRow finds earliest week for day 0", () => {
        assert.equal(findFirstCellInDayRow(cells, 0), cells[0]);
    });

    it("findLastCellInDayRow finds latest week for day 0", () => {
        assert.equal(findLastCellInDayRow(cells, 0), cells[3]);
    });
});

describe("GitHub cache", () => {
    it("returns null when cache is empty", () => {
        cacheStorage.clear();
        assert.equal(readGitHubCache(), null);
    });

    it("reads valid cache within TTL", () => {
        cacheStorage.clear();
        const payload = {
            ts: Date.now(),
            user: { login: "klovaaxel" },
            activity: { contributions: [], total: { lastYear: 0 } },
        };
        cacheStorage.set(GITHUB_CACHE_KEY, JSON.stringify(payload));
        assert.deepEqual(readGitHubCache(), { user: payload.user, activity: payload.activity });
    });

    it("expires cache after TTL", () => {
        cacheStorage.clear();
        const payload = {
            ts: Date.now() - GITHUB_CACHE_TTL_MS - 1,
            user: { login: "klovaaxel" },
            activity: { contributions: [] },
        };
        cacheStorage.set(GITHUB_CACHE_KEY, JSON.stringify(payload));
        assert.equal(readGitHubCache(), null);
    });

    it("writes cache payload", () => {
        cacheStorage.clear();
        const user = { login: "klovaaxel" };
        const activity = { contributions: [{ date: "2026-01-01", count: 1, level: 1 }] };
        writeGitHubCache(user, activity);
        const raw = JSON.parse(cacheStorage.get(GITHUB_CACHE_KEY));
        assert.equal(raw.user.login, "klovaaxel");
        assert.equal(raw.activity.contributions.length, 1);
    });
});

describe("computeStreaks", () => {
    it("returns zeros for empty contributions", () => {
        assert.deepEqual(computeStreaks([]), { current: 0, longest: 0 });
        assert.deepEqual(computeStreaks(null), { current: 0, longest: 0 });
    });

    it("breaks streak on zero-count days", () => {
        const contributions = [
            { date: "2026-01-01", count: 1, level: 1 },
            { date: "2026-01-02", count: 1, level: 1 },
            { date: "2026-01-03", count: 0, level: 0 },
            { date: "2026-01-04", count: 1, level: 1 },
        ];
        assert.equal(computeStreaks(contributions).longest, 2);
    });
});

describe("buildWeeks", () => {
    it("returns empty array for empty contributions", () => {
        assert.deepEqual(buildWeeks([]), []);
        assert.deepEqual(buildWeeks(null), []);
    });
});

describe("escapeHtml", () => {
    it("escapes XSS-sensitive characters", () => {
        assert.equal(escapeHtml(`<script>"&'</script>`), "&lt;script&gt;&quot;&amp;'&lt;/script&gt;");
        assert.equal(escapeHtml("a & b"), "a &amp; b");
    });
});
