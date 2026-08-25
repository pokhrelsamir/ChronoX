/**
 * =========================================================
 * ChronoX
 * Application Controller
 * =========================================================
 *
 * Responsibilities:
 * - Application initialization
 * - Navigation
 * - Global UI events
 * - Theme handling
 * - Toast notifications
 * - Keyboard shortcuts
 * - Settings management
 * - Component coordination
 *
 * =========================================================
 */

const App = (() => {

    /* =====================================================
       STATE
    ====================================================== */

    let currentSection = "clock";


    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

    const elements = {
        navigation:
            document.querySelectorAll("[data-section]"),

        sections:
            document.querySelectorAll(".app-section"),

        pageTitle:
            document.getElementById("page-title"),

        themeToggle:
            document.getElementById("theme-toggle"),

        settingsButton:
            document.getElementById("settings-button"),

        settingsPanel:
            document.getElementById("settings-panel"),

        settingsClose:
            document.getElementById("settings-close"),

        resetSettings:
            document.getElementById("reset-settings"),

        toastContainer:
            document.getElementById("toast-container")
    };


    /* =====================================================
       PAGE TITLES
    ====================================================== */

    const pageTitles = {
        clock: "Clock",
        stopwatch: "Stopwatch",
        timer: "Timer",
        timezone: "World Time"
    };


    /* =====================================================
       NAVIGATION
    ====================================================== */

    function navigate(section) {

        if (!section) {
            section = "clock";
        }


        const target =
            document.getElementById(section);


        if (!target) {
            section = "clock";
        }


        currentSection =
            section;


        /*
         * Update page title.
         */
        if (elements.pageTitle) {

            elements.pageTitle.textContent =
                pageTitles[section] ||
                "ChronoX";
        }


        /*
         * Update navigation state.
         */
        elements.navigation.forEach(
            navigationItem => {

                const isActive =
                    navigationItem.dataset.section ===
                    section;


                navigationItem.classList.toggle(
                    "active",
                    isActive
                );


                if (isActive) {

                    navigationItem.setAttribute(
                        "aria-current",
                        "page"
                    );

                } else {

                    navigationItem.removeAttribute(
                        "aria-current"
                    );
                }
            }
        );


        /*
         * Update section visibility.
         */
        elements.sections.forEach(
            appSection => {

                const isActive =
                    appSection.id === section;


                appSection.classList.toggle(
                    "active",
                    isActive
                );


                appSection.hidden =
                    !isActive;
            }
        );


        /*
         * Keep URL hash synchronized.
         */
        const newHash =
            `#${section}`;


        if (
            window.location.hash !==
            newHash
        ) {

            history.replaceState(
                null,
                "",
                newHash
            );
        }
    }


    /* =====================================================
       INITIAL NAVIGATION
    ====================================================== */

    function initializeNavigation() {

        elements.navigation.forEach(
            navigationItem => {

                navigationItem.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        navigate(
                            navigationItem.dataset.section
                        );
                    }
                );
            }
        );


        /*
         * Restore section from URL hash.
         */
        const hash =
            window.location.hash
                .replace(/^#/, "");


        if (
            hash &&
            document.getElementById(hash)
        ) {

            navigate(hash);

        } else {

            navigate("clock");
        }
    }


    /* =====================================================
       THEME
    ====================================================== */

    function getPreferredTheme() {

        const storedTheme =
            StorageManager.get(
                "theme"
            );


        if (
            storedTheme === "light" ||
            storedTheme === "dark"
        ) {

            return storedTheme;
        }


        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
    }


    function applyTheme(theme) {

        if (
            theme !== "light" &&
            theme !== "dark"
        ) {

            theme = "light";
        }


        document.documentElement.dataset.theme =
            theme;


        if (elements.themeToggle) {

            const isDark =
                theme === "dark";


            elements.themeToggle.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to light theme"
                    : "Switch to dark theme"
            );


            elements.themeToggle.setAttribute(
                "title",
                isDark
                    ? "Light mode"
                    : "Dark mode"
            );


            elements.themeToggle.textContent =
                isDark
                    ? "☀"
                    : "☾";
        }


        StorageManager.save(
            "theme",
            theme
        );
    }


    function toggleTheme() {

        const currentTheme =
            document.documentElement.dataset.theme ||
            "light";


        const nextTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";


        applyTheme(nextTheme);


        showToast(
            nextTheme === "dark"
                ? "Dark theme enabled."
                : "Light theme enabled."
        );
    }


    function initializeTheme() {

        applyTheme(
            getPreferredTheme()
        );


        if (elements.themeToggle) {

            elements.themeToggle.addEventListener(
                "click",
                toggleTheme
            );
        }
    }


    /* =====================================================
       SETTINGS PANEL
    ====================================================== */

    function openSettings() {

        if (!elements.settingsPanel) {
            return;
        }


        elements.settingsPanel.classList.add(
            "open"
        );


        elements.settingsPanel.setAttribute(
            "aria-hidden",
            "false"
        );


        if (elements.settingsClose) {

            elements.settingsClose.focus();
        }
    }


    function closeSettings() {

        if (!elements.settingsPanel) {
            return;
        }


        elements.settingsPanel.classList.remove(
            "open"
        );


        elements.settingsPanel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    function initializeSettings() {

        if (elements.settingsButton) {

            elements.settingsButton.addEventListener(
                "click",
                openSettings
            );
        }


        if (elements.settingsClose) {

            elements.settingsClose.addEventListener(
                "click",
                closeSettings
            );
        }


        /*
         * Close when clicking overlay.
         */
        if (elements.settingsPanel) {

            elements.settingsPanel.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        elements.settingsPanel
                    ) {

                        closeSettings();
                    }
                }
            );
        }


        /*
         * Reset preferences.
         */
        if (elements.resetSettings) {

            elements.resetSettings.addEventListener(
                "click",
                resetSettings
            );
        }
    }


    /* =====================================================
       RESET SETTINGS
    ====================================================== */

    function resetSettings() {

        const confirmed =
            window.confirm(
                "Reset ChronoX preferences to their defaults?"
            );


        if (!confirmed) {
            return;
        }


        /*
         * Clear saved preferences.
         */
        if (
            typeof StorageManager !==
            "undefined" &&
            typeof StorageManager.resetPreferences ===
            "function"
        ) {

            StorageManager.resetPreferences();
        }


        /*
         * Restore default theme.
         */
        applyTheme("light");


        /*
         * Restore clock preferences.
         */
        if (
            typeof Clock !==
            "undefined"
        ) {

            if (
                typeof Clock.setFormat ===
                "function"
            ) {

                Clock.setFormat("24");
            }


            if (
                typeof Clock.setShowSeconds ===
                "function"
            ) {

                Clock.setShowSeconds(true);
            }
        }


        /*
         * Close settings.
         */
        closeSettings();


        /*
         * Reload application so every component
         * returns to its default state.
         */
        showToast(
            "Preferences restored."
        );


        setTimeout(() => {

            window.location.reload();

        }, 500);
    }


    /* =====================================================
       TOAST SYSTEM
    ====================================================== */

    function showToast(
        message,
        duration = 2600
    ) {

        if (!message) {
            return;
        }


        /*
         * Use existing container when available.
         */
        let container =
            elements.toastContainer;


        /*
         * Create container if missing.
         */
        if (!container) {

            container =
                document.createElement(
                    "div"
                );


            container.id =
                "toast-container";


            container.className =
                "toast-container";


            container.setAttribute(
                "aria-live",
                "polite"
            );


            container.setAttribute(
                "aria-atomic",
                "true"
            );


            document.body.appendChild(
                container
            );
        }


        /*
         * Create toast.
         */
        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            "toast";


        toast.setAttribute(
            "role",
            "status"
        );


        toast.textContent =
            message;


        container.appendChild(
            toast
        );


        /*
         * Trigger entrance animation.
         */
        requestAnimationFrame(() => {

            toast.classList.add(
                "show"
            );
        });


        /*
         * Remove toast.
         */
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );


            setTimeout(() => {

                if (toast.parentNode) {

                    toast.remove();
                }

            }, 250);

        }, duration);
    }


    /* =====================================================
       KEYBOARD SHORTCUTS
    ====================================================== */

    function handleKeyboard(event) {

        /*
         * Ignore shortcuts while typing.
         */
        const activeElement =
            document.activeElement;


        const isTyping =
            activeElement &&
            (
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.tagName === "SELECT" ||
                activeElement.isContentEditable
            );


        if (isTyping) {
            return;
        }


        /*
         * Space
         * Start / pause active tool.
         */
        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            if (
                currentSection === "stopwatch" &&
                typeof Stopwatch !== "undefined"
            ) {

                if (
                    typeof Stopwatch.isRunning ===
                    "function"
                ) {

                    Stopwatch.isRunning()
                        ? Stopwatch.pause()
                        : Stopwatch.start();
                }
            }


            if (
                currentSection === "timer" &&
                typeof Timer !== "undefined"
            ) {

                if (
                    typeof Timer.isRunning ===
                    "function"
                ) {

                    Timer.isRunning()
                        ? Timer.pause()
                        : Timer.start();
                }
            }
        }


        /*
         * R
         * Reset active tool.
         */
        if (
            event.key.toLowerCase() === "r"
        ) {

            if (
                currentSection === "stopwatch" &&
                typeof Stopwatch !== "undefined" &&
                typeof Stopwatch.reset === "function"
            ) {

                Stopwatch.reset();
            }


            if (
                currentSection === "timer" &&
                typeof Timer !== "undefined" &&
                typeof Timer.reset === "function"
            ) {

                Timer.reset();
            }
        }


        /*
         * L
         * Record stopwatch lap.
         */
        if (
            event.key.toLowerCase() === "l"
        ) {

            if (
                currentSection === "stopwatch" &&
                typeof Stopwatch !== "undefined" &&
                typeof Stopwatch.recordLap === "function"
            ) {

                Stopwatch.recordLap();
            }
        }


        /*
         * T
         * Toggle theme.
         */
        if (
            event.key.toLowerCase() === "t"
        ) {

            toggleTheme();
        }


        /*
         * Escape
         * Close settings.
         */
        if (
            event.key === "Escape"
        ) {

            closeSettings();
        }
    }


    function initializeKeyboardShortcuts() {

        document.addEventListener(
            "keydown",
            handleKeyboard
        );
    }


    /* =====================================================
       GLOBAL EVENTS
    ====================================================== */

    function initializeGlobalEvents() {

        /*
         * Handle browser back / forward.
         */
        window.addEventListener(
            "popstate",
            () => {

                const hash =
                    window.location.hash
                        .replace(/^#/, "");


                navigate(
                    hash || "clock"
                );
            }
        );


        /*
         * Handle system theme changes.
         */
        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );


        mediaQuery.addEventListener(
            "change",
            event => {

                const storedTheme =
                    StorageManager.get(
                        "theme"
                    );


                /*
                 * Only follow system theme when
                 * the user has not selected one.
                 */
                if (!storedTheme) {

                    applyTheme(
                        event.matches
                            ? "dark"
                            : "light"
                    );
                }
            }
        );
    }


    /* =====================================================
       COMPONENT INITIALIZATION
    ====================================================== */

    function initializeComponents() {

        /*
         * Components initialize themselves.
         * This controller only checks availability.
         */

        if (
            typeof StorageManager ===
            "undefined"
        ) {

            console.warn(
                "[ChronoX] StorageManager module unavailable."
            );
        }


        if (
            typeof Clock ===
            "undefined"
        ) {

            console.warn(
                "[ChronoX] Clock module unavailable."
            );
        }


        if (
            typeof Stopwatch ===
            "undefined"
        ) {

            console.warn(
                "[ChronoX] Stopwatch module unavailable."
            );
        }


        if (
            typeof Timer ===
            "undefined"
        ) {

            console.warn(
                "[ChronoX] Timer module unavailable."
            );
        }


        if (
            typeof Timezone ===
            "undefined"
        ) {

            console.warn(
                "[ChronoX] Timezone module unavailable."
            );
        }
    }


    /* =====================================================
       APPLICATION INITIALIZATION
    ====================================================== */

    function init() {

        initializeNavigation();

        initializeTheme();

        initializeSettings();

        initializeKeyboardShortcuts();

        initializeGlobalEvents();

        initializeComponents();


        console.info(
            "[ChronoX] Application initialized."
        );
    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    return {

        init,

        navigate,

        openSettings,

        closeSettings,

        toggleTheme,

        applyTheme,

        showToast,

        resetSettings,

        getCurrentSection: () =>
            currentSection
    };

})();


/* =========================================================
   APPLICATION START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);