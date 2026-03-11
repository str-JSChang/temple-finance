import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { receiptService } from '../services/api';

const ReceiptPrint = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const res = await receiptService.getById(id);
                setReceipt(res.data);
            } catch (e) {
                console.error(e);
                setReceipt(null);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [id]);

    const dateStr = useMemo(() => {
        if (!receipt?.date) return '';
        return new Date(receipt.date).toLocaleDateString();
    }, [receipt]);

    if (loading) return <div className="p-8 text-gray-500">Loading receipt...</div>;
    if (!receipt) return <div className="p-8 text-red-600">Receipt not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
            <div className="no-print max-w-4xl mx-auto mb-4 flex items-center justify-between">
                <Link to="/receipts" className="btn btn-secondary">Back</Link>
                <button className="btn btn-primary" onClick={() => window.print()}>Print / Export PDF</button>
            </div>

            <div className="receipt-sheet mx-auto bg-white border border-gray-300 shadow-sm print:shadow-none print:border-0">
                <div className="receipt-inner">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="text-sm font-semibold tracking-wide">PERSATUAN PENGANUT DEWA FOO YA KONG</div>
                            <div className="text-xs text-gray-600">柔佛州新山甲柔佛花园孚佑宫（社团注册）</div>
                            <div className="text-xs text-gray-600">OFFICIAL RECEIPT / 正式收据</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">No. / 号码</div>
                            <div className="text-2xl font-bold text-red-700">{receipt.receiptNo}</div>
                            <div className="mt-2 text-xs text-gray-500">DATE / 日期</div>
                            <div className="text-sm font-semibold">{dateStr}</div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-12 gap-3 text-sm">
                        <div className="col-span-12 flex items-center gap-3">
                            <div className="w-40 text-gray-700 font-semibold">Received from 收妥自</div>
                            <div className="flex-1 line-fill">{receipt.receivedFrom}</div>
                        </div>

                        <div className="col-span-12 flex items-center gap-3">
                            <div className="w-40 text-gray-700 font-semibold">the sum of Ringgit 令吉</div>
                            <div className="flex-1 line-fill">RM {Number(receipt.amount).toLocaleString()}</div>
                        </div>

                        <div className="col-span-12 flex items-center gap-3">
                            <div className="w-40 text-gray-700 font-semibold">being payment of 兹收</div>
                            <div className="flex-1 line-fill">{receipt.beingPaymentOf || ''}</div>
                        </div>

                        <div className="col-span-12 flex items-center gap-3">
                            <div className="w-40 text-gray-700 font-semibold">Activity 活动</div>
                            <div className="flex-1 line-fill">{receipt.activity || ''}</div>
                            <div className="flex items-center gap-2 pl-3">
                                <div className={`box ${receipt.isDonation ? 'checked' : ''}`} />
                                <div className="text-gray-700 font-semibold">Donation 乐捐</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-0 border border-gray-300 text-sm">
                        <div className="col-span-3 p-3 border-r border-gray-300 font-semibold text-gray-700">DATE<br />日期</div>
                        <div className="col-span-3 p-3 border-r border-gray-300 font-semibold text-gray-700">BANK<br />银行</div>
                        <div className="col-span-3 p-3 border-r border-gray-300 font-semibold text-gray-700">CHEQUE NO.<br />支票号码</div>
                        <div className="col-span-3 p-3 font-semibold text-gray-700">AMOUNT<br />金额</div>

                        <div className="col-span-3 p-3 border-t border-gray-300 border-r border-gray-300">{dateStr}</div>
                        <div className="col-span-3 p-3 border-t border-gray-300 border-r border-gray-300">{receipt.bank || ''}</div>
                        <div className="col-span-3 p-3 border-t border-gray-300 border-r border-gray-300">{receipt.chequeNo || ''}</div>
                        <div className="col-span-3 p-3 border-t border-gray-300">RM {Number(receipt.amount).toLocaleString()}</div>
                    </div>

                    <div className="mt-10 flex items-end justify-between">
                        <div className="text-xs text-gray-600">
                            <div className="font-semibold text-gray-700">Note 注意：</div>
                            <div>此收据仅在支票兑现或支票经银行退票时方属有效</div>
                            <div className="text-gray-500">This receipt is only valid subject to cheque or cheques honoured by the bank.</div>
                        </div>
                        <div className="w-64 text-right">
                            <div className="text-xs text-gray-500">Issued / 经手人</div>
                            <div className="mt-8 border-t border-gray-400 pt-2 text-sm font-semibold">{receipt.issuedBy || ''}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPrint;

