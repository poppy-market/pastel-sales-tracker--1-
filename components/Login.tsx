import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, Input, Button, Modal } from './common/UI';
import { UserIcon, LockIcon, StarIcon, EmailIcon } from './Icons';
import { supabase } from '../services/supabase';
import { signUpUser } from '../services/storage';

const ResetPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
             redirectTo: window.location.origin, // URL to redirect to after password reset
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
        }
    };
    
    const handleClose = () => {
        setEmail('');
        setMessage('');
        setError('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">Enter your email address. We will send you a link to reset your password.</p>
                <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    icon={<EmailIcon className="w-5 h-5 text-gray-400" />}
                    required
                />
                {message && <p className="text-green-600 text-sm">{message}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">
                    Send Reset Link
                </Button>
            </form>
        </Modal>
    );
};

const SignUpModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setMessage('');
        setIsLoading(true);

        const result = await signUpUser(name, email, password);

        if (result.success) {
            setMessage(result.message);
            // Optionally close modal after a delay
            setTimeout(() => handleClose(), 3000);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };
    
    const handleClose = () => {
        // Reset state on close
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setMessage('');
        setError('');
        setIsLoading(false);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create an Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <Input
                    id="signup-name"
                    type="text"
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sally Seller"
                    icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                    required
                />
                <Input
                    id="signup-email"
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    icon={<EmailIcon className="w-5 h-5 text-gray-400" />}
                    required
                />
                <Input
                    id="signup-password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    icon={<LockIcon className="w-5 h-5 text-gray-400" />}
                    required
                />
                <Input
                    id="signup-confirm-password"
                    type="password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    icon={<LockIcon className="w-5 h-5 text-gray-400" />}
                    required
                />

                {message && <p className="text-green-600 text-sm">{message}</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </form>
        </Modal>
    );
};


const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message || 'Invalid email or password.');
        }
        setIsLoading(false);
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center border border-white/30 shadow-xl">
                           <StarIcon className="w-10 h-10 text-pink-400" />
                        </div>
                    </div>
                    <Card>
                        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back!</h1>
                        <p className="text-center text-gray-600 mb-6">Log in to track your sales.</p>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                id="email"
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<EmailIcon className="w-5 h-5 text-gray-400" />}
                                placeholder="e.g., sally@example.com"
                                required
                            />
                            <Input
                                id="password"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<LockIcon className="w-5 h-5 text-gray-400" />}
                                placeholder="Your password"
                                required
                            />
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="flex items-center justify-between text-sm pt-2">
                                <button type="button" onClick={() => setIsSignUpModalOpen(true)} className="font-semibold text-pink-500 hover:underline focus:outline-none">
                                    Create account
                                </button>
                                <button type="button" onClick={() => setIsResetModalOpen(true)} className="font-semibold text-pink-500 hover:underline focus:outline-none">
                                    Forgot password?
                                </button>
                            </div>
                            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
            <ResetPasswordModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />
            <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
        </>
    );
};

export default Login;