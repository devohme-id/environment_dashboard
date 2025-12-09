// File: grounding_monitor/assets/js/app.js

/**
 * LOGIKA DROPDOWN MENU
 */
function toggleDropdown() {
    const dropdown = document.getElementById("nav-dropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

window.onclick = function (event) {
    if (!event.target.closest('.dropdown-container')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

/**
 * LOGIKA WAKTU & TANGGAL
 */
function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const timeElem = document.getElementById('time-display');
    const dateElem = document.getElementById('date-display');

    if (timeElem) timeElem.textContent = now.toLocaleTimeString('id-ID', timeOptions).replace(/\./g, ':');
    if (dateElem) dateElem.textContent = now.toLocaleDateString('id-ID', dateOptions);
}

const fixedLocations = ["WH_01", "WH_02", "LineProd_01", "LineProd_02", "LineProd_03", "LineProd_04", "LineProd_05", "LineProd_06"];

const locationDescriptions = {
    'WH_01': "LV 3 Human GND",
    'WH_02': "LV 3 Human GND",
    'LineProd_01': "LV 1 Machine GND",
    'LineProd_02': "LV 1 Machine GND",
    'LineProd_03': "LV 1 Machine GND",
    'LineProd_04': "LV 1 Machine GND",
    'LineProd_05': "LV 1 Machine GND",
    'LineProd_06': "LV 1 Machine GND"
};

function formatWaktuRelatif(timestampString) {
    if (!timestampString || timestampString === "-") return "NO DATA";
    const then = new Date(timestampString.replace(' ', 'T'));
    const now = new Date();
    if (isNaN(then)) return "Invalid time";

    const selisihDetik = Math.round((now - then) / 1000);
    const selisihMenit = Math.round(selisihDetik / 60);

    if (selisihDetik < 5) return "recently"; // Teks lebih padat
    if (selisihDetik < 60) return `${selisihDetik}s ago`;
    if (selisihMenit < 90) return `${selisihMenit}m ago`;

    return `> 90m ago`;
}

function loadStatus() {
    fetch('get_latest_status.php?nocache=' + new Date().getTime())
        .then(res => res.ok ? res.json() : Promise.reject('Network error'))
        .then(data => {
            const grid = document.getElementById('monitor-grid');
            const alarm = document.getElementById("alarmSound");
            if (!grid) return;

            grid.innerHTML = '';

            const dataMap = new Map(data.map(item => [item.line_id, item]));
            let triggerAlarm = false;
            const now = new Date();

            fixedLocations.forEach(loc => {
                const item = dataMap.get(loc);
                let rawStatus = "UNKNOWN";
                let timestamp = "-";
                let diffSeconds = 999999;

                if (item) {
                    rawStatus = item.ground_status;
                    timestamp = item.timestamp;
                    const lastUpdate = new Date(timestamp.replace(' ', 'T'));
                    diffSeconds = (now - lastUpdate) / 1000;
                }

                let visualClass = '';
                let displayStatus = '';
                const TIME_WARNING = 30;
                const TIME_CRITICAL = 900;

                if (!item) {
                    visualClass = 'disconnected blinking';
                    displayStatus = 'DISCONNECTED';
                    triggerAlarm = true;
                } else if (rawStatus === 'DISCONNECTED') {
                    visualClass = 'disconnected';
                    displayStatus = 'FAULT';
                    triggerAlarm = true;
                } else if (diffSeconds >= TIME_CRITICAL) {
                    visualClass = 'unknown blinking';
                    displayStatus = 'ANOMALY';
                    triggerAlarm = false;
                } else if (diffSeconds >= TIME_WARNING) {
                    visualClass = 'warning';
                    displayStatus = 'CONNECTED';
                } else {
                    visualClass = 'ok';
                    displayStatus = 'CONNECTED';
                }

                const card = document.createElement('div');
                card.className = `card ${visualClass}`;
                const waktuTampil = formatWaktuRelatif(timestamp);
                const description = locationDescriptions[loc] || '';

                // Struktur Card yang lebih padat, Icon lebih besar
                card.innerHTML = `
                  <div class="location">${loc}</div>
                  <div class="location-description">${description}</div>

                    <div class="status-animation">
                        <i class="ti ti-building-estate machine-icon"></i>

                        <!-- Kabel Putus (ViewBox disesuaikan agar kabel terlihat tebal & panjang) -->
                        <svg class="cable-svg cable-error" viewBox="0 0 100 40" style="display: ${visualClass.includes('disconnected') || visualClass.includes('unknown') ? 'block' : 'none'}">
                             <!-- Kabel Kiri -->
                             <path class="cable-path" d="M 5,20 C 30,5 40,20 45,20"/>
                             <!-- Silang Error (X) di tengah -->
                             <path class="cable-path" d="M 40,10 L 60,30" stroke-width="4" stroke="currentColor" />
                             <path class="cable-path" d="M 60,10 L 40,30" stroke-width="4" stroke="currentColor" />
                             <!-- Kabel Kanan -->
                             <path class="cable-path" d="M 55,20 C 60,20 70,35 95,20"/>
                        </svg>

                        <!-- Kabel Nyambung -->
                        <svg class="cable-svg cable-ok" viewBox="0 0 100 40" style="display: ${visualClass === 'ok' ? 'block' : 'none'}">
                            <path class="cable-path" d="M 5,20 C 30,5 70,35 95,20"/>
                        </svg>

                        <!-- Kabel Warning -->
                        <svg class="cable-svg cable-warning" viewBox="0 0 100 40" style="display: ${visualClass === 'warning' ? 'block' : 'none'}">
                             <path class="cable-path" stroke-dasharray="10,10" d="M 5,20 C 30,5 70,35 95,20"/>
                        </svg>

                        <i class="ti ti-outlet device-icon"></i>
                    </div>

                  <div class="status-text">${displayStatus}</div>
                  <div class="timestamp">${waktuTampil}</div>
                `;
                grid.appendChild(card);
            });

            if (triggerAlarm) {
                if (alarm.paused) alarm.play().catch(e => { });
            } else {
                alarm.pause();
                alarm.currentTime = 0;
            }
        })
        .catch(error => {
            console.error(error);
            const grid = document.getElementById('monitor-grid');
            if (grid) grid.innerHTML = `<div style="text-align:center; color:#ef4444; margin-top:50px;">Connection Lost...</div>`;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadStatus();
    setInterval(loadStatus, 2000);
});
