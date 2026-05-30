import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2, Home } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Addresses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: '', phone: '', street: '',
    city: '', state: '', pincode: '', is_default: false
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      const res = await api.post('/addresses', formData);
      setAddresses(prev => [...prev, res.data]);
      setSuccess('Address added successfully!');
      setShowForm(false);
      setFormData({ full_name: '', phone: '', street: '', city: '', state: '', pincode: '', is_default: false });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add address');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
      setSuccess('Address deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-5xl animate-bounce">📍</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3c2e]">My Addresses</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your delivery addresses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#1a3c2e] hover:bg-[#f97316] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
            <h2 className="font-bold text-[#1a3c2e] mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-[#f97316]" />
              New Delivery Address
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Full Name"
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                <input required placeholder="Phone Number"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
              </div>
              <input required placeholder="Street / House No / Area"
                value={formData.street}
                onChange={e => setFormData({...formData, street: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
              <div className="grid grid-cols-3 gap-3">
                <input required placeholder="City"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                <input required placeholder="State"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
                <input required placeholder="Pincode"
                  value={formData.pincode}
                  onChange={e => setFormData({...formData, pincode: e.target.value})}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox"
                  checked={formData.is_default}
                  onChange={e => setFormData({...formData, is_default: e.target.checked})}
                  className="accent-[#1a3c2e] w-4 h-4" />
                Set as default address
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="px-5 py-2 bg-[#1a3c2e] text-white text-sm font-semibold rounded-xl hover:bg-[#f97316] transition disabled:opacity-70">
                  {formLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="font-bold text-[#1a3c2e] mb-2">No addresses saved</h3>
            <p className="text-gray-400 text-sm mb-5">Add a delivery address to get started</p>
            <button onClick={() => setShowForm(true)}
              className="bg-[#1a3c2e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#f97316] transition">
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#f5f0e8] rounded-xl flex items-center justify-center flex-shrink-0">
                    {addr.is_default ? (
                      <Home size={18} className="text-[#f97316]" />
                    ) : (
                      <MapPin size={18} className="text-[#1a3c2e]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#1a3c2e] text-sm">{addr.full_name}</p>
                      {addr.is_default && (
                        <span className="bg-[#f97316]/10 text-[#f97316] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-500 transition flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}