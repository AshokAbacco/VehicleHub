import { clsx } from 'clsx';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20',
        secondary: 'bg-white/10 text-slate-100 border border-white/15 backdrop-blur-xl',
        ghost: 'bg-transparent text-slate-300 hover:bg-white/10',
    };

    return (
        <button
            className={clsx('rounded-full px-4 py-2.5 font-medium transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};
