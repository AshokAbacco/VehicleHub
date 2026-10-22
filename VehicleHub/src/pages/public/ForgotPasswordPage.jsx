// VehicleHub/VehicleHub/src/pages/public/ForgotPasswordPage.jsx
// Forgot password (/forgot-password):
//   1. email or mobile number  -> a 6-digit code is emailed to the account's email (MotorDesk MS mailbox)
//   2. enter the code          -> verified by the server
//   3. new password + confirm  -> saved; a "password changed" email is sent
// All checks (code expiry, attempt limits, resend wait) happen on the server.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Loader2, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, KeyRound, RotateCcw } from 'lucide-react';
import { AuthShell, FormError, PasswordInput } from './LoginPage.jsx';
import {
    useForgotPasswordMutation,
    useVerifyResetOtpMutation,
    useResetPasswordMutation,
} from '../../services/authApiSlice.js';

const PASSWORD_MIN = 6;
const CODE_LENGTH = 6;

const inputClass =
    'w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#001f3f] focus:bg-white focus:outline-none';
const primaryBtn =
    'flex w-full items-center justify-center gap-2 rounded-xl bg-[#001f3f] py-3 text-sm font-bold text-white shadow-md shadow-[#001f3f]/20 transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:opacity-60';

const errorText = (err, fallback) =>
    err?.status === 'FETCH_ERROR' ? "Can't reach the server. Please try again." : err?.data?.message || fallback;

const Steps = ({ step }) => (
    <div className="mt-6 flex items-center justify-center gap-2" aria-label={`Step ${step} of 3`}>
        {['Account', 'Verify code', 'New password'].map((label, i) => {
            const n = i + 1;
            return (
                <div key={label} className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-[#001f3f] text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {step > n ? <CheckCircle2 size={13} /> : n}
                    </span>
                    <span className={`hidden text-xs font-semibold sm:inline ${step >= n ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                    {n < 3 && <span className="h-px w-5 bg-slate-200" />}
                </div>
            );
        })}
    </div>
);

// Six boxes; typing moves forward, Backspace moves back, pasting a code fills all boxes
const CodeInput = ({ value, onChange, disabled }) => {
    const refs = useRef([]);
    const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] || '');
    const setAt = (i, d) => {
        const next = digits.slice();
        next[i] = d;
        onChange(next.join('').slice(0, CODE_LENGTH));
    };
    return (
        <div className="flex justify-center gap-2 sm:gap-2.5">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    value={d}
                    disabled={disabled}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Digit ${i + 1}`}
                    maxLength={1}
                    autoFocus={i === 0}
                    onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        if (v.length > 1) {
                            onChange(v.slice(0, CODE_LENGTH));
                            refs.current[Math.min(v.length, CODE_LENGTH) - 1]?.focus();
                            return;
                        }
                        setAt(i, v);
                        if (v && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus();
                        if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
                        if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
                    }}
                    onPaste={(e) => {
                        const v = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
                        if (!v) return;
                        e.preventDefault();
                        onChange(v);
                        refs.current[Math.min(v.length, CODE_LENGTH) - 1]?.focus();
                    }}
                    className="h-12 w-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900 transition focus:border-[#001f3f] focus:bg-white focus:outline-none disabled:opacity-60 sm:h-13 sm:w-12"
                />
            ))}
        </div>
    );
};

export const ForgotPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [identifier, setIdentifier] = useState(location.state?.identifier || '');
    const [sentTo, setSentTo] = useState('');
    const [code, setCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [resendIn, setResendIn] = useState(0);

    const [requestCode, { isLoading: sending }] = useForgotPasswordMutation();
    const [verifyCode, { isLoading: verifying }] = useVerifyResetOtpMutation();
    const [saveNewPassword, { isLoading: saving }] = useResetPasswordMutation();

    // resend countdown
    useEffect(() => {
        if (resendIn <= 0) return undefined;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const sendCode = async ({ resend = false } = {}) => {
        setError('');
        setNotice('');
        if (!identifier.trim()) return setError('Enter your email or mobile number.');
        try {
            const res = await requestCode({ identifier: identifier.trim() }).unwrap();
            if (!res?.data?.sent) {
                setError("We couldn't find an account with this email or mobile number. Please check it and try again.");
                return;
            }
            setSentTo(res.data.sentTo);
            setResendIn(res.data.resendIn || 60);
            setCode('');
            setStep(2);
            if (resend) setNotice(`A new code has been sent to ${res.data.sentTo}.`);
        } catch (err) {
            if (err?.data?.data?.resendIn) setResendIn(err.data.data.resendIn);
            setError(errorText(err, "We couldn't send the code. Please try again."));
        }
    };

    const onVerify = async (e) => {
        e.preventDefault();
        setError('');
        setNotice('');
        if (code.length !== CODE_LENGTH) return setError(`Enter the ${CODE_LENGTH}-digit code from the email.`);
        try {
            const res = await verifyCode({ identifier: identifier.trim(), otp: code }).unwrap();
            setResetToken(res.data.resetToken);
            setStep(3);
        } catch (err) {
            setError(errorText(err, 'The code could not be verified. Please try again.'));
            setCode('');
        }
    };

    const onReset = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < PASSWORD_MIN) return setError(`Password must be at least ${PASSWORD_MIN} characters.`);
        if (form.password !== form.confirmPassword) return setError("The passwords don't match.");
        try {
            await saveNewPassword({ resetToken, ...form }).unwrap();
            setStep(4);
        } catch (err) {
            const msg = errorText(err, "We couldn't change the password. Please try again.");
            setError(msg);
            if (/expired|start again/i.test(msg)) { setResetToken(''); setStep(1); }
        }
    };

    const onFormChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const titles = {
        1: ['Forgot your password?', "Enter your email or mobile number. We'll email you a 6-digit code to reset it."],
        2: ['Check your email', <>We sent a 6-digit code to <strong className="text-slate-700">{sentTo}</strong>. It's valid for 10 minutes.</>],
        3: ['Set a new password', `Choose a new password with at least ${PASSWORD_MIN} characters.`],
        4: ['Password changed', 'Your password has been updated. You can now sign in with your new password.'],
    };

    return (
        <AuthShell
            title={titles[step][0]}
            subtitle={titles[step][1]}
            footer={
                step < 4 && (
                    <p className="mt-5 text-center text-sm text-slate-500">
                        Remembered it? <Link to="/login" className="font-semibold text-[#001f3f] hover:underline">Back to sign in</Link>
                    </p>
                )
            }
        >
            <Helmet><title>Forgot Password | MotorDesk</title></Helmet>
            {step < 4 && <Steps step={step} />}

            {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); sendCode(); }} className="mt-6 space-y-4" noValidate>
                    <FormError message={error} />
                    <div>
                        <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold text-slate-700">Email or mobile number</label>
                        <div className="relative">
                            <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="identifier"
                                value={identifier}
                                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                                placeholder="you@example.com or 98765 43210"
                                autoComplete="username"
                                autoFocus
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={sending || resendIn > 0} className={primaryBtn}>
                        {sending ? <Loader2 size={16} className="animate-spin" /> : resendIn > 0 ? `Try again in ${resendIn}s` : <>Send code <ArrowRight size={15} /></>}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={onVerify} className="mt-6 space-y-4" noValidate>
                    <FormError message={error} />
                    {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{notice}</p>}
                    <CodeInput value={code} onChange={(v) => { setCode(v); setError(''); }} disabled={verifying} />
                    <button type="submit" disabled={verifying || code.length !== CODE_LENGTH} className={primaryBtn}>
                        {verifying ? <Loader2 size={16} className="animate-spin" /> : <>Verify code <ShieldCheck size={15} /></>}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                        <button type="button" onClick={() => { setStep(1); setError(''); setNotice(''); }} className="flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800">
                            <ArrowLeft size={14} /> Change account
                        </button>
                        <button
                            type="button"
                            onClick={() => sendCode({ resend: true })}
                            disabled={resendIn > 0 || sending}
                            className="flex items-center gap-1 font-semibold text-[#001f3f] hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                        >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                        </button>
                    </div>
                    <p className="text-center text-xs text-slate-400">Can't find it? Check your spam or junk folder.</p>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={onReset} className="mt-6 space-y-4" noValidate>
                    <FormError message={error} />
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">New password</label>
                        <PasswordInput name="password" value={form.password} onChange={onFormChange} placeholder={`At least ${PASSWORD_MIN} characters`} autoComplete="new-password" />
                        {form.password && form.password.length < PASSWORD_MIN && (
                            <p className="mt-1.5 text-xs text-amber-600">{PASSWORD_MIN - form.password.length} more character{PASSWORD_MIN - form.password.length === 1 ? '' : 's'} needed</p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm new password</label>
                        <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={onFormChange} placeholder="Type it again" autoComplete="new-password" />
                        {form.confirmPassword && form.confirmPassword !== form.password && (
                            <p className="mt-1.5 text-xs text-red-500">The passwords don't match.</p>
                        )}
                    </div>
                    <button type="submit" disabled={saving} className={primaryBtn}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <>Save new password <KeyRound size={15} /></>}
                    </button>
                </form>
            )}

            {step === 4 && (
                <div className="mt-6 space-y-5 text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={28} />
                    </span>
                    <button type="button" onClick={() => navigate('/login', { replace: true })} className={primaryBtn}>
                        Go to sign in <ArrowRight size={15} />
                    </button>
                </div>
            )}
        </AuthShell>
    );
};