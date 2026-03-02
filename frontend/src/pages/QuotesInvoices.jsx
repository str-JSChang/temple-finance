import React, { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Send,
    CheckCircle2,
    ArrowRight,
    MoreVertical,
    Clock,
    ExternalLink
} from 'lucide-react';
import { quoteService, invoiceService } from '../services/api';

const QuotesInvoices = () => {
    const [quotes, setQuotes] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quotes');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [qRes, iRes] = await Promise.all([
                quoteService.getAll(),
                invoiceService.getAll()
            ]);
            setQuotes(qRes.data);
            setInvoices(iRes.data);
        } catch (error) {
            console.error('Error fetching quotes/invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConvertToInvoice = async (id) => {
        if (!window.confirm('Convert this quote to a formal invoice?')) return;
        try {
            await quoteService.convert(id, { dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
            fetchData();
        } catch (error) {
            console.error('Error converting quote:', error);
        }
    };

    const handleMarkPaid = async (id) => {
        if (!window.confirm('Mark this invoice as paid? This will generate an income transaction.')) return;
        try {
            await invoiceService.pay(id);
            fetchData();
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quotes & Invoices</h2>
                    <p className="text-gray-500">Manage client proposals and billing cycles.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="btn btn-primary flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        {activeTab === 'quotes' ? 'New Quote' : 'New Invoice'}
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'quotes'
                            ? 'border-primary-700 text-primary-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    onClick={() => setActiveTab('quotes')}
                >
                    Quotes ({quotes.length})
                </button>
                <button
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'invoices'
                            ? 'border-primary-700 text-primary-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    onClick={() => setActiveTab('invoices')}
                >
                    Invoices ({invoices.length})
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-4">Client</th>
                                <th className="px-4 py-4">Description</th>
                                <th className="px-4 py-4">Total Amount</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading {activeTab}...</td></tr>
                            ) : (activeTab === 'quotes' ? quotes : invoices).length === 0 ? (
                                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No {activeTab} found.</td></tr>
                            ) : (
                                (activeTab === 'quotes' ? quotes : invoices).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-bold text-gray-900">{item.clientName}</div>
                                            <div className="text-xs text-gray-400">Created {new Date(item.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-4 py-4 flex items-center">
                                            <div className="text-sm text-gray-600 truncate w-64">{item.description}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900">
                                            ${item.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'paid' || item.status === 'converted' || item.status === 'accepted'
                                                    ? 'bg-green-100 text-green-700'
                                                    : item.status === 'draft'
                                                        ? 'bg-gray-100 text-gray-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {activeTab === 'quotes' && item.status !== 'converted' && (
                                                    <button
                                                        onClick={() => handleConvertToInvoice(item.id)}
                                                        className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1 rounded text-xs font-bold flex items-center shadow-sm transition-all"
                                                    >
                                                        Convert to Invoice <ArrowRight className="w-3 h-3 ml-1" />
                                                    </button>
                                                )}
                                                {activeTab === 'invoices' && item.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(item.id)}
                                                        className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded text-xs font-bold flex items-center shadow-sm transition-all"
                                                    >
                                                        Mark as Paid <CheckCircle2 className="w-3 h-3 ml-1" />
                                                    </button>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-600 p-1">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
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

export default QuotesInvoices;
