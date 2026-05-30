import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Clock, Zap } from 'lucide-react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

export default function Deals() {
  const navigate = useNavigate();
  const { addToCart, setCartOpen } = useCart();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await api.get('/products/deals');
        setDeals(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🔥</div>
          <p className="text-[#1a3c2e] font-semibold">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">

      {/* Hero Banner */}
      <div className="bg-[#1a3c2e] text-white py-12 px-4 rounded-b-[2.5rem]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={24} className="text-[#f97316]" />
            <span className="text-[#f97316] font-bold text-sm uppercase tracking-widest">
              Limited Time Offers
            </span>
            <Zap size={24} className="text-[#f97316]" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-3">
            Today's Best Deals
          </h1>
          <p className="text-[#f5f0e8]/70 text-sm sm:text-base max-w-xl mx-auto">
            Handpicked discounts on your favorite groceries. Grab them before they're gone!
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-2xl font-black text-[#f97316]">{deals.length}</p>
              <p className="text-xs text-gray-300">Active Deals</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-[#f97316]">
                {deals.length > 0
                  ? Math.max(...deals.map(d => d.discount_percent || 0))
                  : 0}%
              </p>
              <p className="text-xs text-gray-300">Max Discount</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-[#f97316]">FREE</p>
              <p className="text-xs text-gray-300">Delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* No Deals */}
        {deals.length === 0 ? (
          <div className="bg-white rounded-2xl py-24 text-center border border-gray-100">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-bold text-[#1a3c2e] mb-2">No deals right now</h3>
            <p className="text-gray-400 text-sm mb-6">
              Check back soon — new deals are added daily!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-[#1a3c2e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#f97316] transition">
              Browse All Products
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-[#f97316]" />
                <h2 className="font-bold text-[#1a3c2e] text-lg">
                  {deals.length} Deal{deals.length > 1 ? 's' : ''} Available
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full border border-gray-100">
                <Clock size={12} className="text-[#f97316]" />
                Updated today
              </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {deals.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#1a3c2e]/5 relative flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  {/* Discount Badge */}
                  {product.discount_percent > 0 && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="bg-[#f97316] text-white text-[10px] font-black px-2 py-0.5 rounded-lg block">
                        {product.discount_percent}% OFF
                      </span>
                    </div>
                  )}

                  {/* Deal Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                      🔥 DEAL
                    </span>
                  </div>

                  {/* Image */}
                  <div className="w-full aspect-square bg-[#f5f0e8]/50 rounded-xl mb-3 flex items-center justify-center overflow-hidden mt-2">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                        {product.emoji || '🛒'}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">{product.category}</p>
                    <h4 className="font-semibold text-[#1a3c2e] text-xs sm:text-sm line-clamp-2 min-h-[2rem] mb-2 leading-tight">
                      {product.name}
                    </h4>
                  </div>

                  {/* Savings */}
                  {product.original_price && (
                    <div className="bg-green-50 rounded-lg px-2 py-1 mb-2">
                      <p className="text-[10px] text-green-600 font-bold text-center">
                        You save ₹{(product.original_price - product.price).toFixed(0)}!
                      </p>
                    </div>
                  )}

                  {/* Price + Button */}
                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-[#1a3c2e]">
                        ₹{product.price}
                      </span>
                      {product.original_price && (
                        <span className="text-[10px] text-gray-400 line-through ml-1">
                          ₹{product.original_price}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-[#f97316] hover:bg-[#1a3c2e] text-white w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-200 active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm mb-3">Looking for more products?</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-[#1a3c2e] hover:bg-[#f97316] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
                Browse All Products →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}