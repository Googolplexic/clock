/**
 * Wall clock (12-hour display).
 *
 * Prefer the runtime's IANA time zone. When none is reported — common on
 * Windows with the new "Pacific Time (British Columbia)" zone (permanent
 * PCT / UTC−7, no IANA mapping yet) — Date#getHours is stuck on UTC−8 while
 * the OS clock is correct. Fall back to America/Vancouver, which follows BC
 * civil time in current tzdata.
 */
function initClock() {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    const formatter = new Intl.DateTimeFormat(undefined, {
        timeZone: resolveDisplayTimeZone(),
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    function partValue(parts, type) {
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].type === type) return parts[i].value;
        }
        return '';
    }

    function updateClock() {
        const parts = formatter.formatToParts(new Date());
        const hours = partValue(parts, 'hour');
        const minutes = partValue(parts, 'minute');
        const seconds = partValue(parts, 'second');
        clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateClock, 1000);
    updateClock();
}

function resolveDisplayTimeZone() {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (resolved) {
        // US Pacific still falls back in November; BC stays on UTC−7.
        // If the resolved zone has diverged from Vancouver, prefer Vancouver
        // for Canadian locales (or when the OS offset already matches it).
        if (resolved === 'America/Los_Angeles' || resolved === 'America/Tijuana') {
            const now = new Date();
            const resolvedOffset = zoneOffsetMinutes(now, resolved);
            const vancouverOffset = zoneOffsetMinutes(now, 'America/Vancouver');
            if (resolvedOffset !== vancouverOffset) {
                const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
                const systemOffset = now.getTimezoneOffset();
                if (
                    systemOffset === vancouverOffset ||
                    locale.startsWith('en-CA') ||
                    locale.startsWith('fr-CA')
                ) {
                    return 'America/Vancouver';
                }
            }
        }
        return resolved;
    }

    return 'America/Vancouver';
}

function zoneOffsetMinutes(date, timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'longOffset',
        hour: 'numeric',
    }).formatToParts(date);

    let name = '';
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].type === 'timeZoneName') {
            name = parts[i].value;
            break;
        }
    }

    // "GMT-07:00" / "GMT+5:30" / "GMT"
    const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
    if (!match) return date.getTimezoneOffset();

    const sign = match[1] === '-' ? 1 : -1;
    const hours = Number(match[2]);
    const minutes = Number(match[3] || 0);
    return sign * (hours * 60 + minutes);
}

window.initClock = initClock;
