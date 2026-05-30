import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function CartSidebar() {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart()
  const navigate = useNavigate()

  if (!cartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#1a3c2e]" />
            <h2 className="font-bold text-lg text-[#1a3c2e]">My Cart</h2>
            <span className="bg-[#f97316] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="font-bold text-[#1a3c2e] text-lg mb-1">Cart is empty</h3>
              <p className="text-gray-400 text-sm mb-6">Add items to get started</p>
              <button
                onClick={() => { setCartOpen(false); navigate('/products'); }}
                className="bg-[#1a3c2e] text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-[#f5f0e8]/50 rounded-2xl p-3">

                {/* Emoji */}
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {item.emoji || '🛒'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#1a3c2e] text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-[#f97316] font-bold text-sm">₹{item.price}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[#1a3c2e] text-white flex items-center justify-center hover:bg-[#1a3c2e]/90"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-bold text-[#1a3c2e] text-lg">₹{totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { setCartOpen(false); navigate('/checkout'); }}
              className="w-full bg-[#1a3c2e] hover:bg-[#f97316] text-white font-bold py-3.5 rounded-xl transition-colors duration-200 text-sm"
            >
              Proceed to Checkout →
            </button>
            <button
              onClick={() => { setCartOpen(false); navigate('/products'); }}
              className="w-full bg-[#f5f0e8] text-[#1a3c2e] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#f5f0e8]/80"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}