import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import OrderDetail from './pages/customer/OrderDetail';
import Addresses from './pages/customer/Addresses';
import Deals from './pages/customer/Deals';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AddProduct from './pages/admin/AddProduct';
import ProductsList from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import DeliveryPartners from './pages/admin/DeliveryPartners';
import Notifications from './pages/admin/Notifications';

// Delivery Pages
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-orders/:id" element={<OrderDetail />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/deals" element={<Deals />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
          <Route path="/admin/products" element={<ProductsList />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/delivery" element={<DeliveryPartners />} />
          <Route path="/admin/notifications" element={<Notifications />} />

          {/* Delivery Routes */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}