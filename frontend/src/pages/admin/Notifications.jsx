import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/admin/AdminSidebar'
import api from '../../utils/api'
import { Send, Zap } from 'lucide-react'

export default function Notifications() {
  const [products, setProducts] = useState([])
  const [selectedDeals, setSelectedDeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products')
        setProducts(res.data)
      } catch (err) {
        console.error('Failed to fetch products')
      }
    }
    fetchProducts()
  }, [])

  const toggleDeal = (product) => {
    setSelectedDeals(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )
  }

  const handleSendDeals = async () => {
    if (selectedDeals.length === 0) {
      setError('Please select at least one product!')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/notifications/flash-deals', {
        deals: selectedDeals
      })
      setSuccess(res.data.message)
      setSelectedDeals([])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send flash deals!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a3c2e] font-sans flex flex-col md:flex-row antialiased">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Zap className="text-[#f97316]" /> Flash Deals Notifications
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Select products and send flash deal emails to all users
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center font-medium">
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* Selected Deals Count */}
        {selectedDeals.length > 0 && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl text-sm text-center font-medium">
            {selectedDeals.length} product(s) selected for flash deals
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => toggleDeal(product)}
              className={`bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                selectedDeals.find(p => p.id === product.id)
                  ? 'border-[#f97316] bg-orange-50'
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{product.emoji || '🛒'}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-900">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-[#1a3c2e]">₹{product.price}</span>
                    {product.original_price && (
                      <span className="text-xs line-through text-gray-400">₹{product.original_price}</span>
                    )}
                    {product.discount_percent && (
                      <span className="text-xs bg-orange-100 text-[#f97316] font-bold px-1.5 py-0.5 rounded-full">
                        {product.discount_percent}% OFF
                      </span>
                    )}
                  </div>
                </div>
                {selectedDeals.find(p => p.id === product.id) && (
                  <div className="w-6 h-6 bg-[#f97316] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSendDeals}
            disabled={loading || selectedDeals.length === 0}
            className="flex items-center gap-2 bg-[#f97316] hover:bg-[#e2620b] text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-70"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : `Send Flash Deals to All Users`}
          </button>
        </div>
      </main>
    </div>
  )
}