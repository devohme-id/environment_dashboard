// File: grounding_monitor/assets/js/app.js

/**
 * Fungsi untuk memformat timestamp menjadi waktu relatif
 */
function formatWaktuRelatif(timestampString) {
    if (!timestampString || timestampString === "-") return "No data";
    const then = new Date(timestampString.replace(' ', 'T'));
    const now = new Date();

    if (isNaN(then)) return "Invalid time";

    const selisihDetik = Math.round((now - then) / 1000);
    const selisihMenit = Math.round(selisihDetik / 60);

    if (selisihDetik < 5) return "Baru saja";
    if (selisihDetik < 60) return `${selisihDetik} detik lalu`;
    if (selisihMenit < 90) return `${selisihMenit} menit lalu`;

    return `Lebih dari 90 menit lalu`;
}

/**
 * Fungsi update jam header
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

/**
 * Fungsi utama memuat status dengan Logika 3 Tahap
 */
function loadStatus() {
    // Gunakan nocache agar data selalu fresh dari server
    fetch('get_latest_status.php?nocache=' + new Date().getTime())
        .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
        .then(data => {
            const grid = document.getElementById('monitor-grid');
            const alarm = document.getElementById("alarmSound");

            if (!grid) return;
            grid.innerHTML = '';

            const dataMap = new Map(data.map(item => [item.line_id, item]));
            let triggerAlarm = false; // Flag global untuk menyalakan alarm

            const now = new Date();

            fixedLocations.forEach(loc => {
                const item = dataMap.get(loc);

                let rawStatus = "UNKNOWN";
                let timestamp = "-";
                let diffSeconds = 999999; // Default nilai besar jika tidak ada data

                if (item) {
                    rawStatus = item.ground_status;
                    timestamp = item.timestamp;

                    const lastUpdate = new Date(timestamp.replace(' ', 'T'));
                    diffSeconds = (now - lastUpdate) / 1000;
                }

                // --- LOGIKA UTAMA ---
                let visualClass = ''; // ok, warning, disconnected
                let displayStatus = '';

                // Batas Waktu
                const TIME_WARNING = 30;   // 30 detik (mulai jadi Orange)
                const TIME_CRITICAL = 900; // 15 menit (mulai jadi Merah + Alarm)

                if (!item) {
                    // Kasus 1: Tidak ada data sama sekali di DB
                    visualClass = 'disconnected blinking';
                    displayStatus = 'NO DATA';
                    triggerAlarm = true;
                }
                else if (rawStatus === 'DISCONNECTED') {
                    // Kasus 2: DB eksplisit bilang DISCONNECTED (kabel putus tapi sensor masih kirim data)
                    visualClass = 'disconnected blinking';
                    displayStatus = 'DISCONNECTED';
                    triggerAlarm = true;
                }
                else if (diffSeconds >= TIME_CRITICAL) {
                    // Kasus 3: Data basi > 5 menit (Merah + Alarm)
                    visualClass = 'disconnected blinking';
                    displayStatus = 'NO SIGNAL';
                    triggerAlarm = true;
                }
                else if (diffSeconds >= TIME_WARNING) {
                    // Kasus 4: Data basi antara 30 det - 5 menit (Orange, Alarm Mati)
                    visualClass = 'warning';
                    displayStatus = 'WAITING...';
                    // triggerAlarm TETAP FALSE
                }
                else {
                    // Kasus 5: Data fresh (< 30 det) dan Status OK (Hijau)
                    visualClass = 'ok';
                    displayStatus = 'CONNECTED';
                }

                // Render Card
                const card = document.createElement('div');
                card.className = `card ${visualClass}`; // visualClass akan jadi 'ok', 'warning', atau 'disconnected blinking'

                const waktuTampil = formatWaktuRelatif(timestamp);
                const description = locationDescriptions[loc] || '';

                card.innerHTML = `
                  <div class="location">${loc}</div>
                  <div class="location-description">${description}</div>

                    <div class="status-animation">
                        <i class="ti ti-building-estate machine-icon"></i>

                        <!-- Kabel Putus (Merah) -->
                        <svg class="cable-svg cable-error" width="80" height="30" viewBox="0 0 80 30" style="display: ${visualClass.includes('disconnected') ? 'block' : 'none'}">
                            <path class="cable-path" d="M 5,15 C 25,0 35,15 38,15"/>
                            <path class="cable-path" d="M 42,15 C 45,15 55,30 75,15"/>
                        </svg>

                        <!-- Kabel Nyambung (Hijau) -->
                        <svg class="cable-svg cable-ok" width="80" height="30" viewBox="0 0 80 30" style="display: ${visualClass === 'ok' ? 'block' : 'none'}">
                            <path class="cable-path" d="M 5,15 C 25,0 55,30 75,15"/>
                        </svg>

                        <!-- Kabel Warning/Waiting (Garis Putus-putus atau Lurus Orange) -->
                        <svg class="cable-svg cable-warning" width="80" height="30" viewBox="0 0 80 30" style="display: ${visualClass === 'warning' ? 'block' : 'none'}">
                             <path class="cable-path" stroke-dasharray="5,5" d="M 5,15 C 25,0 55,30 75,15"/>
                        </svg>

                        <i class="ti ti-outlet device-icon"></i>
                    </div>

                  <div class="status-text">${displayStatus}</div>
                  <div class="timestamp" title="Terakhir: ${timestamp}">${waktuTampil}</div>
                `;
                grid.appendChild(card);
            });

            // Kontrol Alarm
            if (triggerAlarm) {
                if (alarm.paused) {
                    alarm.play().catch(e => console.warn("Alarm play failed (need interaction):", e));
                }
            } else {
                alarm.pause();
                alarm.currentTime = 0;
            }
        })
        .catch(error => {
            console.error("Error loading status:", error);
            const grid = document.getElementById('monitor-grid');
            if (grid) grid.innerHTML = `<div class="error-message">Connection Lost...</div>`;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);

    loadStatus();
    setInterval(loadStatus, 2000); // Cek setiap 2 detik
});
