import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-[#1a3c2e]/5">
    <div className="text-3xl text-[#f97316]">{icon}</div>
    <div>
      <h4 className="font-semibold text-[#1a3c2e] text-sm md:text-base">{title}</h4>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const { addToCart, setCartOpen } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { emoji: "🥦", name: "Fruits & Vegetables" },
    { emoji: "🧴", name: "Personal Care" },
    { emoji: "🌾", name: "Pantry Staples" },
    { emoji: "🍞", name: "Bakery" },
    { emoji: "🥤", name: "Beverages" },
    { emoji: "🥩", name: "Meat & Seafood" },
    { emoji: "🍿", name: "Snacks" },
    { emoji: "🧊", name: "Frozen Foods" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setCartOpen(true);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-gray-800 antialiased font-sans">

      {/* 1. Hero Section */}
      <section className="bg-[#1a3c2e] text-white pt-16 pb-20 md:py-24 rounded-b-[2.5rem] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
              Nourish your home with Earth's finest
            </h1>
            <p className="text-[#f5f0e8]/80 text-base sm:text-lg font-light leading-relaxed">
              Supercharge your kitchen with 100% certified organic groceries, handpicked daily from sustainable local farms and delivered straight to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => navigate('/products')}
                className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-center flex items-center justify-center group">
                Shop Now
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white/80 hover:border-white hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-center">
                Browse Categories
              </button>
            </div>
          </div>
          <div className="hidden md:flex justify-center items-center relative">
            <div className="absolute w-72 h-72 bg-[#f97316]/10 rounded-full blur-3xl -z-10"></div>
            <div className="text-[12rem] animate-bounce duration-[3000ms] ease-in-out select-none filter drop-shadow-2xl">
              🧺
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureItem icon="🚚" title="Free Delivery" description="On all orders over ₹500" />
          <FeatureItem icon="🌱" title="100% Organic" description="Certified organic sourcing" />
          <FeatureItem icon="⚡" title="Same Day Delivery" description="Within 4 hours of ordering" />
          <FeatureItem icon="🔒" title="Secure Pay" description="100% protected payments" />
        </div>
      </section>

      {/* 3. Browse Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3c2e]">Browse Categories</h2>
          <div className="w-16 h-1 bg-[#f97316] mt-2 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-transparent hover:border-[#f97316]/30 hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </div>
              <span className="text-sm font-medium text-[#1a3c2e] text-center">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Popular Products — Real Data */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex justify-between items-end mb-8 border-b border-[#1a3c2e]/10 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3c2e]">Popular Products</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Our customer community favorites this week</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-[#f97316] hover:text-[#f97316]/80 font-semibold text-sm sm:text-base flex items-center space-x-1 group transition-colors">
            <span>View All</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-5xl animate-bounce mb-4">🛒</div>
            <p className="text-[#1a3c2e] font-semibold">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-bold text-[#1a3c2e] mb-2">No products yet</h3>
            <p className="text-gray-400 text-sm">Add products from the Admin Panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#1a3c2e]/5 relative flex flex-col justify-between hover:shadow-md transition-shadow duration-300 cursor-pointer group"
              >
                {/* Discount Badge */}
                {product.discount_percent > 0 && (
                  <span className="absolute top-3 left-3 bg-[#f97316] text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
                    {product.discount_percent}% OFF
                  </span>
                )}

                {/* Image */}
                <div className="w-full h-40 bg-[#f5f0e8]/50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {product.emoji || '🛒'}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">{product.category}</p>
                  <h3 className="font-semibold text-[#1a3c2e] text-sm line-clamp-2 mb-2">{product.name}</h3>
                </div>

                {/* Price + Button */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-lg font-bold text-[#1a3c2e]">₹{product.price}</span>
                    {product.original_price && (
                      <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.original_price}</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-[#1a3c2e] hover:bg-[#f97316] text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-200 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}