import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    Users,
    FileText,
    BarChart3,
    Settings,
    ShieldCheck,
    Boxes,
    BadgeDollarSign
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Transactions', icon: Receipt, path: '/transactions' },
        { name: 'Inventory', icon: Boxes, path: '/inventory' },
        { name: 'Official Receipts', icon: BadgeDollarSign, path: '/receipts' },
        { name: 'Payroll', icon: Users, path: '/payroll' },
        { name: 'Quotes & Invoices', icon: FileText, path: '/quotes-invoices' },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
    ];

    return (
        <aside className="w-64 bg-primary-900 text-white flex flex-col shrink-0">
            <div className="h-20 flex items-center px-6 border-b border-primary-800">
                <ShieldCheck className="w-8 h-8 text-primary-300 mr-3" />
                <span className="text-xl font-bold tracking-tight">TemplePay</span>
            </div>

            <nav className="flex-1 py-6 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center px-6 py-3 text-sm font-medium transition-colors
              ${isActive
                                ? 'bg-primary-800 text-white border-r-4 border-primary-300'
                                : 'text-primary-200 hover:bg-primary-800 hover:text-white'}
            `}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-primary-800">
                <button className="flex items-center text-sm text-primary-300 hover:text-white transition-colors">
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
