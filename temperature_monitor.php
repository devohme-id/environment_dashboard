<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Temperature & Humidity Monitoring</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/tabler-icons.min.css">
    <link rel="stylesheet" href="assets/css/temp_style.css">
    <script src="assets/js/chart.js"></script>
    <script src="assets/js/chartjs-adapter-date-fns.js"></script>
    <script src="assets/js/chartjs-plugin-annotation.min.js"></script>
</head>

<body>

    <header class="header-ui">
        <div class="header-center">
            <div class="header-title" id="header-title-text">
                ENVIRONMENT MONITORING
            </div>
        </div>
        <div class="header-right">
            <div class="dropdown-container">
                <button class="nav-btn" onclick="toggleDropdown()" title="Menu">
                    <i class="ti ti-menu-2" style="font-size: 1.2em;"></i>
                    <span>MENU</span>
                    <i class="ti ti-chevron-down" style="font-size: 0.8em; margin-left: auto;"></i>
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
                <div class="legend-item"><span class="legend-box status-anomaly"></span><span>ANOMALY SENSOR</span></div>
            </div>
            <div class="info-ranges">
                <span>Temp: 22~28°C</span> | <span>Hum: 30~60%</span> | <span>Press: 5.5~7.5 KGF/CM²</span>
            </div>
        </div>
        <div class="info-note" style="max-width: 500px;">
            Status updated automatically. Alarm active during limit breach.
        </div>
    </footer>

    <audio id="alarmSound" src="assets/alarm.wav" preload="auto"></audio>
    <script src="assets/js/temp_app.js"></script>

</body>

</html>
