// Konfigurasi global untuk setiap halaman, kartu, dan perangkatnya
const pageConfig = {
    1: { // Halaman 1: SMT Lines
        charts: [
            { title: "SMT Line 1 Temperature", type: 'temperature', devices: { 1: "Top", 2: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 2 Temperature", type: 'temperature', devices: { 4: "Top", 8: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 3 & 4 Temperature", type: 'temperature', devices: { 6: "Bottom", 8: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 5 Temperature", type: 'temperature', devices: { 20: "Top", 21: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 6 Temperature", type: 'temperature', devices: { 22: "Top", 23: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 7 Temperature", type: 'temperature', devices: { 3: "Top", 7: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } }
        ]
    },
    2: { // Halaman 2: Area & Storage
        charts: [
            { title: "Material Humidity", type: 'humidity', devices: { 10: "Material" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "IC Mapping Humidity", type: 'humidity', devices: { 11: "IC Mapping" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "Semiconductor Humidity", type: 'humidity', devices: { 12: "Semiconductor" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "Production Humidity", type: 'humidity', devices: { 13: "Production" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "Delivery Temperature", type: 'temperature', devices: { 24: "Delivery" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "Solder Paste Temperature", type: 'temperature_solder', devices: { 25: "Top", 26: "Bottom" }, limits: { lm: 8, lw: 7, uw: 3, um: 2 } }
        ]
    },
    3: { // Halaman 3: Facility
        charts: [
            { title: "Main Air Pressure", type: 'pressure', devices: { 100: "Main Air" }, limits: { lm: 7.5, lw: 7.0, uw: 6.0, um: 5.5 } },
            { title: "Stencil Room Temperature", type: 'temperature', devices: { 27: "Stencil Room" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "Stencil Room Humidity", type: 'humidity', devices: { 27: "Stencil Room" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: " ", type: 'empty' }, { title: " ", type: 'empty' }, { title: " ", type: 'empty' }
        ]
    }
};

let activeCharts = [];
let currentPage = 1;
let refreshInterval;
let alarmShouldBePlaying = false;
const alarm = document.getElementById("alarmSound");

if (alarm) {
    alarm.addEventListener('ended', function() {
        if (alarmShouldBePlaying) {
            setTimeout(() => {
                if (alarmShouldBePlaying) {
                    alarm.play().catch(e => console.warn("Alarm replay failed:", e));
                }
            }, 1000);
        }
    });
}

function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('time-display').textContent = now.toLocaleTimeString('id-ID', timeOptions).replace(/\./g, ':');
    document.getElementById('date-display').textContent = now.toLocaleDateString('id-ID', dateOptions);
}

async function loadPage(pageNum = null) {
    if (pageNum === null) {
        const urlParams = new URLSearchParams(window.location.search);
        currentPage = parseInt(urlParams.get('page')) || 1;
    } else {
        currentPage = pageNum;
    }

    activeCharts.forEach(chart => chart.destroy());
    activeCharts = [];

    for (let i = 0; i < 6; i++) {
        const card = document.getElementById(`chart-card-${i + 1}`);
        if (card) {
            card.style.visibility = 'visible';
            card.className = 'chart-card';
            const oldAnomalyMsg = card.querySelector('.anomaly-message');
            if (oldAnomalyMsg) oldAnomalyMsg.remove();
        }
        const title = document.getElementById(`chart-title-${i}`);
        if (title) title.textContent = 'Memuat Data...';
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-page-${currentPage}`);
    if(activeBtn) activeBtn.classList.add('active');

    try {
        const response = await fetch(`get_temphygro_data.php?page=${currentPage}`);
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Server responded with status ${response.status}: ${errorData}`);
        }
        const data = await response.json();
        renderPage(currentPage, data);
    } catch (error) {
        console.error("Gagal memuat data:", error);
        const titleEl = document.getElementById('chart-title-0');
        if (titleEl) titleEl.textContent = 'Gagal Memuat Data';
        const container = document.getElementById('chart-0').parentElement;
        if (container) {
            container.innerHTML = `<div class="error-message"><strong>Error:</strong> ${error.message}<br><br>Periksa koneksi, nama tabel/kolom di database, dan log error PHP di server.</div>`;
        }
    }
}

function renderPage(pageNum, data) {
    const config = pageConfig[pageNum];
    if (!config) return;
    let isAnyAlarmActive = false;
    
    config.charts.forEach((chartConfig, index) => {
        const card = document.getElementById(`chart-card-${index + 1}`);
        const titleEl = document.getElementById(`chart-title-${index}`);
        const canvas = document.getElementById(`chart-${index}`);

        if (!card || !titleEl || !canvas) return;

        if (chartConfig.type === 'empty') {
            card.style.visibility = 'hidden';
            return;
        }

        titleEl.textContent = chartConfig.title;

        const chartData = { labels: [], datasets: [] };
        const lineColors = ['#4ade80', '#fb923c', '#a78bfa', '#f87171', '#38bdf8', '#facc15'];
        let colorIndex = 0;
        
        const statusInfo = getCardStatus(data, chartConfig.devices, chartConfig.limits, chartConfig.type);
        card.classList.add(`status-${statusInfo.status}`);

        const isAlarmState = ['warning', 'danger', 'anomaly', 'partial_anomaly'].includes(statusInfo.status);
        if (isAlarmState) {
            card.classList.add('blinking');
            isAnyAlarmActive = true;
        }
        
        if (statusInfo.anomalySensors.length > 0) {
            const anomalyMsg = document.createElement('div');
            anomalyMsg.className = 'anomaly-message';
            anomalyMsg.textContent = `Anomaly: ${statusInfo.anomalySensors.join(', ')} offline`;
            titleEl.parentNode.insertBefore(anomalyMsg, titleEl.nextSibling);
        }

        for (const devid in chartConfig.devices) {
            const deviceName = chartConfig.devices[devid];
            const deviceData = data[devid] || [];
            
            let dataKey;
            if (chartConfig.type === 'humidity') {
                dataKey = 'humidity';
            } else { // Covers 'temperature', 'temperature_solder', and 'pressure'
                dataKey = 'temperature';
            }
            
            const values = deviceData.map(d => parseFloat(d[dataKey]));
            chartData.datasets.push({
                label: deviceName,
                data: values.map(v => v.toFixed(2)),
                borderColor: lineColors[colorIndex % lineColors.length],
                tension: 0.4,
                fill: false,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: lineColors[colorIndex % lineColors.length]
            });
            colorIndex++;
        }

        const firstDevId = Object.keys(chartConfig.devices)[0];
        if (data[firstDevId] && data[firstDevId].length > 0) {
            chartData.labels = data[firstDevId].map(d => new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }
        
        const newChart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: chartData,
            options: getChartOptions(chartConfig.type, chartConfig.limits)
        });
        activeCharts.push(newChart);
    });

    alarmShouldBePlaying = isAnyAlarmActive;
    if (alarm) {
        if (alarmShouldBePlaying && alarm.paused) {
            alarm.play().catch(e => console.warn("Alarm play failed:", e));
        } else if (!alarmShouldBePlaying && !alarm.paused) {
            alarm.pause();
            alarm.currentTime = 0;
        }
    }
}

function getCardStatus(allData, deviceMap, limits, chartType) {
    const STALE_THRESHOLD_MINUTES = 65;
    const now = new Date();
    
    let anomalySensors = [];
    let activeValues = [];
    const totalSensors = Object.keys(deviceMap).length;

    for (const devid in deviceMap) {
        const deviceName = deviceMap[devid];
        const deviceData = allData[devid];

        if (!deviceData || deviceData.length === 0) {
            anomalySensors.push(deviceName);
            continue;
        }

        const lastRecord = deviceData[deviceData.length - 1];
        const lastTimestamp = new Date(lastRecord.created_at);
        const ageInMinutes = (now - lastTimestamp) / (1000 * 60);

        if (ageInMinutes > STALE_THRESHOLD_MINUTES) {
            anomalySensors.push(deviceName);
        } else {
            let dataKey;
            if (chartType === 'humidity') {
                dataKey = 'humidity';
            } else { // Covers 'temperature', 'temperature_solder', and 'pressure'
                dataKey = 'temperature';
            }
            activeValues.push(parseFloat(lastRecord[dataKey]));
        }
    }

    if (anomalySensors.length > 0) {
        if (anomalySensors.length === totalSensors) {
            return { status: 'anomaly', anomalySensors: ['All Sensors'] };
        }
        return { status: 'partial_anomaly', anomalySensors: anomalySensors };
    }

    if (!activeValues.length || !limits) return { status: 'unknown', anomalySensors: [] };
    
    let isDanger = activeValues.some(v => v > limits.lm || v < limits.um);
    let isWarning = activeValues.some(v => (v > limits.lw && v <= limits.lm) || (v < limits.uw && v >= limits.um));
    
    if (isDanger) return { status: 'danger', anomalySensors: [] };
    if (isWarning) return { status: 'warning', anomalySensors: [] };
    return { status: 'safe', anomalySensors: [] };
}

function getChartOptions(type, limits) {
    let yAxisLabel = 'Value';
    let yAxisOptions = {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
        title: { display: true, text: yAxisLabel, color: '#cbd5e1', font: { size: 14 } }
    };
    const annotations = {};

    switch (type) {
        case 'temperature':
            yAxisLabel = 'Suhu (°C)';
            yAxisOptions.min = 20; yAxisOptions.max = 30; yAxisOptions.ticks.stepSize = 1;
            break;
        case 'temperature_solder':
            yAxisLabel = 'Suhu (°C)';
            yAxisOptions.min = 0; yAxisOptions.max = 10; yAxisOptions.ticks.stepSize = 1;
            break;
        case 'humidity':
            yAxisLabel = 'Kelembaban (%)';
            yAxisOptions.min = 20; yAxisOptions.max = 70; yAxisOptions.ticks.stepSize = 5;
            break;
        case 'pressure':
            yAxisLabel = 'Tekanan (kgf/cm²)';
            yAxisOptions.min = 5.0; yAxisOptions.max = 8.0; yAxisOptions.ticks.stepSize = 0.5;
            break;
    }
    
    if (limits) {
        annotations.safeZone = { type: 'box', yMin: limits.uw, yMax: limits.lw, backgroundColor: 'rgba(107, 114, 128, 0.15)', borderColor: 'transparent' };
        annotations.upperWarningZone = { type: 'box', yMin: limits.lw, yMax: limits.lm, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'transparent' };
        annotations.lowerWarningZone = { type: 'box', yMin: limits.um, yMax: limits.uw, backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'transparent' };
        
        annotations.limitMaxLine = { type: 'line', yMin: limits.lm, yMax: limits.lm, borderColor: '#ef4444', borderWidth: 2, label: { content: `Max Limit: ${limits.lm}`, enabled: true, position: 'end', backgroundColor: 'rgba(239, 68, 68, 0.7)', font: { weight: 'bold' } } };
        annotations.limitMinLine = { type: 'line', yMin: limits.um, yMax: limits.um, borderColor: '#ef4444', borderWidth: 2, label: { content: `Min Limit: ${limits.um}`, enabled: true, position: 'end', backgroundColor: 'rgba(239, 68, 68, 0.7)', font: { weight: 'bold' } } };
    }
    
    yAxisOptions.title.text = yAxisLabel;

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            annotation: { drawTime: 'beforeDatasetsDraw', annotations: annotations },
            legend: { position: 'top', labels: { color: '#cbd5e1', font: { size: 14 } } },
            tooltip: {
                mode: 'index', intersect: false, backgroundColor: '#1e293b', titleColor: '#ffffff',
                bodyColor: '#cbd5e1', borderColor: '#334155', borderWidth: 1, padding: 10,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                            if (type.includes('temperature')) label += ' °C';
                            if (type === 'humidity') label += ' %';
                            if (type === 'pressure') label += ' kgf/cm²';
                        }
                        return label;
                    }
                }
            }
        },
        scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }, y: yAxisOptions },
        interaction: { mode: 'nearest', axis: 'x', intersect: false }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    loadPage();
});
