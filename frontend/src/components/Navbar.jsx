import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, ShoppingCart, Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems, setCartOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-[#1a3c2e] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
                <Bike className="h-6 w-6 text-green-400" />
                <span>myMart</span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-8 font-medium">
              <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
              <Link to="/products" className="hover:text-green-400 transition-colors">Products</Link>
              <Link to="/deals" className="hover:text-green-400 transition-colors">Deals</Link>
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-6">

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative hover:text-green-400 transition-colors p-1"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-[#1a3c2e] font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 bg-[#1a3c2e] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name?.split(' ')[0]}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/my-orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm">
                        My Orders
                      </Link>
                      <Link to="/addresses" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm">
                        Addresses
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-orange-500 font-semibold">
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-red-500 w-full">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-green-500 hover:bg-green-600 text-[#1a3c2e] font-semibold px-4 py-2 rounded-lg transition-colors">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setCartOpen(true)} className="relative p-1">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:text-green-400">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-[#142e24] border-t border-emerald-900">
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-base font-medium">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-900">Home</Link>
              <Link to="/products" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-900">Products</Link>
              <Link to="/deals" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-900">Deals</Link>
              <Link to="/my-orders" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-900">My Orders</Link>
              <Link to="/addresses" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-900">Addresses</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-900 text-orange-400 font-semibold">
                  Admin Panel
                </Link>
              )}
              <div className="pt-4 border-t border-emerald-900 px-3">
                {user ? (
                  <button onClick={handleLogout} className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center bg-green-500 text-[#1a3c2e] font-semibold px-4 py-2 rounded-lg text-sm">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Sidebar renders here */}
      <CartSidebar />
    </>
  );
}