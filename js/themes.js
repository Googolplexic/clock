/**
 * Theme presets, live color customization, ambient effects, settings UI.
 */
(function () {
    var STORAGE_KEY = 'clock.config';
    var STORAGE_SAVED_THEME = 'clock.savedTheme';

    var PRESETS = {
        dark: {
            vars: {
                '--bg': '#0f1115',
                '--fg': '#e8eaed',
                '--muted': '#3c4043',
                '--placeholder': '#9aa0a6',
                '--start': '#81c995',
                '--pause': '#8ab4f8',
                '--stop': '#f28b82',
                '--effect-color': '#8ab4f8',
            },
            effect: 'none',
        },
        light: {
            vars: {
                '--bg': '#ffffff',
                '--fg': '#1f2937',
                '--muted': '#e5e7eb',
                '--placeholder': '#cbd1d8',
                '--start': '#2e7d32',
                '--pause': '#1f2937',
                '--stop': '#c62828',
                '--effect-color': '#9bb8ff',
            },
            effect: 'none',
        },
        winter: {
            vars: {
                '--bg': '#eaf2fc',
                '--fg': '#1e3a5f',
                '--muted': '#c9d8ee',
                '--placeholder': '#9fb4cf',
                '--start': '#2e7d32',
                '--pause': '#1e3a5f',
                '--stop': '#c62828',
                '--effect-color': '#5aa0eb',
            },
            effect: 'snow',
        },
        sepia: {
            vars: {
                '--bg': '#ebe2d4',
                '--fg': '#3d2914',
                '--muted': '#cec0a2',
                '--placeholder': '#96856a',
                '--start': '#5d4e37',
                '--pause': '#5d4e37',
                '--stop': '#8b4513',
                '--effect-color': '#c9a227',
            },
            effect: 'none',
        },
        ember: {
            vars: {
                '--bg': '#150b05',
                '--fg': '#f5ddba',
                '--muted': '#3a2414',
                '--placeholder': '#8a6a4a',
                '--start': '#c68b3a',
                '--pause': '#b46a2a',
                '--stop': '#e24a32',
                '--effect-color': '#ff7a2a',
            },
            effect: 'embers',
        },
        cosmos: {
            vars: {
                '--bg': '#0a0817',
                '--fg': '#e0d8f0',
                '--muted': '#241b3c',
                '--placeholder': '#7a6fa0',
                '--start': '#8b84ff',
                '--pause': '#b49cff',
                '--stop': '#ff9ebe',
                '--effect-color': '#ffffdd',
            },
            effect: 'stars',
        },
        mono: {
            vars: {
                '--bg': '#c6c6c6',
                '--fg': '#141414',
                '--muted': '#a5a5a5',
                '--placeholder': '#737373',
                '--start': '#2a2a2a',
                '--pause': '#4a4a4a',
                '--stop': '#6a6a6a',
                '--effect-color': '#5c5c5c',
            },
            effect: 'none',
        },
        forest: {
            vars: {
                '--bg': '#0f1d14',
                '--fg': '#d8e6c9',
                '--muted': '#1f3628',
                '--placeholder': '#6d8a72',
                '--start': '#6fb07e',
                '--pause': '#4a7a56',
                '--stop': '#d87a4e',
                '--effect-color': '#9fd3a0',
            },
            effect: 'none',
        },
        ocean: {
            vars: {
                '--bg': '#061826',
                '--fg': '#cfe6f5',
                '--muted': '#112f45',
                '--placeholder': '#5f8ba5',
                '--start': '#3aa9a2',
                '--pause': '#4fb8d8',
                '--stop': '#ef7a6a',
                '--effect-color': '#7ed0e8',
            },
            effect: 'none',
        },
        sakura: {
            vars: {
                '--bg': '#fdf3f5',
                '--fg': '#4a2233',
                '--muted': '#f2d4dc',
                '--placeholder': '#c08a9a',
                '--start': '#4c8a5a',
                '--pause': '#8a4a60',
                '--stop': '#c63a5a',
                '--effect-color': '#f0a9bc',
            },
            effect: 'petals',
        },
        rain: {
            vars: {
                '--bg': '#1b2530',
                '--fg': '#d5dde6',
                '--muted': '#2c3b4a',
                '--placeholder': '#7b8a9a',
                '--start': '#6aa290',
                '--pause': '#7aa8c8',
                '--stop': '#d08a7a',
                '--effect-color': '#9fc0d8',
            },
            effect: 'rain',
        },
    };

    var COLOR_KEYS = ['--bg', '--fg', '--start', '--pause', '--stop', '--effect-color'];

    function hexToRgb(hex) {
        if (!hex || typeof hex !== 'string') return null;
        var h = hex.trim().replace(/^#/, '');
        if (h.length === 3) {
            h = h
                .split('')
                .map(function (c) {
                    return c + c;
                })
                .join('');
        }
        if (h.length !== 6) return null;
        var n = parseInt(h, 16);
        if (isNaN(n)) return null;
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function parseColor(str) {
        if (!str || typeof str !== 'string') return null;
        str = str.trim();
        if (str === '') return null;
        if (str.charAt(0) === '#') return hexToRgb(str);
        var m = str.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
        if (m) return { r: Math.round(+m[1]), g: Math.round(+m[2]), b: Math.round(+m[3]) };
        return null;
    }

    function rgbToHex(rgb) {
        if (!rgb) return '#ffffff';
        return (
            '#' +
            [rgb.r, rgb.g, rgb.b]
                .map(function (x) {
                    var h = Math.max(0, Math.min(255, x)).toString(16);
                    return h.length === 1 ? '0' + h : h;
                })
                .join('')
        );
    }

    function relativeLuminance(rgb) {
        if (!rgb) return 0;
        function lin(c) {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        }
        var R = lin(rgb.r);
        var G = lin(rgb.g);
        var B = lin(rgb.b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    function contrastRatio(rgbA, rgbB) {
        if (!rgbA || !rgbB) return 1;
        var La = relativeLuminance(rgbA);
        var Lb = relativeLuminance(rgbB);
        var light = Math.max(La, Lb);
        var dark = Math.min(La, Lb);
        return (light + 0.05) / (dark + 0.05);
    }

    /** Best of black or white on any solid fill, chosen by actual contrast ratio. */
    function fgForSolid(rgb) {
        if (!rgb) return '#ffffff';
        var black = { r: 18, g: 18, b: 18 };
        var white = { r: 255, g: 255, b: 255 };
        return contrastRatio(rgb, black) >= contrastRatio(rgb, white) ? '#121212' : '#ffffff';
    }

    /** 7-char lowercase hex for native <input type="color"> (required by spec). */
    function normalizeHex(val) {
        var rgb = parseColor(val);
        return rgb ? rgbToHex(rgb) : null;
    }

    function mixRgb(a, b, t) {
        return {
            r: Math.round(b.r + (a.r - b.r) * t),
            g: Math.round(b.g + (a.g - b.g) * t),
            b: Math.round(b.b + (a.b - b.b) * t),
        };
    }

    /** Link color on page background: use --fg when readable, else contrast-safe fallback. */
    function linkOnBackground(bg, fg) {
        if (fg && bg && contrastRatio(fg, bg) >= 4.5) return rgbToHex(fg);
        return fgForSolid(bg || { r: 255, g: 255, b: 255 });
    }

    /**
     * Sets --on-start/--on-pause/--on-stop, --on-fg (text on solid --fg),
     * --toast-fg, --link-on-bg from current CSS variables on :root.
     */
    function refreshDerivedColors() {
        var root = document.documentElement;
        var cs = getComputedStyle(root);

        function rgbVar(name, fallbackHex) {
            var raw = cs.getPropertyValue(name).trim();
            var p = parseColor(raw);
            if (!p && fallbackHex) p = parseColor(fallbackHex);
            return p;
        }

        var bg = rgbVar('--bg', '#ffffff');
        var fg = rgbVar('--fg', '#1f2937');
        var start = rgbVar('--start', '#2e7d32');
        var pause = rgbVar('--pause', '#1f2937');
        var stop = rgbVar('--stop', '#c62828');

        root.style.setProperty('--on-start', fgForSolid(start));
        root.style.setProperty('--on-pause', fgForSolid(pause));
        root.style.setProperty('--on-stop', fgForSolid(stop));
        root.style.setProperty('--on-fg', fgForSolid(fg));

        var toastSurface = mixRgb(pause || { r: 31, g: 41, b: 55 }, bg || { r: 255, g: 255, b: 255 }, 0.18);
        root.style.setProperty('--toast-fg', fgForSolid(toastSurface));

        root.style.setProperty('--link-on-bg', linkOnBackground(bg, fg));
    }

    var EFFECT_CONFIG = {
        snow: {
            char: '\u2744',
            interval: 300,
            fallClass: 'particle--fall-sway',
            dualFade: true,
            durationRange: [8, 13],
            sizeRange: [0.8, 2.0],
            opacityRange: [0.3, 0.7],
            position: 'top',
        },
        petals: {
            char: '\u2740',
            interval: 500,
            fallClass: 'particle--fall-sway',
            dualFade: true,
            durationRange: [10, 16],
            sizeRange: [0.7, 1.4],
            opacityRange: [0.4, 0.8],
            position: 'top',
        },
        embers: {
            char: '\u2022',
            interval: 200,
            fallClass: 'particle--rise',
            dualFade: false,
            durationRange: [4, 7],
            sizeRange: [0.95, 1.95],
            opacityRange: [0.5, 0.9],
            position: 'bottom',
        },
        stars: {
            char: '\u00B7',
            interval: 600,
            fallClass: 'particle--twinkle',
            dualFade: false,
            durationRange: [3, 6],
            sizeRange: [1.5, 3.5],
            opacityRange: [0.2, 0.6],
            position: 'scatter',
        },
        rain: {
            char: '|',
            interval: 95,
            fallClass: 'particle--rain',
            dualFade: true,
            durationRange: [0.65, 1.35],
            sizeRange: [1.15, 2.05],
            opacityRange: [0.3, 0.6],
            position: 'top',
        },
    };

    var effectIntervalId = null;
    var currentEffectName = null;
    var saveTimer = null;
    var previousFocus = null;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function ensureParticleLayer() {
        var layer = document.getElementById('particleLayer');
        if (!layer) {
            layer = document.createElement('div');
            layer.id = 'particleLayer';
            layer.className = 'particle-layer';
            layer.setAttribute('aria-hidden', 'true');
            document.body.insertBefore(layer, document.body.firstChild);
        }
        return layer;
    }

    function stopEffectLoop() {
        if (effectIntervalId) {
            clearInterval(effectIntervalId);
            effectIntervalId = null;
        }
    }

    function clearParticles() {
        var layer = document.getElementById('particleLayer');
        if (layer) layer.innerHTML = '';
    }

    function spawnParticle(effectName, layer) {
        var cfg = EFFECT_CONFIG[effectName];
        if (!cfg) return;

        var el = document.createElement('div');
        el.className = 'particle ' + cfg.fallClass;
        el.textContent = cfg.char;
        el.style.color = 'var(--effect-color)';

        var dur = rand(cfg.durationRange[0], cfg.durationRange[1]);
        var op = rand(cfg.opacityRange[0], cfg.opacityRange[1]);
        el.style.setProperty('--particle-opacity-base', String(op));

        var size = rand(cfg.sizeRange[0], cfg.sizeRange[1]);
        el.style.fontSize = size + 'em';

        if (cfg.position === 'scatter') {
            el.style.left = rand(0, 100) + 'vw';
            el.style.top = rand(0, 100) + 'vh';
        } else {
            el.style.left = rand(0, 100) + 'vw';
        }
        el.style.animationDuration = cfg.dualFade ? dur + 's, ' + dur + 's' : dur + 's';

        layer.appendChild(el);
        window.setTimeout(function () {
            if (el.parentNode) el.remove();
        }, dur * 1000 + 150);
    }

    function startEffect(name) {
        stopEffectLoop();
        clearParticles();
        currentEffectName = name && name !== 'none' && EFFECT_CONFIG[name] ? name : null;
        if (!currentEffectName) return;
        if (document.hidden) return;

        var layer = ensureParticleLayer();
        var cfg = EFFECT_CONFIG[currentEffectName];
        effectIntervalId = window.setInterval(function () {
            spawnParticle(currentEffectName, layer);
        }, cfg.interval);
    }

    function pauseEffectsForBackground() {
        stopEffectLoop();
        clearParticles();
    }

    function resumeEffectsIfActive() {
        if (!currentEffectName) return;
        if (effectIntervalId) return;
        if (document.hidden) return;
        var layer = ensureParticleLayer();
        var cfg = EFFECT_CONFIG[currentEffectName];
        if (!cfg) return;
        effectIntervalId = window.setInterval(function () {
            spawnParticle(currentEffectName, layer);
        }, cfg.interval);
    }

    // Pause/resume only via the Page Visibility API. Tab + window switches set
    // document.hidden reliably; pairing window blur/focus with it caused effects
    // to stay stopped when focus/blur order didn't match visibility.
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) pauseEffectsForBackground();
        else resumeEffectsIfActive();
    });

    // Reveal the settings gear only while the user is actively interacting.
    // Any mouse/touch/key activity surfaces it; it fades out after idle.
    var uiIdleTimer = null;
    var UI_IDLE_MS = 1800;
    function showUIBriefly() {
        if (document.body) document.body.classList.add('ui-active');
        if (uiIdleTimer) window.clearTimeout(uiIdleTimer);
        uiIdleTimer = window.setTimeout(function () {
            if (document.body) document.body.classList.remove('ui-active');
        }, UI_IDLE_MS);
    }
    document.addEventListener('mousemove', showUIBriefly, { passive: true });
    document.addEventListener('pointerdown', showUIBriefly, { passive: true });
    document.addEventListener('touchstart', showUIBriefly, { passive: true });
    document.addEventListener('keydown', showUIBriefly);

    function applyVarsToRoot(vars) {
        var root = document.documentElement;
        Object.keys(vars).forEach(function (key) {
            root.style.setProperty(key, vars[key]);
        });
    }

    function gatherConfigFromInputs(panel) {
        var cfg = {};
        COLOR_KEYS.forEach(function (key) {
            var input = panel.querySelector('input[data-var="' + key + '"]');
            if (input && input.value) cfg[key] = input.value;
        });
        var sel = document.getElementById('effectSelect');
        cfg.effect = sel ? sel.value || 'none' : 'none';
        return cfg;
    }

    /** Writes full merged vars to localStorage so reload restores last session reliably. */
    function persistSessionConfig(panel) {
        var cfg = gatherConfigFromInputs(panel);
        var merged = mergeFullVars(cfg);
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    '--bg': merged['--bg'],
                    '--fg': merged['--fg'],
                    '--start': merged['--start'],
                    '--pause': merged['--pause'],
                    '--stop': merged['--stop'],
                    '--effect-color': merged['--effect-color'],
                    effect: cfg.effect,
                }),
            );
        } catch (e) {
            /* ignore quota */
        }
    }

    function loadSavedThemePreset() {
        try {
            var raw = localStorage.getItem(STORAGE_SAVED_THEME);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    /** Paints each preset chip from the PRESETS config so chips stay in sync
        with any preset color changes automatically. Presets with an ambient
        effect render as bg + effect-color diagonal; presets with no effect
        render as a solid bg fill. */
    function paintPresetChips(panel) {
        Object.keys(PRESETS).forEach(function (name) {
            var chip = panel.querySelector('.preset-chip[data-preset="' + name + '"]');
            if (!chip) return;
            var preset = PRESETS[name];
            var bg = normalizeHex(preset.vars['--bg']) || preset.vars['--bg'];
            var hasEffect = preset.effect && preset.effect !== 'none';
            if (hasEffect) {
                var sig =
                    normalizeHex(preset.vars['--effect-color']) || preset.vars['--effect-color'];
                chip.style.backgroundImage =
                    'linear-gradient(135deg, ' + bg + ' 50%, ' + sig + ' 50%)';
            } else {
                chip.style.backgroundImage = 'none';
                chip.style.backgroundColor = bg;
            }
        });
    }

    function updateSavedChipState(savedBtn) {
        if (!savedBtn) return;
        var saved = loadSavedThemePreset();
        var has = !!saved;
        savedBtn.disabled = !has;
        savedBtn.setAttribute('aria-disabled', has ? 'false' : 'true');
        savedBtn.title = has ? 'Saved theme' : 'Use “Save current theme” first';

        if (has) {
            var bg = normalizeHex(saved['--bg']);
            var fg = normalizeHex(saved['--fg']);
            var sig = normalizeHex(saved['--effect-color']);
            var hasEffect = saved.effect && saved.effect !== 'none';
            if (bg) savedBtn.style.setProperty('--saved-bg', bg);
            if (fg) savedBtn.style.setProperty('--saved-fg', fg);
            if (hasEffect && sig) {
                savedBtn.style.backgroundImage =
                    'linear-gradient(135deg, ' + (bg || 'var(--saved-bg)') + ' 50%, ' + sig + ' 50%)';
                savedBtn.style.backgroundColor = '';
            } else if (bg) {
                savedBtn.style.backgroundImage = 'none';
                savedBtn.style.backgroundColor = bg;
            } else {
                savedBtn.style.backgroundImage = '';
                savedBtn.style.backgroundColor = '';
            }
        } else {
            savedBtn.style.removeProperty('--saved-bg');
            savedBtn.style.removeProperty('--saved-fg');
            savedBtn.style.backgroundImage = '';
            savedBtn.style.backgroundColor = '';
        }
    }

    function fillInputsFromConfig(panel, cfg) {
        COLOR_KEYS.forEach(function (key) {
            var input = panel.querySelector('input[data-var="' + key + '"]');
            if (!input) return;
            var normalized = normalizeHex(cfg[key]);
            if (normalized) input.value = normalized;
        });
        var sel = document.getElementById('effectSelect');
        if (sel && cfg.effect) sel.value = cfg.effect;
    }

    function mergeFullVars(cfg) {
        var base = PRESETS.dark.vars;
        var out = {};
        Object.keys(base).forEach(function (k) {
            out[k] = cfg[k] != null ? cfg[k] : base[k];
        });
        return out;
    }

    function applyConfig(cfg, panel) {
        var full = mergeFullVars(cfg);
        applyVarsToRoot(full);
        fillInputsFromConfig(panel, full);
        var effect = cfg.effect != null ? cfg.effect : 'none';
        var sel = document.getElementById('effectSelect');
        if (sel) sel.value = effect;
        startEffect(effect);
        refreshDerivedColors();
    }

    function applyPreset(name, panel) {
        var preset = PRESETS[name];
        if (!preset) return;
        applyVarsToRoot(preset.vars);
        fillInputsFromConfig(panel, {
            '--bg': preset.vars['--bg'],
            '--fg': preset.vars['--fg'],
            '--start': preset.vars['--start'],
            '--pause': preset.vars['--pause'],
            '--stop': preset.vars['--stop'],
            '--effect-color': preset.vars['--effect-color'],
            effect: preset.effect,
        });
        startEffect(preset.effect);
        refreshDerivedColors();
    }

    function applySavedTheme(panel) {
        var cfg = loadSavedThemePreset();
        if (!cfg || typeof cfg !== 'object') return;
        applyConfig(cfg, panel);
    }

    function saveConfigDebounced(panel) {
        if (saveTimer) window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(function () {
            persistSessionConfig(panel);
        }, 120);
    }

    function loadStoredConfig() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function getFocusableElements(panel) {
        var sel =
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.prototype.slice.call(panel.querySelectorAll(sel)).filter(function (el) {
            return el.offsetParent !== null || el === document.activeElement;
        });
    }

    function initThemes() {
        var panel = document.getElementById('settingsPanel');
        var backdrop = document.getElementById('settingsBackdrop');
        var toggle = document.getElementById('settingsToggle');
        var resetBtn = document.getElementById('resetSettings');
        var effectSelect = document.getElementById('effectSelect');

        if (!panel || !toggle) return;

        ensureParticleLayer();

        var stored = loadStoredConfig();
        if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
            applyConfig(stored, panel);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            applyPreset('light', panel);
        } else {
            applyPreset('dark', panel);
        }

        var savedPresetBtn = document.getElementById('presetSavedBtn');
        var saveThemeBtn = document.getElementById('saveThemeBtn');
        paintPresetChips(panel);
        updateSavedChipState(savedPresetBtn);

        function isTypingTarget(el) {
            if (!el || !el.tagName) return false;
            var t = el.tagName;
            return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || el.isContentEditable === true;
        }

        function openSettings() {
            previousFocus = document.activeElement;
            backdrop.hidden = false;
            backdrop.setAttribute('aria-hidden', 'false');
            panel.hidden = false;
            panel.setAttribute('aria-hidden', 'false');
            panel.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
            window.requestAnimationFrame(function () {
                var focusables = getFocusableElements(panel);
                if (focusables.length) focusables[0].focus();
            });
        }

        function closeSettings() {
            panel.classList.remove('is-open');
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
            backdrop.hidden = true;
            backdrop.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            if (previousFocus && typeof previousFocus.focus === 'function') {
                previousFocus.focus();
            }
        }

        toggle.addEventListener('click', function () {
            if (panel.classList.contains('is-open')) closeSettings();
            else openSettings();
        });

        if (backdrop) {
            backdrop.addEventListener('click', closeSettings);
        }

        panel.addEventListener('input', function (e) {
            var t = e.target;
            if (t && t.getAttribute && t.getAttribute('data-var')) {
                document.documentElement.style.setProperty(t.getAttribute('data-var'), t.value);
                refreshDerivedColors();
                saveConfigDebounced(panel);
            }
        });

        if (effectSelect) {
            effectSelect.addEventListener('change', function () {
                startEffect(effectSelect.value);
                saveConfigDebounced(panel);
            });
        }

        panel.querySelectorAll('.preset-chip[data-preset]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var name = btn.getAttribute('data-preset');
                if (name === 'saved') {
                    if (btn.disabled) return;
                    applySavedTheme(panel);
                    saveConfigDebounced(panel);
                    return;
                }
                applyPreset(name, panel);
                saveConfigDebounced(panel);
            });
        });

        if (saveThemeBtn) {
            saveThemeBtn.addEventListener('click', function () {
                var cfg = gatherConfigFromInputs(panel);
                var merged = mergeFullVars(cfg);
                try {
                    localStorage.setItem(
                        STORAGE_SAVED_THEME,
                        JSON.stringify({
                            '--bg': merged['--bg'],
                            '--fg': merged['--fg'],
                            '--start': merged['--start'],
                            '--pause': merged['--pause'],
                            '--stop': merged['--stop'],
                            '--effect-color': merged['--effect-color'],
                            effect: cfg.effect,
                        }),
                    );
                } catch (err) {
                    /* ignore */
                }
                updateSavedChipState(savedPresetBtn);
                saveThemeBtn.textContent = 'Saved ✓';
                window.setTimeout(function () {
                    saveThemeBtn.textContent = 'Save current theme';
                }, 1600);
                persistSessionConfig(panel);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (e) { }
                applyPreset('dark', panel);
                persistSessionConfig(panel);
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) {
                e.preventDefault();
                closeSettings();
                return;
            }
            if (!isTypingTarget(document.activeElement)) {
                var comma = e.key === ',' || e.code === 'Comma';
                if (comma && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (panel.classList.contains('is-open')) closeSettings();
                    else openSettings();
                    return;
                }
            }
            if (!panel.classList.contains('is-open') || e.key !== 'Tab') return;

            var focusables = getFocusableElements(panel);
            if (focusables.length === 0) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        persistSessionConfig(panel);
        refreshDerivedColors();
    }

    window.initThemes = initThemes;
})();
