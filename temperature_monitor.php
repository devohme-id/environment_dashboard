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

    <header>
        <div class="header-title">
            ENVIRONMENT MONITORING
        </div>
        <nav>
            <button id="btn-page-1" class="nav-btn active" onclick="loadPage(1)">SMT Lines</button>
            <button id="btn-page-2" class="nav-btn" onclick="loadPage(2)">Area & Storage</button>
            <button id="btn-page-3" class="nav-btn" onclick="loadPage(3)">Facility</button>
        </nav>
        <div id="datetime-container">
            <div id="time-display"></div>
            <div id="date-display"></div>
        </div>
    </header>

    <main>
        <div class="chart-grid" id="chart-grid">
            <!-- Kartu 1 -->
            <div class="chart-card" id="chart-card-1">
                <h2 id="chart-title-0">Memuat Data...</h2>
                <div class="chart-container">
                    <canvas id="chart-0"></canvas>
                </div>
            </div>
            <!-- Kartu 2 -->
            <div class="chart-card" id="chart-card-2">
                <h2 id="chart-title-1">Memuat Data...</h2>
                <div class="chart-container">
                    <canvas id="chart-1"></canvas>
                </div>
            </div>
            <!-- Kartu 3 -->
            <div class="chart-card" id="chart-card-3">
                <h2 id="chart-title-2">Memuat Data...</h2>
                <div class="chart-container">
                    <canvas id="chart-2"></canvas>
                </div>
            </div>
            <!-- Kartu 4 -->
            <div class="chart-card" id="chart-card-4">
                <h2 id="chart-title-3">Memuat Data...</h2>
                <div class="chart-container">
                    <canvas id="chart-3"></canvas>
                </div>
            </div>
            <!-- Kartu 5 -->
            <div class="chart-card" id="chart-card-5">
                <h2 id="chart-title-4">Memuat Data...</h2>
                <div class="chart-container">
                    <canvas id="chart-4"></canvas>
                </div>
            </div>
            <!-- Kartu 6 -->
            <div class="chart-card" id="chart-card-6">
                <h2 id="chart-title-5">Memuat Data...</h2>
                <div class="chart-container">
                    <canvas id="chart-5"></canvas>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="footer-left">
            <div class="legend">
                <div class="legend-item">
                    <span class="legend-box status-safe"></span>
                    <span>SAFE</span>
                </div>
                <div class="legend-item">
                    <span class="legend-box status-warning"></span>
                    <span>WARNING</span>
                </div>
                <div class="legend-item">
                    <span class="legend-box status-danger"></span>
                    <span>DANGER</span>
                </div>
                <div class="legend-item">
                    <span class="legend-box status-anomaly"></span>
                    <span>ANOMALY SENSOR</span>
                </div>
            </div>
            <div class="info-ranges">
                <span>Temperature : 22 ~ 28°C</span> |
                <span>Humidity : 30 ~ 60%</span> |
                <span>Air Pressure : 5.5 ~ 7.5 KGF/CM²</span>
            </div>
        </div>
        <div class="info-note">
            Status is updated automatically. Alarm and blinking animation are active only during a limit breach.
        </div>
    </footer>

    <!-- ### PERUBAHAN: Atribut 'loop' dihapus ### -->
    <audio id="alarmSound" src="assets/alarm.wav" preload="auto"></audio>

    <script src="assets/js/temp_app.js"></script>

</body>

</html>