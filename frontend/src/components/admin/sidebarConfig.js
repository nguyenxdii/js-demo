import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  UserOutlined,
  CommentOutlined,
  GiftOutlined,
  SafetyOutlined,
  SettingOutlined,
  SkinOutlined,
  PictureOutlined,
  LayoutOutlined,
} from "@ant-design/icons";

export const sidebarConfig = {
  user: {
    name: "Admin",
    email: "admin@exeshop.vn",
    avatar: "/logo-exeshop.png",
  },

  menuGroups: [
    {
      title: "Tổng quan",
      items: [
        {
          title: "Dashboard",
          icon: DashboardOutlined,
          url: "/admin/dashboard",
        },
      ],
    },
    {
      title: "Quản lý sản phẩm",
      items: [
        {
          title: "Sản phẩm",
          icon: ShoppingOutlined,
          url: "/admin/products",
        },
        {
          title: "Danh mục",
          icon: AppstoreOutlined,
          url: "/admin/categories",
        },
        {
          title: "Thương hiệu",
          icon: TagOutlined,
          url: "/admin/brands",
        },
      ],
    },
    {
      title: "Quản lý đơn hàng",
      items: [
        {
          title: "Đơn hàng",
          icon: ShoppingCartOutlined,
          url: "/admin/orders",
        },
        {
          title: "Thanh toán",
          icon: CreditCardOutlined,
          url: "/admin/payments",
        },
      ],
    },
    {
      title: "Quản lý khách hàng",
      items: [
        {
          title: "Người dùng",
          icon: UserOutlined,
          url: "/admin/users",
        },
        {
          title: "Đánh giá",
          icon: CommentOutlined,
          url: "/admin/comments",
        },
      ],
    },
    {
      title: "Khuyến mãi & Dịch vụ",
      items: [
        {
          title: "Voucher",
          icon: GiftOutlined,
          url: "/admin/vouchers",
        },
        {
          title: "Bảo hành",
          icon: SafetyOutlined,
          url: "/admin/warranties",
        },
      ],
    },
    {
      title: "Giao diện & Marketing",
      items: [
        {
          title: "Banner trang chủ",
          icon: PictureOutlined,
          url: "/admin/banners",
        },
        {
          title: "Bố cục trang chủ",
          icon: LayoutOutlined,
          url: "/admin/sections",
        },
      ],
    },
    {
      title: "Cài đặt",
      items: [
        {
          title: "Tài khoản",
          icon: UserOutlined,
          url: "/admin/settings/account",
        },
        {
          title: "Giao diện",
          icon: SkinOutlined,
          url: "/admin/settings/appearance",
        },
      ],
    },
  ],
};
