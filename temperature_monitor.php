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
        <div class="header-left">
            <h1 class="header-title" id="header-title-text">ENVIRONMENT MONITORING</h1>
            <p class="header-subtitle" id="header-subtitle-text"></p>
        </div>
        <div class="header-right">
            <nav class="nav-menu">
                <div class="dropdown-container">
                    <button class="dropdown-toggle" onclick="toggleDropdown()" title="Menu">
                        <i class="ti ti-menu-2" style="font-size: 1.2em;"></i>
                        <span>MENU</span>
                    </button>
                    <div id="nav-dropdown" class="dropdown-menu">
                        <a href="#" class="dropdown-item" onclick="handleNavClick(1); return false;" id="link-page-1">SMT Lines</a>
                        <a href="#" class="dropdown-item" onclick="handleNavClick(2); return false;" id="link-page-2">Area & Storage</a>
                        <a href="#" class="dropdown-item" onclick="handleNavClick(3); return false;" id="link-page-3">Facility</a>
                        <a href="grounding_monitor.php" class="dropdown-item" target="_top">Grounding Monitor</a>
                    </div>
                </div>
            </nav>
            <button id="audio-toggle" class="sound-btn" title="Enable/Disable Sound">
                <div id="audio-icon-container" class="flex items-center justify-center">
                    <svg class="sound-icon muted-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <svg class="sound-icon unmuted-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                    </svg>
                </div>
            </button>
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
                <span>Temperature: 22 ~ 28°C</span> | <span>Humidity: 30 ~ 60%</span> | <span>Air Pressure: 5.5 ~ 7.5 KGF/CM²</span>
            </div>
        </div>
        <div class="info-note" style="max-width: 800px;">
            Status is updated automatically. Alarm and blinking animation are active only during a limit breach
        </div>
    </footer>

    <audio id="alarmSound" src="assets/alarm.wav" preload="auto"></audio>
    <script src="assets/js/temp_app.js"></script>

</body>

</html>
