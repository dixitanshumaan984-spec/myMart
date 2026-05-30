import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, setCartOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    'All Categories',
    'Fruits & Vegetables',
    'Personal Care',
    'Pantry Staples',
    'Bakery',
    'Beverages',
    'Meat & Seafood',
    'Snacks',
    'Frozen Foods',
    'Baby Care',
    'Dairy & Eggs',
  ];

  const handlePriceChange = (e) => {
    setPriceRange({ ...priceRange, [e.target.name]: e.target.value });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    setCartOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All Categories' || product.category === activeCategory;
    const matchesMin = priceRange.min === '' || product.price >= Number(priceRange.min);
    const matchesMax = priceRange.max === '' || product.price <= Number(priceRange.max);
    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🛒</div>
          <p className="text-[#1a3c2e] font-semibold">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-gray-800 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* TOP HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="text-xs sm:text-sm text-gray-500 font-medium">
            <span onClick={() => navigate('/')} className="hover:text-[#1a3c2e] cursor-pointer">Home</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-[#1a3c2e] font-semibold">
              {activeCategory === 'All Categories' ? 'All Products' : activeCategory}
            </span>
          </nav>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-[#1a3c2e]/10 shadow-sm font-semibold text-sm text-[#1a3c2e]"
          >
            <SlidersHorizontal size={16} />
            <span>Filters & Categories</span>
          </button>
        </div>

        <div className="flex gap-8 items-start">

          {/* SIDEBAR */}
          <aside className={`fixed inset-0 z-40 bg-[#f5f0e8] p-6 overflow-y-auto transition-transform duration-300 transform md:relative md:transform-none md:z-0 md:p-0 md:bg-transparent md:w-64 flex-shrink-0 border-r border-transparent md:border-[#1a3c2e]/5 ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

            <div className="flex items-center justify-between md:hidden mb-6 pb-4 border-b border-[#1a3c2e]/10">
              <h3 className="font-serif font-bold text-lg text-[#1a3c2e]">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-sm font-bold text-[#f97316]">Close ✕</button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-serif font-bold text-lg text-[#1a3c2e] mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#f97316]">
                Categories
              </h3>
              <ul className="space-y-1">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => {
                          setActiveCategory(cat);
                          setShowMobileFilters(false);
                          if (cat === 'All Categories') {
                            navigate('/products');
                          } else {
                            navigate(`/products?category=${encodeURIComponent(cat)}`);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-between ${
                          isActive ? 'bg-[#1a3c2e] text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-[#1a3c2e]'
                        }`}
                      >
                        <span>{cat}</span>
                        {isActive && <Check size={14} className="text-[#f97316]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border border-[#1a3c2e]/5">
              <h3 className="font-serif font-bold text-lg text-[#1a3c2e] mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#f97316]">
                Price Range
              </h3>
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">₹</span>
                  <input type="number" name="min" placeholder="Min" value={priceRange.min}
                    onChange={handlePriceChange}
                    className="w-full bg-[#f5f0e8]/50 md:bg-white border border-gray-200 focus:border-[#f97316] focus:outline-none rounded-xl pl-6 pr-2 py-2 text-sm text-gray-700" />
                </div>
                <span className="text-gray-400 text-sm font-medium">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-gray-400">₹</span>
                  <input type="number" name="max" placeholder="Max" value={priceRange.max}
                    onChange={handlePriceChange}
                    className="w-full bg-[#f5f0e8]/50 md:bg-white border border-gray-200 focus:border-[#f97316] focus:outline-none rounded-xl pl-6 pr-2 py-2 text-sm text-gray-700" />
                </div>
              </div>
            </div>
          </aside>

          {/* MOBILE OVERLAY */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)} />
          )}

          {/* PRODUCTS SECTION */}
          <main className="flex-1 w-full">
            <div className="relative mb-8 shadow-sm rounded-2xl overflow-hidden bg-white border border-[#1a3c2e]/5">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder={`Search in ${activeCategory.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all text-sm sm:text-base font-medium"
              />
            </div>

            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a3c2e]">{activeCategory}</h2>
              <span className="text-xs text-gray-400 font-medium">Showing {filteredProducts.length} results</span>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-2xl py-20 text-center border border-[#1a3c2e]/5">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-[#1a3c2e] mb-2">No Products Yet</h3>
                <p className="text-gray-500 text-sm">Add products from the Admin Panel.</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-[#1a3c2e]/5 relative flex flex-col justify-between hover:shadow-md transition-shadow duration-300 group cursor-pointer"
                  >
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-[#f97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg z-10">
                        {product.discount_percent}% OFF
                      </span>
                    )}
                    <div className="w-full aspect-square bg-[#f5f0e8]/50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {product.emoji || '🛒'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">{product.category}</p>
                      <h4 className="font-semibold text-[#1a3c2e] text-xs sm:text-sm line-clamp-2 min-h-[2rem] mb-2 leading-tight">
                        {product.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-1.5">
                        <span className="text-base sm:text-lg font-bold text-[#1a3c2e]">₹{product.price}</span>
                        {product.original_price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{product.original_price}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-[#1a3c2e] hover:bg-[#f97316] text-white w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl py-20 text-center border border-[#1a3c2e]/5">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#1a3c2e] mb-2">No Products Found</h3>
                <p className="text-gray-500 text-sm">Try changing category, search or price range.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}