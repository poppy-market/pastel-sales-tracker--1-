import React, { ReactNode } from 'react';
import { CloseIcon } from '../Icons';

// --- Card ---
interface CardProps {
    children: ReactNode;
    className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl ${className}`}>
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
    const baseStyle = "px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm";
    const variantStyles = {
        primary: 'bg-pink-400 text-white hover:bg-pink-500 focus:ring-pink-500 border border-pink-500/50',
        secondary: 'bg-white text-gray-800 hover:bg-gray-100 focus:ring-gray-400 border border-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-600 border border-red-600/50',
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
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ icon, label, id, className, ...props }, ref) => (
    <div className={`w-full ${className || ''}`}>
        {label && <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
            <input
                id={id}
                ref={ref}
                className={`w-full p-3 ${icon ? 'pl-10' : ''} rounded-lg border-2 border-gray-300 focus:border-pink-400 focus:ring-pink-400 focus:outline-none transition duration-200 bg-white/80`}
                {...props}
            />
        </div>
    </div>
));
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