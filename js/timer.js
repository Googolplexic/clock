/**
 * Countdown timer with setup and running views.
 */
function initTimer(options) {
    const onFinish = options && typeof options.onFinish === 'function' ? options.onFinish : function () {};

    const clockEl = document.getElementById('clock');
    const clockHeader = document.getElementById('clockHeader');
    const toggleBtn = document.getElementById('toggleBtn');
    const timerSection = document.getElementById('timerSection');
    const timerSetup = document.getElementById('timerSetup');
    const timerRunning = document.getElementById('timerRunning');
    const timerTitle = document.getElementById('timerTitle');
    const timerTitleDisplay = document.getElementById('timerTitleDisplay');
    const timerDisplay = document.getElementById('timerDisplay');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const pauseBtn = document.getElementById('pauseBtn');
    const startBtn = document.getElementById('startBtn');
    const backBtn = document.getElementById('backBtn');
    const stopBtn = document.getElementById('stopBtn');

    const originalDocumentTitle = document.title;
    let timerInterval;
    let titleFlashInterval;
    let titleRestoreTimeout;
    let notificationPermissionRequest;
    let endTime = 0;
    let remainingTime = 0;
    let isRunning = false;

    function syncRemainingTime() {
        if (!isRunning || !endTime) return;
        remainingTime = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    }

    function updateTimerDisplay() {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent =
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function getTimerTitle() {
        const title = timerTitle && timerTitle.value && timerTitle.value.trim();
        return title || 'Timer';
    }

    function canUseNotifications() {
        return 'Notification' in window;
    }

    function requestNotificationPermission() {
        if (!canUseNotifications() || Notification.permission !== 'default') return;

        try {
            if (!notificationPermissionRequest) {
                const permissionRequest = Notification.requestPermission();
                notificationPermissionRequest = permissionRequest &&
                    typeof permissionRequest.catch === 'function'
                    ? permissionRequest.catch(function () {})
                    : permissionRequest;
            }
        } catch (error) {
            notificationPermissionRequest = null;
        }
    }

    function showSystemNotification(title) {
        if (!canUseNotifications() || Notification.permission !== 'granted') return;

        try {
            const notification = new Notification(`${title} finished!`, {
                body: 'Your countdown timer is done.',
                badge: '/favicon.svg',
                icon: '/apple-touch-icon.svg',
                renotify: true,
                requireInteraction: true,
                tag: 'clock-timer-finished'
            });

            notification.onclick = function () {
                window.focus();
                notification.close();
            };
        } catch (error) {
            // Some browsers expose Notification but still block construction in-page.
        }
    }

    function stopFlashingTitle() {
        clearInterval(titleFlashInterval);
        clearTimeout(titleRestoreTimeout);
        titleFlashInterval = null;
        titleRestoreTimeout = null;
        document.title = originalDocumentTitle;
    }

    function flashTitle(title) {
        stopFlashingTitle();

        let showAlert = true;
        const alertTitle = `${title} finished!`;
        document.title = alertTitle;
        titleFlashInterval = setInterval(function () {
            document.title = showAlert ? alertTitle : originalDocumentTitle;
            showAlert = !showAlert;
        }, 1000);
        titleRestoreTimeout = setTimeout(stopFlashingTitle, 30000);
    }

    function tickTimer() {
        if (!isRunning) return;

        syncRemainingTime();
        updateTimerDisplay();

        if (remainingTime <= 0) {
            handleComplete();
        }
    }

    function showTimerSetup() {
        if (clockEl) clockEl.classList.add('small');
        if (clockHeader) clockHeader.style.display = 'none';
        if (toggleBtn) toggleBtn.classList.add('hidden');
        if (timerSection) timerSection.classList.add('visible');
        if (timerSetup) timerSetup.classList.remove('hidden');
        if (timerRunning) {
            timerRunning.classList.remove('visible');
            document.body.classList.remove('timer-running-active');
        }
    }

    function hideTimer() {
        if (clockEl) clockEl.classList.remove('small');
        if (clockHeader) clockHeader.style.display = '';
        if (toggleBtn) toggleBtn.classList.remove('hidden');
        if (timerSection) timerSection.classList.remove('visible');
        if (timerSetup) timerSetup.classList.remove('hidden');
        if (timerRunning) timerRunning.classList.remove('visible');
        document.body.classList.remove('timer-running-active');
        clearInterval(timerInterval);
        endTime = 0;
        isRunning = false;
        remainingTime = 0;
        if (minutesEl) minutesEl.value = '';
        if (secondsEl) secondsEl.value = '';
        if (pauseBtn) pauseBtn.textContent = 'Pause';
        updateTimerDisplay();
    }

    function stopTimer() {
        hideTimer();
    }

    function showRunningView() {
        if (timerSetup) timerSetup.classList.add('hidden');
        if (timerRunning) timerRunning.classList.add('visible');
        document.body.classList.add('timer-running-active');
        const title = getTimerTitle();
        if (timerTitleDisplay) timerTitleDisplay.textContent = title;
    }

    function handleComplete() {
        clearInterval(timerInterval);
        endTime = 0;
        isRunning = false;
        const title = getTimerTitle();
        showSystemNotification(title);
        flashTitle(title);
        onFinish(title);
        hideTimer();
    }

    function startTimer() {
        if (!isRunning) {
            if (remainingTime === 0) {
                const minutes = parseInt(minutesEl && minutesEl.value, 10) || 0;
                const seconds = parseInt(secondsEl && secondsEl.value, 10) || 0;
                remainingTime = minutes * 60 + seconds;
            }

            if (remainingTime > 0) {
                requestNotificationPermission();
                stopFlashingTitle();
                showRunningView();
                updateTimerDisplay();
                isRunning = true;
                endTime = Date.now() + remainingTime * 1000;
                clearInterval(timerInterval);
                timerInterval = setInterval(tickTimer, 250);
            }
        }
    }

    function togglePause() {
        const btn = pauseBtn;
        if (!btn) return;
        if (isRunning) {
            syncRemainingTime();
            clearInterval(timerInterval);
            endTime = 0;
            isRunning = false;
            updateTimerDisplay();
            btn.textContent = 'Resume';
        } else {
            if (remainingTime <= 0) return;
            isRunning = true;
            endTime = Date.now() + remainingTime * 1000;
            btn.textContent = 'Pause';
            clearInterval(timerInterval);
            timerInterval = setInterval(tickTimer, 250);
            tickTimer();
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', showTimerSetup);
    if (backBtn) backBtn.addEventListener('click', hideTimer);
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    document.addEventListener('visibilitychange', tickTimer);
    window.addEventListener('focus', tickTimer);
    window.addEventListener('focus', stopFlashingTitle);
    window.addEventListener('pageshow', tickTimer);
}

window.initTimer = initTimer;
