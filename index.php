<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Integrated Monitoring Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Mengubah background body menjadi warna terang */
        body,
        html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background-color: #f1f5f9;
            /* Light Mode Background */
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>

<body>
    <iframe id="monitoring-frame" src="temperature_monitor.php"></iframe>

    <script>
        const pages = [
            'temperature_monitor.php?page=1',
            'temperature_monitor.php?page=2',
            'temperature_monitor.php?page=3',
            'grounding_monitor.php'
        ];

        let currentPageIndex = 0;
        const intervalTime = 15000;

        const monitoringFrame = document.getElementById('monitoring-frame');

        function switchToNextPage() {
            currentPageIndex = (currentPageIndex + 1) % pages.length;
            monitoringFrame.src = pages[currentPageIndex];
        }

        setInterval(switchToNextPage, intervalTime);
    </script>
</body>

</html>
