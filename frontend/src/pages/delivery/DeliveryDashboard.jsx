import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Package, CheckCircle, Clock, Truck, LogOut, MapPin, Shield, Navigation, NavigationOff } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-400' },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400' },
  assigned:         { label: 'Assigned',          color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-700',   dot: 'bg-green-400' },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // OTP Modal state
  const [otpModal, setOtpModal] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Location sharing state
  const [sharingLocation, setSharingLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    const savedPartner = localStorage.getItem('deliveryPartner');
    const token = localStorage.getItem('deliveryToken');
    if (!savedPartner || !token) {
      navigate('/delivery/login');
      return;
    }
    setPartner(JSON.parse(savedPartner));
    fetchMyOrders();

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      socket.disconnect();
    };
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('deliveryToken');
      const res = await api.get('/delivery/my-deliveries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('deliveryToken');
      await api.put(`/delivery/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('order_status_update', { orderId, status: newStatus });
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  // ✅ Start sharing location
  const startLocationSharing = (orderId) => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser');
      return;
    }

    // Join order room
    socket.emit('join_order', orderId);

    const shareLocation = () => {
      // ✅ Fake location - Satya Nagar, Bhubaneswar (for testing)
      // Replace with real GPS after testing
      const lat = 20.2672;
      const lng = 85.8380;
      socket.emit('share_location', { orderId, lat, lng });
      console.log(`📍 Sharing location: ${lat}, ${lng}`);
    };

    // Share immediately then every 5 seconds
    shareLocation();
    locationIntervalRef.current = setInterval(shareLocation, 5000);
    setSharingLocation(orderId);
  };

  // ✅ Stop sharing location
  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setSharingLocation(null);
  };

  const openOtpModal = (orderId) => {
    setOtpModal(orderId);
    setOtpInput('');
    setOtpError('');
  };

  const verifyOTP = async (orderId) => {
    if (otpInput.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const token = localStorage.getItem('deliveryToken');
      await api.post(
        `/orders/${orderId}/verify-otp`,
        { otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('order_status_update', { orderId, status: 'delivered' });
      if (sharingLocation === orderId) stopLocationSharing();
      setOtpModal(null);
      setOtpInput('');
      fetchMyOrders();
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogout = () => {
    stopLocationSharing();
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('deliveryPartner');
    navigate('/delivery/login');
  };

  const totalOrders = orders.length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const onTheWay = orders.filter(o => o.status === 'out_for_delivery').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🚴</div>
          <p className="text-[#1a3c2e] font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* Header */}
      <div className="bg-[#1a3c2e] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Bike size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">myMart Delivery</h1>
              <p className="text-green-300 text-xs">
                Welcome, {partner?.name || 'Partner'} 👋
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-sm font-semibold transition">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Location Error */}
        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600 font-medium">
            ⚠️ {locationError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-black text-[#1a3c2e]">{totalOrders}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Total Assigned</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-black text-orange-500">{onTheWay}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">On the Way</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-black text-green-600">{delivered}</div>
            <p className="text-xs text-gray-500 font-medium mt-1">Delivered</p>
          </div>
        </div>

        {/* Orders List */}
        <h2 className="font-bold text-[#1a3c2e] text-lg mb-4">My Deliveries</h2>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-bold text-[#1a3c2e] mb-2">No deliveries assigned</h3>
            <p className="text-gray-400 text-sm">Check back when admin assigns orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isSharing = sharingLocation === order.id;

              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-[#1a3c2e]" />
                        <span className="font-bold text-[#1a3c2e]">Order #{order.id}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-2 mb-3 p-3 bg-[#f5f0e8]/50 rounded-xl">
                    <MapPin size={14} className="text-[#f97316] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#1a3c2e]">
                        {order.customer_name || order.user_name || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.street && `${order.street}, ${order.city}`}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="font-bold text-[#1a3c2e] text-sm">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 uppercase">{order.payment_method}</p>
                    </div>
                  </div>

                  {/* Live Location Sharing Banner */}
                  {isSharing && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                      <p className="text-xs text-green-700 font-semibold">
                        📍 Live location being shared with customer
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">

                    {/* Assigned → Start Delivery */}
                    {(order.status === 'confirmed' || order.status === 'assigned') && (
                      <button
                        onClick={() => updateStatus(order.id, 'out_for_delivery')}
                        disabled={updating === order.id}
                        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-70"
                      >
                        <Truck size={14} />
                        {updating === order.id ? 'Updating...' : 'Start Delivery'}
                      </button>
                    )}

                    {/* Out for delivery buttons */}
                    {order.status === 'out_for_delivery' && (
                      <>
                        {/* Share / Stop Location */}
                        <button
                          onClick={() => isSharing ? stopLocationSharing() : startLocationSharing(order.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            isSharing
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {isSharing ? (
                            <><NavigationOff size={14} /> Stop Sharing</>
                          ) : (
                            <><Navigation size={14} /> Share Location</>
                          )}
                        </button>

                        {/* Enter OTP */}
                        <button
                          onClick={() => openOtpModal(order.id)}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                          <Shield size={14} />
                          Enter OTP & Deliver
                        </button>
                      </>
                    )}

                    {/* Delivered */}
                    {order.status === 'delivered' && (
                      <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-bold">
                        <CheckCircle size={14} />
                        Completed ✓
                      </span>
                    )}

                    {/* Pending */}
                    {order.status === 'pending' && (
                      <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl text-xs font-bold">
                        <Clock size={14} />
                        Waiting for confirmation
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {otpModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setOtpModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3c2e] text-lg">Enter Delivery OTP</h3>
                  <p className="text-xs text-gray-400">Order #{otpModal}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-5 mt-2">
                Ask the customer for the 6-digit OTP shown on their order tracking page
              </p>

              <input
                type="number"
                value={otpInput}
                onChange={e => {
                  const val = e.target.value.slice(0, 6);
                  setOtpInput(val);
                  setOtpError('');
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#1a3c2e] text-center text-3xl font-black tracking-[0.5em] focus:outline-none mb-2 transition"
              />

              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                  <p className="text-red-500 text-xs text-center font-semibold">❌ {otpError}</p>
                </div>
              )}

              <div className="flex justify-center gap-1.5 mb-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                    otpInput.length >= i ? 'bg-[#1a3c2e]' : 'bg-gray-200'
                  }`} />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setOtpModal(null); setOtpInput(''); setOtpError(''); }}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => verifyOTP(otpModal)}
                  disabled={otpInput.length !== 6 || otpLoading}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {otpLoading ? 'Verifying...' : 'Confirm Delivery'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}