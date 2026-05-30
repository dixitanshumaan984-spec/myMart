import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { IKContext, IKUpload } from 'imagekitio-react';
import { IMAGEKIT_URL, IMAGEKIT_PUBLIC_KEY } from '../../utils/api';

const CATEGORIES = [
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

const authenticator = async () => {
  const res = await api.get('/upload/auth');
  return res.data;
};

export default function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    original_price: '',
    stock: '',
    discount_percent: '',
    description: '',
    emoji: '🛒',
    is_deal: false,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onUploadStart = () => {
    setUploading(true);
    setError('');
  };

  const onUploadSuccess = (res) => {
    setImageUrl(res.url);
    setPreview(res.url);
    setUploading(false);
  };

  const onUploadError = () => {
    setError('Image upload failed. Try again.');
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/products', {
        ...formData,
        image_url: imageUrl || null,
      });

      setSuccess('Product added successfully!');

      setFormData({
        name: '',
        category: '',
        price: '',
        original_price: '',
        stock: '',
        discount_percent: '',
        description: '',
        emoji: '🛒',
        is_deal: false,
      });

      setImageUrl('');
      setPreview('');

      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a3c2e] font-sans flex flex-col md:flex-row antialiased">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Add New Product
          </h2>

          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Add products to your live catalog
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100/60 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Product Image
              </label>

              <IKContext
                publicKey={IMAGEKIT_PUBLIC_KEY}
                urlEndpoint={IMAGEKIT_URL}
                authenticator={authenticator}
              >
                <div className="flex items-center gap-4">

                  {/* Preview */}
                  <div className="w-24 h-24 bg-[#f5f0e8] rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-3xl">
                        {formData.emoji || '🛒'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <IKUpload
                      fileName={`product_${Date.now()}`}
                      folder="/mymart/products"
                      onUploadStart={onUploadStart}
                      onSuccess={onUploadSuccess}
                      onError={onUploadError}
                      className="hidden"
                      id="ik-upload"
                    />

                    <label
                      htmlFor="ik-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-[#1a3c2e] hover:bg-[#f97316] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                    >
                      {uploading ? '⏳ Uploading...' : '📷 Upload Image'}
                    </label>

                    <p className="text-xs text-gray-400 mt-2">
                      JPG, PNG, WEBP — Max 5MB. Or use emoji below if no image.
                    </p>

                    {imageUrl && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        ✅ Image uploaded!
                      </p>
                    )}
                  </div>
                </div>
              </IKContext>
            </div>

            {/* Name & Emoji */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Organic Alphonso Mangoes"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Emoji (fallback)
                </label>

                <input
                  type="text"
                  name="emoji"
                  placeholder="🍎"
                  value={formData.emoji}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-center text-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Category
              </label>

              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] font-medium text-gray-800"
              >
                <option value="" disabled>
                  Select Category
                </option>

                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Selling Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  required
                  placeholder="240"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Original Price (₹)
                </label>

                <input
                  type="number"
                  name="original_price"
                  placeholder="300"
                  value={formData.original_price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  required
                  placeholder="150"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Discount (%)
                </label>

                <input
                  type="number"
                  name="discount_percent"
                  placeholder="20"
                  value={formData.discount_percent}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] text-[#f97316] font-bold"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Description
              </label>

              <textarea
                name="description"
                rows="4"
                required
                placeholder="Describe the product..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] leading-relaxed"
              />
            </div>

            {/* Deal Toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-orange-50 rounded-xl border border-orange-100">
              <input
                type="checkbox"
                checked={formData.is_deal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_deal: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#f97316]"
              />

              <div>
                <p className="text-sm font-bold text-[#1a3c2e]">
                  🔥 Mark as Deal
                </p>

                <p className="text-xs text-gray-400">
                  This product will appear on the Deals page
                </p>
              </div>
            </label>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-[#1a3c2e] hover:bg-[#122a20] text-white font-bold text-sm px-6 py-3 rounded-xl transition duration-150 shadow-sm disabled:opacity-70"
              >
                {loading
                  ? 'Adding Product...'
                  : 'Add Product to Live Catalog'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}