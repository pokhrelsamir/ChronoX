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
 * - Validate stored data
 * - Handle corrupted data safely
 * - Provide application defaults
 *
 * =========================================================
 */

const StorageManager = (() => {

    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const STORAGE_PREFIX =
        "chronox_";

    const STORAGE_VERSION =
        1;


    /* =====================================================
       STORAGE KEYS
    ====================================================== */

    const keys = {

        TIME_FORMAT:
            "timeFormat",

        SHOW_SECONDS:
            "showSeconds",

        TIMEZONES:
            "timezones",

        VERSION:
            "version"
    };


    /* =====================================================
       DEFAULT PREFERENCES
    ====================================================== */

    const defaults = {

        timeFormat:
            "24",

        showSeconds:
            true,

        timezones: [

            {
                city:
                    "Kathmandu",

                country:
                    "Nepal",

                zone:
                    "Asia/Kathmandu"
            },

            {
                city:
                    "London",

                country:
                    "United Kingdom",

                zone:
                    "Europe/London"
            },

            {
                city:
                    "Tokyo",

                country:
                    "Japan",

                zone:
                    "Asia/Tokyo"
            },

            {
                city:
                    "New York",

                country:
                    "United States",

                zone:
                    "America/New_York"
            }
        ]
    };


    /* =====================================================
       INTERNAL STATE
    ====================================================== */

    let storageAvailable =
        null;


    /* =====================================================
       INTERNAL HELPERS
    ====================================================== */

    function buildKey(key) {

        return `${STORAGE_PREFIX}${key}`;
    }


    /*
     * Return a safe deep copy.
     *
     * This prevents callers from accidentally
     * modifying the default configuration.
     */
    function clone(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;
        }


        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch {

            return value;
        }
    }


    /*
     * Determine whether localStorage is available.
     */
    function isAvailable() {

        if (
            storageAvailable !== null
        ) {

            return storageAvailable;
        }


        try {

            const testKey =
                `${STORAGE_PREFIX}storage_test`;


            localStorage.setItem(
                testKey,
                "1"
            );


            localStorage.removeItem(
                testKey
            );


            storageAvailable =
                true;


        } catch (error) {

            storageAvailable =
                false;


            console.warn(
                "[ChronoX] Local storage is unavailable.",
                error
            );
        }


        return storageAvailable;
    }


    /*
     * Validate time format.
     */
    function isValidTimeFormat(value) {

        return (
            value === "12" ||
            value === "24"
        );
    }


    /*
     * Validate boolean preference.
     */
    function isValidBoolean(value) {

        return (
            typeof value ===
            "boolean"
        );
    }


    /*
     * Validate timezone object.
     */
    function isValidTimezone(timezone) {

        if (
            !timezone ||
            typeof timezone !== "object"
        ) {

            return false;
        }


        return (
            typeof timezone.city ===
                "string" &&

            typeof timezone.country ===
                "string" &&

            typeof timezone.zone ===
                "string" &&

            timezone.city.trim() !== "" &&

            timezone.zone.trim() !== ""
        );
    }


    /*
     * Validate timezone collection.
     */
    function isValidTimezones(value) {

        return (
            Array.isArray(value) &&
            value.every(
                isValidTimezone
            )
        );
    }


    /* =====================================================
       SAVE
    ====================================================== */

    function save(key, value) {

        if (!key) {

            return false;
        }


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

    function get(
        key,
        fallback = null
    ) {

        if (!key) {

            return fallback;
        }


        if (!isAvailable()) {

            return clone(
                fallback
            );
        }


        try {

            const stored =
                localStorage.getItem(
                    buildKey(key)
                );


            if (
                stored === null
            ) {

                return clone(
                    fallback
                );
            }


            return JSON.parse(
                stored
            );

        } catch (error) {

            console.warn(
                "[ChronoX] Unable to read:",
                key,
                error
            );


            /*
             * Remove corrupted data.
             */
            remove(key);


            return clone(
                fallback
            );
        }
    }


    /* =====================================================
       REMOVE
    ====================================================== */

    function remove(key) {

        if (!key) {

            return false;
        }


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

        if (!key) {

            return false;
        }


        if (!isAvailable()) {

            return false;
        }


        try {

            return (
                localStorage.getItem(
                    buildKey(key)
                ) !== null
            );

        } catch {

            return false;
        }
    }


    /* =====================================================
       CLEAR CHRONOX DATA
    ====================================================== */

    function clear() {

        if (!isAvailable()) {

            return false;
        }


        try {

            const keysToRemove = [];


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

                    keysToRemove.push(
                        key
                    );
                }
            }


            keysToRemove.forEach(
                key => {

                    localStorage.removeItem(
                        key
                    );
                }
            );


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
       PREFERENCE VALIDATION
    ====================================================== */

    function getTimeFormat() {

        const value =
            get(
                keys.TIME_FORMAT,
                defaults.timeFormat
            );


        if (
            !isValidTimeFormat(value)
        ) {

            save(
                keys.TIME_FORMAT,
                defaults.timeFormat
            );


            return defaults.timeFormat;
        }


        return value;
    }


    function getShowSeconds() {

        const value =
            get(
                keys.SHOW_SECONDS,
                defaults.showSeconds
            );


        if (
            !isValidBoolean(value)
        ) {

            save(
                keys.SHOW_SECONDS,
                defaults.showSeconds
            );


            return defaults.showSeconds;
        }


        return value;
    }


    function getTimezones() {

        const value =
            get(
                keys.TIMEZONES,
                defaults.timezones
            );


        if (
            !isValidTimezones(value)
        ) {

            save(
                keys.TIMEZONES,
                defaults.timezones
            );


            return clone(
                defaults.timezones
            );
        }


        return value;
    }


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


        /*
         * Store storage version.
         */
        if (!has(keys.VERSION)) {

            save(
                keys.VERSION,
                STORAGE_VERSION
            );
        }
    }


    /* =====================================================
       GET ALL PREFERENCES
    ====================================================== */

    function getPreferences() {

        return {

            timeFormat:
                getTimeFormat(),

            showSeconds:
                getShowSeconds(),

            timezones:
                getTimezones()
        };
    }


    /* =====================================================
       RESET PREFERENCES
    ====================================================== */

    function resetPreferences() {

        if (!isAvailable()) {

            return false;
        }


        const results = [

            save(
                keys.TIME_FORMAT,
                defaults.timeFormat
            ),

            save(
                keys.SHOW_SECONDS,
                defaults.showSeconds
            ),

            save(
                keys.TIMEZONES,
                defaults.timezones
            ),

            save(
                keys.VERSION,
                STORAGE_VERSION
            )
        ];


        return results.every(
            Boolean
        );
    }


    /* =====================================================
       STORAGE INFORMATION
    ====================================================== */

    function getStorageInfo() {

        return {

            available:
                isAvailable(),

            prefix:
                STORAGE_PREFIX,

            version:
                STORAGE_VERSION,

            keys: {
                timeFormat:
                    keys.TIME_FORMAT,

                showSeconds:
                    keys.SHOW_SECONDS,

                timezones:
                    keys.TIMEZONES
            }
        };
    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    function init() {

        if (!isAvailable()) {

            console.warn(
                "[ChronoX] Running without local storage."
            );


            return;
        }


        initializeDefaults();


        console.info(
            "[ChronoX] Storage manager initialized."
        );
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

        getStorageInfo,

        isAvailable,

        keys,

        defaults
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