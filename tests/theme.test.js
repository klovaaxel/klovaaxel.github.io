import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { resolveTheme, supportsSketchTheme } from "../js/theme.js";

const originalCss = globalThis.CSS;

describe("resolveTheme", () => {
    before(() => {
        globalThis.CSS = { supports: () => false };
    });

    after(() => {
        if (originalCss === undefined) {
            delete globalThis.CSS;
        } else {
            globalThis.CSS = originalCss;
        }
    });

    it("returns default theme when theme id is missing", () => {
        assert.equal(resolveTheme("not-a-theme"), "dark");
    });

    it("returns default theme when sketch is unsupported", () => {
        assert.equal(resolveTheme("sketch"), "dark");
    });

    it("returns valid theme when sketch is supported", () => {
        globalThis.CSS = { supports: (prop) => prop === "border-shape" };
        assert.equal(resolveTheme("sketch"), "sketch");
    });
});

describe("supportsSketchTheme", () => {
    after(() => {
        if (originalCss === undefined) {
            delete globalThis.CSS;
        } else {
            globalThis.CSS = originalCss;
        }
    });

    it("reflects CSS border-shape support", () => {
        globalThis.CSS = { supports: () => true };
        assert.equal(supportsSketchTheme(), true);

        globalThis.CSS = { supports: () => false };
        assert.equal(supportsSketchTheme(), false);
    });
});
