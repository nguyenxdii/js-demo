import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  MenuOutlined,
  RightOutlined
} from "@ant-design/icons";
import { Badge, Dropdown, Avatar } from "antd";
import { useCart } from "../contexts/CartContext";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";

export default function MainLayout() {
  const { cartCount } = useCart();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimer = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await categoryService.getCategoryTree();
        setCategories(tree || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();

    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }

    // Đóng search dropdown khi click ra ngoài
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search với debounce
  const handleSearch = (value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) { setSearchResults([]); setShowSearch(false); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await productService.getAllProducts({ keyword: value, limit: 6 });
        setSearchResults(res.products || []);
        setShowSearch(true);
      } catch (e) { console.error(e); }
    }, 300);
  };

  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    return `http://localhost:8080${cleanUrl.startsWith("/") ? cleanUrl : "/" + cleanUrl}`;
  };

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-logout"));
    navigate("/login");
  };

  const userMenuItems = [
    ...(user?.role === 'ADMIN' ? [{ key: 'admin', label: 'Quản trị hệ thống', icon: <DashboardOutlined />, onClick: () => navigate("/admin") }] : []),
    { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined />, onClick: () => navigate("/profile") },
    { key: 'orders', label: 'Đơn hàng của tôi', icon: <ShoppingOutlined />, onClick: () => navigate("/orders") },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true, onClick: handleLogout }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
              <div className="w-1 h-7 bg-orange-500 rounded-full"></div>
              <div className="leading-none">
                <h1 className="text-base font-bold text-slate-900 m-0 tracking-tighter leading-none uppercase italic logo-font">Sport Gear</h1>
                <span className="text-[8px] font-medium text-gray-400 tracking-[0.2em] uppercase">Studio</span>
              </div>
            </Link>

            {/* NÚT DANH MỤC - MÀU TRẮNG */}
            <div className="cat-menu-wrapper relative h-full flex items-center">
              <button className="flex items-center gap-2 bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold hover:border-orange-500 hover:text-orange-500 transition-all cursor-pointer">
                <MenuOutlined className="text-sm" />
                <span className="hidden sm:inline">Danh mục</span>
              </button>

              {/* DROPDOWN DANH MỤC DỌC */}
              <div className="cat-dropdown">
                <ul className="cat-list">
                  {/* Link xem tất cả sản phẩm */}
                  <li className="cat-list-item">
                    <Link to="/products" className="cat-list-link" style={{ color: '#2563eb', fontWeight: 600 }}>
                      <span>Tất cả sản phẩm</span>
                    </Link>
                  </li>
                  <li style={{ borderBottom: '1px solid #f1f5f9', margin: '4px 0' }}></li>

                  {Array.isArray(categories) && categories.map((cat) => (
                    <li key={cat._id} className="cat-list-item">
                      <Link to={`/products?category=${cat._id}`} className="cat-list-link">
                        <span>{cat.name}</span>
                        {cat.children && cat.children.length > 0 && (
                          <RightOutlined className="text-[10px] text-gray-300" />
                        )}
                      </Link>

                      {/* SUB-PANEL: Hình trên + Text dưới */}
                      {cat.children && cat.children.length > 0 && (
                        <div className="cat-sub-panel">
                          <div className="grid grid-cols-3 gap-4">
                            {cat.children.map((sub) => (
                              <Link 
                                key={sub._id}
                                to={`/products?category=${sub._id}`}
                                className="cat-sub-card"
                              >
                                <div className="cat-sub-img">
                                  <img 
                                    src={getFullImageUrl(sub.imageUrl)} 
                                    alt={sub.name}
                                    onError={(e) => { e.target.src = "/images/cat-placeholder.png"; }}
                                  />
                                </div>
                                <span className="cat-sub-name">{sub.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* THANH TÌM KIẾM - GẦN HƠN + LIVE SEARCH */}
            <div className="flex-1 max-w-md relative" ref={searchRef}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowSearch(true); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:bg-white focus:border-orange-500 transition-all"
                />
                <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* SEARCH DROPDOWN */}
              {showSearch && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((p) => (
                    <Link 
                      key={p._id}
                      to={`/product/${p.slug}`}
                      className="search-item"
                      onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                    >
                      <img 
                        src={getFullImageUrl(p.mainImageUrl)} 
                        alt={p.name}
                        className="search-item-img"
                        onError={(e) => { e.target.src = "/images/cat-placeholder.png"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate m-0">{p.name}</p>
                        <p className="text-sm text-red-500 font-bold m-0">{formatPrice(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Giỏ hàng + text */}
            <Link to="/cart" className="flex items-center gap-2 no-underline group shrink-0">
              <Badge count={cartCount} offset={[0, 0]} size="small">
                <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-600 flex items-center justify-center text-gray-600 group-hover:text-white transition-all">
                  <ShoppingCartOutlined className="text-base" />
                </div>
              </Badge>
              <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 transition-colors hidden sm:inline">Giỏ hàng</span>
            </Link>
            
            {/* User */}
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
                <div className="flex items-center gap-2 cursor-pointer group shrink-0">
                  <Avatar 
                    src={user.avatarUrl ? getFullImageUrl(user.avatarUrl) : "/user-default.jpg"} 
                    icon={<UserOutlined />} 
                    className="border-2 border-transparent group-hover:border-orange-500 transition-all w-8 h-8 flex items-center justify-center overflow-hidden"
                  />
                  <span className="text-xs font-medium text-slate-600 hidden lg:inline">{user.fullName}</span>
                </div>
              </Dropdown>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold text-xs whitespace-nowrap shrink-0">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 mt-auto border-t border-slate-900">
        <div className="container mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex flex-col leading-none border-l-2 border-orange-500 pl-3">
                <span className="text-xl font-bold text-white tracking-tighter logo-font italic">SPORT GEAR</span>
                <span className="text-[10px] font-semibold text-gray-500 tracking-[0.4em] ml-0.5">STUDIO</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[240px]">Nâng tầm trải nghiệm tập luyện với trang phục và dụng cụ thể thao cao cấp. Đồng hành cùng bạn trên mọi hành trình chinh phục đỉnh cao.</p>
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-300">Sản phẩm</h3>
              <ul className="list-none p-0 space-y-3 text-[11px] text-gray-500">
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Hàng mới về</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Sản phẩm bán chạy</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Bộ sưu tập Premium</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-300">Hỗ trợ</h3>
              <ul className="list-none p-0 space-y-3 text-[11px] text-gray-500">
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors text-gray-500 no-underline">Liên hệ tư vấn</Link></li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Chính sách đổi trả</li>
                <li className="hover:text-orange-500 cursor-pointer transition-colors">Câu hỏi thường gặp</li>
              </ul>
            </div>
            
            <div className="space-y-5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-300">Bản tin</h3>
              <p className="text-[10px] text-gray-500">Đăng ký nhận tin để không bỏ lỡ các ưu đãi mới nhất.</p>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Nhập email của bạn..." 
                  className="bg-slate-900/50 border border-slate-800 rounded-full px-4 py-2.5 text-[11px] w-full outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 text-white transition-all pr-12" 
                />
                <button className="absolute right-1 top-1 bottom-1 bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-full font-bold text-[9px] uppercase transition-all shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95">
                  Gửi
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest italic">© 2024 Sport Gear Studio. Explore your potential.</p>
            <div className="flex gap-6">
                 <span className="text-[9px] text-gray-600 hover:text-gray-400 cursor-pointer uppercase tracking-widest transition-colors font-bold">Facebook</span>
                 <span className="text-[9px] text-gray-600 hover:text-gray-400 cursor-pointer uppercase tracking-widest transition-colors font-bold">Instagram</span>
                 <span className="text-[9px] text-gray-600 hover:text-gray-400 cursor-pointer uppercase tracking-widest transition-colors font-bold">Youtube</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
