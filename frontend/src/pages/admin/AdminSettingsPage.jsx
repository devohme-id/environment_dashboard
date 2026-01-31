import React, { useState, useEffect } from 'react';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminSettingsPage = () => {
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState({
        telegram_bot_token: '',
        telegram_chat_id: '',
        telegram_alert_enabled: false
    });

    // Fetch Settings
    const { data: settings, isLoading, isError } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3000/api/admin/settings');
            if (!res.ok) throw new Error('Failed to fetch settings');
            return res.json();
        }
    });

    // Sync state when data is loaded
    useEffect(() => {
        if (settings) {
            setLocalSettings({
                telegram_bot_token: settings.telegram_bot_token || '',
                telegram_chat_id: settings.telegram_chat_id || '',
                telegram_alert_enabled: settings.telegram_alert_enabled === 'true' || settings.telegram_alert_enabled === true
            });
        }
    }, [settings]);

    // Save Settings Mutation
    const mutation = useMutation({
        mutationFn: async (newSettings) => {
            const res = await fetch('http://localhost:3000/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            if (!res.ok) throw new Error('Failed to save settings');
            return res.json();
        },
        onSuccess: () => {
            alert('Settings saved successfully');
            queryClient.invalidateQueries(['settings']); // Refresh data
        },
        onError: (error) => {
            alert('Error saving settings: ' + error.message);
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(localSettings);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">System Settings</h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Telegram Notification Settings</h3>
                {isLoading ? (
                    <p>Loading...</p>
                ) : isError ? (
                    <p className="text-red-500">Error loading settings.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Telegram Bot Token</label>
                            <input
                                type="text"
                                name="telegram_bot_token"
                                value={localSettings.telegram_bot_token}
                                onChange={handleChange}
                                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                                className="mt-1 w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Token from @BotFather</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Telegram Chat ID</label>
                            <input
                                type="text"
                                name="telegram_chat_id"
                                value={localSettings.telegram_chat_id}
                                onChange={handleChange}
                                placeholder="-100123456789"
                                className="mt-1 w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Chat ID to send alerts to</p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="telegram_alert_enabled"
                                id="telegram_alert_enabled"
                                checked={localSettings.telegram_alert_enabled}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="telegram_alert_enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Enable Telegram Alerts
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className={`flex items-center px-4 py-2 text-white rounded ${mutation.isPending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                <IconDeviceFloppy size={20} className="mr-2" />
                                {mutation.isPending ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminSettingsPage;
