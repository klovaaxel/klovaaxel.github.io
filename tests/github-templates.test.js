import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { GITHUB_TEMPLATE_IDS } from "./fixtures/github-template-ids.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectTemplateIds(source) {
    const ids = [];
    const re = /<template\b[^>]*\bid=["']([^"']+)["']/gi;
    let match;
    while ((match = re.exec(source)) !== null) {
        ids.push(match[1]);
    }
    return ids;
}

function collectCloneTemplateIds(source) {
    const ids = [];
    const re = /cloneTemplate\(["']([^"']+)["']\)/g;
    let match;
    while ((match = re.exec(source)) !== null) {
        ids.push(match[1]);
    }
    return [...new Set(ids)].sort();
}

describe("GitHub template contract", () => {
    const html = readFileSync(join(ROOT, "index.html"), "utf8");
    const githubJs = readFileSync(join(ROOT, "js/github.js"), "utf8");
    const htmlTemplateIds = collectTemplateIds(html);

    it("lists every template id used by cloneTemplate in github.js", () => {
        const usedIds = collectCloneTemplateIds(githubJs);
        assert.deepEqual(usedIds, [...GITHUB_TEMPLATE_IDS].sort());
    });

    it("includes every canonical id in index.html", () => {
        for (const id of GITHUB_TEMPLATE_IDS) {
            assert.ok(htmlTemplateIds.includes(id), `index.html missing template id="${id}"`);
        }
    });
});
