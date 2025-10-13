// File: grounding_monitor/assets/js/app.js

/**
 * Fungsi untuk memformat timestamp menjadi waktu relatif (e.g., "beberapa detik lalu").
 */
function formatWaktuRelatif(timestampString) {
    if (!timestampString || timestampString === "-") return "No data";
    const now = new Date();
    const then = new Date(timestampString.replace(' ', 'T'));
    if (isNaN(then)) return "Invalid time";

    const selisihDetik = Math.round((now - then) / 1000);
    const selisihMenit = Math.round(selisihDetik / 60);

    if (selisihDetik < 5) return "recently";
    if (selisihDetik < 60) return `${selisihDetik} seconds ago`;
    // ### TAMPILAN MENIT DIPERPANJANG ###
    if (selisihMenit < 90) return `${selisihMenit} minutes ago`; 
    
    return `more than 90 minutes ago`;
}

/**
 * Fungsi untuk memperbarui jam dan tanggal di header.
 */
function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    document.getElementById('time-display').textContent = now.toLocaleTimeString('id-ID', timeOptions).replace(/\./g, ':');
    document.getElementById('date-display').textContent = now.toLocaleDateString('id-ID', dateOptions);
}

const fixedLocations = ["WH_01", "WH_02", "LineProd_01", "LineProd_02", "LineProd_03", "LineProd_04", "LineProd_05", "LineProd_06"];

// --- DATA BARU: Peta untuk deskripsi lokasi ---
const locationDescriptions = {
    'WH_01': "LV 3 Human GND",
    'WH_02': "LV 3 Human GND",
    'LineProd_01': "LV 1 Machine GND",
    'LineProd_02': "LV 1 Machine GND",
    'LineProd_03': "LV 1 Machine GND", // Deskripsi untuk LineProd_03
    'LineProd_04': "LV 1 Machine GND", // Deskripsi untuk LineProd_04
    'LineProd_05': "LV 1 Machine GND", // Deskripsi untuk LineProd_05
    'LineProd_06': "LV 1 Machine GND"  // Deskripsi untuk LineProd_06
};

/**
 * Fungsi utama untuk memuat dan menampilkan status grounding.
 */
function loadStatus() {
    fetch('get_latest_status.php')
        .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok.'))
        .then(data => {
            const grid = document.getElementById('monitor-grid');
            const alarm = document.getElementById("alarmSound");
            grid.innerHTML = '';

            const dataMap = new Map(data.map(item => [item.line_id, item]));
            let hasDisconnected = false;

            fixedLocations.forEach(loc => {
                const item = dataMap.get(loc);
                let status = "UNKNOWN";
                let timestamp = "-";
                
                // Logika kini sederhana: hanya baca status dari server
                if (item) {
                    status = item.ground_status;
                    timestamp = item.timestamp;
                }
                
                let cardClass = status.toLowerCase(); // ok, disconnected, atau unknown
                
                if (status === 'DISCONNECTED') {
                    cardClass += ' blinking';
                    hasDisconnected = true;
                }

                const card = document.createElement('div');
                card.className = `card ${cardClass}`;
                
                const waktuTampil = formatWaktuRelatif(timestamp);

                // Ambil deskripsi dari map, jika tidak ada beri nilai default string kosong
                const description = locationDescriptions[loc] || '';

                // --- KARTU HTML DIPERBARUI DENGAN DESKRIPSI ---
                card.innerHTML = `
                  <div class="location">${loc}</div>
                  <div class="location-description">${description}</div>
                  <div class="status">${status}</div>
                  <div class="timestamp" title="Pembaruan Terakhir: ${timestamp}">${waktuTampil}</div>
                `;
                grid.appendChild(card);
            });

            // Logika alarm tetap sama
            if (hasDisconnected && alarm.paused) {
                alarm.play().catch(e => console.warn("Alarm play failed:", e));
            } else if (!hasDisconnected && !alarm.paused) {
                alarm.pause();
                alarm.currentTime = 0;
            }
        })
        .catch(error => {
            console.error("Error loading status:", error);
            document.getElementById('monitor-grid').innerHTML = `<div class="error-message">Gagal memuat data. Periksa koneksi atau file endpoint.</div>`;
        });
}

// Inisialisasi dan interval pembaruan
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    loadStatus();
    setInterval(loadStatus, 15000); // Periksa status setiap 15 detik
});