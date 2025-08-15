import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Card, Input, Button } from './common/UI';
import { LockIcon } from './Icons';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get access token from URL
  const accessToken = searchParams.get('access_token') || searchParams.get('token');

  // Don't show error immediately, only on submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!accessToken) {
      setError('Invalid or missing token.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-4">
          <LockIcon className="w-12 h-12 text-pink-400 mb-2" />
          <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
        </div>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        {success ? (
          <div className="text-green-600 text-center">Password reset! Redirecting...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              label="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<LockIcon className="w-5 h-5 text-gray-400" />}
              required
            />
            <Input
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              icon={<LockIcon className="w-5 h-5 text-gray-400" />}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
