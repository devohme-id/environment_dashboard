<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Grounding Monitoring System</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link rel="stylesheet" href="assets/css/tabler-icons.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
    <header>
        <div class="header-title">
            GROUNDING CHECKER MONITORING
        </div>
        <nav>
            <a href="index.php" class="nav-btn" style="text-decoration: none;">Back</a>
        </nav>
        <div id="datetime-container">
            <div id="time-display"></div>
            <div id="date-display"></div>
        </div>
    </header>
    <div class="grid" id="monitor-grid"></div>

    <audio id="alarmSound" src="assets/alarm.wav" allow="autoplay; fullscreen" preload="auto" loop></audio>

    <footer>
        <div class="legend">
            <div class="legend-item">
                <span class="legend-box ok"></span>
                <span style="margin-left:6px">Ground path is <strong>normal</strong>.</span>
            </div>
            <div class="legend-item">
                <span class="legend-box disconnected"></span>
                <span style="margin-left:6px">Ground path has a fault.</span>
            </div>
            <div class="legend-item">
                <span class="legend-box unknown"></span>
                <span style="margin-left:6px">Anomaly Sensor.</span>
            </div>
        </div>
        <div class="note">Status updates automatically every 2 seconds. Alarm and blinking animation are active only during a fault.</div>
    </footer>


    <script src="assets/js/app.js"></script>

</body>

</html>