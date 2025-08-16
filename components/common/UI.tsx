// --- Tooltip ---
interface TooltipProps {
    content: ReactNode;
    children: ReactNode;
}
export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => (
    <span className="relative group inline-block align-middle">
        {children}
        <span className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 absolute z-50 left-0 bottom-full mb-2 min-w-[120px] px-3 py-2 rounded-xl text-xs font-poppins font-medium text-gray-800 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-100 shadow-[0_2px_16px_0_rgba(255,255,255,0.7)] border border-pink-100/40 backdrop-blur-sm text-left">
            {content}
        </span>
    </span>
);
import React, { ReactNode } from 'react';
import { CloseIcon } from '../Icons';

// --- Card ---
interface CardProps {
    children: ReactNode;
    className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div
        className={`bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-blue-50/80 backdrop-blur-[2px] p-4 sm:p-6 rounded-2xl border border-pink-100/60 transition-all duration-300 shadow-[0_4px_24px_0_rgba(180,160,255,0.18),0_1.5px_6px_0_rgba(255,255,255,0.7)_inset] hover:shadow-[0_8px_32px_0_rgba(180,160,255,0.22),0_2px_8px_0_rgba(255,255,255,0.8)_inset] ${className}`}
        style={{ boxShadow: '0 4px 24px 0 rgba(180,160,255,0.18), 0 1.5px 6px 0 rgba(255,255,255,0.7) inset' }}
    >
        {children}
    </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-[1.03] active:scale-95 active:shadow-sm font-poppins" +
        " shadow-[0_2px_16px_0_rgba(255,255,255,0.7)]";
    const variantStyles = {
        primary: 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white hover:from-pink-500 hover:to-blue-500 focus:ring-pink-300',
        secondary: 'bg-white/90 text-gray-800 hover:bg-pink-50/80 focus:ring-pink-200',
        danger: 'bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600 focus:ring-red-300',
    };
    return (
        <button className={`${baseStyle} ${variantStyles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: ReactNode;
    label?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ icon, label, id, className, type, onChange, ...props }, ref) => {
    // Remove leading zeros for number inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
            let value = e.target.value;
            // Remove leading zeros unless the value is just '0' or empty
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
                if (value === '') value = '0';
            }
            e.target.value = value;
        }
        if (onChange) onChange(e);
    };
    return (
        <div className={`w-full ${className || ''}`}>
            {label && <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
                <input
                    id={id}
                    ref={ref}
                    type={type}
                    inputMode={type === 'number' ? 'numeric' : undefined}
                    pattern={type === 'number' ? '[0-9]*' : undefined}
                    className={`w-full p-3 ${icon ? 'pl-10' : ''} rounded-lg border-2 border-gray-300 focus:border-pink-400 focus:ring-pink-400 focus:outline-none transition duration-200 bg-white/80`}
                    onChange={handleChange}
                    {...props}
                />
            </div>
        </div>
    );
});
Input.displayName = 'Input';


// --- Modal ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <Card className="relative">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {children}
                </Card>
            </div>
        </div>
    );
};