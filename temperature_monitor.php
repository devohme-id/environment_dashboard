<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Temperature & Humidity Monitoring</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/temp_style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@1.4.0/dist/chartjs-plugin-annotation.min.js"></script>
</head>

<body>

    <header class="header-ui">
        <!-- Bagian Tengah: Judul (Absolute Center di Desktop, Flow di Mobile) -->
        <div class="header-center">
            <div class="header-title" id="header-title-text">
                ENVIRONMENT MONITORING
            </div>
        </div>

        <!-- Bagian Kanan: Menu & Jam -->
        <div class="header-right">

            <!-- Dropdown Menu -->
            <div class="dropdown-container">
                <button class="nav-btn" onclick="toggleDropdown()" title="Menu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
                    </svg>
                    MENU
                </button>
                <div id="nav-dropdown" class="dropdown-menu">
                    <a href="#" class="dropdown-item" onclick="handleNavClick(1); return false;" id="link-page-1">SMT Lines</a>
                    <a href="#" class="dropdown-item" onclick="handleNavClick(2); return false;" id="link-page-2">Area & Storage</a>
                    <a href="#" class="dropdown-item" onclick="handleNavClick(3); return false;" id="link-page-3">Facility</a>
                    <div style="border-top: 1px solid #e2e8f0; margin: 4px 0;"></div>
                    <a href="grounding_monitor.php" class="dropdown-item" target="_top">Grounding Monitor</a>
                </div>
            </div>

            <div class="header-clock">
                <div id="time-display" class="clock-time"></div>
                <div id="date-display" class="clock-date"></div>
            </div>
        </div>
    </header>

    <main>
        <div class="chart-grid" id="chart-grid">
            <div class="chart-card" id="chart-card-1">
                <h2 id="chart-title-0">Memuat Data...</h2>
                <div class="chart-container"><canvas id="chart-0"></canvas></div>
            </div>
            <div class="chart-card" id="chart-card-2">
                <h2 id="chart-title-1">Memuat Data...</h2>
                <div class="chart-container"><canvas id="chart-1"></canvas></div>
            </div>
            <div class="chart-card" id="chart-card-3">
                <h2 id="chart-title-2">Memuat Data...</h2>
                <div class="chart-container"><canvas id="chart-2"></canvas></div>
            </div>
            <div class="chart-card" id="chart-card-4">
                <h2 id="chart-title-3">Memuat Data...</h2>
                <div class="chart-container"><canvas id="chart-3"></canvas></div>
            </div>
            <div class="chart-card" id="chart-card-5">
                <h2 id="chart-title-4">Memuat Data...</h2>
                <div class="chart-container"><canvas id="chart-4"></canvas></div>
            </div>
            <div class="chart-card" id="chart-card-6">
                <h2 id="chart-title-5">Memuat Data...</h2>
                <div class="chart-container"><canvas id="chart-5"></canvas></div>
            </div>
        </div>
    </main>

    <footer>
        <div class="footer-left">
            <div class="legend">
                <div class="legend-item"><span class="legend-box status-safe"></span><span>SAFE</span></div>
                <div class="legend-item"><span class="legend-box status-warning"></span><span>WARNING</span></div>
                <div class="legend-item"><span class="legend-box status-danger"></span><span>DANGER</span></div>
                <div class="legend-item"><span class="legend-box status-anomaly"></span><span>ANOMALY</span></div>
            </div>
            <div class="info-ranges">
                <span>Temp: 22~28°C</span> | <span>Hum: 30~60%</span> | <span>Press: 5.5~7.5 KGF/CM²</span>
            </div>
        </div>
        <div class="info-note">
            Status updated automatically. Alarm active during limit breach.
        </div>
    </footer>

    <audio id="alarmSound" src="assets/alarm.wav" preload="auto"></audio>
    <script src="assets/js/temp_app.js"></script>

</body>

</html>
