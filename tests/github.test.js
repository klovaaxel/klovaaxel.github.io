import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildWeeks, computeStreaks } from "../js/github.js";
import { escapeHtml } from "../js/html.js";

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
