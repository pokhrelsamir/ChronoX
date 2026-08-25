/**
 * =========================================================
 * ChronoX
 * Countdown Timer
 * =========================================================
 *
 * Responsibilities:
 * - Countdown timer
 * - Preset durations
 * - Start / pause / resume
 * - Reset
 * - Accurate time tracking
 * - Completion notification
 * - Progress state
 *
 * =========================================================
 */

const Timer = (() => {

    /* =====================================================
       STATE
    ====================================================== */

    let running = false;

    let duration = 5 * 60 * 1000;
    let remaining = duration;

    let startTimestamp = 0;
    let remainingAtPause = duration;

    let animationFrame = null;


    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

    const elements = {
        display: document.getElementById(
            "timer-display"
        ),

        startButton: document.getElementById(
            "timer-start"
        ),

        pauseButton: document.getElementById(
            "timer-pause"
        ),

        resetButton: document.getElementById(
            "timer-reset"
        ),

        presets: document.querySelectorAll(
            ".preset-button"
        )
    };


    /* =====================================================
       FORMAT TIME
    ====================================================== */

    function formatTime(milliseconds) {

        const totalSeconds =
            Math.max(
                0,
                Math.ceil(milliseconds / 1000)
            );

        const seconds =
            totalSeconds % 60;

        const minutes =
            Math.floor(totalSeconds / 60) % 60;

        const hours =
            Math.floor(totalSeconds / 3600);


        if (hours > 0) {

            return [
                String(hours).padStart(2, "0"),
                String(minutes).padStart(2, "0"),
                String(seconds).padStart(2, "0")
            ].join(":");
        }


        return [
            String(minutes).padStart(2, "0"),
            String(seconds).padStart(2, "0")
        ].join(":");
    }


    /* =====================================================
       UPDATE DISPLAY
    ====================================================== */

    function updateDisplay() {

        if (!elements.display) {
            return;
        }

        elements.display.textContent =
            formatTime(remaining);
    }


    /* =====================================================
       UPDATE BUTTON STATE
    ====================================================== */

    function updateControls() {

        if (elements.startButton) {

            elements.startButton.textContent =
                running ? "Running" : "Start";

            elements.startButton.disabled =
                running || remaining <= 0;
        }


        if (elements.pauseButton) {

            elements.pauseButton.textContent =
                "Pause";

            elements.pauseButton.disabled =
                !running;
        }
    }


    /* =====================================================
       UPDATE PRESET STATE
    ====================================================== */

    function updatePresetState() {

        elements.presets.forEach(button => {

            const minutes =
                Number(button.dataset.minutes);

            const buttonDuration =
                minutes * 60 * 1000;

            button.classList.toggle(
                "active",
                buttonDuration === duration
            );
        });
    }


    /* =====================================================
       PROGRESS
    ====================================================== */

    function updateProgress() {

        if (!elements.display) {
            return;
        }

        const progress =
            duration > 0
                ? remaining / duration
                : 0;

        elements.display.style.setProperty(
            "--timer-progress",
            `${progress * 100}%`
        );
    }


    /* =====================================================
       GET REMAINING TIME
    ====================================================== */

    function getRemainingTime() {

        if (!running) {
            return remainingAtPause;
        }

        const elapsed =
            performance.now() -
            startTimestamp;

        return Math.max(
            0,
            remainingAtPause - elapsed
        );
    }


    /* =====================================================
       TIMER LOOP
    ====================================================== */

    function tick() {

        remaining =
            getRemainingTime();

        updateDisplay();
        updateProgress();


        if (remaining <= 0) {

            complete();

            return;
        }


        animationFrame =
            requestAnimationFrame(tick);
    }


    /* =====================================================
       START
    ====================================================== */

    function start() {

        if (running || remaining <= 0) {
            return;
        }

        running = true;

        remainingAtPause =
            remaining;

        startTimestamp =
            performance.now();

        updateControls();

        animationFrame =
            requestAnimationFrame(tick);
    }


    /* =====================================================
       PAUSE
    ====================================================== */

    function pause() {

        if (!running) {
            return;
        }

        remaining =
            getRemainingTime();

        remainingAtPause =
            remaining;

        running = false;

        cancelAnimationFrame(
            animationFrame
        );

        updateDisplay();
        updateProgress();
        updateControls();
    }


    /* =====================================================
       RESET
    ====================================================== */

    function reset() {

        running = false;

        cancelAnimationFrame(
            animationFrame
        );

        remaining =
            duration;

        remainingAtPause =
            duration;

        startTimestamp = 0;

        updateDisplay();
        updateProgress();
        updateControls();
    }


    /* =====================================================
       SET DURATION
    ====================================================== */

    function setDuration(minutes) {

        const value =
            Number(minutes);

        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {
            return;
        }

        duration =
            value * 60 * 1000;

        remaining =
            duration;

        remainingAtPause =
            duration;

        running = false;

        cancelAnimationFrame(
            animationFrame
        );

        updatePresetState();
        updateDisplay();
        updateProgress();
        updateControls();
    }


    /* =====================================================
       COMPLETE
    ====================================================== */

    function complete() {

        running = false;

        remaining = 0;
        remainingAtPause = 0;

        cancelAnimationFrame(
            animationFrame
        );

        updateDisplay();
        updateProgress();
        updateControls();

        notifyCompletion();
    }


    /* =====================================================
       COMPLETION NOTIFICATION
    ====================================================== */

    function notifyCompletion() {

        /*
         * Visual toast if app.js provides one.
         */
        if (
            typeof App !== "undefined" &&
            typeof App.showToast === "function"
        ) {

            App.showToast(
                "Timer complete."
            );
        }


        /*
         * Browser notification.
         */
        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {

            new Notification(
                "ChronoX Timer",
                {
                    body: "Your countdown has finished."
                }
            );
        }


        /*
         * Lightweight audio notification.
         */
        playCompletionSound();
    }


    /* =====================================================
       COMPLETION SOUND
    ====================================================== */

    function playCompletionSound() {

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return;
            }

            const context =
                new AudioContext();

            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();


            oscillator.type =
                "sine";

            oscillator.frequency.value =
                880;

            gain.gain.setValueAtTime(
                0.0001,
                context.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.12,
                context.currentTime + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                context.currentTime + 0.45
            );


            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();

            oscillator.stop(
                context.currentTime + 0.45
            );

        } catch (error) {

            /*
             * Audio is optional.
             * Ignore browser restrictions.
             */
        }
    }


    /* =====================================================
       REQUEST NOTIFICATION PERMISSION
    ====================================================== */

    async function requestNotificationPermission() {

        if (
            !("Notification" in window)
        ) {
            return;
        }

        if (
            Notification.permission === "default"
        ) {

            try {

                await Notification.requestPermission();

            } catch {
                /*
                 * Notification permission is optional.
                 */
            }
        }
    }


    /* =====================================================
       PRESET EVENTS
    ====================================================== */

    function bindPresetEvents() {

        elements.presets.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const minutes =
                        Number(
                            button.dataset.minutes
                        );

                    setDuration(minutes);

                }
            );

        });
    }


    /* =====================================================
       BUTTON EVENTS
    ====================================================== */

    function bindButtonEvents() {

        if (elements.startButton) {

            elements.startButton.addEventListener(
                "click",
                async () => {

                    await requestNotificationPermission();

                    start();
                }
            );
        }


        if (elements.pauseButton) {

            elements.pauseButton.addEventListener(
                "click",
                pause
            );
        }


        if (elements.resetButton) {

            elements.resetButton.addEventListener(
                "click",
                reset
            );
        }
    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function init() {

        bindPresetEvents();

        bindButtonEvents();

        updatePresetState();

        updateDisplay();

        updateProgress();

        updateControls();
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,

        start,
        pause,
        reset,

        setDuration,

        getRemainingTime,

        isRunning: () => running,

        getDuration: () => duration
    };

})();


/* =========================================================
   INITIALIZE TIMER
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Timer.init();

    }
);