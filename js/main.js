import { initTheme } from "./theme.js";
import { loadGitHubDashboard } from "./github.js";
import { initCursor, refreshCursorTargets } from "./cursor.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initCursor();
    refreshCursorTargets();
    loadGitHubDashboard();
});
