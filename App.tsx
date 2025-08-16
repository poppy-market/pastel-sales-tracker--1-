
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';

import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import SetPassword from './components/SetPassword';
import ResetPassword from './components/ResetPassword';
import Login from './components/Login';
import SellerView from './components/SellerView';
import AdminView from './components/AdminView';
import NotFound from './components/NotFound';
import { UserRole } from './types';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen font-sans antialiased text-gray-800">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/admin/*" element={<RequireRole role={UserRole.ADMIN}><AdminView /></RequireRole>} />
                    <Route path="/seller/*" element={<RequireRole role={UserRole.SELLER}><SellerView /></RequireRole>} />
                    <Route path="/" element={<AuthRedirect />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </AuthProvider>
    );
};

// Redirects to the correct dashboard based on user role, or to login
const AuthRedirect: React.FC = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === UserRole.SELLER) return <Navigate to="/seller" replace />;
    return <Navigate to="/login" replace />;
};

// Protects routes by user role
const RequireRole: React.FC<{ role: UserRole; children: React.ReactNode }> = ({ role, children }) => {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (user.role !== role) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

export default App;