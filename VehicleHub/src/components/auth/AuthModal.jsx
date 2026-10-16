// VehicleHub/VehicleHub/src/components/auth/AuthModal.jsx
import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, Phone, ShieldCheck, User, Smartphone, Mail } from 'lucide-react';
import {
    useSendOTPMutation,
    useVerifyOTPMutation,
    useSendEmailOtpMutation,
    useVerifyEmailOtpMutation,
    useCompleteProfileMutation,
} from '../../services/authApiSlice.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STEP = { INTRO: 'intro', PHONE: 'phone', OTP: 'otp', EMAIL: 'email', EMAIL_OTP: 'email_otp', NAME: 'name' };

// The login token, wherever the server put it in the OTP reply
const tokenFrom = (response) =>
    response?.accessToken || response?.token || response?.data?.accessToken || response?.data?.token || '';

export const AuthModal = ({ onClose, onComplete, intent = null }) => {
    const { completeAuth, user } = useAuth();
    const [step, setStep] = useState(STEP.INTRO);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [email, setEmail] = useState('');
    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
    const [name, setName] = useState('');
    const [sending, setSending] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const otpRefs = useRef([]);
    const emailOtpRefs = useRef([]);
    const modalRef = useRef(null);

    const [sendOTP] = useSendOTPMutation();
    const [verifyOTP] = useVerifyOTPMutation();

    const [sendEmailOtp] = useSendEmailOtpMutation();
    const [verifyEmailOtp] = useVerifyEmailOtpMutation();

    const [completeProfile] = useCompleteProfileMutation();
    // Token from the OTP reply, kept for the "What's your name?" step
    const [sessionToken, setSessionToken] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (phone.length < 10) return;

        const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        setSending(true);
        setErrorMessage('');

        try {
            await sendOTP({ mobile: normalizedPhone }).unwrap();
            setOtp(['', '', '', '']);
            setStep(STEP.OTP);
        } catch (err) {
            setErrorMessage(err?.data?.message || 'Unable to send OTP');
        } finally {
            setSending(false);
        }
    };

    // const handleOtpChange = async (index, value) => {
    //     if (!/^\d?$/.test(value)) return;
    //     const next = [...otp];
    //     next[index] = value;
    //     setOtp(next);
    //     if (value && index < 3) otpRefs.current[index + 1]?.focus();

    //     if (next.every((d) => d)) {
    //         const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    //         const otpCode = next.join('');
    //         setErrorMessage('');

    //         try {
    //             const response = await verifyOTP({ mobile: normalizedPhone, otp: otpCode }).unwrap();
    //             finalizeAuth(response?.user, response?.token);
    //         } catch (err) {
    //             setErrorMessage(err?.data?.message || 'Incorrect OTP');
    //             setOtp(['', '', '', '']);
    //         }
    //     }
    // };
    const handleOtpChange = async (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 3) otpRefs.current[index + 1]?.focus();

        if (next.every((d) => d)) {
            const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            const otpCode = next.join('');
            setErrorMessage('');

            try {
                const response = await verifyOTP({ mobile: normalizedPhone, otp: otpCode }).unwrap();
                // phone OTP may return `accessToken` or `token` — accept either
                const authToken = tokenFrom(response);
                if (!authToken) throw { data: { message: 'Sign-in failed: the server did not return a login token. Please restart the server and try again.' } };
                finalizeAuth(response?.user, authToken, response?.needsFullName, response?.user?.email || '');
            } catch (err) {
                setErrorMessage(err?.data?.message || 'Incorrect OTP');
                setOtp(['', '', '', '']);
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Shared logic to decide: skip to NAME step, or complete auth right away
    // const finalizeAuth = (verifiedUser, token) => {
    //     const normalizedRole = String(verifiedUser?.role || verifiedUser?.userRole || 'BUYER').toUpperCase();
    //     const normalizedUser = {
    //         ...verifiedUser,
    //         id: verifiedUser?.id || verifiedUser?.phone || verifiedUser?.email || 'user-unknown',
    //         name: verifiedUser?.fullName || verifiedUser?.name || 'User',
    //         role: normalizedRole,
    //     };

    //     const hasActualName = Boolean(
    //         verifiedUser?.fullName ||
    //         verifiedUser?.lastName ||
    //         (verifiedUser?.name && verifiedUser.name.toLowerCase() !== 'user')
    //     );

    //     if (normalizedRole === 'SELLER' || normalizedRole === 'ADMIN' || hasActualName) {
    //         const nextUser = completeAuth?.(normalizedUser, token);
    //         const userToUse = nextUser || normalizedUser;
    //         onComplete?.(userToUse, intent);
    //         return;
    //     }

    //     // Persist the temporary auth session so profile completion can call protected endpoints.
    //     completeAuth?.(normalizedUser, token);
    //     setStep(STEP.NAME);
    // };
    // Shared logic — now purely driven by the `needsFullName` flag the backend computed
    const finalizeAuth = async (verifiedUser, token, needsFullName, userEmail) => {
        const baseUser = {
            ...verifiedUser,
            id: verifiedUser?.id,
            name: verifiedUser?.fullName || '',
            role: String(verifiedUser?.role || 'BUYER').toLowerCase().replace(/-/g, '_'),
            userRole: String(verifiedUser?.role || 'BUYER').toLowerCase().replace(/-/g, '_'),
        };

        // The role comes from the verified account itself (ADMIN | SELLER | BUYER | INSPECTOR).
        // (The old POST /users/check-role lookup never existed on the server and always failed.)

        // Persist the session either way — NAME step needs a valid token to call completeProfile
        setSessionToken(token || '');
        completeAuth?.(baseUser, token);

        if (needsFullName) {
            setStep(STEP.NAME);
            return;
        }

        onComplete?.(baseUser, intent);
    };

    // ---- Email flow ----
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) return;

        setSendingEmail(true);
        setErrorMessage('');

        try {
            await sendEmailOtp({ email }).unwrap();
            setEmailOtp(['', '', '', '', '', '']);
            setStep(STEP.EMAIL_OTP);
        } catch (err) {
            setErrorMessage(err?.data?.message || 'Unable to send OTP');
        } finally {
            setSendingEmail(false);
        }
    };

    // const handleEmailOtpChange = async (index, value) => {
    //     if (!/^\d?$/.test(value)) return;
    //     const next = [...emailOtp];
    //     next[index] = value;
    //     setEmailOtp(next);
    //     if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();

    //     if (next.every((d) => d)) {
    //         const otpCode = next.join('');
    //         setErrorMessage('');

    //         try {
    //             const response = await verifyEmailOtp({ email, otp: otpCode }).unwrap();
    //             finalizeAuth(response?.user, response?.accessToken);
    //         } catch (err) {
    //             setErrorMessage(err?.data?.message || 'Incorrect OTP');
    //             setEmailOtp(['', '', '', '', '', '']);
    //         }
    //     }
    // };
    const handleEmailOtpChange = async (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...emailOtp];
        next[index] = value;
        setEmailOtp(next);
        if (value && index < 5) emailOtpRefs.current[index + 1]?.focus();

        if (next.every((d) => d)) {
            const otpCode = next.join('');
            setErrorMessage('');

            try {
                const response = await verifyEmailOtp({ email, otp: otpCode }).unwrap();
                const authToken = tokenFrom(response);
                if (!authToken) throw { data: { message: 'Sign-in failed: the server did not return a login token. Please restart the server and try again.' } };
                finalizeAuth(response?.user, authToken, response?.needsFullName, email);
            } catch (err) {
                setErrorMessage(err?.data?.message || 'Incorrect OTP');
                setEmailOtp(['', '', '', '', '', '']);
            }
        }
    };


    const handleEmailOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
            emailOtpRefs.current[index - 1]?.focus();
        }
    };

    // const handleNameSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!name.trim()) return;

    //     const normalizedPhone = phone ? (phone.startsWith('+') ? phone : `+91${phone}`) : undefined;
    //     const payload = {
    //         fullName: name.trim(),
    //         lastName: '',
    //         ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    //     };

    //     setSubmitting(true);
    //     setErrorMessage('');

    //     try {
    //         const response = await completeProfile(payload).unwrap();
    //         const updatedUser = response?.user || {
    //             ...user,
    //             firstName: name.trim(),
    //             lastName: '',
    //         };

    //         const nextUser = completeAuth?.(updatedUser, localStorage.getItem('vehiclehub_token'));
    //         const userToUse = nextUser || updatedUser;
    //         onComplete?.(userToUse, intent);
    //         return;
    //     } catch (err) {
    //         setErrorMessage(err?.data?.message || 'Unable to save profile');
    //     } finally {
    //         setSubmitting(false);
    //     }
    // };

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const normalizedPhone = phone ? (phone.startsWith('+') ? phone : `+91${phone}`) : undefined;
        const payload = {
            fullName: name.trim(),
            ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        };

        setSubmitting(true);
        setErrorMessage('');

        try {
            const token = sessionToken || localStorage.getItem('vehiclehub_token') || '';
            const response = await completeProfile({ ...payload, token }).unwrap();
            const updatedUser = response?.user || { ...user, fullName: name.trim() };

            const nextUser = completeAuth?.(updatedUser, token);
            const userToUse = nextUser || updatedUser;
            onComplete?.(userToUse, intent); // now finalize for real — no more NAME loop
            return;
        } catch (err) {
            setErrorMessage(err?.data?.message || 'Unable to save profile');
        } finally {
            setSubmitting(false);
        }
    };


    // Google login placeholder - wire this up to your actual auth flow
    const handleGoogleContinue = () => {
        console.log('Continue with Google clicked');
        // TODO: trigger Google OAuth flow here
    };

    const backStepFor = (current) => {
        if (current === STEP.NAME) return email ? STEP.EMAIL_OTP : STEP.OTP;
        if (current === STEP.OTP) return STEP.PHONE;
        if (current === STEP.EMAIL_OTP) return STEP.EMAIL;
        return STEP.INTRO;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div ref={modalRef} className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5">
                    {step !== STEP.INTRO ? (
                        <button
                            onClick={() => setStep(backStepFor(step))}
                            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                            aria-label="Back"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    ) : <span />}
                    <button onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 pb-8 pt-4">
                    {/* STEP: Intro / choose method */}
                    {step === STEP.INTRO && (
                        <>
                            <div className="mb-6 flex flex-col items-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <ShieldCheck size={28} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-slate-900">
                                    Help us become one of the safest places to buy and sell
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setStep(STEP.PHONE)}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#001f3f] py-3 text-sm font-bold text-[#001f3f] transition hover:bg-[#001f3f]/5"
                                >
                                    <Smartphone size={18} />
                                    Continue with phone
                                </button>

                                <button
                                    onClick={handleGoogleContinue}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z" />
                                        <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 34.9 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.5 16.3 44 24 44z" />
                                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.3 5.3C40.5 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="flex items-center gap-3 py-1">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <span className="text-xs font-semibold text-slate-400">OR</span>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>

                                <button
                                    onClick={() => { setErrorMessage(''); setStep(STEP.EMAIL); }}
                                    className="w-full text-center text-sm font-bold text-slate-900 underline underline-offset-2"
                                >
                                    Login with Email
                                </button>
                            </div>

                            <p className="mt-6 text-center text-xs text-slate-400">
                                All your personal details are safe with us.
                            </p>
                        </>
                    )}

                    {/* STEP: Phone number */}
                    {step === STEP.PHONE && (
                        <>
                            <div className="mb-5 flex flex-col items-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <Phone size={24} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-slate-900">Enter your phone number</h2>
                                <p className="mt-1 text-sm text-slate-500">We'll send you a verification code</p>
                            </div>
                            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                <div className="flex items-center rounded-lg border-2 border-slate-200 px-3 py-3 transition focus-within:border-[#001f3f]">
                                    <span className="mr-2 shrink-0 text-sm font-semibold text-slate-500">+91</span>
                                    <input
                                        autoFocus
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Phone Number"
                                        className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    />
                                </div>
                                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                                <button
                                    type="submit"
                                    disabled={phone.length < 10 || sending}
                                    className="w-full rounded-lg bg-[#001f3f] py-3 text-sm font-bold text-white transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {sending ? 'Sending...' : 'Next'}
                                </button>
                                <p className="text-center text-xs text-slate-400">
                                    Your contact number is never shared with external parties nor do we use it to spam you in any way.
                                </p>
                            </form>
                        </>
                    )}

                    {/* STEP: Phone OTP */}
                    {step === STEP.OTP && (
                        <>
                            <div className="mb-5 flex flex-col items-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <ShieldCheck size={24} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-slate-900">Enter verification code</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    We sent a 4-digit code to <span className="font-semibold text-slate-700">+91{phone}</span>
                                </p>
                            </div>
                            <div className="mb-5 flex justify-center gap-3">
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (otpRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        autoFocus={i === 0}
                                        className="h-14 w-12 rounded-lg border-2 border-slate-200 text-center text-lg font-bold text-slate-900 focus:border-[#001f3f] focus:outline-none"
                                    />
                                ))}
                            </div>
                            {errorMessage && <p className="mb-3 text-center text-sm text-red-600">{errorMessage}</p>}
                            <div className="flex flex-col items-center gap-2 text-sm">
                                <button className="font-semibold text-[#001f3f] hover:underline">Resend code by SMS</button>
                                <button className="font-semibold text-[#001f3f] hover:underline">Resend code by Call</button>
                            </div>
                        </>
                    )}

                    {/* STEP: Email address */}
                    {step === STEP.EMAIL && (
                        <>
                            <div className="mb-5 flex flex-col items-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <Mail size={24} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-slate-900">Enter your email</h2>
                                <p className="mt-1 text-sm text-slate-500">We'll send you a verification code</p>
                            </div>
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="flex items-center rounded-lg border-2 border-slate-200 px-3 py-3 transition focus-within:border-[#001f3f]">
                                    <input
                                        autoFocus
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                    />
                                </div>
                                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                                <button
                                    type="submit"
                                    disabled={!isValidEmail(email) || sendingEmail}
                                    className="w-full rounded-lg bg-[#001f3f] py-3 text-sm font-bold text-white transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {sendingEmail ? 'Sending...' : 'Next'}
                                </button>
                                <p className="text-center text-xs text-slate-400">
                                    Your email is never shared with external parties nor do we use it to spam you in any way.
                                </p>
                            </form>
                        </>
                    )}

                    {/* STEP: Email OTP */}
                    {step === STEP.EMAIL_OTP && (
                        <>
                            <div className="mb-5 flex flex-col items-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <ShieldCheck size={24} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-slate-900">Enter verification code</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    OTP sent to your email — please enter it below.<br />
                                    <span className="font-semibold text-slate-700">{email}</span>
                                </p>
                            </div>
                            <div className="mb-5 flex justify-center gap-2">
                                {emailOtp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (emailOtpRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleEmailOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleEmailOtpKeyDown(i, e)}
                                        autoFocus={i === 0}
                                        className="h-14 w-10 rounded-lg border-2 border-slate-200 text-center text-lg font-bold text-slate-900 focus:border-[#001f3f] focus:outline-none"
                                    />
                                ))}
                            </div>
                            {errorMessage && <p className="mb-3 text-center text-sm text-red-600">{errorMessage}</p>}
                            <div className="flex flex-col items-center gap-2 text-sm">
                                <button
                                    onClick={handleEmailSubmit}
                                    className="font-semibold text-[#001f3f] hover:underline"
                                >
                                    Resend code by Email
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP: Full name */}
                    {step === STEP.NAME && (
                        <>
                            <div className="mb-5 flex flex-col items-center text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f2ff] text-[#001f3f]">
                                    <User size={24} />
                                </div>
                                <h2 className="mt-4 text-lg font-bold text-slate-900">What's your name?</h2>
                                <p className="mt-1 text-sm text-slate-500">This helps sellers know who they're talking to</p>
                            </div>
                            <form onSubmit={handleNameSubmit} className="space-y-4">
                                <input
                                    autoFocus
                                    maxLength={30}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full name"
                                    className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#001f3f] focus:outline-none"
                                />
                                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                                <button
                                    type="submit"
                                    disabled={!name.trim() || submitting}
                                    className="w-full rounded-lg bg-[#001f3f] py-3 text-sm font-bold text-white transition hover:bg-[#002a55] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {submitting ? 'Saving...' : 'Continue'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};