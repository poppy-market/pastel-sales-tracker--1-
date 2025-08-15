
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './components/Login';
import SellerView from './components/SellerView';
import AdminView from './components/AdminView';
import { UserRole } from './types';

const AppContent: React.FC = () => {
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


const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen font-sans antialiased text-gray-800">
                <AppContent />
            </div>
        </AuthProvider>
    );
};

export default App;