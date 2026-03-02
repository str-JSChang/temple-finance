const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Temple Finance database...');

    // Clear existing data
    await prisma.profitSnapshot.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.payrollEntry.deleteMany();
    await prisma.transaction.deleteMany();

    // ─── TRANSACTIONS ─────────────────────────────────────────
    const transactions = await Promise.all([
        prisma.transaction.create({
            data: {
                date: new Date('2026-01-15'),
                type: 'income',
                category: 'Donations',
                description: 'Monthly congregation donation',
                amount: 15000,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-01-20'),
                type: 'income',
                category: 'Event Revenue',
                description: 'New Year celebration ticket sales',
                amount: 8500,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-01-25'),
                type: 'expense',
                category: 'Utilities',
                description: 'January electricity and water bill',
                amount: 2200,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-02-01'),
                type: 'income',
                category: 'Donations',
                description: 'February tithing collection',
                amount: 12000,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-02-10'),
                type: 'expense',
                category: 'Maintenance',
                description: 'Temple roof repair',
                amount: 4500,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-02-15'),
                type: 'income',
                category: 'Rental Income',
                description: 'Community hall rental - wedding',
                amount: 3000,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-02-20'),
                type: 'expense',
                category: 'Supplies',
                description: 'Office and ceremony supplies',
                amount: 800,
            },
        }),
        prisma.transaction.create({
            data: {
                date: new Date('2026-03-01'),
                type: 'income',
                category: 'Donations',
                description: 'March congregation donation',
                amount: 14000,
            },
        }),
    ]);
    console.log(`  ✅ Created ${transactions.length} transactions`);

    // ─── PAYROLL ──────────────────────────────────────────────
    const payroll = await Promise.all([
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Rev. Samuel Osei',
                role: 'Head Pastor',
                salary: 5000,
                bonus: 500,
                deductions: 250,
                netPay: 5250,
                payPeriod: '2026-01',
                status: 'paid',
                paidAt: new Date('2026-01-31'),
            },
        }),
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Grace Mensah',
                role: 'Administrator',
                salary: 3000,
                bonus: 0,
                deductions: 150,
                netPay: 2850,
                payPeriod: '2026-01',
                status: 'paid',
                paidAt: new Date('2026-01-31'),
            },
        }),
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Daniel Kwame',
                role: 'Maintenance',
                salary: 2000,
                bonus: 200,
                deductions: 100,
                netPay: 2100,
                payPeriod: '2026-01',
                status: 'paid',
                paidAt: new Date('2026-01-31'),
            },
        }),
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Rev. Samuel Osei',
                role: 'Head Pastor',
                salary: 5000,
                bonus: 0,
                deductions: 250,
                netPay: 4750,
                payPeriod: '2026-02',
                status: 'paid',
                paidAt: new Date('2026-02-28'),
            },
        }),
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Grace Mensah',
                role: 'Administrator',
                salary: 3000,
                bonus: 300,
                deductions: 150,
                netPay: 3150,
                payPeriod: '2026-02',
                status: 'paid',
                paidAt: new Date('2026-02-28'),
            },
        }),
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Rev. Samuel Osei',
                role: 'Head Pastor',
                salary: 5000,
                bonus: 0,
                deductions: 250,
                netPay: 4750,
                payPeriod: '2026-03',
                status: 'pending',
            },
        }),
        prisma.payrollEntry.create({
            data: {
                employeeName: 'Grace Mensah',
                role: 'Administrator',
                salary: 3000,
                bonus: 0,
                deductions: 150,
                netPay: 2850,
                payPeriod: '2026-03',
                status: 'pending',
            },
        }),
    ]);
    console.log(`  ✅ Created ${payroll.length} payroll entries`);

    // ─── QUOTES ───────────────────────────────────────────────
    const quotes = await Promise.all([
        prisma.quote.create({
            data: {
                clientName: 'Johnson Family',
                description: 'Wedding ceremony package',
                items: JSON.stringify([
                    { name: 'Venue rental', qty: 1, unitPrice: 2000 },
                    { name: 'Decoration', qty: 1, unitPrice: 1500 },
                    { name: 'Sound system', qty: 1, unitPrice: 500 },
                ]),
                totalAmount: 4000,
                status: 'accepted',
                validUntil: new Date('2026-04-15'),
            },
        }),
        prisma.quote.create({
            data: {
                clientName: 'Community Center',
                description: 'Monthly hall rental agreement',
                items: JSON.stringify([
                    { name: 'Hall rental - Saturday', qty: 4, unitPrice: 500 },
                    { name: 'Cleaning service', qty: 4, unitPrice: 100 },
                ]),
                totalAmount: 2400,
                status: 'sent',
                validUntil: new Date('2026-03-31'),
            },
        }),
        prisma.quote.create({
            data: {
                clientName: 'ABC School',
                description: 'End of year ceremony venue',
                items: JSON.stringify([
                    { name: 'Auditorium rental', qty: 1, unitPrice: 3000 },
                    { name: 'Chairs (extra)', qty: 200, unitPrice: 5 },
                    { name: 'PA System', qty: 1, unitPrice: 800 },
                ]),
                totalAmount: 4800,
                status: 'draft',
                validUntil: new Date('2026-05-01'),
            },
        }),
    ]);
    console.log(`  ✅ Created ${quotes.length} quotes`);

    // ─── INVOICES ─────────────────────────────────────────────
    const invoices = await Promise.all([
        prisma.invoice.create({
            data: {
                clientName: 'Smith Family',
                description: 'Funeral service package',
                items: JSON.stringify([
                    { name: 'Chapel use', qty: 1, unitPrice: 1500 },
                    { name: 'Flower arrangement', qty: 3, unitPrice: 200 },
                    { name: 'Catering', qty: 1, unitPrice: 2000 },
                ]),
                totalAmount: 4100,
                status: 'paid',
                dueDate: new Date('2026-02-15'),
                paidAt: new Date('2026-02-14'),
            },
        }),
        prisma.invoice.create({
            data: {
                clientName: 'Williams Corp',
                description: 'Corporate retreat venue',
                items: JSON.stringify([
                    { name: 'Main hall - 2 days', qty: 2, unitPrice: 2500 },
                    { name: 'Catering package', qty: 50, unitPrice: 30 },
                ]),
                totalAmount: 6500,
                status: 'unpaid',
                dueDate: new Date('2026-03-15'),
            },
        }),
    ]);
    console.log(`  ✅ Created ${invoices.length} invoices`);

    // ─── PROFIT SNAPSHOTS ─────────────────────────────────────
    const snapshots = await Promise.all([
        prisma.profitSnapshot.create({
            data: {
                period: '2026-01',
                totalIncome: 23500,
                totalExpense: 12400,
                netProfit: 11100,
                metadata: JSON.stringify({ transactionCount: 5 }),
            },
        }),
        prisma.profitSnapshot.create({
            data: {
                period: '2026-02',
                totalIncome: 15000,
                totalExpense: 13250,
                netProfit: 1750,
                metadata: JSON.stringify({ transactionCount: 6 }),
            },
        }),
    ]);
    console.log(`  ✅ Created ${snapshots.length} profit snapshots`);

    console.log('\n🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
