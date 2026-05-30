import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../utils/api';

const getStatusBadge = (status) => {
  const badges = {
    'pending':          'bg-gray-100 text-gray-800 border border-gray-300',
    'confirmed':        'bg-blue-100 text-blue-800 border border-blue-300',
    'out_for_delivery': 'bg-orange-100 text-orange-800 border border-orange-300',
    'delivered':        'bg-green-100 text-green-800 border border-green-300',
    'cancelled':        'bg-red-100 text-red-800 border border-red-300',
  };
  return badges[status] || 'bg-gray-100 text-gray-800';
};

const formatStatus = (status) => {
  return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/all');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get('/delivery/partners');
      setPartners(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, []);

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const STATUS_FLOW = ['pending', 'confirmed', 'out_for_delivery', 'delivered'];
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;

    try {
      setUpdatingId(orderId);
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssign = async (orderId) => {
    if (!selectedPartner) {
      alert('Please select a delivery partner');
      return;
    }
    try {
      setAssigningId(orderId);
      await api.put(`/orders/${orderId}/assign`, {
        delivery_partner_id: selectedPartner
      });
      setShowAssignModal(null);
      setSelectedPartner('');
      fetchOrders();
    } catch (err) {
      alert('Failed to assign delivery partner');
    } finally {
      setAssigningId(null);
    }
  };

  const getNextStatusLabel = (status) => {
    const labels = {
      'pending':          'Confirm Order',
      'confirmed':        'Out for Delivery',
      'out_for_delivery': 'Mark Delivered',
      'delivered':        'Delivered ✓',
    };
    return labels[status] || 'Update';
  };

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      <AdminSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-[#1a3c2e]">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage and update all customer orders</p>
          </div>
          <div className="mt-4 md:mt-0 bg-[#1a3c2e] text-white px-4 py-2 rounded-lg font-medium shadow-sm">
            Live Orders: {orders.filter(o => o.status !== 'delivered').length}
          </div>
        </div>

        {loading && <div className="text-center py-20 text-gray-500">Loading orders...</div>}
        {error && <div className="text-center py-20 text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a3c2e] text-white">
                    <th className="p-4 font-semibold text-sm">Order ID</th>
                    <th className="p-4 font-semibold text-sm">Customer</th>
                    <th className="p-4 font-semibold text-sm">Items</th>
                    <th className="p-4 font-semibold text-sm text-right">Total</th>
                    <th className="p-4 font-semibold text-sm text-center">Payment</th>
                    <th className="p-4 font-semibold text-sm text-center">Status</th>
                    <th className="p-4 font-semibold text-sm text-center">Action</th>
                    <th className="p-4 font-semibold text-sm text-center">Assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 font-bold text-[#1a3c2e]">#MM-{order.id}</td>

                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {order.user_name || order.customer_name || 'Customer'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.email || order.customer_email}
                        </p>
                      </td>

                      <td className="p-4 text-sm text-gray-500 max-w-xs">
                        <span className="truncate block">
                          {order.items_summary || `${order.item_count || '?'} item(s)`}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-right text-gray-900">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </td>

                      <td className="p-4 text-center">
                        <span className="text-xs font-bold uppercase text-gray-500">
                          {order.payment_method}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block uppercase ${getStatusBadge(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>

                      {/* Status Action */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleStatusUpdate(order.id, order.status)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled' || updatingId === order.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                            order.status === 'delivered' || order.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }`}
                        >
                          {updatingId === order.id ? 'Updating...' : getNextStatusLabel(order.status)}
                        </button>
                      </td>

                      {/* Assign Delivery Partner */}
                      <td className="p-4 text-center">
                        {order.status === 'confirmed' || order.status === 'out_for_delivery' ? (
                          <button
                            onClick={() => { setShowAssignModal(order.id); setSelectedPartner(''); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a3c2e] hover:bg-[#1a3c2e]/80 text-white transition-all"
                          >
                            {order.delivery_partner_id ? '🔄 Reassign' : '🚴 Assign'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-gray-400">No orders found!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Assign Modal */}
      {showAssignModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAssignModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-[#1a3c2e] text-lg mb-4">
                🚴 Assign Delivery Partner
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Order #MM-{showAssignModal}
              </p>

              {partners.length === 0 ? (
                <p className="text-sm text-red-500 mb-4">
                  No delivery partners available. Add one first.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {partners.map(partner => (
                    <label key={partner.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPartner == partner.id
                          ? 'border-[#1a3c2e] bg-[#1a3c2e]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}>
                      <input
                        type="radio"
                        name="partner"
                        value={partner.id}
                        checked={selectedPartner == partner.id}
                        onChange={() => setSelectedPartner(partner.id)}
                        className="accent-[#1a3c2e]"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[#1a3c2e]">{partner.name}</p>
                        <p className="text-xs text-gray-400">{partner.email}</p>
                      </div>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                        partner.is_available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                      }`}>
                        {partner.is_available ? 'Available' : 'Busy'}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssign(showAssignModal)}
                  disabled={!selectedPartner || assigningId === showAssignModal}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-[#1a3c2e] rounded-xl hover:bg-[#f97316] transition disabled:opacity-70"
                >
                  {assigningId === showAssignModal ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}