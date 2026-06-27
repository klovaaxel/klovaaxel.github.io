export function announceStatus(message) {
    const region = document.getElementById("live-status");
    if (!region || !message) return;

    region.textContent = "";
    window.requestAnimationFrame(() => {
        region.textContent = message;
    });
}
