/**
 * =========================================================
 * ChronoX
 * Timezone Manager
 * =========================================================
 *
 * Responsibilities:
 * - World Time management
 * - Timezone conversion
 * - Timezone catalog
 * - Add / remove World Time zones
 * - Persistent timezone storage
 * - DST-aware timezone conversion
 * - UTC offset display
 *
 * =========================================================
 */

const TimezoneManager = (() => {

    /* =====================================================
       TIMEZONE CATALOG
    ===================================================== */

    const timezoneCatalog = [
        {
            city: "Kathmandu",
            country: "Nepal",
            zone: "Asia/Kathmandu"
        },
        {
            city: "New Delhi",
            country: "India",
            zone: "Asia/Kolkata"
        },
        {
            city: "Dhaka",
            country: "Bangladesh",
            zone: "Asia/Dhaka"
        },
        {
            city: "Colombo",
            country: "Sri Lanka",
            zone: "Asia/Colombo"
        },
        {
            city: "Bangkok",
            country: "Thailand",
            zone: "Asia/Bangkok"
        },
        {
            city: "Singapore",
            country: "Singapore",
            zone: "Asia/Singapore"
        },
        {
            city: "Kuala Lumpur",
            country: "Malaysia",
            zone: "Asia/Kuala_Lumpur"
        },
        {
            city: "Jakarta",
            country: "Indonesia",
            zone: "Asia/Jakarta"
        },
        {
            city: "Hong Kong",
            country: "Hong Kong",
            zone: "Asia/Hong_Kong"
        },
        {
            city: "Shanghai",
            country: "China",
            zone: "Asia/Shanghai"
        },
        {
            city: "Tokyo",
            country: "Japan",
            zone: "Asia/Tokyo"
        },
        {
            city: "Seoul",
            country: "South Korea",
            zone: "Asia/Seoul"
        },
        {
            city: "Dubai",
            country: "United Arab Emirates",
            zone: "Asia/Dubai"
        },
        {
            city: "Riyadh",
            country: "Saudi Arabia",
            zone: "Asia/Riyadh"
        },
        {
            city: "Doha",
            country: "Qatar",
            zone: "Asia/Qatar"
        },
        {
            city: "Istanbul",
            country: "Türkiye",
            zone: "Europe/Istanbul"
        },
        {
            city: "Moscow",
            country: "Russia",
            zone: "Europe/Moscow"
        },
        {
            city: "London",
            country: "United Kingdom",
            zone: "Europe/London"
        },
        {
            city: "Paris",
            country: "France",
            zone: "Europe/Paris"
        },
        {
            city: "Berlin",
            country: "Germany",
            zone: "Europe/Berlin"
        },
        {
            city: "Rome",
            country: "Italy",
            zone: "Europe/Rome"
        },
        {
            city: "Madrid",
            country: "Spain",
            zone: "Europe/Madrid"
        },
        {
            city: "Amsterdam",
            country: "Netherlands",
            zone: "Europe/Amsterdam"
        },
        {
            city: "Zurich",
            country: "Switzerland",
            zone: "Europe/Zurich"
        },
        {
            city: "Cairo",
            country: "Egypt",
            zone: "Africa/Cairo"
        },
        {
            city: "Johannesburg",
            country: "South Africa",
            zone: "Africa/Johannesburg"
        },
        {
            city: "Nairobi",
            country: "Kenya",
            zone: "Africa/Nairobi"
        },
        {
            city: "Lagos",
            country: "Nigeria",
            zone: "Africa/Lagos"
        },
        {
            city: "Sydney",
            country: "Australia",
            zone: "Australia/Sydney"
        },
        {
            city: "Melbourne",
            country: "Australia",
            zone: "Australia/Melbourne"
        },
        {
            city: "Perth",
            country: "Australia",
            zone: "Australia/Perth"
        },
        {
            city: "Auckland",
            country: "New Zealand",
            zone: "Pacific/Auckland"
        },
        {
            city: "Honolulu",
            country: "United States",
            zone: "Pacific/Honolulu"
        },
        {
            city: "Los Angeles",
            country: "United States",
            zone: "America/Los_Angeles"
        },
        {
            city: "Denver",
            country: "United States",
            zone: "America/Denver"
        },
        {
            city: "Chicago",
            country: "United States",
            zone: "America/Chicago"
        },
        {
            city: "New York",
            country: "United States",
            zone: "America/New_York"
        },
        {
            city: "Toronto",
            country: "Canada",
            zone: "America/Toronto"
        },
        {
            city: "Vancouver",
            country: "Canada",
            zone: "America/Vancouver"
        },
        {
            city: "Mexico City",
            country: "Mexico",
            zone: "America/Mexico_City"
        },
        {
            city: "São Paulo",
            country: "Brazil",
            zone: "America/Sao_Paulo"
        },
        {
            city: "Buenos Aires",
            country: "Argentina",
            zone: "America/Argentina/Buenos_Aires"
        }
    ];


    /* =====================================================
       DEFAULT WORLD TIME ZONES
    ===================================================== */

    const defaultZones = [
        "Asia/Kathmandu",
        "Asia/Kolkata",
        "Asia/Tokyo",
        "Europe/London",
        "America/New_York"
    ];


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const elements = {
        timezoneGrid:
            document.getElementById("timezone-grid"),

        addTimezone:
            document.getElementById("add-timezone"),

        timezonePicker:
            document.getElementById("timezone-picker"),

        sourceZone:
            document.getElementById("source-timezone"),

        targetZone:
            document.getElementById("target-timezone"),

        sourceDate:
            document.getElementById("source-date"),

        sourceTime:
            document.getElementById("source-time"),

        result:
            document.getElementById("conversion-result")
    };


    /* =====================================================
       STATE
    ===================================================== */

    let savedZones = [];


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY =
        "chronox-world-timezones";


    function loadZones() {

        try {

            const stored =
                localStorage.getItem(STORAGE_KEY);

            if (!stored) {

                savedZones =
                    [...defaultZones];

                saveZones();

                return;
            }


            const parsed =
                JSON.parse(stored);


            if (
                Array.isArray(parsed) &&
                parsed.length > 0
            ) {

                savedZones =
                    parsed.filter(zone =>
                        typeof zone === "string" &&
                        timezoneCatalog.some(
                            item =>
                                item.zone === zone
                        )
                    );

            } else {

                savedZones =
                    [...defaultZones];

            }

        } catch (error) {

            console.warn(
                "ChronoX: Unable to load timezone settings.",
                error
            );

            savedZones =
                [...defaultZones];
        }
    }


    function saveZones() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(savedZones)
            );

        } catch (error) {

            console.warn(
                "ChronoX: Unable to save timezone settings.",
                error
            );
        }
    }


    /* =====================================================
       TIMEZONE LOOKUP
    ===================================================== */

    function getTimezone(zone) {

        return timezoneCatalog.find(
            timezone =>
                timezone.zone === zone
        );
    }


    /* =====================================================
       UTC OFFSET
    ===================================================== */

    function getTimezoneOffsetMinutes(
        date,
        timezone
    ) {

        try {

            const formatter =
                new Intl.DateTimeFormat(
                    "en-US",
                    {
                        timeZone: timezone,
                        timeZoneName: "longOffset"
                    }
                );


            const parts =
                formatter.formatToParts(date);


            const offsetPart =
                parts.find(
                    part =>
                        part.type === "timeZoneName"
                );


            if (!offsetPart) {
                return null;
            }


            const value =
                offsetPart.value;


            if (value === "GMT") {
                return 0;
            }


            const match =
                value.match(
                    /GMT([+-])(\d{2}):?(\d{2})?/
                );


            if (!match) {
                return null;
            }


            const sign =
                match[1] === "+"
                    ? 1
                    : -1;


            const hours =
                Number(match[2]);


            const minutes =
                Number(match[3] || 0);


            return sign *
                (
                    hours * 60 +
                    minutes
                );

        } catch (error) {

            console.warn(
                "ChronoX: Unable to determine timezone offset.",
                error
            );

            return null;
        }
    }


    function getOffset(
        date,
        timezone
    ) {

        const minutes =
            getTimezoneOffsetMinutes(
                date,
                timezone
            );


        if (minutes === null) {
            return "UTC";
        }


        const sign =
            minutes >= 0
                ? "+"
                : "-";


        const absolute =
            Math.abs(minutes);


        const hours =
            Math.floor(
                absolute / 60
            );


        const mins =
            absolute % 60;


        return `UTC${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    }


    /* =====================================================
       FORMAT WORLD TIME
    ===================================================== */

    function formatTime(
        date,
        timezone
    ) {

        return new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        ).format(date);
    }


    function formatDate(
        date,
        timezone
    ) {

        return new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: timezone,
                weekday: "short",
                month: "short",
                day: "2-digit",
                year: "numeric"
            }
        ).format(date);
    }


    /* =====================================================
       WORLD CLOCK RENDERING
    ===================================================== */

    function renderWorldClocks() {

        if (!elements.timezoneGrid) {
            return;
        }


        elements.timezoneGrid.innerHTML = "";


        const now =
            new Date();


        savedZones.forEach(zone => {

            const timezone =
                getTimezone(zone);


            if (!timezone) {
                return;
            }


            const card =
                document.createElement("article");

            card.className =
                "timezone-card";


            card.dataset.timezone =
                timezone.zone;


            card.innerHTML = `
                <div class="timezone-card-header">

                    <div>
                        <h3>
                            ${escapeHTML(timezone.city)}
                        </h3>

                        <span>
                            ${escapeHTML(timezone.country)}
                        </span>
                    </div>

                    <button
                        class="timezone-remove"
                        type="button"
                        data-zone="${escapeHTML(timezone.zone)}"
                        aria-label="Remove ${escapeHTML(timezone.city)}"
                    >
                        ×
                    </button>

                </div>

                <div class="timezone-clock">
                    ${formatTime(now, timezone.zone)}
                </div>

                <div class="timezone-date">
                    ${formatDate(now, timezone.zone)}
                </div>

                <div class="timezone-offset">
                    ${getOffset(now, timezone.zone)}
                </div>
            `;


            const removeButton =
                card.querySelector(
                    ".timezone-remove"
                );


            if (removeButton) {

                removeButton.addEventListener(
                    "click",
                    () => {

                        removeTimezone(
                            timezone.zone
                        );

                    }
                );
            }


            elements.timezoneGrid.appendChild(
                card
            );
        });
    }


    /* =====================================================
       ADD TIMEZONE
    ===================================================== */

    function addTimezone(zone) {

        const timezone =
            getTimezone(zone);


        if (!timezone) {

            showMessage(
                "Timezone not found."
            );

            return false;
        }


        if (
            savedZones.includes(
                timezone.zone
            )
        ) {

            showMessage(
                `${timezone.city} is already added.`
            );

            return false;
        }


        savedZones.push(
            timezone.zone
        );


        saveZones();

        renderWorldClocks();

        populateTimezonePicker();

        populateTimezoneSelects();


        showMessage(
            `${timezone.city} added.`
        );


        return true;
    }


    /* =====================================================
       REMOVE TIMEZONE
    ===================================================== */

    function removeTimezone(zone) {

        const timezone =
            getTimezone(zone);


        if (!timezone) {
            return;
        }


        savedZones =
            savedZones.filter(
                savedZone =>
                    savedZone !== zone
            );


        saveZones();

        renderWorldClocks();

        populateTimezonePicker();

        populateTimezoneSelects();


        showMessage(
            `${timezone.city} removed.`
        );
    }


    /* =====================================================
       WORLD TIMEZONE PICKER
    ===================================================== */

    function populateTimezonePicker() {

        if (!elements.timezonePicker) {
            return;
        }


        elements.timezonePicker.innerHTML = "";


        const placeholder =
            document.createElement("option");


        placeholder.value =
            "";


        placeholder.textContent =
            "Select timezone...";


        elements.timezonePicker.appendChild(
            placeholder
        );


        timezoneCatalog.forEach(
            timezone => {

                const alreadyAdded =
                    savedZones.includes(
                        timezone.zone
                    );


                if (alreadyAdded) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    timezone.zone;


                option.textContent =
                    `${timezone.city} — ${timezone.country}`;


                elements.timezonePicker.appendChild(
                    option
                );
            }
        );
    }


    /* =====================================================
       CONVERTER SELECT OPTIONS
    ===================================================== */

    function populateTimezoneSelects() {

        if (
            !elements.sourceZone ||
            !elements.targetZone
        ) {
            return;
        }


        const currentSource =
            elements.sourceZone.value;


        const currentTarget =
            elements.targetZone.value;


        elements.sourceZone.innerHTML = "";

        elements.targetZone.innerHTML = "";


        timezoneCatalog.forEach(
            timezone => {

                const offset =
                    getOffset(
                        new Date(),
                        timezone.zone
                    );


                const label =
                    `${timezone.city} — ${timezone.country} (${offset})`;


                const sourceOption =
                    document.createElement(
                        "option"
                    );


                sourceOption.value =
                    timezone.zone;


                sourceOption.textContent =
                    label;


                const targetOption =
                    document.createElement(
                        "option"
                    );


                targetOption.value =
                    timezone.zone;


                targetOption.textContent =
                    label;


                elements.sourceZone.appendChild(
                    sourceOption
                );


                elements.targetZone.appendChild(
                    targetOption
                );
            }
        );


        if (
            currentSource &&
            timezoneCatalog.some(
                timezone =>
                    timezone.zone === currentSource
            )
        ) {

            elements.sourceZone.value =
                currentSource;

        } else {

            elements.sourceZone.value =
                "Asia/Kathmandu";
        }


        if (
            currentTarget &&
            timezoneCatalog.some(
                timezone =>
                    timezone.zone === currentTarget
            )
        ) {

            elements.targetZone.value =
                currentTarget;

        } else {

            elements.targetZone.value =
                "Asia/Kolkata";
        }
    }


    /* =====================================================
       LOCAL DATE/TIME PARTS
    ===================================================== */

    function getDateTimeParts(
        date,
        timezone
    ) {

        const formatter =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: timezone,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23"
                }
            );


        const parts =
            formatter.formatToParts(date);


        const values = {};


        parts.forEach(part => {

            if (part.type !== "literal") {
                values[part.type] =
                    Number(part.value);
            }

        });


        return {
            year: values.year,
            month: values.month,
            day: values.day,
            hour: values.hour,
            minute: values.minute
        };
    }


    /* =====================================================
       ZONED LOCAL TIME → UTC
    ===================================================== */

    function zonedTimeToUTC(
        parts,
        timezone
    ) {

        /*
         * Interpret the entered local time as UTC
         * temporarily.
         */
        let utc =
            Date.UTC(
                parts.year,
                parts.month - 1,
                parts.day,
                parts.hour,
                parts.minute
            );


        /*
         * Recalculate the timezone offset multiple
         * times so DST transitions are handled more
         * reliably.
         */
        for (
            let attempt = 0;
            attempt < 3;
            attempt++
        ) {

            const date =
                new Date(utc);


            const offset =
                getTimezoneOffsetMinutes(
                    date,
                    timezone
                );


            if (offset === null) {
                return null;
            }


            const corrected =
                Date.UTC(
                    parts.year,
                    parts.month - 1,
                    parts.day,
                    parts.hour,
                    parts.minute
                ) -
                offset * 60 * 1000;


            if (corrected === utc) {
                break;
            }


            utc =
                corrected;
        }


        return new Date(utc);
    }


    /* =====================================================
       CONVERT TIME
    ===================================================== */

    function convertTime() {

        if (
            !elements.sourceZone ||
            !elements.targetZone ||
            !elements.sourceDate ||
            !elements.sourceTime ||
            !elements.result
        ) {
            return;
        }


        const sourceTimezone =
            elements.sourceZone.value;


        const targetTimezone =
            elements.targetZone.value;


        const dateValue =
            elements.sourceDate.value;


        const timeValue =
            elements.sourceTime.value;


        if (
            !sourceTimezone ||
            !targetTimezone ||
            !dateValue ||
            !timeValue
        ) {

            elements.result.textContent =
                "Select a date, time, and timezone.";

            return;
        }


        const [
            year,
            month,
            day
        ] =
            dateValue
                .split("-")
                .map(Number);


        const [
            hour,
            minute
        ] =
            timeValue
                .split(":")
                .map(Number);


        const utcDate =
            zonedTimeToUTC(
                {
                    year,
                    month,
                    day,
                    hour,
                    minute
                },
                sourceTimezone
            );


        if (!utcDate) {

            elements.result.textContent =
                "Unable to convert this time.";

            return;
        }


        const converted =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone: targetTimezone,
                    weekday: "short",
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }
            ).format(utcDate);


        const targetOffset =
            getOffset(
                utcDate,
                targetTimezone
            );


        elements.result.innerHTML = `
            <strong>
                ${escapeHTML(converted)}
            </strong>

            <span>
                ${escapeHTML(targetOffset)}
            </span>
        `;
    }


    /* =====================================================
       SWAP TIMEZONES
    ===================================================== */

    function swapTimezones() {

        if (
            !elements.sourceZone ||
            !elements.targetZone
        ) {
            return;
        }


        const source =
            elements.sourceZone.value;


        const target =
            elements.targetZone.value;


        elements.sourceZone.value =
            target;


        elements.targetZone.value =
            source;


        convertTime();
    }


    /* =====================================================
       UPDATE WORLD CLOCKS
    ===================================================== */

    function updateWorldClocks() {

        if (!elements.timezoneGrid) {
            return;
        }


        const now =
            new Date();


        const cards =
            elements.timezoneGrid.querySelectorAll(
                ".timezone-card"
            );


        cards.forEach(card => {

            const zone =
                card.dataset.timezone;


            if (!zone) {
                return;
            }


            const clock =
                card.querySelector(
                    ".timezone-clock"
                );


            const date =
                card.querySelector(
                    ".timezone-date"
                );


            const offset =
                card.querySelector(
                    ".timezone-offset"
                );


            if (clock) {

                clock.textContent =
                    formatTime(
                        now,
                        zone
                    );
            }


            if (date) {

                date.textContent =
                    formatDate(
                        now,
                        zone
                    );
            }


            if (offset) {

                offset.textContent =
                    getOffset(
                        now,
                        zone
                    );
            }
        });
    }


    /* =====================================================
       ADD TIMEZONE BUTTON
    ===================================================== */

    function openTimezonePicker() {

        if (!elements.timezonePicker) {
            return;
        }


        const zone =
            elements.timezonePicker.value;


        if (!zone) {

            showMessage(
                "Select a timezone first."
            );

            return;
        }


        if (addTimezone(zone)) {

            elements.timezonePicker.value =
                "";
        }
    }


    /* =====================================================
       MESSAGE / TOAST
    ===================================================== */

    function showMessage(message) {

        /*
         * Use ChronoX's existing toast system when
         * available.
         */
        if (
            typeof window.showToast ===
            "function"
        ) {

            window.showToast(
                message
            );

            return;
        }


        if (
            typeof window.showMessage ===
            "function" &&
            window.showMessage !== showMessage
        ) {

            window.showMessage(
                message
            );

            return;
        }


        console.info(
            `ChronoX: ${message}`
        );
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");


        div.textContent =
            String(value);


        return div.innerHTML;
    }


    /* =====================================================
       EVENT BINDING
    ===================================================== */

    function bindEvents() {

        if (elements.addTimezone) {

            elements.addTimezone.addEventListener(
                "click",
                openTimezonePicker
            );
        }


        if (elements.timezonePicker) {

            elements.timezonePicker.addEventListener(
                "change",
                event => {

                    if (!event.target.value) {
                        return;
                    }


                    addTimezone(
                        event.target.value
                    );


                    event.target.value =
                        "";
                }
            );
        }


        if (elements.sourceZone) {

            elements.sourceZone.addEventListener(
                "change",
                convertTime
            );
        }


        if (elements.targetZone) {

            elements.targetZone.addEventListener(
                "change",
                convertTime
            );
        }


        if (elements.sourceDate) {

            elements.sourceDate.addEventListener(
                "change",
                convertTime
            );
        }


        if (elements.sourceTime) {

            elements.sourceTime.addEventListener(
                "change",
                convertTime
            );
        }


        /*
         * Support an existing swap button if your
         * HTML already contains one.
         */
        const swapButton =
            document.getElementById(
                "swap-timezones"
            );


        if (swapButton) {

            swapButton.addEventListener(
                "click",
                swapTimezones
            );
        }
    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {

        loadZones();

        populateTimezonePicker();

        populateTimezoneSelects();

        renderWorldClocks();

        bindEvents();

        convertTime();


        /*
         * Update World Time every second.
         */
        setInterval(
            updateWorldClocks,
            1000
        );


        /*
         * Refresh converter offsets every minute
         * so DST changes are reflected.
         */
        setInterval(
            populateTimezoneSelects,
            60 * 1000
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {
        init,
        addTimezone,
        removeTimezone,
        convertTime,
        swapTimezones,
        renderWorldClocks,
        populateTimezonePicker,
        populateTimezoneSelects,
        getOffset
    };

})();


/* =========================================================
   START CHRONOX TIMEZONE MANAGER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        TimezoneManager.init();

    }
);