import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { reportService } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await reportService.getDashboard();
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;
    if (!data) return <div className="text-red-500">Error loading data.</div>;

    const { summary, monthlyBreakdown, recentTransactions } = data;

    const stats = [
        { name: 'Total Income', value: summary.totalIncome, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Total Expense', value: summary.totalExpense, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        { name: 'Net Profit', value: summary.netProfit, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Unpaid Invoices', value: summary.unpaidInvoices, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', isCount: true },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
                    <p className="text-gray-500">Key metrics and recent activity for the temple.</p>
                </div>
                <button className="btn btn-primary flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Download Monthly Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="card flex items-start">
                        <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stat.isCount ? stat.value : `$${stat.value.toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card">
                    <h3 className="text-lg font-bold mb-6">Income vs Expense</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyBreakdown}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-3 ${tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {tx.type === 'income' ? (
                                            <ArrowDownLeft className={`w-4 h-4 text-green-600`} />
                                        ) : (
                                            <ArrowUpRight className={`w-4 h-4 text-red-600`} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 truncate w-32">{tx.description}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors border-t border-gray-100 pt-4">
                        View All Transactions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
