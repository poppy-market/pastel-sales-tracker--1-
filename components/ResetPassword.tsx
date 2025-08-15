import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

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

  useEffect(() => {
    if (!accessToken) {
      setError('Invalid or missing token.');
    }
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      <div className="bg-white/80 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        {success ? (
          <div className="text-green-600 text-center">Password reset! Redirecting...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Confirm Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded transition"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
