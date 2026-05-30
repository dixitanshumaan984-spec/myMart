import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Clock, Truck, CheckCircle, XCircle, Shield, Navigation } from 'lucide-react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const bikeIcon = new L.DivIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚴</div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const homeIcon = new L.DivIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🏠</div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Calculate distance between two coordinates in km
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

// Map updater component
function MapUpdater({ deliveryLocation, customerLocation }) {
  const map = useMap();
  useEffect(() => {
    if (deliveryLocation && customerLocation) {
      // Fit both markers in view
      const bounds = L.latLngBounds(
        [deliveryLocation, customerLocation]
      );
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else if (deliveryLocation) {
      map.setView(deliveryLocation, 15, { animate: true });
    } else if (customerLocation) {
      map.setView(customerLocation, 15, { animate: true });
    }
  }, [deliveryLocation, customerLocation, map]);
  return null;
}

const STATUS_CONFIG = {
  pending:          { label: 'Pending',         icon: Clock,       color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', step: 1 },
  confirmed:        { label: 'Confirmed',        icon: Package,     color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400',   step: 2 },
  assigned:         { label: 'Assigned',         icon: Truck,       color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-400', step: 2 },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck,       color: 'bg-orange-100 text-orange-700',dot: 'bg-orange-400', step: 3 },
  delivered:        { label: 'Delivered',        icon: CheckCircle, color: 'bg-green-100 text-green-700',  dot: 'bg-green-400',  step: 4 },
  cancelled:        { label: 'Cancelled',        icon: XCircle,     color: 'bg-red-100 text-red-700',      dot: 'bg-red-400',    step: 0 },
};

const STEPS = ['Order Placed', 'Confirmed', 'Out for Delivery', 'Delivered'];

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Location states
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [locationActive, setLocationActive] = useState(false);
  const [locationPermission, setLocationPermission] = useState('pending');
  const [distance, setDistance] = useState(null);
  const watchIdRef = useRef(null);

  // Get customer location
  const getCustomerLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setCustomerLocation([lat, lng]);
        setLocationPermission('granted');
      },
      (err) => {
        console.error('Location error:', err);
        setLocationPermission('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrder();

    // Join order room
    socket.emit('join_order', id);

    // Listen for delivery location
    socket.on('location_update', ({ lat, lng, orderId }) => {
      if (String(orderId) === String(id)) {
        setDeliveryLocation([lat, lng]);
        setLocationActive(true);
      }
    });

    // Listen for status changes
    socket.on('status_changed', ({ orderId, status }) => {
      if (String(orderId) === String(id)) {
        setOrder(prev => prev ? { ...prev, status } : prev);
        if (status === 'delivered') {
          setLocationActive(false);
          setDeliveryLocation(null);
        }
      }
    });

    // Get customer location when out for delivery
    getCustomerLocation();

    return () => {
      socket.off('location_update');
      socket.off('status_changed');
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [id]);

  // Calculate distance when both locations available
  useEffect(() => {
    if (deliveryLocation && customerLocation) {
      const dist = calculateDistance(
        deliveryLocation[0], deliveryLocation[1],
        customerLocation[0], customerLocation[1]
      );
      setDistance(dist);
    }
  }, [deliveryLocation, customerLocation]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/orders/my');
      const found = res.data.find(o => String(o.id) === String(id));
      if (!found) {
        setError('Order not found');
        setOrder(null);
      } else {
        const detailRes = await api.get(`/orders/${id}`);
        setOrder(detailRes.data);
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📦</div>
          <p className="text-[#1a3c2e] font-semibold">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="font-bold text-[#1a3c2e] mb-2">Order not found</h3>
          <p className="text-gray-400 text-sm mb-4">
            This order doesn't exist or doesn't belong to you
          </p>
          <button onClick={() => navigate('/my-orders')}
            className="bg-[#1a3c2e] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#f97316] transition">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const items = order.items?.filter(Boolean) || [];
  const currentStep = status.step;
  const otpDigits = order.delivery_otp ? order.delivery_otp.split('') : [];

  // Map center — priority: delivery > customer > India center
  const mapCenter = deliveryLocation || customerLocation || [20.5937, 78.9629];
  const mapZoom = (deliveryLocation || customerLocation) ? 15 : 5;

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back Button */}
        <button onClick={() => navigate('/my-orders')}
          className="flex items-center gap-2 text-sm font-semibold text-[#1a3c2e] mb-6 hover:text-[#f97316] transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-bold text-[#1a3c2e] text-lg">Order #{order.id}</h1>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>

        {/* OTP Box */}
        {order.status === 'out_for_delivery' && order.delivery_otp && (
          <div className="bg-[#1a3c2e] rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-[#f97316]" />
              <h2 className="font-bold text-white text-sm">Delivery OTP</h2>
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400 font-semibold">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-gray-300 text-xs mb-4">
              Share this OTP with your delivery partner when they arrive
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, idx) => (
                <div key={idx}
                  className="w-10 h-12 sm:w-12 sm:h-14 bg-white/10 border-2 border-[#f97316] rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-black text-white">{digit}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 Do not share this OTP until your delivery partner arrives
            </p>
          </div>
        )}

        {/* Delivered */}
        {order.status === 'delivered' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-700 text-sm">Order Delivered Successfully! 🎉</p>
              <p className="text-xs text-green-600 mt-0.5">OTP verified and delivery confirmed</p>
            </div>
          </div>
        )}

        {/* Live Map */}
        {order.status === 'out_for_delivery' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">

            {/* Map Header */}
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <MapPin size={16} className="text-[#f97316]" />
              <h2 className="font-bold text-[#1a3c2e] text-sm">Live Tracking</h2>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold">
                {locationActive ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600">Live</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-gray-300 rounded-full" />
                    <span className="text-gray-400">Waiting...</span>
                  </>
                )}
              </span>
            </div>

            {/* Location Permission Banner */}
            {locationPermission === 'denied' && (
              <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2">
                <Navigation size={14} className="text-yellow-600" />
                <p className="text-xs text-yellow-700 font-medium">
                  Enable location to see your position on map
                </p>
                <button
                  onClick={getCustomerLocation}
                  className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-bold"
                >
                  Enable
                </button>
              </div>
            )}

            {/* Distance Info */}
            {distance && locationActive && (
              <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                <span className="text-sm">📍</span>
                <div>
                  <p className="text-xs font-bold text-blue-700">
                    Delivery partner is {distance} km away
                  </p>
                  <p className="text-xs text-blue-500">
                    ETA: ~{Math.ceil(distance / 0.5)} minutes
                  </p>
                </div>
              </div>
            )}

            {/* Leaflet Map */}
            <div style={{ height: '300px', width: '100%' }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 🚴 Delivery Partner Marker */}
                {deliveryLocation && (
                  <Marker position={deliveryLocation} icon={bikeIcon}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">🚴 Delivery Partner</p>
                        <p className="text-xs text-gray-500">
                          {order.delivery_partner_name}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* 🏠 Customer Marker */}
                {customerLocation && (
                  <Marker position={customerLocation} icon={homeIcon}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">🏠 Your Location</p>
                        <p className="text-xs text-gray-500">Delivery destination</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route line between partner and customer */}
                {deliveryLocation && customerLocation && (
                  <Polyline
                    positions={[deliveryLocation, customerLocation]}
                    color="#f97316"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                )}

                {/* Auto-fit map */}
                <MapUpdater
                  deliveryLocation={deliveryLocation}
                  customerLocation={customerLocation}
                />
              </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="px-5 py-3 bg-gray-50 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🚴</span>
                <span className="text-xs text-gray-600 font-medium">Delivery Partner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🏠</span>
                <span className="text-xs text-gray-600 font-medium">Your Location</span>
              </div>
              {distance && (
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#f97316]">{distance} km away</span>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="px-5 py-3 bg-orange-50 flex items-center gap-2">
              <Truck size={14} className="text-[#f97316]" />
              <p className="text-xs text-orange-700 font-semibold">
                {locationActive
                  ? '🚴 Your delivery partner is on the way! Updates every 5 seconds.'
                  : 'Waiting for delivery partner to share location...'}
              </p>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <h2 className="font-bold text-[#1a3c2e] mb-4 text-sm">Order Progress</h2>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0">
                <div
                  className="h-full bg-[#1a3c2e] transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isCompleted = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                      isCompleted ? 'bg-[#1a3c2e] text-white' :
                      isActive    ? 'bg-[#f97316] text-white' :
                                    'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <p className={`text-[10px] text-center font-medium ${
                      isCompleted || isActive ? 'text-[#1a3c2e]' : 'text-gray-400'
                    }`}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order.street && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <h2 className="font-bold text-[#1a3c2e] mb-3 text-sm">Delivery Address</h2>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#f97316] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-[#1a3c2e]">{order.full_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{order.street}</p>
                <p className="text-xs text-gray-500">{order.city}, {order.state} - {order.pincode}</p>
                <p className="text-xs text-gray-500 mt-0.5">📞 {order.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Partner */}
        {order.delivery_partner_name && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <h2 className="font-bold text-[#1a3c2e] mb-3 text-sm">Delivery Partner</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1a3c2e] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {order.delivery_partner_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1a3c2e]">{order.delivery_partner_name}</p>
                <p className="text-xs text-gray-500">📞 {order.delivery_partner_phone}</p>
              </div>
              {locationActive && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <h2 className="font-bold text-[#1a3c2e] mb-4 text-sm">
            Items Ordered ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No items found</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#f5f0e8]/50 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name}
                        className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-2xl">{item.emoji || '🛒'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1a3c2e]">
                      {item.product_name || `Product #${item.product_id}`}
                    </p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#1a3c2e] text-sm">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-[#1a3c2e] mb-3 text-sm">Payment Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₹{Number(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Payment Method</span>
              <span className="font-semibold uppercase">{order.payment_method}</span>
            </div>
            <div className="flex justify-between font-bold text-[#1a3c2e] pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>₹{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/products')}
          className="w-full bg-[#1a3c2e] hover:bg-[#f97316] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
          Continue Shopping
        </button>

      </div>
    </div>
  );
}