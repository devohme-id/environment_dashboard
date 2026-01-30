import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import GroundingCard from '../components/GroundingCard';
import { useAutoCycle } from '../hooks/useAutoCycle';
import { useAlarm } from '../hooks/useAlarm';

export default function GroundingPage() {
    // Auto Cycle Logic - Moved to Layout
    // const { isPaused, togglePause } = useAutoCycle(['/monitor-smt', '/monitor-area', '/monitor-facility', '/monitor-grounding']);

    const { data: rawData, isLoading: loading } = useQuery({
        queryKey: ['groundingStatus'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3000/api/grounding');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        staleTime: 60000,
    });

    const data = rawData || [];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-2 md:pb-6">
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
    );
}

