/**
 * =========================================================
 * ChronoX
 * Live Clock Engine
 * =========================================================
 *
 * Responsibilities:
 * - Live local clock
 * - Current date
 * - Local timezone detection
 * - UTC offset calculation
 * - 12/24-hour formatting
 * - Seconds visibility
 * - World clock updates
 *
 * =========================================================
 */

const Clock = (() => {

    /* =====================================================
       STATE
    ====================================================== */

    let use24Hour = true;
    let showSeconds = true;

    let clockInterval = null;


    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

    const elements = {
        clock: document.getElementById("digital-clock"),
        date: document.getElementById("current-date"),

        timezoneName: document.getElementById("timezone-name"),
        timezoneOffset: document.getElementById("timezone-offset"),

        formatLabel: document.getElementById("format-label"),
        settingsFormat: document.getElementById("settings-format"),

        showSeconds: document.getElementById("show-seconds"),

        worldTimes: document.querySelectorAll(".world-time"),
        worldDates: document.querySelectorAll(".world-date")
    };


    /* =====================================================
       FORMATTERS
    ====================================================== */

    function formatTime(date) {

        const options = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24Hour
        };

        if (showSeconds) {
            options.second = "2-digit";
        }

        return new Intl.DateTimeFormat(
            undefined,
            options
        ).format(date);
    }


    function formatDate(date) {

        return new Intl.DateTimeFormat(
            undefined,
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        ).format(date);
    }


    function formatWorldTime(date, timezone) {

        const options = {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: !use24Hour
        };

        return new Intl.DateTimeFormat(
            undefined,
            options
        ).format(date);
    }


    function formatWorldDate(date, timezone) {

        return new Intl.DateTimeFormat(
            undefined,
            {
                timeZone: timezone,
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        ).format(date);
    }


    /* =====================================================
       TIMEZONE
    ====================================================== */

    function getLocalTimezone() {

        try {

            return Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone || "Local Time";

        } catch {

            return "Local Time";
        }
    }


    function getTimezoneOffset(date) {

        const timezone = getLocalTimezone();

        try {

            const parts = new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: timezone,
                    timeZoneName: "longOffset"
                }
            ).formatToParts(date);

            const offsetPart = parts.find(
                part => part.type === "timeZoneName"
            );

            if (!offsetPart) {
                return "UTC";
            }

            return offsetPart.value
                .replace("GMT", "UTC");

        } catch {

            return "UTC";
        }
    }


    /* =====================================================
       MAIN CLOCK
    ====================================================== */

    function updateMainClock() {

        const now = new Date();

        if (elements.clock) {
            elements.clock.textContent =
                formatTime(now);
        }

        if (elements.date) {
            elements.date.textContent =
                formatDate(now);
        }

        if (elements.timezoneName) {
            elements.timezoneName.textContent =
                getLocalTimezone();
        }

        if (elements.timezoneOffset) {
            elements.timezoneOffset.textContent =
                getTimezoneOffset(now);
        }
    }


    /* =====================================================
       WORLD CLOCKS
    ====================================================== */

    function updateWorldClocks() {

        const now = new Date();

        elements.worldTimes.forEach(element => {

            const timezone =
                element.dataset.zone;

            if (!timezone) {
                return;
            }

            try {

                element.textContent =
                    formatWorldTime(
                        now,
                        timezone
                    );

            } catch {

                element.textContent = "--:--";
            }
        });


        elements.worldDates.forEach(element => {

            const timezone =
                element.dataset.zoneDate;

            if (!timezone) {
                return;
            }

            try {

                element.textContent =
                    formatWorldDate(
                        now,
                        timezone
                    );

            } catch {

                element.textContent = "---";
            }
        });
    }


    /* =====================================================
       UPDATE EVERYTHING
    ====================================================== */

    function update() {

        updateMainClock();
        updateWorldClocks();
    }


    /* =====================================================
       FORMAT CONTROL
    ====================================================== */

    function setFormat(format) {

        use24Hour = format !== "12";

        if (elements.formatLabel) {

            elements.formatLabel.textContent =
                use24Hour ? "24H" : "12H";
        }

        if (elements.settingsFormat) {

            elements.settingsFormat.value =
                use24Hour ? "24" : "12";
        }

        update();
    }


    function toggleFormat() {

        setFormat(
            use24Hour ? "12" : "24"
        );
    }


    /* =====================================================
       SECONDS CONTROL
    ====================================================== */

    function setShowSeconds(enabled) {

        showSeconds = Boolean(enabled);

        update();
    }


    /* =====================================================
       EVENT LISTENERS
    ====================================================== */

    function bindEvents() {

        const formatToggle =
            document.getElementById("format-toggle");

        if (formatToggle) {

            formatToggle.addEventListener(
                "click",
                toggleFormat
            );
        }


        if (elements.settingsFormat) {

            elements.settingsFormat.addEventListener(
                "change",
                event => {

                    setFormat(
                        event.target.value
                    );

                    if (
                        typeof StorageManager !== "undefined" &&
                        StorageManager.save
                    ) {

                        StorageManager.save(
                            "timeFormat",
                            event.target.value
                        );
                    }
                }
            );
        }


        if (elements.showSeconds) {

            elements.showSeconds.addEventListener(
                "change",
                event => {

                    setShowSeconds(
                        event.target.checked
                    );

                    if (
                        typeof StorageManager !== "undefined" &&
                        StorageManager.save
                    ) {

                        StorageManager.save(
                            "showSeconds",
                            event.target.checked
                        );
                    }
                }
            );
        }
    }


    /* =====================================================
       STORAGE
    ====================================================== */

    function loadPreferences() {

        if (
            typeof StorageManager === "undefined" ||
            !StorageManager.get
        ) {
            return;
        }


        const savedFormat =
            StorageManager.get("timeFormat");


        if (savedFormat === "12" ||
            savedFormat === "24") {

            setFormat(savedFormat);
        }


        const savedSeconds =
            StorageManager.get("showSeconds");


        if (typeof savedSeconds === "boolean") {

            setShowSeconds(savedSeconds);

            if (elements.showSeconds) {
                elements.showSeconds.checked =
                    savedSeconds;
            }
        }
    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function init() {

        bindEvents();

        loadPreferences();

        update();

        /*
         * Update every second.
         */
        clockInterval =
            setInterval(update, 1000);
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,
        update,

        setFormat,
        toggleFormat,

        setShowSeconds,

        getLocalTimezone,
        getTimezoneOffset
    };

})();


/* =========================================================
   INITIALIZE CLOCK
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Clock.init();

    }
);