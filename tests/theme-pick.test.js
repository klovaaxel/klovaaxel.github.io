import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildThemePool, pickRandomThemeId } from "../js/theme-pick.js";

const THEMES = [{ id: "dark" }, { id: "light" }, { id: "forest" }, { id: "ocean" }, { id: "sketch" }];

describe("buildThemePool", () => {
    it("excludes sketch when border-shape is unsupported", () => {
        assert.deepEqual(buildThemePool(THEMES, false), ["dark", "light", "forest", "ocean"]);
    });

    it("includes sketch when border-shape is supported", () => {
        assert.deepEqual(buildThemePool(THEMES, true), ["dark", "light", "forest", "ocean", "sketch"]);
    });
});

describe("pickRandomThemeId", () => {
    it("picks deterministically from the pool", () => {
        assert.equal(pickRandomThemeId(THEMES, "dark", false, 0), "dark");
        assert.equal(pickRandomThemeId(THEMES, "dark", true, 0.99), "sketch");
    });

    it("falls back to default when pool is empty", () => {
        assert.equal(pickRandomThemeId([], "dark", false), "dark");
    });
});
