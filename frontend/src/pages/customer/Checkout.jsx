import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, ShoppingBag, ChevronRight, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', street: '',
    city: '', state: '', pincode: ''
  });

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (cartItems.length === 0) { navigate('/products'); return; }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data);
      if (res.data.length > 0) setSelectedAddress(res.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      setAddresses(prev => [...prev, res.data]);
      setSelectedAddress(res.data.id);
      setShowAddForm(false);
      setNewAddress({ full_name: '', phone: '', street: '', city: '', state: '', pincode: '' });
    } catch (err) {
      setError('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError('Please select a delivery address'); return; }
    setLoading(true);
    setError('');
    try {
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      await api.post('/orders', {
        address_id: selectedAddress,
        items,
        total_amount: totalPrice,
        payment_method: paymentMethod
      });
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a3c2e]">Checkout</h1>
          <p className="text-gray-500 text-sm mt-1">Review your order and place it</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Address + Payment */}
          <div className="lg:col-span-2 space-y-5">

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#f97316]" />
                  <h2 className="font-bold text-[#1a3c2e]">Delivery Address</h2>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 text-sm text-[#1a3c2e] font-semibold hover:text-[#f97316] transition-colors"
                >
                  <Plus size={16} />
                  Add New
                </button>
              </div>

              {/* Add Address Form */}
              {showAddForm && (
                <form onSubmit={handleAddAddress} className="mb-4 p-4 bg-[#f5f0e8] rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input required placeholder="Full Name" value={newAddress.full_name}
                      onChange={e => setNewAddress({...newAddress, full_name: e.target.value})}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                    <input required placeholder="Phone" value={newAddress.phone}
                      onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                  </div>
                  <input required placeholder="Street Address" value={newAddress.street}
                    onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                  <div className="grid grid-cols-3 gap-3">
                    <input required placeholder="City" value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                    <input required placeholder="State" value={newAddress.state}
                      onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                    <input required placeholder="Pincode" value={newAddress.pincode}
                      onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                    <button type="submit"
                      className="px-4 py-2 bg-[#1a3c2e] text-white text-sm font-semibold rounded-xl">
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {addressLoading ? (
                <p className="text-sm text-gray-400">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No addresses saved. Add one above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-[#1a3c2e] bg-[#1a3c2e]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}>
                      <input type="radio" name="address" value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 accent-[#1a3c2e]" />
                      <div>
                        <p className="font-semibold text-sm text-[#1a3c2e]">{addr.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-[#1a3c2e] mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
                  { value: 'upi', label: 'UPI Payment', icon: '📱', desc: 'Pay via UPI apps' },
                  { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
                ].map(method => (
                  <label key={method.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.value
                        ? 'border-[#1a3c2e] bg-[#1a3c2e]/5'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <input type="radio" name="payment" value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="accent-[#1a3c2e]" />
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-[#1a3c2e]">{method.label}</p>
                      <p className="text-xs text-gray-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={18} className="text-[#1a3c2e]" />
                <h2 className="font-bold text-[#1a3c2e]">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f5f0e8] rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {item.emoji || '🛒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1a3c2e] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#1a3c2e]">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-[#1a3c2e] text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-4 bg-[#1a3c2e] hover:bg-[#f97316] text-white font-bold py-3.5 rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Placing Order...' : (
                  <>
                    Place Order <ChevronRight size={16} />
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                By placing order you agree to our terms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}