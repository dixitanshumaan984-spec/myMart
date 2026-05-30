import React, { useState } from 'react';
import { Bike, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/delivery/login', { email, password });
      localStorage.setItem('deliveryToken', res.data.token);
      localStorage.setItem('deliveryPartner', JSON.stringify(res.data.partner));
      navigate('/delivery/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col md:flex-row">

      {/* Left Side */}
      <div className="bg-[#1a3c2e] md:w-1/2 flex flex-col justify-between p-8 md:p-16 relative overflow-hidden text-white min-h-[30vh] md:min-h-screen">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-600/20">
            <Bike className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            my<span className="text-orange-500">Mart</span>
          </span>
        </div>

        <div className="my-auto py-8 md:py-0 relative z-10 max-w-md">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Delivery Partner <br className="hidden md:inline" />Portal
          </h1>
          <p className="text-gray-300 mt-4 text-base md:text-lg">
            Join India's fastest grocery delivery network. Access your routes, manage deliveries, and track your active earnings on the go.
          </p>
        </div>

        <div className="text-xs text-gray-400 relative z-10 hidden md:block">
          &copy; 2026 myMart Logistics Network. All rights reserved.
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a3c2e]">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to view your delivery schedule</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="delivery@mymart.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1a3c2e] hover:bg-[#f97316] text-white py-3.5 px-4 rounded-xl font-bold tracking-wide shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}