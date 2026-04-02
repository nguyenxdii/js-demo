import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, UserOutlined, BellOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Badge, Popover, List, Typography, Button } from "antd";
import SidebarGroup from "./SidebarGroup";
import { sidebarConfig } from "./sidebarConfig";
import { authAPI } from "../../services/api";
import { notificationService } from "../../services/notificationService";
const { Text } = Typography;

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Cập nhật mỗi 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getUnread();
      setNotifications(data);
    } catch (error) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {}
  };

  const notificationContent = (
    <div className="w-80">
      <div className="flex justify-between items-center mb-2 border-b pb-2">
        <Text strong>Thông báo mới nhất</Text>
        <Badge count={notifications.length} size="small" />
      </div>
      <List
        size="small"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item 
            className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            onClick={() => handleMarkRead(item.id)}
          >
            <List.Item.Meta
              avatar={<ThunderboltOutlined className="text-red-500 mt-1" />}
              title={<span className="text-[12px] font-bold">{item.title}</span>}
              description={
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-500 line-clamp-2">{item.message}</span>
                  <span className="text-[9px] text-gray-400 mt-1">Vừa cập nhật</span>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: <div className="p-4 text-center text-gray-400">Không có thông báo mới</div> }}
      />
    </div>
  );

  const handleLogout = () => {
    authAPI.logout();
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo/Brand + Notifications */}
      <div
        className="h-16 flex items-center justify-between px-4 border-b border-gray-200 cursor-pointer flex-shrink-0"
      >
        <img
          src="/logo-exeshop.png"
          alt="EXEShop Logo"
          className="h-8 w-auto object-contain"
          onClick={() => navigate("/admin/dashboard")}
        />
        
        <Popover 
          content={notificationContent} 
          title="Thông báo hệ thống" 
          trigger="click" 
          placement="bottomRight"
        >
          <div className="hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center relative">
            <Badge count={notifications.length} size="small" offset={[2, -2]}>
              <BellOutlined style={{ fontSize: '18px', color: '#374151' }} />
            </Badge>
          </div>
        </Popover>
      </div>

      {/* Navigation with custom scrollbar */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {sidebarConfig.menuGroups.map((group, index) => (
          <SidebarGroup key={index} group={group} />
        ))}
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <Dropdown menu={{ items: userMenuItems }} placement="topRight">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
            <Avatar
              style={{ backgroundColor: "#ff4d4f" }}
              icon={<UserOutlined />}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || "Admin"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || "admin@exeshop.vn"}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </aside>
  );
}
