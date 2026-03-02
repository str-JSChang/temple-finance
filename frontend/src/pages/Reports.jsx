import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    FileCheck,
    Plus
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { reportService } from '../services/api';

const Reports = () => {
    const [reportData, setReportData] = useState(null);
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('2026-03');

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [resDash, resSnap] = await Promise.all([
                reportService.getDashboard(),
                reportService.getSnapshots()
            ]);
            setReportData(resDash.data);
            setSnapshots(resSnap.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleCreateSnapshot = async () => {
        try {
            await reportService.createSnapshot({ period });
            alert(`Snapshot created for ${period}`);
            fetchReports();
        } catch (error) {
            console.error('Error creating snapshot:', error);
            alert('Failed to create snapshot');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Building reports...</div>;

    const { monthlyBreakdown, categoryBreakdown } = reportData;

    const COLORS = ['#bfa094', '#977669', '#846358', '#43302b', '#d2bab0'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Financial Reports</h2>
                    <p className="text-gray-500">In-depth analysis of temple finances and historical data.</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={handleCreateSnapshot} className="btn btn-secondary flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Profit Snapshot
                    </button>
                    <button className="btn btn-primary flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Standard Report PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                    <h3 className="text-lg font-bold mb-6">Income vs Expense Growth</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold mb-6">Income by Category</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown.filter(c => c.income > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="income"
                                    nameKey="category"
                                    label
                                >
                                    {categoryBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                    <FileCheck className="w-5 h-5 mr-3 text-primary-700" />
                    Profit Snapshots (Historical)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-4">Period</th>
                                <th className="px-4 py-4 text-right">Total Income</th>
                                <th className="px-4 py-4 text-right">Total Expense</th>
                                <th className="px-4 py-4 text-right font-bold">Net Profit</th>
                                <th className="px-4 py-4 text-right">Snapshot Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {snapshots.map((snap) => (
                                <tr key={snap.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-bold text-gray-900">{snap.period}</td>
                                    <td className="px-4 py-4 text-sm text-right text-green-600">${snap.totalIncome.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-sm text-right text-red-600">${snap.totalExpense.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-sm text-right font-bold text-gray-900">${snap.netProfit.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-sm text-right text-gray-400">
                                        {new Date(snap.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {snapshots.length === 0 && (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No snapshots available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
