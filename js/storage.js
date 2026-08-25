/**
 * =========================================================
 * ChronoX
 * Local Storage Manager
 * =========================================================
 *
 * Responsibilities:
 * - Save application preferences
 * - Retrieve stored preferences
 * - Remove stored values
 * - Clear ChronoX storage
 * - Safely handle invalid/corrupted data
 *
 * =========================================================
 */

const StorageManager = (() => {

    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const STORAGE_PREFIX =
        "chronox_";


    /* =====================================================
       INTERNAL HELPERS
    ====================================================== */

    function buildKey(key) {

        return `${STORAGE_PREFIX}${key}`;
    }


    function isAvailable() {

        try {

            const testKey =
                "__chronox_storage_test__";

            localStorage.setItem(
                testKey,
                "1"
            );

            localStorage.removeItem(
                testKey
            );

            return true;

        } catch {

            return false;
        }
    }


    /* =====================================================
       SAVE
    ====================================================== */

    function save(key, value) {

        if (!isAvailable()) {
            return false;
        }


        try {

            const serialized =
                JSON.stringify(value);

            localStorage.setItem(
                buildKey(key),
                serialized
            );

            return true;

        } catch (error) {

            console.warn(
                "[ChronoX] Unable to save:",
                key,
                error
            );

            return false;
        }
    }


    /* =====================================================
       GET
    ====================================================== */

    function get(key, fallback = null) {

        if (!isAvailable()) {
            return fallback;
        }


        try {

            const stored =
                localStorage.getItem(
                    buildKey(key)
                );


            if (stored === null) {
                return fallback;
            }


            return JSON.parse(stored);

        } catch (error) {

            console.warn(
                "[ChronoX] Unable to read:",
                key,
                error
            );

            /*
             * Remove corrupted data so the
             * application can recover automatically.
             */
            remove(key);

            return fallback;
        }
    }


    /* =====================================================
       REMOVE
    ====================================================== */

    function remove(key) {

        if (!isAvailable()) {
            return false;
        }


        try {

            localStorage.removeItem(
                buildKey(key)
            );

            return true;

        } catch (error) {

            console.warn(
                "[ChronoX] Unable to remove:",
                key,
                error
            );

            return false;
        }
    }


    /* =====================================================
       EXISTS
    ====================================================== */

    function has(key) {

        if (!isAvailable()) {
            return false;
        }

        return (
            localStorage.getItem(
                buildKey(key)
            ) !== null
        );
    }


    /* =====================================================
       CLEAR CHRONOX DATA
    ====================================================== */

    function clear() {

        if (!isAvailable()) {
            return false;
        }


        try {

            const keys = [];

            for (
                let index = 0;
                index < localStorage.length;
                index++
            ) {

                const key =
                    localStorage.key(index);

                if (
                    key &&
                    key.startsWith(
                        STORAGE_PREFIX
                    )
                ) {

                    keys.push(key);
                }
            }


            keys.forEach(key => {

                localStorage.removeItem(key);

            });


            return true;

        } catch (error) {

            console.warn(
                "[ChronoX] Unable to clear storage:",
                error
            );

            return false;
        }
    }


    /* =====================================================
       STORAGE KEYS
    ====================================================== */

    const keys = {
        TIME_FORMAT: "timeFormat",
        SHOW_SECONDS: "showSeconds",
        TIMEZONES: "timezones"
    };


    /* =====================================================
       DEFAULT PREFERENCES
    ====================================================== */

    const defaults = {
        timeFormat: "24",
        showSeconds: true,
        timezones: [
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
        ]
    };


    /* =====================================================
       INITIALIZE DEFAULTS
    ====================================================== */

    function initializeDefaults() {

        if (!has(keys.TIME_FORMAT)) {

            save(
                keys.TIME_FORMAT,
                defaults.timeFormat
            );
        }


        if (!has(keys.SHOW_SECONDS)) {

            save(
                keys.SHOW_SECONDS,
                defaults.showSeconds
            );
        }


        if (!has(keys.TIMEZONES)) {

            save(
                keys.TIMEZONES,
                defaults.timezones
            );
        }
    }


    /* =====================================================
       GET ALL PREFERENCES
    ====================================================== */

    function getPreferences() {

        return {

            timeFormat:
                get(
                    keys.TIME_FORMAT,
                    defaults.timeFormat
                ),

            showSeconds:
                get(
                    keys.SHOW_SECONDS,
                    defaults.showSeconds
                ),

            timezones:
                get(
                    keys.TIMEZONES,
                    defaults.timezones
                )
        };
    }


    /* =====================================================
       RESET PREFERENCES
    ====================================================== */

    function resetPreferences() {

        save(
            keys.TIME_FORMAT,
            defaults.timeFormat
        );

        save(
            keys.SHOW_SECONDS,
            defaults.showSeconds
        );

        save(
            keys.TIMEZONES,
            defaults.timezones
        );
    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function init() {

        initializeDefaults();
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,

        save,
        get,
        remove,
        has,
        clear,

        getPreferences,
        resetPreferences,

        keys,
        defaults,

        isAvailable
    };

})();


/* =========================================================
   INITIALIZE STORAGE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        StorageManager.init();

    }
);