import { useNavigate, useLocation } from "react-router-dom";

export default function SidebarItem({ item }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = location.pathname === item.url;

  const handleLinkClick = () => {
    navigate(item.url);
  };

  const Icon = item.icon;

  return (
    <div
      onClick={handleLinkClick}
      className={`
        flex items-center gap-3 px-3 py-2 mx-2 rounded-md cursor-pointer
        transition-colors duration-200
        ${
          isActive
            ? "bg-red-50 text-red-600"
            : "text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      <Icon style={{ fontSize: "18px" }} />
      <span className="text-sm font-medium">{item.title}</span>
    </div>
  );
}
