import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setCartOpen } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setReviewLoading(true);
    try {
      await api.post('/reviews', { product_id: id, ...reviewData });
      setReviewSuccess('Review submitted!');
      setReviewData({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  // Calculate rating breakdown from real reviews
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    stars: star,
    percentage: reviews.length
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🛒</div>
          <p className="text-[#1a3c2e] font-semibold">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="font-bold text-[#1a3c2e] mb-3">Product not found</h3>
          <button onClick={() => navigate('/products')}
            className="bg-[#1a3c2e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a3c2e] font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav className="text-sm font-medium text-gray-500">
            <span onClick={() => navigate('/')} className="hover:text-[#1a3c2e] cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span onClick={() => navigate('/products')} className="hover:text-[#1a3c2e] cursor-pointer">Products</span>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-[#1a3c2e] font-semibold">{product.name}</span>
          </nav>
          <button onClick={() => navigate(-1)}
            className="text-sm font-bold text-[#1a3c2e] hover:text-[#f97316] transition">
            ← Back
          </button>
        </div>

        {/* Product Block */}
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8">

          {/* Left — Image/Emoji */}
          <div className="relative bg-[#f5f0e8]/40 rounded-2xl flex items-center justify-center min-h-[320px] md:min-h-[400px] border border-gray-50">
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount_percent > 0 && (
                <span className="bg-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {product.discount_percent}% OFF
                </span>
              )}
            </div>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name}
                className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-[120px] lg:text-[150px] select-none drop-shadow-sm">
                {product.emoji || '🛒'}
              </span>
            )}
          </div>

          {/* Right — Details */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                {product.category}
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-[#f97316] text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < Math.round(avgRating) ? 'text-[#f97316]' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{avgRating}</span>
                  <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-black text-[#1a3c2e]">₹{product.price}</span>
                {product.original_price && (
                  <span className="text-base line-through text-gray-400">₹{product.original_price}</span>
                )}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold mb-6 ${
                product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between border border-gray-200 rounded-xl bg-gray-50/50 p-1 min-w-[130px]">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center font-bold text-lg rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 transition">
                  −
                </button>
                <span className="font-extrabold text-sm w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 flex items-center justify-center font-bold text-lg rounded-lg text-gray-600 hover:bg-white disabled:opacity-40 transition">
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 text-white text-sm font-bold py-3.5 px-6 rounded-xl shadow-md transition duration-150 disabled:opacity-50 ${
                  added ? 'bg-green-500' : 'bg-[#f97316] hover:bg-[#e2620b]'
                }`}>
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              💬 Verified Ratings & Reviews
            </h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-[#1a3c2e] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#f97316] transition">
                + Write Review
              </button>
            )}
          </div>

          {/* Review Success */}
          {reviewSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center font-medium">
              {reviewSuccess}
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-[#f5f0e8] rounded-2xl space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button"
                      onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition ${star <= reviewData.rating ? 'text-[#f97316]' : 'text-gray-200'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Comment</label>
                <textarea rows={3} required
                  value={reviewData.comment}
                  onChange={e => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500">Cancel</button>
                <button type="submit" disabled={reviewLoading}
                  className="px-4 py-2 bg-[#1a3c2e] text-white text-sm font-semibold rounded-xl disabled:opacity-70">
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8 pb-8 border-b border-gray-100">
              <div className="bg-[#f5f0e8]/30 border border-gray-100 rounded-2xl p-6 text-center">
                <span className="text-5xl font-black text-[#1a3c2e] leading-none mb-1 block">{avgRating}</span>
                <div className="flex justify-center text-[#f97316] text-lg mb-1">★★★★★</div>
                <span className="text-xs text-gray-500 font-medium">Out of 5 Stars</span>
              </div>
              <div className="lg:col-span-2 space-y-2.5 w-full">
                {breakdown.map(row => (
                  <div key={row.stars} className="flex items-center text-xs font-bold gap-3">
                    <span className="w-8 text-gray-500 text-right">{row.stars}★</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f97316] rounded-full" style={{ width: `${row.percentage}%` }} />
                    </div>
                    <span className="w-10 text-gray-400 font-medium">{row.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-5 rounded-2xl border border-gray-50 bg-gray-50/40 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1a3c2e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {review.user_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900">{review.user_name || 'User'}</h4>
                        <span className="text-[11px] font-medium text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-[#f97316] text-xs">
                      {Array.from({ length: review.rating }).map((_, idx) => <span key={idx}>★</span>)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed ml-13">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}