import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Plus, Package, ShoppingBag, Truck, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLE = {
  pending:          'bg-yellow-50 text-yellow-700',
  confirmed:        'bg-blue-50 text-blue-700',
  out_for_delivery: 'bg-orange-50 text-orange-700',
  delivered:        'bg-emerald-50 text-emerald-700',
  cancelled:        'bg-rose-50 text-rose-700',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders/admin/all'),
        api.get('/products'),
      ]);

      const orders = ordersRes.data;
      const products = productsRes.data;

      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue: totalRevenue.toFixed(2),
        totalProducts: products.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
      });

      setRecentOrders(orders.slice(0, 8));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      change: `${stats.pendingOrders} pending`,
      icon: <ShoppingBag className="h-5 w-5" />,
      urgent: stats.pendingOrders > 0
    },
    {
      label: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`,
      change: `${stats.deliveredOrders} delivered`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      change: 'in catalog',
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: 'Out for Delivery',
      value: stats.outForDelivery || 0,
      change: 'active deliveries',
      icon: <Truck className="h-5 w-5" />,
      urgent: (stats.outForDelivery || 0) > 0
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📊</div>
          <p className="text-[#1a3c2e] font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a3c2e] font-sans flex flex-col md:flex-row antialiased">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Overview Dashboard</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Real-time hub operations and inventory status tracking.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-7 h-7 bg-[#1a3c2e] text-white rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
          {STAT_CARDS.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {stat.label}
                </span>
                <span className="text-2xl font-black text-gray-900 leading-none block mb-1.5">
                  {stat.value}
                </span>
                <span className={`text-[11px] font-medium block ${stat.urgent ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#f5f0e8] flex items-center justify-center text-[#f97316]">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-[#f97316] hover:underline">
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-400 text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100 tracking-wider">
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-bold text-[#1a3c2e]">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.user_name || 'Customer'}</p>
                        <p className="text-xs text-gray-400">{order.email}</p>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-gray-900">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 uppercase text-xs font-semibold">
                        {order.payment_method}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md ${STATUS_STYLE[order.status] || 'bg-gray-50 text-gray-500'}`}>
                          {order.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}