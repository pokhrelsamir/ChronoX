/**
 * =========================================================
 * ChronoX
 * Timezone Engine
 * =========================================================
 *
 * Responsibilities:
 * - World clock updates
 * - Timezone conversion
 * - Timezone formatting
 * - Dynamic timezone cards
 * - Add / remove saved zones
 * - DST-aware timezone calculations
 *
 * =========================================================
 */

const Timezone = (() => {

    /* =====================================================
       STATE
    ====================================================== */

    let savedZones = [
        {
            city: "Kathmandu",
            country: "Nepal",
            zone: "Asia/Kathmandu"
        },
        {
            city: "London",
            country: "United Kingdom",
            zone: "Europe/London"
        },
        {
            city: "Tokyo",
            country: "Japan",
            zone: "Asia/Tokyo"
        },
        {
            city: "New York",
            country: "United States",
            zone: "America/New_York"
        }
    ];


    /* =====================================================
       TIMEZONE DATA
    ====================================================== */

    const timezoneCatalog = [
        {
            city: "Kathmandu",
            country: "Nepal",
            zone: "Asia/Kathmandu"
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
            city: "Dubai",
            country: "United Arab Emirates",
            zone: "Asia/Dubai"
        },
        {
            city: "Mumbai",
            country: "India",
            zone: "Asia/Kolkata"
        },
        {
            city: "Singapore",
            country: "Singapore",
            zone: "Asia/Singapore"
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
            city: "Sydney",
            country: "Australia",
            zone: "Australia/Sydney"
        },
        {
            city: "Auckland",
            country: "New Zealand",
            zone: "Pacific/Auckland"
        },
        {
            city: "New York",
            country: "United States",
            zone: "America/New_York"
        },
        {
            city: "Chicago",
            country: "United States",
            zone: "America/Chicago"
        },
        {
            city: "Denver",
            country: "United States",
            zone: "America/Denver"
        },
        {
            city: "Los Angeles",
            country: "United States",
            zone: "America/Los_Angeles"
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
            city: "Cairo",
            country: "Egypt",
            zone: "Africa/Cairo"
        },
        {
            city: "Johannesburg",
            country: "South Africa",
            zone: "Africa/Johannesburg"
        }
    ];


    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

    const elements = {
        timezoneGrid:
            document.getElementById("timezone-grid"),

        addTimezone:
            document.getElementById("add-timezone"),

        sourceTime:
            document.getElementById("source-time"),

        sourceZone:
            document.getElementById("source-zone"),

        targetZone:
            document.getElementById("target-zone"),

        convertedTime:
            document.getElementById("converted-time")
    };


    /* =====================================================
       TIME FORMAT
    ====================================================== */

    function getTimeOptions(timezone) {

        const options = {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: getHour12Preference()
        };

        return options;
    }


    function getHour12Preference() {

        const format =
            typeof StorageManager !== "undefined"
                ? StorageManager.get("timeFormat")
                : null;

        return format === "12";
    }


    /* =====================================================
       FORMAT WORLD TIME
    ====================================================== */

    function formatTime(date, timezone) {

        try {

            return new Intl.DateTimeFormat(
                undefined,
                getTimeOptions(timezone)
            ).format(date);

        } catch {

            return "--:--";
        }
    }


    /* =====================================================
       FORMAT WORLD DATE
    ====================================================== */

    function formatDate(date, timezone) {

        try {

            return new Intl.DateTimeFormat(
                undefined,
                {
                    timeZone: timezone,
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                }
            ).format(date);

        } catch {

            return "---";
        }
    }


    /* =====================================================
       GET UTC OFFSET
    ====================================================== */

    function getOffset(date, timezone) {

        try {

            const parts =
                new Intl.DateTimeFormat(
                    "en-US",
                    {
                        timeZone: timezone,
                        timeZoneName: "longOffset"
                    }
                ).formatToParts(date);

            const zonePart =
                parts.find(
                    part =>
                        part.type === "timeZoneName"
                );

            if (!zonePart) {
                return "UTC";
            }

            return zonePart.value
                .replace("GMT", "UTC");

        } catch {

            return "UTC";
        }
    }


    /* =====================================================
       GET ZONE LABEL
    ====================================================== */

    function getZoneLabel(zone) {

        try {

            const parts =
                new Intl.DateTimeFormat(
                    "en-US",
                    {
                        timeZone: zone,
                        timeZoneName: "long"
                    }
                ).formatToParts(
                    new Date()
                );

            const zonePart =
                parts.find(
                    part =>
                        part.type === "timeZoneName"
                );

            return zonePart
                ? zonePart.value
                : zone;

        } catch {

            return zone;
        }
    }


    /* =====================================================
       RENDER WORLD CLOCKS
    ====================================================== */

    function renderWorldClocks() {

        if (!elements.timezoneGrid) {
            return;
        }

        const now = new Date();

        elements.timezoneGrid.innerHTML = "";

        savedZones.forEach(
            (timezone, index) => {

                const card =
                    document.createElement("article");

                card.className =
                    "timezone-card";

                card.dataset.zone =
                    timezone.zone;


                card.innerHTML = `
                    <div class="timezone-info">

                        <span class="timezone-city">
                            ${escapeHTML(timezone.city)}
                        </span>

                        <span class="timezone-location">
                            ${escapeHTML(timezone.country)}
                        </span>

                    </div>

                    <div class="timezone-time">

                        <span class="world-time">
                            ${formatTime(
                                now,
                                timezone.zone
                            )}
                        </span>

                        <span class="world-date">
                            ${formatDate(
                                now,
                                timezone.zone
                            )}
                        </span>

                    </div>

                    <div class="timezone-footer">

                        <span class="timezone-offset">
                            ${getOffset(
                                now,
                                timezone.zone
                            )}
                        </span>

                        <button
                            class="timezone-remove"
                            type="button"
                            data-index="${index}"
                            aria-label="Remove ${
                                escapeHTML(timezone.city)
                            }"
                            title="Remove timezone">
                            ×
                        </button>

                    </div>
                `;


                elements.timezoneGrid.appendChild(
                    card
                );
            }
        );


        bindRemoveButtons();
    }


    /* =====================================================
       UPDATE WORLD CLOCKS
    ====================================================== */

    function updateWorldClocks() {

        if (!elements.timezoneGrid) {
            return;
        }

        const now = new Date();

        const cards =
            elements.timezoneGrid.querySelectorAll(
                ".timezone-card"
            );


        cards.forEach(
            (card, index) => {

                const timezone =
                    savedZones[index];

                if (!timezone) {
                    return;
                }


                const timeElement =
                    card.querySelector(
                        ".world-time"
                    );

                const dateElement =
                    card.querySelector(
                        ".world-date"
                    );

                const offsetElement =
                    card.querySelector(
                        ".timezone-offset"
                    );


                if (timeElement) {

                    timeElement.textContent =
                        formatTime(
                            now,
                            timezone.zone
                        );
                }


                if (dateElement) {

                    dateElement.textContent =
                        formatDate(
                            now,
                            timezone.zone
                        );
                }


                if (offsetElement) {

                    offsetElement.textContent =
                        getOffset(
                            now,
                            timezone.zone
                        );
                }
            }
        );
    }


    /* =====================================================
       ADD TIMEZONE
    ====================================================== */

    function addTimezone(zone) {

        const timezone =
            timezoneCatalog.find(
                item =>
                    item.zone === zone
            );


        if (!timezone) {
            return false;
        }


        const alreadyExists =
            savedZones.some(
                item =>
                    item.zone === timezone.zone
            );


        if (alreadyExists) {

            showMessage(
                `${timezone.city} is already added.`
            );

            return false;
        }


        savedZones.push({
            city: timezone.city,
            country: timezone.country,
            zone: timezone.zone
        });


        saveZones();

        renderWorldClocks();

        showMessage(
            `${timezone.city} added.`
        );

        return true;
    }


    /* =====================================================
       REMOVE TIMEZONE
    ====================================================== */

    function removeTimezone(index) {

        if (
            index < 0 ||
            index >= savedZones.length
        ) {
            return;
        }


        const removed =
            savedZones[index];


        /*
         * Keep at least one timezone.
         */
        if (savedZones.length <= 1) {

            showMessage(
                "At least one timezone must remain."
            );

            return;
        }


        savedZones.splice(
            index,
            1
        );


        saveZones();

        renderWorldClocks();

        showMessage(
            `${removed.city} removed.`
        );
    }


    /* =====================================================
       REMOVE BUTTONS
    ====================================================== */

    function bindRemoveButtons() {

        const buttons =
            document.querySelectorAll(
                ".timezone-remove"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    removeTimezone(index);
                }
            );

        });
    }


    /* =====================================================
       TIMEZONE SELECT OPTIONS
    ====================================================== */

    function populateTimezoneSelects() {

        if (!elements.sourceZone ||
            !elements.targetZone) {

            return;
        }


        const zones =
            timezoneCatalog;


        elements.sourceZone.innerHTML = "";

        elements.targetZone.innerHTML = "";


        zones.forEach(timezone => {

            const label =
                `${timezone.city} — ${timezone.country}`;


            const sourceOption =
                document.createElement("option");

            sourceOption.value =
                timezone.zone;

            sourceOption.textContent =
                label;


            const targetOption =
                document.createElement("option");

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
        });


        /*
         * Sensible defaults.
         */
        elements.sourceZone.value =
            "Asia/Kathmandu";

        elements.targetZone.value =
            "Asia/Tokyo";
    }


    /* =====================================================
       TIMEZONE CONVERSION
    ====================================================== */

    function convertTime() {

        if (
            !elements.sourceTime ||
            !elements.sourceZone ||
            !elements.targetZone ||
            !elements.convertedTime
        ) {
            return;
        }


        const input =
            elements.sourceTime.value;


        if (!input) {

            elements.convertedTime.textContent =
                "—";

            return;
        }


        const sourceZone =
            elements.sourceZone.value;

        const targetZone =
            elements.targetZone.value;


        /*
         * Parse the entered local date/time.
         */
        const dateParts =
            parseDateTimeInput(input);


        if (!dateParts) {

            elements.convertedTime.textContent =
                "Invalid date";

            return;
        }


        /*
         * Convert source-local time to UTC.
         */
        const utcDate =
            zonedTimeToUTC(
                dateParts,
                sourceZone
            );


        if (!utcDate) {

            elements.convertedTime.textContent =
                "Unable to convert";

            return;
        }


        /*
         * Format UTC instant in target timezone.
         */
        const converted =
            new Intl.DateTimeFormat(
                undefined,
                {
                    timeZone: targetZone,
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: getHour12Preference()
                }
            ).format(utcDate);


        elements.convertedTime.textContent =
            converted;
    }


    /* =====================================================
       PARSE DATETIME-LOCAL
    ====================================================== */

    function parseDateTimeInput(value) {

        const match =
            value.match(
                /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
            );


        if (!match) {
            return null;
        }


        return {
            year: Number(match[1]),
            month: Number(match[2]),
            day: Number(match[3]),
            hour: Number(match[4]),
            minute: Number(match[5])
        };
    }


    /* =====================================================
       ZONED TIME → UTC
    ====================================================== */

    function zonedTimeToUTC(
        parts,
        timezone
    ) {

        /*
         * Initial UTC approximation.
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
         * Determine timezone offset.
         */
        const offset =
            getTimezoneOffsetMinutes(
                new Date(utc),
                timezone
            );


        if (offset === null) {
            return null;
        }


        /*
         * Apply timezone offset.
         */
        utc -= offset * 60 * 1000;


        return new Date(utc);
    }


    /* =====================================================
       GET OFFSET IN MINUTES
    ====================================================== */

    function getTimezoneOffsetMinutes(
        date,
        timezone
    ) {

        try {

            const parts =
                new Intl.DateTimeFormat(
                    "en-US",
                    {
                        timeZone: timezone,
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hourCycle: "h23"
                    }
                ).formatToParts(date);


            const values = {};


            parts.forEach(part => {

                if (part.type !== "literal") {

                    values[part.type] =
                        Number(part.value);
                }
            });


            const asUTC =
                Date.UTC(
                    values.year,
                    values.month - 1,
                    values.day,
                    values.hour,
                    values.minute,
                    values.second
                );


            return (
                asUTC -
                date.getTime()
            ) / 60000;

        } catch {

            return null;
        }
    }


    /* =====================================================
       ADD TIMEZONE DIALOG
    ====================================================== */

    function openTimezonePicker() {

        const available =
            timezoneCatalog.filter(
                timezone =>
                    !savedZones.some(
                        saved =>
                            saved.zone === timezone.zone
                    )
            );


        if (available.length === 0) {

            showMessage(
                "All available timezones are already added."
            );

            return;
        }


        const options =
            available
                .map(
                    (timezone, index) =>
                        `${index + 1}. ${timezone.city} — ${timezone.country}`
                )
                .join("\n");


        const answer =
            window.prompt(
                `Add a timezone:\n\n${options}\n\nEnter the number:`
            );


        if (answer === null) {
            return;
        }


        const index =
            Number(answer) - 1;


        if (
            !Number.isInteger(index) ||
            !available[index]
        ) {

            showMessage(
                "Invalid timezone selection."
            );

            return;
        }


        addTimezone(
            available[index].zone
        );
    }


    /* =====================================================
       STORAGE
    ====================================================== */

    function saveZones() {

        if (
            typeof StorageManager !== "undefined" &&
            StorageManager.save
        ) {

            StorageManager.save(
                "timezones",
                savedZones
            );
        }
    }


    function loadZones() {

        if (
            typeof StorageManager === "undefined" ||
            !StorageManager.get
        ) {
            return;
        }


        const stored =
            StorageManager.get(
                "timezones"
            );


        if (
            Array.isArray(stored) &&
            stored.length > 0
        ) {

            const validZones =
                stored.filter(
                    zone =>
                        zone &&
                        typeof zone.city === "string" &&
                        typeof zone.country === "string" &&
                        typeof zone.zone === "string"
                );


            if (validZones.length > 0) {

                savedZones =
                    validZones;
            }
        }
    }


    /* =====================================================
       MESSAGE
    ====================================================== */

    function showMessage(message) {

        if (
            typeof App !== "undefined" &&
            typeof App.showToast === "function"
        ) {

            App.showToast(message);

            return;
        }


        /*
         * Fallback for early development.
         */
        console.info(
            `[ChronoX] ${message}`
        );
    }


    /* =====================================================
       HTML ESCAPE
    ====================================================== */

    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /* =====================================================
       EVENTS
    ====================================================== */

    function bindEvents() {

        if (elements.addTimezone) {

            elements.addTimezone.addEventListener(
                "click",
                openTimezonePicker
            );
        }


        if (elements.sourceTime) {

            elements.sourceTime.addEventListener(
                "input",
                convertTime
            );

            elements.sourceTime.addEventListener(
                "change",
                convertTime
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
    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function init() {

        loadZones();

        populateTimezoneSelects();

        renderWorldClocks();

        bindEvents();

        convertTime();


        /*
         * World clocks need only update once per minute,
         * but updating every second keeps the interface
         * synchronized with the main clock.
         */
        setInterval(
            updateWorldClocks,
            1000
        );
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,

        addTimezone,
        removeTimezone,

        renderWorldClocks,
        updateWorldClocks,

        convertTime,

        getCatalog: () =>
            [...timezoneCatalog],

        getSavedZones: () =>
            [...savedZones]
    };

})();


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Timezone.init();

    }
);



// TimeZoneX Core Configuration & State Management
const timezoneCatalog = [
  { label: 'UTC', zone: 'UTC' },
  { label: 'Kathmandu (NST)', zone: 'Asia/Kathmandu' },
  { label: 'New York (EST/EDT)', zone: 'America/New_York' },
  { label: 'London (GMT/BST)', zone: 'Europe/London' },
  { label: 'Tokyo (JST)', zone: 'Asia/Tokyo' },
  { label: 'Sydney (AEST/AEDT)', zone: 'Australia/Sydney' }
];

let savedTimezones = JSON.parse(localStorage.getItem('timezonex_favorites')) || [
  'UTC',
  'Asia/Kathmandu',
  'America/New_York'
];

// Core Time Utility Functions
function formatTimeForZone(timeZone) {
  const now = new Date();
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return {
    timeStr: timeFormatter.format(now),
    dateStr: dateFormatter.format(now)
  };
}

// Render Engine
function renderClocks() {
  const container = document.getElementById('clock-container');
  if (!container) return;

  container.innerHTML = '';

  savedTimezones.forEach(zone => {
    const { timeStr, dateStr } = formatTimeForZone(zone);
    const card = document.createElement('div');
    card.className = 'clock-card';

    card.innerHTML = `
      <div class="clock-header">
        <h3>${zone.replace('_', ' ')}</h3>
        <button class="remove-btn" onclick="removeTimezone('${zone}')">&times;</button>
      </div>
      <div class="clock-time">${timeStr}</div>
      <div class="clock-date">${dateStr}</div>
    `;

    container.appendChild(card);
  });
}

// Interactive State Actions
function addTimezone(zone) {
  if (!savedTimezones.includes(zone)) {
    savedTimezones.push(zone);
    saveAndRefresh();
  }
}

function removeTimezone(zone) {
  savedTimezones = savedTimezones.filter(z => z !== zone);
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem('timezonex_favorites', JSON.stringify(savedTimezones));
  renderClocks();
}

// Modal / Interactive Prompt Helper
function promptAddTimezone() {
  const available = timezoneCatalog.filter(tz => !savedTimezones.includes(tz.zone));
  if (available.length === 0) {
    alert('All available timezones are already added!');
    return;
  }

  const listOptions = available.map((tz, i) => `${i + 1}. ${tz.label}`).join('\n');
  const choice = prompt(`Select a timezone to add:\n\n${listOptions}`);
  
  const index = parseInt(choice, 10) - 1;
  if (!isNaN(index) && available[index]) {
    addTimezone(available[index].zone);
  }
}

// Real-Time Engine Initialization
function initClockEngine() {
  renderClocks();
  // Sync render on every second boundary
  setInterval(renderClocks, 1000);
}

document.addEventListener('DOMContentLoaded', initClockEngine);