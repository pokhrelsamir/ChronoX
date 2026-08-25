/**
 * =========================================================
 * ChronoX
 * Precision Stopwatch
 * =========================================================
 *
 * Responsibilities:
 * - Start stopwatch
 * - Pause stopwatch
 * - Reset stopwatch
 * - Record laps
 * - Display hundredths of a second
 * - Maintain accurate elapsed time
 *
 * =========================================================
 */

const Stopwatch = (() => {

    /* =====================================================
       STATE
    ====================================================== */

    let running = false;
    let startTimestamp = 0;
    let elapsedBeforeStart = 0;

    let animationFrame = null;

    let lapCount = 0;
    let lastLapTime = 0;


    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

    const elements = {
        display: document.getElementById(
            "stopwatch-display"
        ),

        startButton: document.getElementById(
            "stopwatch-start"
        ),

        lapButton: document.getElementById(
            "stopwatch-lap"
        ),

        resetButton: document.getElementById(
            "stopwatch-reset"
        ),

        lapList: document.getElementById(
            "lap-list"
        )
    };


    /* =====================================================
       FORMAT TIME
    ====================================================== */

    function formatTime(milliseconds) {

        const totalCentiseconds =
            Math.floor(milliseconds / 10);

        const centiseconds =
            totalCentiseconds % 100;

        const totalSeconds =
            Math.floor(totalCentiseconds / 100);

        const seconds =
            totalSeconds % 60;

        const minutes =
            Math.floor(totalSeconds / 60) % 60;

        const hours =
            Math.floor(totalSeconds / 3600);


        return [
            String(hours).padStart(2, "0"),
            String(minutes).padStart(2, "0"),
            String(seconds).padStart(2, "0")
        ].join(":") +
        "." +
        String(centiseconds).padStart(2, "0");
    }


    /* =====================================================
       GET ELAPSED TIME
    ====================================================== */

    function getElapsedTime() {

        if (!running) {
            return elapsedBeforeStart;
        }

        return (
            elapsedBeforeStart +
            (performance.now() - startTimestamp)
        );
    }


    /* =====================================================
       UPDATE DISPLAY
    ====================================================== */

    function updateDisplay() {

        if (!elements.display) {
            return;
        }

        elements.display.textContent =
            formatTime(getElapsedTime());
    }


    /* =====================================================
       ANIMATION LOOP
    ====================================================== */

    function tick() {

        updateDisplay();

        if (running) {

            animationFrame =
                requestAnimationFrame(tick);
        }
    }


    /* =====================================================
       START
    ====================================================== */

    function start() {

        if (running) {
            return;
        }

        running = true;

        startTimestamp =
            performance.now();

        if (elements.startButton) {

            elements.startButton.textContent =
                "Pause";
        }

        if (elements.lapButton) {

            elements.lapButton.disabled =
                false;
        }

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

        elapsedBeforeStart =
            getElapsedTime();

        running = false;

        cancelAnimationFrame(
            animationFrame
        );

        updateDisplay();

        if (elements.startButton) {

            elements.startButton.textContent =
                "Start";
        }

        if (elements.lapButton) {

            elements.lapButton.disabled =
                elapsedBeforeStart <= 0;
        }
    }


    /* =====================================================
       TOGGLE START / PAUSE
    ====================================================== */

    function toggle() {

        if (running) {
            pause();
        } else {
            start();
        }
    }


    /* =====================================================
       LAP
    ====================================================== */

    function recordLap() {

        if (!running) {
            return;
        }

        const currentTime =
            getElapsedTime();

        const lapTime =
            currentTime - lastLapTime;

        lastLapTime =
            currentTime;

        lapCount++;

        addLap(
            lapCount,
            lapTime,
            currentTime
        );
    }


    /* =====================================================
       ADD LAP TO UI
    ====================================================== */

    function addLap(
        number,
        lapTime,
        totalTime
    ) {

        if (!elements.lapList) {
            return;
        }

        const lapElement =
            document.createElement("div");

        lapElement.className =
            "lap-item";

        lapElement.innerHTML = `
            <span>Lap ${number}</span>

            <strong>
                ${formatTime(lapTime)}
            </strong>
        `;

        /*
         * Newest lap appears first.
         */
        elements.lapList.prepend(
            lapElement
        );
    }


    /* =====================================================
       RESET
    ====================================================== */

    function reset() {

        running = false;

        cancelAnimationFrame(
            animationFrame
        );

        startTimestamp = 0;
        elapsedBeforeStart = 0;

        lapCount = 0;
        lastLapTime = 0;

        updateDisplay();


        if (elements.startButton) {

            elements.startButton.textContent =
                "Start";
        }


        if (elements.lapButton) {

            elements.lapButton.disabled =
                true;
        }


        if (elements.lapList) {

            elements.lapList.innerHTML = "";
        }
    }


    /* =====================================================
       EVENT LISTENERS
    ====================================================== */

    function bindEvents() {

        if (elements.startButton) {

            elements.startButton.addEventListener(
                "click",
                toggle
            );
        }


        if (elements.lapButton) {

            elements.lapButton.addEventListener(
                "click",
                recordLap
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

        bindEvents();

        reset();
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,
        start,
        pause,
        reset,
        recordLap,

        getElapsedTime,

        isRunning: () => running
    };

})();


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Stopwatch.init();

    }
);