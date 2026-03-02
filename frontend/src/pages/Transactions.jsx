import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Trash2,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import { transactionService } from '../services/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionService.getAll({ type: filterType });
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterType]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await transactionService.delete(id);
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
                    <p className="text-gray-500">History of all income and expenses.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="btn btn-secondary flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button className="btn btn-primary flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        New Transaction
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by description or category..."
                            className="form-input pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter by Type:
                        </div>
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-4">Date</th>
                                <th className="px-4 py-4">Description</th>
                                <th className="px-4 py-4">Category</th>
                                <th className="px-4 py-4">Type</th>
                                <th className="px-4 py-4 text-right">Amount</th>
                                <th className="px-4 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading transactions...</td></tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No transactions found.</td></tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                                            {tx.reference && <div className="text-xs text-gray-400">Ref: {tx.reference}</div>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center text-sm font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'income' ? (
                                                    <ArrowDownLeft className="w-4 h-4 mr-1.5" />
                                                ) : (
                                                    <ArrowUpRight className="w-4 h-4 mr-1.5" />
                                                )}
                                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                            </div>
                                        </td>
                                        <td className={`px-4 py-4 text-sm font-bold text-right ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
