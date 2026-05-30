import { Link } from 'react-router-dom';
import { Bike, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1a3c2e] text-white border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Logo & Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
              <Bike className="h-6 w-6 text-green-400" />
              <span>myMart</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Bringing fresh groceries, organic produce, and daily essentials straight to your doorstep with lightning-fast delivery.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors" aria-label="Facebook">
                <span className="font-bold text-lg">f</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors" aria-label="Twitter">
                <span className="font-bold text-lg">t</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-300 hover:text-green-400 transition-colors" aria-label="Instagram">
                <span className="font-bold text-lg">ig</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-green-400 font-semibold uppercase tracking-wider text-sm mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white transition-colors">
                  Deals
                </Link>
              </li>
              <li>
                <Link to="/delivery/login" className="hover:text-white transition-colors">
                  Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-green-400 font-semibold uppercase tracking-wider text-sm mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-white transition-colors">
                  Addresses
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="text-green-400 font-semibold uppercase tracking-wider text-sm mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>123 Fresh Market Way, Grocery City, GC 45678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-green-400 flex-shrink-0" />
                <a href="mailto:support@mymart.com" className="hover:text-white transition-colors">
                  support@mymart.com
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#142e24] py-4 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          <p>© 2026 myMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}