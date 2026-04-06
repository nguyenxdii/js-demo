import React from "react";
import Slider from "react-slick";
import PremiumProductCard from "./PremiumProductCard";
import CountdownTimer from "./CountdownTimer";
import { Typography, Button } from "antd";
import { FireOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const FlashSaleSection = ({ section, sliderSettings }) => {
  if (!section || !section.products || section.products.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden relative group mt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-gray-50 pb-6">
        <div className="flex items-center w-full md:w-auto">
          {/* Multi-layered Slanted Title */}
          <div className="relative flex items-center min-w-[220px] -ml-8">
            {/* Background Layer 1: Dark Depth */}
            <div className="absolute inset-0 bg-[#0a191e] clip-path-slanted translate-x-2 translate-y-1 opacity-20"></div>
            
            {/* Background Layer 2: Orange Gradient */}
            <div className="relative bg-gradient-to-r from-red-600 to-orange-500 text-white py-2.5 px-8 pr-12 clip-path-slanted flex items-center shadow-lg">
              <Title level={4} className="!m-0 !text-lg !font-bold !text-white uppercase tracking-tight">
                {section.title || "FLASH SALE"}
              </Title>
              {/* Subtle shine effect */}
              <div className="absolute top-0 right-0 h-full w-4 bg-white/10 skew-x-[-20deg] -mr-2"></div>
            </div>
          </div>
          
          <div className="ml-8 flex items-center gap-4 bg-orange-50/50 px-4 py-1.5 rounded-full border border-orange-100">
             <Text className="text-[10px] font-semibold uppercase text-orange-600 tracking-widest hidden sm:block">Kết thúc sau:</Text>
             <CountdownTimer targetDate={section.endDate || new Date(Date.now() + 86400000).toISOString()} />
          </div>
        </div>
        
        <Link to={`/products?sectionId=${section._id}`} className="flex-shrink-0">
          <Button type="link" className="group/btn flex items-center gap-1 font-bold text-slate-400 hover:text-orange-500 p-0 h-auto text-xs uppercase tracking-tighter">
            Xem tất cả <RightOutlined className="text-[8px] group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

        <div className="relative">
          <Slider {...sliderSettings}>
            {section.products.map((product) => (
              <div key={product._id} className="px-3 pb-8">
                <PremiumProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    );
};

export default FlashSaleSection;
