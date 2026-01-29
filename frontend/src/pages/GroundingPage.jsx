import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GroundingCard from '../components/GroundingCard';
import { useAutoCycle } from '../hooks/useAutoCycle';
import { useAlarm } from '../hooks/useAlarm';

export default function GroundingPage() {
    // Auto Cycle Logic
    const { isPaused, togglePause } = useAutoCycle(['/monitor-smt', '/monitor-area', '/monitor-facility', '/monitor-grounding']);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/status');
                if (!res.ok) throw new Error("Failed");
                const jsonData = await res.json();
                setData(jsonData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const fixedLocations = ["WH_01", "WH_02", "LineProd_01", "LineProd_02", "LineProd_03", "LineProd_04", "LineProd_05", "LineProd_06"];
    const locationDescriptions = {
        'WH_01': "LV 3 Human GND",
        'WH_02': "LV 3 Human GND",
        'LineProd_01': "LV 1 Machine GND",
        'LineProd_02': "LV 1 Machine GND",
        'LineProd_03': "LV 1 Machine GND",
        'LineProd_04': "LV 1 Machine GND",
        'LineProd_05': "LV 1 Machine GND",
        'LineProd_06': "LV 1 Machine GND"
    };

    const dataMap = new Map(data.map(item => [item.line_id, item]));

    // Alarm Logic
    const isAlarming = data.some(item => item.ground_status === 'DISCONNECTED');
    useAlarm(isAlarming);

    return (
        <Layout
            title="GROUNDING CHECKER MONITORING"
            subtitle=""
            onTogglePause={togglePause}
            isPaused={isPaused}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-auto md:grid-rows-4 lg:grid-rows-2 gap-4 md:gap-6 h-full pb-2 md:pb-6">
                {fixedLocations.map(loc => {
                    const item = dataMap.get(loc);
                    return (
                        <GroundingCard
                            key={loc}
                            location={loc}
                            description={locationDescriptions[loc]}
                            item={item}
                        />
                    );
                })}
            </div>
        </Layout>
    );
}
