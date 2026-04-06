import React from "react";
import Slider from "react-slick";
import PremiumProductCard from "./PremiumProductCard";
import { Typography, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title } = Typography;

const StandardSection = ({ section, sliderSettings }) => {
  if (!section || !section.products || section.products.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden relative group">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-2">
        <div className="flex items-center w-full md:w-auto">
          {/* Multi-layered Slanted Title */}
          <div className="relative flex items-center min-w-[200px] -ml-8">
            {/* Background Layer 1: Dark Depth */}
            <div className="absolute inset-0 bg-[#0a191e] clip-path-slanted translate-x-2 translate-y-1 opacity-20"></div>
            
            {/* Background Layer 2: Orange Gradient */}
            <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 px-8 pr-12 clip-path-slanted flex items-center shadow-lg">
              <Title level={4} className="!m-0 !text-lg !font-bold !text-white uppercase tracking-tight">
                {section.title || "DYNAMIC SECTION"}
              </Title>
              {/* Subtle shine effect */}
              <div className="absolute top-0 right-0 h-full w-4 bg-white/10 skew-x-[-20deg] -mr-2"></div>
            </div>
          </div>
        </div>

        <Link to={`/products?sectionId=${section._id}`} className="flex-shrink-0">
          <Button type="link" className="group/btn flex items-center gap-1 font-bold text-slate-400 hover:text-[#f97316] p-0 h-auto text-xs uppercase tracking-tighter">
            Xem tất cả <RightOutlined className="text-[8px] group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Slider {...sliderSettings}>
          {section.products.map((product) => (
            <div key={product._id} className="px-3 pb-6">
              <PremiumProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default StandardSection;
