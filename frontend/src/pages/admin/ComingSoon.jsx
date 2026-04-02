import { RocketOutlined } from "@ant-design/icons";

export default function ComingSoon({ title = "Tính năng" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <RocketOutlined style={{ fontSize: "64px", color: "#ff4d4f" }} />
      <h2 className="text-2xl font-bold text-gray-800 mt-6">{title}</h2>
      <p className="text-gray-500 mt-2">Tính năng đang được phát triển</p>
      <p className="text-sm text-gray-400 mt-1">Vui lòng quay lại sau</p>
    </div>
  );
}
