import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import TempChart from '../components/TempChart';
import { useAutoCycle } from '../hooks/useAutoCycle';
import clsx from 'clsx';
import { useAlarm } from '../hooks/useAlarm';

// Configuration (Migrated from temp_app.js)
const pageConfig = {
    1: {
        title: "SMT LINES MONITORING",
        charts: [
            { title: "SMT Line 1 Temperature", type: 'temperature', devices: { 1: "Top", 2: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 2 Temperature", type: 'temperature', devices: { 4: "Top", 8: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 3 & 4 Temperature", type: 'temperature', devices: { 6: "Bottom", 8: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 5 Temperature", type: 'temperature', devices: { 20: "Top", 21: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 6 Temperature", type: 'temperature', devices: { 22: "Top", 23: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "SMT Line 7 Temperature", type: 'temperature', devices: { 3: "Top", 7: "Bottom" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } }
        ]
    },
    2: {
        title: "AREA & STORAGE MONITORING",
        charts: [
            { title: "Material Humidity", type: 'humidity', devices: { 10: "Material" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "IC Mapping Humidity", type: 'humidity', devices: { 11: "IC Mapping" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "Semiconductor Humidity", type: 'humidity', devices: { 12: "Semiconductor" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "Production Humidity", type: 'humidity', devices: { 13: "Production" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: "Delivery Temperature", type: 'temperature', devices: { 24: "Delivery" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "Solder Paste Temperature", type: 'temperature_solder', devices: { 25: "Top", 26: "Bottom" }, limits: { lm: 8, lw: 7, uw: 3, um: 2 } }
        ]
    },
    3: {
        title: "FACILITY MONITORING",
        charts: [
            { title: "Main Air Pressure", type: 'pressure', devices: { 100: "Main Air" }, limits: { lm: 7.5, lw: 7.0, uw: 6.0, um: 5.5 } },
            { title: "Stencil Room Temperature", type: 'temperature', devices: { 27: "Stencil Room" }, limits: { lm: 28, lw: 27, uw: 23, um: 22 } },
            { title: "Stencil Room Humidity", type: 'humidity', devices: { 27: "Stencil Room" }, limits: { lm: 60, lw: 55, uw: 35, um: 30 } },
            { title: " ", type: 'empty' }, { title: " ", type: 'empty' }, { title: " ", type: 'empty' }
        ]
    }
};

export default function TemperaturePage({ pageId }) {
    // const { pageId } = useParams(); // No longer needed
    const currentPage = parseInt(pageId) || 1;
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Auto Cycle Logic
    const { isPaused, togglePause } = useAutoCycle(['/monitor-smt', '/monitor-area', '/monitor-facility', '/monitor-grounding']);

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                // In production, adjust the URL if backend is on different port/domain
                const res = await fetch(`http://localhost:3000/api/temphygro?page=${currentPage}`);
                if (!res.ok) throw new Error("Failed to fetch data");
                const jsonData = await res.json();
                setData(jsonData);
                setLastUpdate(new Date());
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [currentPage]);

    const config = pageConfig[currentPage];

    // Status Helper
    const getCardStatus = (chartConfig) => {
        if (!data || !chartConfig.limits) return 'default';

        let status = 'safe';
        const { limits, devices, type } = chartConfig;

        for (const devId in devices) {
            const deviceData = data[devId];
            if (!deviceData || deviceData.length === 0) continue;

            // Check staleness (65 min)
            const lastRecord = deviceData[deviceData.length - 1];
            const lastTime = new Date(lastRecord.created_at);
            const now = new Date();
            const ageMins = (now - lastTime) / (1000 * 60);
            if (ageMins > 65) return 'anomaly';

            // Check limits
            const val = parseFloat(lastRecord[type === 'humidity' ? 'humidity' : 'temperature']);
            if (val > limits.lm || val < limits.um) return 'danger';
            if ((val > limits.lw && val <= limits.lm) || (val < limits.uw && val >= limits.um)) {
                if (status !== 'danger') status = 'warning';
            }
        }
        return status;
    };

    // Alarm Logic
    const isAlarming = useMemo(() => {
        if (!config || !data) return false;
        return config.charts.some(chart => {
            if (chart.type === 'empty') return false;
            const status = getCardStatus(chart);
            return ['warning', 'danger', 'anomaly'].includes(status);
        });
    }, [config, data]);

    useAlarm(isAlarming);

    if (!config) return <div className="p-10 text-center text-red-500">Invalid Page ID</div>;

    // ORIGINAL STYLE COLORS
    const statusStyles = {
        safe: 'border-l-status-safe',
        warning: 'border-l-status-warning shadow-glow-warning animate-flash-warning',
        danger: 'border-l-status-danger shadow-glow-danger animate-flash-danger',
        anomaly: 'border-l-status-anomaly shadow-glow-anomaly animate-flash-anomaly',
        default: 'border-l-slate-200'
    };

    return (
        <Layout
            title={config.title}
            subtitle={lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Updating...'}
            onTogglePause={togglePause}
            isPaused={isPaused}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full pb-6">
                {config.charts.map((chart, index) => {
                    if (chart.type === 'empty') return <div key={index} className="hidden md:block"></div>;

                    const status = getCardStatus(chart);

                    return (
                        <div key={index} className={clsx(
                            "bg-white dark:bg-slate-800 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] p-2 flex flex-col h-[320px] transition-all duration-300 border border-slate-100 dark:border-slate-700",
                            "border-l-[10px]", // Thick left border
                            statusStyles[status] || statusStyles.default
                        )}>
                            <div className="flex flex-col items-center justify-center mb-1 pt-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg">
                                    {chart.title}
                                </h3>
                                {status === 'anomaly' && (
                                    <span className="text-[10px] text-status-anomaly font-bold italic">Anomaly: Sensor Offline</span>
                                )}
                            </div>
                            <div className="flex-1 relative w-full min-h-0 bg-transparent rounded-lg">
                                <TempChart
                                    title={chart.title}
                                    type={chart.type}
                                    limits={chart.limits}
                                    devices={chart.devices}
                                    data={data}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Layout>
    );
}
