import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { Search, Edit2, Trash2, X, Save } from 'lucide-react';
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

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal state
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (confirm(`Delete "${name}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleEditOpen = (product) => {
    setEditProduct(product);

    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price,
      original_price: product.original_price || '',
      stock: product.stock,
      discount_percent: product.discount_percent || '',
      description: product.description || '',
      emoji: product.emoji || '🛒',
      is_deal: product.is_deal || false,
    });

    setEditImageUrl(product.image_url || '');
  };

  const handleEditSave = async () => {
    setEditLoading(true);

    try {
      await api.put(`/products/${editProduct.id}`, {
        ...editForm,
        image_url: editImageUrl || null,
      });

      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a3c2e] font-sans flex flex-col md:flex-row antialiased">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Active Inventory Catalog
            </h2>

            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Modify, review, or adjust item parameters.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Filter by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] bg-white shadow-sm"
            />

            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-500 font-medium">
            Loading products...
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-500 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100 tracking-wider">
                    <th className="px-6 py-3.5 text-center w-16">
                      Visual
                    </th>

                    <th className="px-6 py-3.5">
                      Product Name
                    </th>

                    <th className="px-6 py-3.5">
                      Category
                    </th>

                    <th className="px-6 py-3.5">
                      Price
                    </th>

                    <th className="px-6 py-3.5 text-center">
                      Stock
                    </th>

                    <th className="px-6 py-3.5">
                      Discount
                    </th>

                    <th className="px-6 py-3.5">
                      Deal
                    </th>

                    <th className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50/40 transition"
                      >
                        {/* Visual */}
                        <td className="px-6 py-3.5 text-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg mx-auto"
                            />
                          ) : (
                            <span className="text-2xl">
                              {product.emoji || '🛒'}
                            </span>
                          )}
                        </td>

                        {/* Name */}
                        <td className="px-6 py-3.5 font-bold text-gray-900">
                          {product.name}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-3.5 text-xs text-gray-500 font-medium">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-3.5">
                          <span className="font-extrabold text-[#1a3c2e]">
                            ₹{product.price}
                          </span>

                          {product.original_price && (
                            <span className="text-xs text-gray-400 line-through ml-1">
                              ₹{product.original_price}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-3.5 text-center font-bold">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs rounded-md ${
                              product.stock <= 15
                                ? 'bg-rose-50 text-rose-700 font-black'
                                : 'text-gray-700'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="px-6 py-3.5">
                          {product.discount_percent > 0 && (
                            <span className="text-[10px] bg-orange-50 text-[#f97316] font-extrabold px-2 py-0.5 rounded-full border border-orange-100">
                              {product.discount_percent}% OFF
                            </span>
                          )}
                        </td>

                        {/* Deal */}
                        <td className="px-6 py-3.5">
                          {product.is_deal ? (
                            <span className="text-[10px] bg-orange-100 text-[#f97316] font-black px-2 py-1 rounded-full">
                              🔥 DEAL
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleEditOpen(product)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-[#1a3c2e] hover:bg-gray-50 transition"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50/50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-12 text-center text-sm font-medium text-gray-400"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setEditProduct(null)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#1a3c2e] text-lg">
                  Edit Product
                </h3>

                <button
                  onClick={() => setEditProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">

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
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-[#f5f0e8] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {editImageUrl ? (
                          <img
                            src={editImageUrl}
                            alt="preview"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <span className="text-2xl">
                            {editForm.emoji || '🛒'}
                          </span>
                        )}
                      </div>

                      <div>
                        <IKUpload
                          fileName={`product_edit_${Date.now()}`}
                          folder="/mymart/products"
                          onUploadStart={() => setEditUploading(true)}
                          onSuccess={(res) => {
                            setEditImageUrl(res.url);
                            setEditUploading(false);
                          }}
                          onError={() => setEditUploading(false)}
                          className="hidden"
                          id="ik-edit-upload"
                        />

                        <label
                          htmlFor="ik-edit-upload"
                          className="cursor-pointer inline-flex items-center gap-2 bg-[#1a3c2e] hover:bg-[#f97316] text-white text-xs font-semibold px-3 py-2 rounded-xl transition"
                        >
                          {editUploading
                            ? '⏳ Uploading...'
                            : '📷 Change Image'}
                        </label>

                        {editImageUrl && (
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            ✅ Image ready
                          </p>
                        )}
                      </div>
                    </div>
                  </IKContext>
                </div>

                {/* Name & Emoji */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Name
                    </label>

                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Emoji
                    </label>

                    <input
                      value={editForm.emoji}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          emoji: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-center text-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Category
                  </label>

                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Price (₹)
                    </label>

                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Original Price (₹)
                    </label>

                    <input
                      type="number"
                      value={editForm.original_price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          original_price: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Stock
                    </label>

                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          stock: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Discount (%)
                    </label>

                    <input
                      type="number"
                      value={editForm.discount_percent}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          discount_percent: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c2e]"
                  />
                </div>

                {/* Deal Toggle */}
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <input
                    type="checkbox"
                    checked={editForm.is_deal}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        is_deal: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#f97316]"
                  />

                  <p className="text-sm font-bold text-[#1a3c2e]">
                    🔥 Mark as Deal
                  </p>
                </label>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditProduct(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleEditSave}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#1a3c2e] rounded-xl hover:bg-[#f97316] transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <Save size={14} />

                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}