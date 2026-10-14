import { useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { formatCurrency } from '../utils/formatters.js';

const calculateEmi = (principal, annualRate, months) => {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
};

/**
 * Cars24-style EMI calculator: down payment, tenure, and rate sliders with a live monthly figure.
 */
export const EMICalculator = ({ price }) => {
    const [downPaymentPct, setDownPaymentPct] = useState(20);
    const [tenureMonths, setTenureMonths] = useState(48);
    const [rate, setRate] = useState(9.5);

    const { emi, principal, totalInterest } = useMemo(() => {
        const downPayment = (price * downPaymentPct) / 100;
        const loanPrincipal = price - downPayment;
        const monthlyEmi = calculateEmi(loanPrincipal, rate, tenureMonths);
        return {
            emi: monthlyEmi,
            principal: loanPrincipal,
            totalInterest: monthlyEmi * tenureMonths - loanPrincipal,
        };
    }, [price, downPaymentPct, tenureMonths, rate]);

    return (
        <Card className="space-y-5">
            <div className="flex items-center gap-2 text-cyan-300">
                <Wallet size={16} /> EMI calculator
            </div>

            <div className="rounded-2xl bg-slate-950/70 p-4 text-center">
                <p className="text-sm text-slate-400">Estimated monthly EMI</p>
                <p className="mt-1 text-3xl font-semibold text-white">{formatCurrency(emi)}</p>
                <p className="mt-1 text-xs text-slate-500">for {tenureMonths} months at {rate}% p.a.</p>
            </div>

            <div className="space-y-4 text-sm">
                <div>
                    <div className="flex justify-between text-slate-300">
                        <span>Down payment</span>
                        <span className="text-cyan-300">{downPaymentPct}% · {formatCurrency((price * downPaymentPct) / 100)}</span>
                    </div>
                    <input
                        type="range" min={10} max={80} step={5}
                        value={downPaymentPct}
                        onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                        className="mt-2 w-full accent-cyan-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between text-slate-300">
                        <span>Loan tenure</span>
                        <span className="text-cyan-300">{tenureMonths} months</span>
                    </div>
                    <input
                        type="range" min={12} max={84} step={6}
                        value={tenureMonths}
                        onChange={(e) => setTenureMonths(Number(e.target.value))}
                        className="mt-2 w-full accent-cyan-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between text-slate-300">
                        <span>Interest rate</span>
                        <span className="text-cyan-300">{rate}% p.a.</span>
                    </div>
                    <input
                        type="range" min={7} max={16} step={0.1}
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="mt-2 w-full accent-cyan-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-950/70 p-3">
                    <p className="text-slate-400">Loan amount</p>
                    <p className="font-semibold text-white">{formatCurrency(principal)}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-3">
                    <p className="text-slate-400">Total interest</p>
                    <p className="font-semibold text-white">{formatCurrency(totalInterest)}</p>
                </div>
            </div>

            <button type="button" className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white">
                Check loan eligibility
            </button>
        </Card>
    );
};
