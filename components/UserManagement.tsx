import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import * as storage from '../services/storage';
import { Card, Input, Button } from './common/UI';
import { PlusIcon, EmailIcon } from './Icons';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [emailToInvite, setEmailToInvite] = useState('');
    const [message, setMessage] = useState({ text: '', type: 'success' });
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const userList = await storage.getUsers();
    console.log('Fetched users from Supabase:', userList);
    setUsers(userList);
    setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailToInvite) return;
        
        const result = await storage.inviteUser(emailToInvite);
        setMessage({
            text: result.message,
            type: result.success ? 'success' : 'error'
        });
        
        if (result.success) {
            setEmailToInvite('');
            // We don't refetch users here because the user won't appear until they click the magic link
        }
        
        setTimeout(() => setMessage({ text: '', type: 'success'}), 5000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Invite New User</h2>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
                    <Input
                        id="invite-email"
                        icon={<EmailIcon className="w-5 h-5 text-gray-400" />}
                        type="email"
                        value={emailToInvite}
                        onChange={(e) => setEmailToInvite(e.target.value)}
                        placeholder="new.seller@example.com"
                        className="flex-grow"
                        required
                    />
                    <Button type="submit" className="w-full sm:w-auto flex-shrink-0">
                        <PlusIcon className="w-5 h-5"/>
                        Send Invite
                    </Button>
                </form>
                {message.text && (
                    <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {message.text}
                    </p>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">User Accounts</h2>
                 {isLoading ? <p className="text-center p-4">Loading users...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm table-fixed">
                             <colgroup>
                                <col className="w-[30%]" />
                                <col className="w-[50%]" />
                                <col className="w-[20%]" />
                            </colgroup>
                            <thead className="border-b-2 border-gray-200 bg-gray-50/80">
                                <tr>
                                    <th className="p-2 font-semibold text-gray-600">Name</th>
                                    <th className="p-2 font-semibold text-gray-600">Email</th>
                                    <th className="p-2 font-semibold text-gray-600">Role</th>
                                <th className="p-2 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-gray-100 last:border-b-0 hover:bg-pink-50/50">
                                        <td className="p-2 text-gray-800 font-medium truncate" title={user.name}>{user.name}</td>
                                        <td className="p-2 text-gray-700 truncate" title={user.email}>{user.email}</td>
                                        <td className="p-2 text-gray-700">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === UserRole.ADMIN ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-2 text-center">
                                            <Button
                                                type="button"
                                                className="text-xs !py-1 !px-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300 rounded"
                                                onClick={async () => {
                                                    const { error } = await storage.sendPasswordReset(user.email);
                                                    setMessage({
                                                        text: error ? `Failed to send reset link: ${error.message}` : `Password reset link sent to ${user.email}`,
                                                        type: error ? 'error' : 'success',
                                                    });
                                                    setTimeout(() => setMessage({ text: '', type: 'success'}), 5000);
                                                }}
                                            >
                                                Reset Password
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 )}
            </Card>
        </div>
    );
};

export default UserManagement;