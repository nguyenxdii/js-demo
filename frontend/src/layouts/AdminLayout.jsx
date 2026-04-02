import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      // Chưa đăng nhập -> Redirect về login
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      // Kiểm tra role
      if (parsedUser.role !== "ADMIN") {
        // Không phải admin -> Redirect về trang chủ
        alert("Bạn không có quyền truy cập vào trang Admin!");
        navigate("/");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi component mount

  if (!user) {
    // Đang kiểm tra auth, hiển thị loading hoặc null
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
