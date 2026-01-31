import React, { useState } from 'react';
import { IconEdit, IconTrash, IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

const AdminFctPage = () => {
    const queryClient = useQueryClient();

    // Cursor-based pagination
    const [cursorHistory, setCursorHistory] = useState([null]);
    const [step, setStep] = useState(0);
    const [limit, setLimit] = useState(10);

    // Filters
    const [filters, setFilters] = useState({ devid: '', temp: '', humidity: '' });
    const [appliedFilters, setAppliedFilters] = useState({ devid: '', temp: '', humidity: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [formData, setFormData] = useState({ devid: '', temperature: '', humidity: '', created_at: '' });

    const handleApplyFilter = () => {
        setAppliedFilters(filters);
        setStep(0);
        setCursorHistory([null]);
    };

    // Fetch Function
    const fetchFctData = async ({ queryKey }) => {
        const [_, currentStep, currentCursor, currentLimit, currentFilters] = queryKey;
        const params = new URLSearchParams();
        params.append('limit', currentLimit);
        if (currentCursor) params.append('cursor', currentCursor);
        if (currentFilters.devid) params.append('devid', currentFilters.devid);
        if (currentFilters.temp) params.append('temp', currentFilters.temp);
        if (currentFilters.humidity) params.append('humidity', currentFilters.humidity);

        const res = await fetch(`http://localhost:3000/api/admin/fct?${params.toString()}`);
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    };

    // Query
    const {
        data: queryData,
        isLoading,
        isError,
        isPlaceholderData
    } = useQuery({
        queryKey: ['fctData', step, cursorHistory[step], limit, appliedFilters],
        queryFn: fetchFctData,
        placeholderData: keepPreviousData,
    });

    const data = queryData?.data || [];
    const nextCursor = queryData?.nextCursor;

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`http://localhost:3000/api/admin/fct/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['fctData']);
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (record) => {
            const url = record.id
                ? `http://localhost:3000/api/admin/fct/${record.id}`
                : 'http://localhost:3000/api/admin/fct';
            const method = record.id ? 'PUT' : 'POST';

            const body = {
                devid: record.devid,
                temperature: record.temperature,
                humidity: record.humidity,
                created_at: record.created_at
            };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Operation failed');
            return res.json();
        },
        onSuccess: () => {
            setIsModalOpen(false);
            queryClient.invalidateQueries(['fctData']);
        },
        onError: (error) => {
            alert('Error: ' + error.message);
        }
    });

    // Pagination Handlers
    const handleNext = () => {
        if (!isPlaceholderData && nextCursor) {
            const newHistory = [...cursorHistory];
            if (step === newHistory.length - 1) {
                newHistory.push(nextCursor);
                setCursorHistory(newHistory);
            }
            setStep(prev => prev + 1);
        }
    };
    const handlePrev = () => { if (step > 0) setStep(prev => prev - 1); };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (item) => {
        setCurrentRecord(item);
        setFormData({
            devid: item.devid,
            temperature: item.temperature,
            humidity: item.humidity,
            created_at: item.created_at || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate({ ...formData, id: currentRecord?.id });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Facility Monitor (FCT) Data</h2>
                <button onClick={() => { setCurrentRecord(null); setFormData({ devid: '', temperature: '', humidity: '', created_at: '' }); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <IconPlus size={20} className="mr-2" />
                    Add Record
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">
                                    <div className="flex flex-col space-y-2">
                                        <span>Device ID</span>
                                        <input type="text" name="devid" value={filters.devid} onChange={handleFilterChange} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()} placeholder="Filter..." className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex flex-col space-y-2">
                                        <span>Temp</span>
                                        <input type="text" name="temp" value={filters.temp} onChange={handleFilterChange} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()} placeholder="Filter..." className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex flex-col space-y-2">
                                        <span>Humidity</span>
                                        <input type="text" name="humidity" value={filters.humidity} onChange={handleFilterChange} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()} placeholder="Filter..." className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">
                                    <div className="flex flex-col space-y-2">
                                        <span>Actions</span>
                                        <button onClick={handleApplyFilter} className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Apply</button>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (<tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>) :
                                data.length === 0 ? (<tr><td colSpan="5" className="text-center py-4">No records found</td></tr>) :
                                    data.map((item) => (
                                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4">{item.devid}</td>
                                            <td className="px-6 py-4">{item.temperature}</td>
                                            <td className="px-6 py-4">{item.humidity}</td>
                                            <td className="px-6 py-4">{item.created_at}</td>
                                            <td className="px-6 py-4 flex space-x-2">
                                                <button onClick={() => handleEdit(item)} className="text-yellow-600"><IconEdit size={18} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600"><IconTrash size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">
                    <span className="text-sm dark:text-gray-400">Page {step + 1}</span>
                    <div className="flex space-x-1">
                        <button onClick={handlePrev} disabled={step === 0 || isLoading} className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"><IconChevronLeft size={16} /></button>
                        <button onClick={handleNext} disabled={!nextCursor || isLoading || isPlaceholderData} className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"><IconChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">{currentRecord ? 'Edit' : 'New'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input placeholder="Device ID" type="number" value={formData.devid} onChange={e => setFormData({ ...formData, devid: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" required />
                            <input placeholder="Temperature" type="number" step="0.1" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" required />
                            <input placeholder="Humidity" type="number" step="0.1" value={formData.humidity} onChange={e => setFormData({ ...formData, humidity: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" required />
                            <input placeholder="Timestamp" value={formData.created_at} onChange={e => setFormData({ ...formData, created_at: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                                <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saveMutation.isPending ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminFctPage;
