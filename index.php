<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Integrated Monitoring Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Menghilangkan margin, padding, dan border dari body dan iframe */
        body,
        html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background-color: #0f172a;
            /* Warna latar belakang yang konsisten */
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>

<body>

    <!-- Iframe ini akan menampilkan halaman monitoring secara bergantian -->
    <!-- Memuat halaman grounding dengan nama baru sebagai halaman pertama -->
    <iframe id="monitoring-frame" src="temperature_monitor.php"></iframe>

    <script>
        // Daftar halaman yang akan di-loop
        const pages = [
            'temperature_monitor.php?page=1', // Halaman SMT Lines
            'temperature_monitor.php?page=2', // Halaman Area & Storage
            'temperature_monitor.php?page=3', // Halaman Facility
            'grounding_monitor.php' // Halaman Grounding Monitoring (NAMA BARU)
        ];

        let currentPageIndex = 0;
        const intervalTime = 15000; // 15 detik

        const monitoringFrame = document.getElementById('monitoring-frame');

        /**
         * Fungsi untuk beralih ke halaman berikutnya dalam daftar.
         */
        function switchToNextPage() {
            // Pindah ke indeks halaman berikutnya
            currentPageIndex = (currentPageIndex + 1) % pages.length;

            // Setel sumber iframe ke halaman berikutnya
            monitoringFrame.src = pages[currentPageIndex];
        }

        // Mulai looping setelah halaman pertama ditampilkan selama 15 detik
        setInterval(switchToNextPage, intervalTime);
    </script>

</body>

</html>