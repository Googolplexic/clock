/**
 * Wall clock (12-hour display).
 */
function initClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours() % 12 || 12);
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();
}

window.initClock = initClock;
