import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildThemePool, pickRandomThemeId } from "../js/theme-pick.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const THEMES = [
    { id: "dark" },
    { id: "light" },
    { id: "forest" },
    { id: "ocean" },
    { id: "sketch", requiresBorderShape: true },
];

describe("theme-bootstrap alignment", () => {
    it("buildThemePool matches bootstrap sketch gating", () => {
        assert.deepEqual(buildThemePool(THEMES, false), ["dark", "light", "forest", "ocean"]);
        assert.deepEqual(buildThemePool(THEMES, true), ["dark", "light", "forest", "ocean", "sketch"]);
    });

    it("pickRandomThemeId uses the same index formula as theme-bootstrap.js", () => {
        const pool = buildThemePool(THEMES, true);
        const random = 0.42;
        const bootstrapIndex = Math.floor(random * pool.length);
        assert.equal(pickRandomThemeId(THEMES, "dark", true, random), pool[bootstrapIndex]);
    });

    it("theme-bootstrap.js filters sketch with border-shape support", () => {
        const source = readFileSync(join(ROOT, "js/theme-bootstrap.js"), "utf8");
        assert.match(source, /id !== "sketch" \|\| supportsSketch/);
        assert.match(source, /CSS\.supports\("border-shape", "circle\(50%\)"\)/);
    });
});
