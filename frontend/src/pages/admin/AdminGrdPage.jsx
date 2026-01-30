import React, { useEffect, useState } from 'react';
import { IconEdit, IconTrash, IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const AdminGrdPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [cursorHistory, setCursorHistory] = useState([null]);
    const [step, setStep] = useState(0);
    const [nextCursor, setNextCursor] = useState(null);
    const [limit, setLimit] = useState(10);

    // Filters for GRD: line_id, status
    const [filters, setFilters] = useState({ line_id: '', status: '' });
    const [appliedFilters, setAppliedFilters] = useState({ line_id: '', status: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [formData, setFormData] = useState({ line_id: '', ground_status: '', timestamp: '' });

    const handleApplyFilter = () => {
        setAppliedFilters(filters);
        setStep(0);
        setCursorHistory([null]);
        setNextCursor(null);
    };

    const fetchData = async () => {
        setLoading(true);
        const currentCursor = cursorHistory[step];
        const params = new URLSearchParams();
        params.append('limit', limit);
        if (currentCursor) params.append('cursor', currentCursor);
        if (appliedFilters.line_id) params.append('line_id', appliedFilters.line_id);
        if (appliedFilters.status) params.append('status', appliedFilters.status);

        try {
            const res = await fetch(`http://localhost:3000/api/admin/grd?${params.toString()}`);
            const json = await res.json();
            setData(json.data);
            setNextCursor(json.nextCursor);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [step, limit, appliedFilters]);

    const handleNext = () => {
        if (nextCursor) {
            const newHistory = [...cursorHistory];
            if (step === newHistory.length - 1) {
                newHistory.push(nextCursor);
                setCursorHistory(newHistory);
            }
            setStep(step + 1);
        }
    };
    const handlePrev = () => { if (step > 0) setStep(step - 1); };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (item) => {
        setCurrentRecord(item);
        setFormData({
            line_id: item.line_id,
            ground_status: item.ground_status,
            timestamp: item.timestamp || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await fetch(`http://localhost:3000/api/admin/grd/${id}`, { method: 'DELETE' });
                fetchData();
            } catch (error) { alert('Failed to delete'); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = currentRecord
            ? `http://localhost:3000/api/admin/grd/${currentRecord.id}`
            : 'http://localhost:3000/api/admin/grd';
        const method = currentRecord ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
            else { alert('Operation failed'); }
        } catch (error) { alert('Error: ' + error.message); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Grounding Monitor (GRD) Data</h2>
                <button
                    onClick={() => { setCurrentRecord(null); setFormData({ line_id: '', ground_status: '', timestamp: '' }); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
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
                                        <span>Line ID</span>
                                        <input type="text" name="line_id" value={filters.line_id} onChange={handleFilterChange} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()} placeholder="Filter..." className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex flex-col space-y-2">
                                        <span>Status</span>
                                        <input type="text" name="status" value={filters.status} onChange={handleFilterChange} onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()} placeholder="Filter..." className="px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
                            {loading ? (<tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>) :
                                data.length === 0 ? (<tr><td colSpan="4" className="text-center py-4">No records found</td></tr>) :
                                    data.map((item) => (
                                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4">{item.line_id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded ${item.ground_status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.ground_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{item.timestamp}</td>
                                            <td className="px-6 py-4 flex space-x-2">
                                                <button onClick={() => handleEdit(item)} className="text-yellow-600"><IconEdit size={18} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600"><IconTrash size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center p-4 border-t dark:border-gray-700">
                    <span className="text-sm dark:text-gray-400">Page {step + 1}</span>
                    <div className="flex space-x-1">
                        <button onClick={handlePrev} disabled={step === 0} className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"><IconChevronLeft size={16} /></button>
                        <button onClick={handleNext} disabled={!nextCursor} className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"><IconChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">{currentRecord ? 'Edit' : 'New'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input placeholder="Line ID" type="number" value={formData.line_id} onChange={e => setFormData({ ...formData, line_id: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" required />
                            <select value={formData.ground_status} onChange={e => setFormData({ ...formData, ground_status: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" required>
                                <option value="">Select Status</option>
                                <option value="OK">OK</option>
                                <option value="FAIL">FAIL</option>
                            </select>
                            <input placeholder="Timestamp" value={formData.timestamp} onChange={e => setFormData({ ...formData, timestamp: e.target.value })} className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminGrdPage;
