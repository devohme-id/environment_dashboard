import React, { useState, useEffect } from 'react';
import { IconDeviceFloppy } from '@tabler/icons-react';

const AdminSettingsPage = () => {
    const [settings, setSettings] = useState({
        telegram_bot_token: '',
        telegram_chat_id: '',
        telegram_alert_enabled: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/settings');
            const data = await res.json();
            if (data) {
                setSettings({
                    telegram_bot_token: data.telegram_bot_token || '',
                    telegram_chat_id: data.telegram_chat_id || '',
                    telegram_alert_enabled: data.telegram_alert_enabled === 'true' || data.telegram_alert_enabled === true
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert('Settings saved successfully');
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            alert('Error saving settings: ' + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold dark:text-white">System Settings</h2>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Telegram Notification Settings</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Telegram Bot Token</label>
                            <input
                                type="text"
                                name="telegram_bot_token"
                                value={settings.telegram_bot_token}
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
                                value={settings.telegram_chat_id}
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
                                checked={settings.telegram_alert_enabled}
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
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                <IconDeviceFloppy size={20} className="mr-2" />
                                Save Settings
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminSettingsPage;
