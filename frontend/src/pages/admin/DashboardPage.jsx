import React, { useState, useEffect } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Spin,
  Empty,
  Tabs,
  Tag,
  Button,
  Space,
  Typography,
  List,
  Pagination,
  Select,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  NotificationOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/api";

const { Text } = Typography;
const { Option } = Select;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    monthlyRevenue: [],
    topProducts: [],
    notifications: [],
    totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifPage, setNotifPage] = useState(1);
  const [timeRange, setTimeRange] = useState("30days");
  const [fetchingNotifs, setFetchingNotifs] = useState(false);

  const fetchStats = async (page = 1, range = "30days") => {
    if (page === 1) setLoading(true);
    else setFetchingNotifs(true);

    try {
      const response = await axiosInstance.get(
        `/admin/dashboard/stats?notifPage=${page}&range=${range}`,
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
      setFetchingNotifs(false);
    }
  };

  useEffect(() => {
    fetchStats(notifPage, timeRange);
  }, [notifPage, timeRange]);

  const handleExportCSV = () => {
    if (!stats.monthlyRevenue || stats.monthlyRevenue.length === 0) return;

    // Thêm BOM (\uFEFF) để Excel nhận diện đúng font Tiếng Việt (UTF-8)
    let csvContent = "\uFEFF";
    csvContent += "Thời gian,Doanh thu (VND)\n";

    stats.monthlyRevenue.forEach((row) => {
      csvContent += `${row.name},${row.revenue}\n`;
    });

    csvContent += "\nTop sản phẩm bán chạy nhất\n";
    csvContent += "Tên sản phẩm,Số lượng bán\n";
    stats.topProducts.forEach((row) => {
      csvContent += `${row.name.replace(/,/g, "")},${row.sales}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Bao_Cao_SGS_${timeRange}_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Không dùng màn hình loading toàn trang để tránh mất trạng thái Tab
  const [activeTab, setActiveTab] = useState("overview");

  const OverviewTab = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-none bg-white overflow-hidden relative group rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <DollarOutlined className="text-6xl text-green-600" />
          </div>
          <Statistic
            title={
              <span className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">
                Doanh thu thuần
              </span>
            }
            value={stats.totalRevenue}
            precision={0}
            valueStyle={{
              color: "#059669",
              fontWeight: "700",
              fontSize: "1.75rem",
            }}
            suffix="₫"
          />
        </Card>
        <Card className="shadow-sm border-none bg-white overflow-hidden relative group rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingCartOutlined className="text-6xl text-blue-600" />
          </div>
          <Statistic
            title={
              <span className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">
                Tổng đơn hàng
              </span>
            }
            value={stats.totalOrders}
            valueStyle={{
              color: "#2563eb",
              fontWeight: "700",
              fontSize: "1.75rem",
            }}
          />
        </Card>
        <Card className="shadow-sm border-none bg-white overflow-hidden relative group rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <UserOutlined className="text-6xl text-red-600" />
          </div>
          <Statistic
            title={
              <span className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">
                Khách hàng
              </span>
            }
            value={stats.totalUsers}
            valueStyle={{
              color: "#dc2626",
              fontWeight: "700",
              fontSize: "1.75rem",
            }}
          />
        </Card>
        <Card className="shadow-sm border-none bg-white overflow-hidden relative group rounded-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingOutlined className="text-6xl text-purple-600" />
          </div>
          <Statistic
            title={
              <span className="text-gray-500 font-semibold uppercase tracking-widest text-[10px]">
                Danh mục SP
              </span>
            }
            value={stats.totalProducts}
            valueStyle={{
              color: "#7c3aed",
              fontWeight: "700",
              fontSize: "1.75rem",
            }}
          />
        </Card>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <NotificationOutlined className="text-orange-500 text-lg" />
          <span className="text-gray-800 font-bold uppercase tracking-wider">
            Hoạt động mới nhất
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
          <Spin spinning={fetchingNotifs}>
            <List
              itemLayout="horizontal"
              dataSource={stats.notifications}
              renderItem={(item, index) => {
                let tagColor = "blue";
                let tagLabel = "HỆ THỐNG";
                let Icon = NotificationOutlined;

                switch (item.type) {
                  case "STOCK":
                    tagColor = "volcano";
                    tagLabel = "KHO HÀNG";
                    Icon = ShoppingOutlined;
                    break;
                  case "ORDER":
                    tagColor = "blue";
                    tagLabel = "ĐƠN HÀNG";
                    Icon = ShoppingCartOutlined;
                    break;
                  case "PAYMENT":
                    tagColor = "success";
                    tagLabel = "THANH TOÁN";
                    Icon = DollarOutlined;
                    break;
                  case "VOUCHER":
                    tagColor = "orange";
                    tagLabel = "KHUYẾN MÃI";
                    Icon = ThunderboltOutlined;
                    break;
                }

                return (
                  <List.Item
                    key={index}
                    className="hover:bg-gray-50 px-4 py-3 rounded-xl transition-all cursor-pointer group"
                    onClick={() => navigate(item.link || "/admin")}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                          <Icon className="text-lg" />
                        </div>
                      }
                      title={
                        <Space align="center" className="mb-0.5">
                          <Tag
                            color={tagColor}
                            className="font-semibold border-none px-2 py-0 rounded-md uppercase text-[8px]"
                          >
                            {tagLabel}
                          </Tag>
                          <span className="font-semibold text-gray-800 text-[14px]">
                            {item.message}
                          </span>
                        </Space>
                      }
                      description={
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : "Vừa xong"}
                        </div>
                      }
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRightOutlined className="text-gray-400" />
                    </div>
                  </List.Item>
                );
              }}
              locale={{
                emptyText: <Empty description="Chua co thong bao moi" />,
              }}
            />
            <div className="mt-8 flex justify-center">
              <Pagination
                current={notifPage}
                total={stats.totalNotifications}
                pageSize={10}
                onChange={(page) => setNotifPage(page)}
                className="custom-pagination"
                showSizeChanger={false}
              />
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="flex flex-col gap-6">
      <Row gutter={[24, 24]}>
        <Col span={24} lg={16}>
          <Card
            title={
              <div className="font-bold flex items-center gap-2 text-blue-600 uppercase tracking-tighter">
                <BarChartOutlined /> Biểu đồ Doanh thu (vnđ) -{" "}
                {timeRange === "7days" || timeRange === "30days"
                  ? "Theo ngày"
                  : "Theo tháng"}
              </div>
            }
            className="shadow-sm border-none rounded-2xl overflow-hidden"
          >
            {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <div style={{ width: "100%", height: 400 }} className="pt-4">
                <ResponsiveContainer>
                  <AreaChart
                    data={stats.monthlyRevenue}
                    margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 700 }}
                      interval={timeRange === "30days" ? 2 : 0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#d1d5db", fontSize: 10 }}
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        padding: "15px",
                      }}
                      formatter={(value) => [
                        `${value.toLocaleString()} ₫`,
                        "Doanh thu",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      strokeWidth={4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chua co so lieu" />
            )}
          </Card>
        </Col>
        <Col span={24} lg={8}>
          <Card
            title={
              <div className="font-bold flex items-center gap-2 text-red-600 uppercase tracking-tighter">
                <ThunderboltOutlined /> Top 5 Bán chạy (
                {timeRange === "7days"
                  ? "Tuần"
                  : timeRange === "30days"
                    ? "Tháng"
                    : timeRange === "90days"
                      ? "Quý"
                      : "Tất cả"}
                )
              </div>
            }
            className="shadow-sm border-none rounded-2xl overflow-hidden h-full"
          >
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={stats.topProducts}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={100}
                      tick={{ fill: "#4b5563", fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value) => [`${value} don vi`, "Da ban"]}
                    />
                    <Bar dataKey="sales" radius={[0, 10, 10, 0]}>
                      {stats.topProducts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chua co du lieu san pham" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="dashboard-container max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-50 mb-8">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 m-0 leading-none">
            Bảng Điều Khiển
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 block">
            Sport Gear Studio Dashboard
          </span>
        </div>

        <Space wrap>
          <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-gray-100">
            <CalendarOutlined className="text-blue-500" />
            <Select
              value={timeRange}
              onChange={(val) => setTimeRange(val)}
              className="w-40 font-bold text-gray-700"
              variant="borderless"
            >
              <Option value="7days">7 ngày qua</Option>
              <Option value="30days">30 ngày qua</Option>
              <Option value="90days">Quý này</Option>
              <Option value="365days">Một năm qua</Option>
              <Option value="all">Tất cả</Option>
            </Select>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchStats(notifPage, timeRange)}
            className="flex items-center gap-2 font-bold border-none shadow-sm hover:text-blue-600 h-10 px-6 rounded-xl bg-gray-50 text-[12px] uppercase tracking-wider"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            className="flex items-center gap-2 font-bold border-none shadow-lg h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-[12px] uppercase tracking-wider"
          >
            Xuất CSV
          </Button>
        </Space>
      </div>

      <Spin spinning={loading} size="large" tip="Đang cập nhật dữ liệu...">
        <Tabs
          activeKey={activeTab}
          onChange={(val) => setActiveTab(val)}
          className="admin-tabs custom-tabs"
          items={[
            {
              key: "overview",
              label: (
                <span className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest">
                  <DashboardOutlined /> Tổng quan
                </span>
              ),
              children: <OverviewTab />,
            },
            {
              key: "stats",
              label: (
                <span className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest">
                  <BarChartOutlined /> Thống kê chi tiết
                </span>
              ),
              children: <StatsTab />,
            },
          ]}
        />
      </Spin>
    </div>
  );
}
