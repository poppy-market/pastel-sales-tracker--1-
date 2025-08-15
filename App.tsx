
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';

import { Routes, Route } from 'react-router-dom';
import SetPassword from './components/SetPassword';
import ResetPassword from './components/ResetPassword';
import Login from './components/Login';
import SellerView from './components/SellerView';
import AdminView from './components/AdminView';
import { UserRole } from './types';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen font-sans antialiased text-gray-800">
                <Routes>
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/*" element={<MainAppRoutes />} />
                </Routes>
            </div>
        </AuthProvider>
    );
};

const MainAppRoutes: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <Login />;
    }

    if (user.role === UserRole.ADMIN) {
        return <AdminView />;
    }

    if (user.role === UserRole.SELLER) {
        return <SellerView />;
    }

    return <Login />;
};

export default App;