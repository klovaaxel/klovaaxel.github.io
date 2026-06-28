import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { beginGitHubLoad, isGitHubLoadCurrent } from "../js/github.js";

describe("GitHub load generation", () => {
    it("marks only the latest load as current", () => {
        const first = beginGitHubLoad();
        assert.ok(isGitHubLoadCurrent(first));

        const second = beginGitHubLoad();
        assert.ok(!isGitHubLoadCurrent(first));
        assert.ok(isGitHubLoadCurrent(second));
    });
});
