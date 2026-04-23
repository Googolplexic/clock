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

    let timerInterval;
    let remainingTime = 0;
    let isRunning = false;

    function updateTimerDisplay() {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent =
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
        const title = (timerTitle && timerTitle.value) || 'Timer';
        if (timerTitleDisplay) timerTitleDisplay.textContent = title;
    }

    function handleComplete() {
        clearInterval(timerInterval);
        isRunning = false;
        const title = (timerTitle && timerTitle.value) || 'Timer';
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
                showRunningView();
                updateTimerDisplay();
                isRunning = true;
                timerInterval = setInterval(function () {
                    remainingTime--;
                    updateTimerDisplay();

                    if (remainingTime <= 0) {
                        handleComplete();
                    }
                }, 1000);
            }
        }
    }

    function togglePause() {
        const btn = pauseBtn;
        if (!btn) return;
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
            btn.textContent = 'Resume';
        } else {
            isRunning = true;
            btn.textContent = 'Pause';
            timerInterval = setInterval(function () {
                remainingTime--;
                updateTimerDisplay();
                if (remainingTime <= 0) {
                    handleComplete();
                }
            }, 1000);
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', showTimerSetup);
    if (backBtn) backBtn.addEventListener('click', hideTimer);
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
}

window.initTimer = initTimer;
