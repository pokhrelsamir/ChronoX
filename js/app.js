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
       NAVIGATION
    ====================================================== */

    function navigate(section) {

        if (!section) {
            return;
        }


        const target =
            document.getElementById(section);


        if (!target) {
            return;
        }


        currentSection =
            section;


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

                navigationItem.setAttribute(
                    "aria-current",
                    isActive
                        ? "page"
                        : "false"
                );
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
        if (
            window.location.hash !==
            `#${section}`
        ) {

            history.replaceState(
                null,
                "",
                `#${section}`
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
         * Restore section from URL.
         */
        const hash =
            window.location.hash
                .replace("#", "");


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


            elements.themeToggle.innerHTML =
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


        applyTheme(
            currentTheme === "dark"
                ? "light"
                : "dark"
        );


        showToast(
            currentTheme === "dark"
                ? "Light theme enabled."
                : "Dark theme enabled."
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
         * Close when clicking outside panel.
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


        StorageManager.resetPreferences();


        /*
         * Restore default theme.
         */
        applyTheme("light");


        /*
         * Restore clock preferences.
         */
        if (
            typeof Clock !== "undefined"
        ) {

            Clock.setFormat("24");

            Clock.setShowSeconds(true);
        }


        /*
         * Restore timezone list.
         */
        if (
            typeof Timezone !== "undefined"
        ) {

            window.location.reload();

            return;
        }


        showToast(
            "Settings restored."
        );
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
         * Create container when HTML does not
         * provide one.
         */
        let container =
            elements.toastContainer;


        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "toast-container";

            container.className =
                "toast-container";

            document.body.appendChild(
                container
            );
        }


        const toast =
            document.createElement("div");

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

                toast.remove();

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
                activeElement.tagName ===
                    "INPUT" ||
                activeElement.tagName ===
                    "TEXTAREA" ||
                activeElement.tagName ===
                    "SELECT" ||
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
                currentSection ===
                "stopwatch" &&
                typeof Stopwatch !== "undefined"
            ) {

                Stopwatch.isRunning()
                    ? Stopwatch.pause()
                    : Stopwatch.start();
            }


            if (
                currentSection ===
                "timer" &&
                typeof Timer !== "undefined"
            ) {

                Timer.isRunning()
                    ? Timer.pause()
                    : Timer.start();
            }
        }


        /*
         * R
         * Reset active tool.
         */
        if (
            event.key.toLowerCase() ===
            "r"
        ) {

            if (
                currentSection ===
                "stopwatch" &&
                typeof Stopwatch !== "undefined"
            ) {

                Stopwatch.reset();
            }


            if (
                currentSection ===
                "timer" &&
                typeof Timer !== "undefined"
            ) {

                Timer.reset();
            }
        }


        /*
         * L
         * Record stopwatch lap.
         */
        if (
            event.key.toLowerCase() ===
            "l"
        ) {

            if (
                currentSection ===
                "stopwatch" &&
                typeof Stopwatch !== "undefined"
            ) {

                Stopwatch.recordLap();
            }
        }


        /*
         * T
         * Toggle theme.
         */
        if (
            event.key.toLowerCase() ===
            "t"
        ) {

            toggleTheme();
        }


        /*
         * Escape
         * Close settings.
         */
        if (
            event.key ===
            "Escape"
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
                        .replace("#", "");

                navigate(
                    hash || "clock"
                );
            }
        );


        /*
         * Update theme if the system theme
         * changes and the user has not explicitly
         * chosen one.
         */
        window
            .matchMedia(
                "(prefers-color-scheme: dark)"
            )
            .addEventListener(
                "change",
                event => {

                    const stored =
                        StorageManager.get(
                            "theme"
                        );


                    if (!stored) {

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
       INITIALIZE COMPONENTS
    ====================================================== */

    function initializeComponents() {

        /*
         * Components initialize themselves through
         * DOMContentLoaded. This controller only
         * verifies that they are available.
         */

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