
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, Input, Button } from './common/UI';
import { updateUser } from '../services/storage';
import { User } from '../types';
import { SaveIcon, UserIcon, PhoneIcon, PesoSignIcon, KeyIcon } from './Icons';

interface SellerProfileProps {
    onNavigateBack: () => void;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ onNavigateBack }) => {
    const { user, refreshUser, updatePassword } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        gcash: user?.gcash || '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ text: '', isError: false});

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const updatedUser: User = { ...user, ...formData };
        await updateUser(updatedUser);
        refreshUser();
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ text: '', isError: false });
        if(passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ text: 'New passwords do not match.', isError: true });
            return;
        }
        if(!user) return;

        const result = await updatePassword(passwordData.newPassword);
        setPasswordMessage({ text: result.message, isError: !result.success });
        
        if (result.success) {
            setPasswordData({ newPassword: '', confirmPassword: ''});
        }
        
        setTimeout(() => setPasswordMessage({ text: '', isError: false }), 4000);
    };

    return (
        <div className="p-4 space-y-6">
            <Button variant="secondary" onClick={onNavigateBack} className="self-start">
                &larr; Back to Dashboard
            </Button>
            <Card>
                <h2 className="text-xl font-bold mb-4">Edit Profile Information</h2>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                    <Input icon={<UserIcon className="w-5 h-5 text-gray-400" />} label="Full Name" name="name" value={formData.name} onChange={handleInfoChange} />
                    <Input icon={<PhoneIcon className="w-5 h-5 text-gray-400" />} label="Phone Number" name="phone" value={formData.phone} onChange={handleInfoChange} placeholder="e.g., 09123456789" />
                    <Input icon={<PesoSignIcon className="w-5 h-5 text-gray-400" />} label="GCash Number" name="gcash" value={formData.gcash} onChange={handleInfoChange} placeholder="e.g., 09123456789" />
                    {message && <p className="text-green-600">{message}</p>}
                    <Button type="submit">
                        <SaveIcon className="w-5 h-5"/>
                        Save Profile
                    </Button>
                </form>
            </Card>
            <Card>
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <Input icon={<KeyIcon className="w-5 h-5 text-gray-400" />} label="New Password" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
                    <Input icon={<KeyIcon className="w-5 h-5 text-gray-400" />} label="Confirm New Password" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
                    {passwordMessage.text && <p className={passwordMessage.isError ? "text-red-600" : "text-green-600"}>{passwordMessage.text}</p>}
                    <Button type="submit">
                        <SaveIcon className="w-5 h-5"/>
                        Change Password
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default SellerProfile;
