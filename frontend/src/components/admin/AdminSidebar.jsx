import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Plus, 
  Package, 
  ShoppingBag, 
  Truck, 
  LogOut,
  Bell
} from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard',          path: '/admin',                  icon: LayoutDashboard },
    { label: 'Add Product',        path: '/admin/add-product',      icon: Plus },
    { label: 'Products',           path: '/admin/products',         icon: Package },
    { label: 'Orders',             path: '/admin/orders',           icon: ShoppingBag },
    { label: 'Delivery Partners',  path: '/admin/delivery',         icon: Truck },
    { label: 'Notifications',      path: '/admin/notifications',    icon: Bell },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-5 shrink-0 min-h-screen">
      <div>
        {/* Header Branding */}
        <div className="flex items-center gap-2.5 px-2 py-3 mb-6 border-b border-gray-50">
          <Shield className="h-6 w-6 text-[#f97316]" strokeWidth={2.5} />
          <div>
            <h1 className="text-base font-black tracking-tight text-gray-900 leading-none">myMart</h1>
            <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition duration-150 ${
                  isActive
                    ? 'bg-[#1a3c2e] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a3c2e]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {/* Show dot for Notifications */}
                {item.label === 'Notifications' && (
                  <span className="ml-auto w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Exit */}
      <div className="pt-4 border-t border-gray-50">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50/60 transition duration-150"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Portal</span>
        </button>
      </div>
    </aside>
  );
}