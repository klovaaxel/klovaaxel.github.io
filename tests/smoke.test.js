import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { GITHUB_TEMPLATE_IDS } from "./fixtures/github-template-ids.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(ROOT, "index.html"), "utf8");

const REQUIRED_IDS = ["main", "github-dashboard", "live-status", "portfolio-theme-data", "connect", "social-links"];

function assertIdPresent(id) {
    const pattern = new RegExp(`\\bid=["']${id}["']`);
    assert.match(html, pattern, `missing id="${id}"`);
}

function collectIds(source) {
    const ids = [];
    const re = /\bid=["']([^"']+)["']/g;
    let match;
    while ((match = re.exec(source)) !== null) {
        ids.push(match[1]);
    }
    return ids;
}

function collectScriptSrcs(source) {
    const srcs = [];
    const tagRe = /<script\b[^>]*>/gi;
    let tagMatch;
    while ((tagMatch = tagRe.exec(source)) !== null) {
        const tag = tagMatch[0];
        const srcMatch = /\bsrc=["']([^"']+)["']/i.exec(tag);
        if (srcMatch) srcs.push(srcMatch[1]);
    }
    return srcs;
}

function collectTemplateIds(source) {
    const ids = [];
    const re = /<template\b[^>]*\bid=["']([^"']+)["']/gi;
    let match;
    while ((match = re.exec(source)) !== null) {
        ids.push(match[1]);
    }
    return ids;
}

function hasMetaProperty(property) {
    return new RegExp(`<meta\\s+[^>]*property=["']${property}["']`, "i").test(html);
}

describe("index.html smoke", () => {
    it("includes required landmark and hook ids", () => {
        for (const id of REQUIRED_IDS) {
            assertIdPresent(id);
        }
    });

    it("includes a skip link to main content", () => {
        assert.match(html, /<a\b[^>]*class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main["']/i);
    });

    it("includes Open Graph type and image meta tags", () => {
        assert.ok(hasMetaProperty("og:type"), "missing og:type meta tag");
        assert.ok(hasMetaProperty("og:image"), "missing og:image meta tag");
    });

    it("has no duplicate id attributes", () => {
        const ids = collectIds(html);
        const seen = new Set();
        const duplicates = new Set();
        for (const id of ids) {
            if (seen.has(id)) duplicates.add(id);
            seen.add(id);
        }
        assert.deepEqual([...duplicates], [], `duplicate ids: ${[...duplicates].join(", ")}`);
    });

    it("references existing files from script src attributes", () => {
        const srcs = collectScriptSrcs(html);
        assert.ok(srcs.length > 0, "expected at least one script src");
        for (const src of srcs) {
            const filePath = resolve(ROOT, src.replace(/^\//, ""));
            assert.ok(existsSync(filePath), `script src missing on disk: ${src}`);
        }
    });

    it("references an existing og:image asset", () => {
        const match = /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html);
        assert.ok(match, "og:image meta tag with content not found");
        const imageUrl = new URL(match[1]);
        const imagePath = resolve(ROOT, imageUrl.pathname.replace(/^\//, ""));
        assert.ok(existsSync(imagePath), `og:image file missing: ${imagePath}`);
    });

    it("validates template ids when templates are present", () => {
        const templateIds = collectTemplateIds(html);
        if (templateIds.length === 0) return;

        for (const id of templateIds) {
            assertIdPresent(id);
        }

        for (const id of GITHUB_TEMPLATE_IDS) {
            assert.ok(templateIds.includes(id), `missing GitHub template id="${id}"`);
        }
    });

    it("loads early theme bootstrap before body", () => {
        const headEnd = html.indexOf("</head>");
        const head = html.slice(0, headEnd);
        assert.match(head, /<script\s+src=["']js\/theme-bootstrap\.js["']/);
    });

    it("includes animated ambient theme layer", () => {
        assert.match(html, /class=["'][^"']*theme-ambient[^"']*["']/);
        const baseCss = readFileSync(join(ROOT, "css/base.css"), "utf8");
        assert.match(baseCss, /theme-ambient\.css/);
        assert.ok(existsSync(join(ROOT, "css/theme-ambient.css")), "missing css/theme-ambient.css");
    });

    it("includes self-hosted Atkinson font files", () => {
        for (const file of [
            "assets/fonts/atkinson-hyperlegible-latin-400.woff2",
            "assets/fonts/atkinson-hyperlegible-latin-700.woff2",
        ]) {
            assert.ok(existsSync(join(ROOT, file)), `missing font file: ${file}`);
        }
        assert.ok(existsSync(join(ROOT, "css/fonts.css")), "missing css/fonts.css");
    });
});
