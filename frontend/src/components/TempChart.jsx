import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    annotationPlugin
);

export default function TempChart({
    title,
    data,
    type = 'temperature',
    limits,
    devices
}) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-400 font-medium">Loading Data...</span>
                </div>
            </div>
        );
    }

    // Chart Configuration
    const options = useMemo(() => {
        let yMin = 0, yMax = 100, stepSize = 5, yLabel = 'Value';

        switch (type) {
            case 'temperature':
                yLabel = 'Temperature (°C)';
                yMin = 20; yMax = 30; stepSize = 1;
                break;
            case 'temperature_solder':
                yLabel = 'Temperature (°C)';
                yMin = 0; yMax = 10; stepSize = 1;
                break;
            case 'humidity':
                yLabel = 'Humidity (%)';
                yMin = 20; yMax = 70; stepSize = 5;
                break;
            case 'pressure':
                yLabel = 'Pressure (kgf/cm²)';
                yMin = 5.0; yMax = 8.0; stepSize = 0.5;
                break;
        }

        const annotations = {};
        if (limits) {
            // Safe Zone (Greenish)
            annotations.safeZone = {
                type: 'box',
                yMin: limits.uw,
                yMax: limits.lw,
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                borderWidth: 0
            };
            // Warning Zones (Reddish) - handled via background colors?
            // Actually let's replicate the original zones
            // Upper Warning
            annotations.upperWarningZone = {
                type: 'box',
                yMin: limits.lw,
                yMax: limits.lm,
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderWidth: 0
            };
            // Lower Warning
            annotations.lowerWarningZone = {
                type: 'box',
                yMin: limits.um,
                yMax: limits.uw,
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                borderWidth: 0
            };

            // Limit Lines
            annotations.maxLine = {
                type: 'line',
                yMin: limits.lm,
                yMax: limits.lm,
                borderColor: '#ef4444',
                borderWidth: 2,
                label: {
                    display: true,
                    content: `Max Limit: ${limits.lm}`,
                    position: 'end',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
                    padding: { top: 6, bottom: 6, left: 10, right: 10 },
                    borderRadius: 6,
                    yAdjust: -12 // Position slightly above line
                }
            };
            annotations.minLine = {
                type: 'line',
                yMin: limits.um,
                yMax: limits.um,
                borderColor: '#ef4444',
                borderWidth: 2,
                label: {
                    display: true,
                    content: `Min Limit: ${limits.um}`,
                    position: 'end',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" },
                    padding: { top: 6, bottom: 6, left: 10, right: 10 },
                    borderRadius: 6,
                    yAdjust: 12 // Position slightly below line
                }
            };
        }

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: false, // Use default boxes
                        boxWidth: 40,
                        font: { family: "'Inter', sans-serif", size: 12 },
                        color: '#334155'
                    }
                },
                title: {
                    display: false,
                },
                annotation: {
                    annotations: annotations
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1e293b',
                    bodyColor: '#334155',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 4,
                    displayColors: true,
                    titleFont: { weight: 'bold' }
                }
            },
            scales: {
                y: {
                    min: yMin,
                    max: yMax,
                    ticks: {
                        stepSize: stepSize,
                        color: '#64748b',
                        font: { size: 11 }
                    },
                    grid: {
                        color: '#e2e8f0',
                        drawBorder: false,
                    },
                    title: {
                        display: true,
                        text: type === 'temperature' ? 'Suhu (°C)' : yLabel, // Use Indonesian 'Suhu'
                        color: '#1e293b',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        color: '#64748b',
                        font: { size: 10 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 12 // Show more ticks for 12 hours
                    },
                    grid: {
                        display: true, // Show vertical grid
                        color: '#f1f5f9'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            elements: {
                point: {
                    radius: 4, // Visible points
                    hoverRadius: 6,
                    borderWidth: 2,
                    backgroundColor: '#fff'
                },
                line: {
                    tension: 0.4,
                    borderWidth: 3
                }
            }
        };
    }, [type, limits]);

    // Prepare Data
    const chartData = useMemo(() => {
        const labels = [];
        const datasets = [];
        const colors = ['#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#eab308'];
        let colorIdx = 0;

        // Find common labels (timestamps) from the first device that has data
        let labelSourceData = null;
        for (const devId in devices) {
            if (data[devId] && data[devId].length > 0) {
                labelSourceData = data[devId];
                break;
            }
        }

        if (labelSourceData) {
            labelSourceData.forEach(d => {
                // Format time: HH:mm
                const date = new Date(d.created_at);
                if (!isNaN(date)) {
                    labels.push(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
                } else {
                    // Fallback for invalid dates if necessary, or skip
                    labels.push('??:??');
                }
            });
        }

        for (const [devId, devName] of Object.entries(devices)) {
            if (!data[devId]) continue;

            const field = type === 'humidity' ? 'humidity' : 'temperature';
            const values = data[devId].map(d => parseFloat(d[field]));

            datasets.push({
                label: devName,
                data: values,
                borderColor: colors[colorIdx % colors.length],
                backgroundColor: colors[colorIdx % colors.length],
                borderWidth: 2,
            });
            colorIdx++;
        }

        return { labels, datasets };
    }, [data, devices, type]);

    // Calculate status for card styling (pass up or do here? The parent handles layout, but we can return status? 
    // Actually the design requested handling status on the card.
    // Let's implement status check logic in parent or helper, but visually, the card should glow if warning.)

    return (
        <div className="relative w-full h-full">
            <Line options={options} data={chartData} />
        </div>
    );
}
