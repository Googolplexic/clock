/**
 * Bootstraps clock, timer, themes, and timer-finished toast.
 */
(function () {
    function showTimerFinishBanner(title) {
        var el = document.getElementById('timerToast');
        if (!el) return;
        var name = title && String(title).trim() ? title : 'Timer';
        el.textContent = name + ' finished!';
        el.hidden = false;
        el.classList.add('is-visible');
        window.setTimeout(function () {
            el.classList.remove('is-visible');
            el.hidden = true;
        }, 3200);
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof window.initThemes === 'function') window.initThemes();
        if (typeof window.initClock === 'function') window.initClock();
        if (typeof window.initTimer === 'function') {
            window.initTimer({ onFinish: showTimerFinishBanner });
        }
    });
})();
