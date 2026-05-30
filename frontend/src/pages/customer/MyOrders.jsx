import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending:          { label: 'Pending',          icon: Clock,        color: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-400' },
  confirmed:        { label: 'Confirmed',         icon: Package,      color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400' },
  out_for_delivery: { label: 'Out for Delivery',  icon: Truck,        color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  delivered:        { label: 'Delivered',         icon: CheckCircle,  color: 'bg-green-100 text-green-700',   dot: 'bg-green-400' },
  cancelled:        { label: 'Cancelled',         icon: XCircle,      color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'all',              label: 'All' },
    { key: 'pending',          label: 'Pending' },
    { key: 'confirmed',        label: 'Confirmed' },
    { key: 'out_for_delivery', label: 'On the Way' },
    { key: 'delivered',        label: 'Delivered' },
    { key: 'cancelled',        label: 'Cancelled' },
  ];

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📦</div>
          <p className="text-[#1a3c2e] font-semibold">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a3c2e]">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your orders</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#1a3c2e] text-white shadow-sm'
                  : 'bg-white text-gray-500 hover:text-[#1a3c2e] border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-[#1a3c2e] mb-2">No orders found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {activeTab === 'all' ? "You haven't placed any orders yet." : `No ${activeTab} orders.`}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-[#1a3c2e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#f97316] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const items = order.items?.filter(Boolean) || [];

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/my-orders/${order.id}`)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-[#1a3c2e]" />
                        <span className="font-bold text-[#1a3c2e] text-sm">
                          Order #{order.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a3c2e] transition-colors" />
                    </div>
                  </div>

                  {/* Items Preview */}
                  {items.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="bg-[#f5f0e8] rounded-lg px-2.5 py-1 text-xs text-gray-600 font-medium">
                          x{item.quantity} item
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="bg-[#f5f0e8] rounded-lg px-2.5 py-1 text-xs text-gray-400">
                          +{items.length - 3} more
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 capitalize">
                        💳 {order.payment_method?.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-bold text-[#1a3c2e]">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}