import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { ConfigProvider } from "antd";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ComingSoon from "./pages/admin/ComingSoon";
import CategoryManagement from "./pages/admin/categories/CategoryManagement";
import ProductManagement from "./pages/admin/products/ProductManagement";
import BrandManagement from "./pages/admin/brands/BrandManagement";
import OrderManagement from "./pages/admin/orders/OrderManagement";
import UserManagement from "./pages/admin/users/UserManagement";
import CommentManagement from "./pages/admin/comments/CommentManagement";
import VoucherManagement from "./pages/admin/vouchers/VoucherManagement";
import PaymentManagement from "./pages/admin/payments/PaymentManagement";
import BannerManagement from "./pages/admin/banners/BannerManagement";
import SectionManagement from "./pages/admin/sections/SectionManagement";
import HomePage from "./pages/client/HomePage";
import ProductDetail from "./pages/client/ProductDetail";
import ProductList from "./pages/client/ProductList";
import CartPage from "./pages/client/CartPage";
import CheckoutPage from "./pages/client/CheckoutPage";
import PaymentReturn from "./pages/client/PaymentReturn";
import OrdersPage from "./pages/client/OrdersPage";
import ProfilePage from "./pages/client/ProfilePage";
import ContactPage from "./pages/client/ContactPage";
import VerifyOtp from "./pages/auth/VerifyOtp";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <CartProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="brands" element={<BrandManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route
                path="payments"
                element={<PaymentManagement />}
              />
              <Route path="users" element={<UserManagement />} />
              <Route path="comments" element={<CommentManagement />} />
              <Route path="vouchers" element={<VoucherManagement />} />
              <Route path="banners" element={<BannerManagement />} />
              <Route path="sections" element={<SectionManagement />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="product" element={<Navigate to="/products" replace />} />
              <Route
                path="products"
                element={<ProductList />}
              />
              <Route
                path="deals"
                element={
                  <div className="container mx-auto p-8 text-xl">
                    Deals (Coming soon)
                  </div>
                }
              />
              <Route
                path="contact"
                element={<ContactPage />}
              />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="payment/momo-return" element={<PaymentReturn />} />
              <Route path="payment/success" element={<PaymentReturn />} />
              <Route path="wallet/callback" element={<PaymentReturn />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center text-2xl">
                  404 - Error
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
