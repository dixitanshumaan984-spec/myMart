import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../utils/api';

export default function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/partners');
      setPartners(res.data);
    } catch (err) {
      setError('Failed to load delivery partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/delivery/register', formData);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      fetchPartners();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add partner');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/delivery/partners/${id}/toggle`, {
        is_available: !currentStatus
      });
      fetchPartners();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    try {
      await api.delete(`/delivery/partners/${id}`);
      fetchPartners();
    } catch (err) {
      alert('Failed to delete partner');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#1a3c2e]">Delivery Personnel</h1>
            <p className="text-gray-600 mt-1">Onboard and manage delivery partners</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 sm:mt-0 bg-[#1a3c2e] hover:bg-[#142f24] text-white px-5 py-2.5 rounded-lg font-semibold shadow-md inline-flex items-center gap-2 transition-all active:scale-95"
          >
            <span className="text-xl">+</span>
            Add Partner
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-500 font-medium">
            Loading partners...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Partners Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.length > 0 ? partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Side indicator */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${partner.is_available ? 'bg-green-600' : 'bg-red-500'}`} />

                <div>
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div>
                      <h3 className="text-xl font-bold text-[#1a3c2e]">{partner.name}</h3>
                      <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 inline-block mt-1">
                        Delivery Partner
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
                      partner.is_available
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {partner.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-6 pl-2">
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <span className="truncate">{partner.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <span>{partner.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span>{partner.total_deliveries || 0} deliveries</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pl-2 pt-2 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(partner.id, partner.is_available)}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 shadow-sm ${
                      partner.is_available
                        ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {partner.is_available ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id, partner.name)}
                    className="px-3 py-2 rounded-lg font-semibold text-sm bg-gray-50 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-20 text-gray-400 font-medium">
                No delivery partners found. Add one!
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1a3c2e]">Add Delivery Partner</h2>
              <button
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Rahul Mishra"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g., rahul@mymart.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-[#1a3c2e] hover:bg-[#142f24] text-white font-bold text-sm py-3 rounded-xl transition disabled:opacity-70"
                >
                  {formLoading ? 'Adding Partner...' : 'Add Delivery Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}