import { useState } from 'react';
import { Bike, Mail, Lock, User, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Start resend countdown
  const startTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1 — Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name
      });
      setSuccess(`OTP sent to ${formData.email}`);
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP!');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', {
        email: formData.email,
        name: formData.name
      });
      setSuccess('New OTP sent!');
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP!');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2 — Verify OTP + Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { ...formData, otp });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-[#1a3c2e]/5 p-8 border border-[#1a3c2e]/5">

        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#1a3c2e] text-[#f97316] rounded-xl flex items-center justify-center shadow-md mb-3">
            <Bike size={32} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-serif font-black tracking-tight text-[#1a3c2e]">
            my<span className="text-[#f97316]">Mart</span>
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
            step === 1 ? 'bg-[#1a3c2e] text-white' : 'bg-green-100 text-green-700'
          }`}>
            {step > 1 ? '✓' : '1'} Details
          </div>
          <div className="h-px w-8 bg-gray-200" />
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
            step === 2 ? 'bg-[#1a3c2e] text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            2 Verify Email
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-[#1a3c2e]">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {step === 1 ? (
              <>Already have an account?{' '}
                <Link to="/login" className="text-[#f97316] font-medium hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              `We sent a 6-digit OTP to ${formData.email}`
            )}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center font-medium">
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Step 1 — Registration Form */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-[#f5f0e8]/30 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#f5f0e8]/30 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-[#f5f0e8]/30 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-[#1a3c2e] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="ml-3 text-xs text-gray-500 cursor-pointer">
                I agree to the{' '}
                <a href="#terms" className="text-[#1a3c2e] font-medium hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#privacy" className="text-[#1a3c2e] font-medium hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a3c2e] hover:bg-[#1a3c2e]/90 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg active:scale-[0.99] transition-all duration-200 text-sm mt-2 disabled:opacity-70"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-5">

            {/* OTP Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Shield size={18} />
                </div>
                <input
                  type="number"
                  value={otp}
                  onChange={e => {
                    const val = e.target.value.slice(0, 6);
                    setOtp(val);
                    setError('');
                  }}
                  placeholder="Enter OTP"
                  className="w-full pl-11 pr-4 py-4 bg-[#f5f0e8]/30 border-2 border-gray-200 rounded-xl text-gray-800 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 transition-all"
                />
              </div>

              {/* OTP Dots Indicator */}
              <div className="flex justify-center gap-2 mt-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                    otp.length >= i ? 'bg-[#1a3c2e]' : 'bg-gray-200'
                  }`} />
                ))}
              </div>
            </div>

            {/* OTP Expiry Notice */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
              <p className="text-xs text-orange-700 font-medium">
                ⏱️ OTP is valid for 10 minutes
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#1a3c2e] hover:bg-[#1a3c2e]/90 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg active:scale-[0.99] transition-all duration-200 text-sm disabled:opacity-70"
            >
              {loading ? 'Verifying...' : '✅ Verify & Create Account'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend OTP in <strong>{resendTimer}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-xs text-[#f97316] font-semibold hover:underline disabled:opacity-70"
                >
                  {resendLoading ? 'Sending...' : '🔄 Resend OTP'}
                </button>
              )}
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setError(''); setSuccess(''); }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 font-medium py-2 transition"
            >
              ← Back to edit details
            </button>
          </form>
        )}
      </div>
    </div>
  );
}