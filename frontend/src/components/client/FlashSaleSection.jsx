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
    <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-[40px] p-1 shadow-[0_20px_50px_rgba(239,68,68,0.2)] overflow-hidden relative group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
      
      <div className="bg-white rounded-[38px] p-8 md:p-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 to-orange-50 p-4 rounded-3xl animate-pulse flex items-center justify-center">
              <FireOutlined className="text-3xl text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter italic">Limited Time</span>
                <Title level={2} className="!m-0 !text-3xl !font-black !tracking-tighter uppercase italic logo-font text-slate-900 leading-none">
                  LỄ HỘI SĂN SALE
                </Title>
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-none mt-1">Don't miss the biggest offers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-gray-50 px-6 py-3 rounded-[24px] border border-gray-100 shadow-sm">
             <Text className="text-[10px] font-black uppercase text-gray-500 tracking-widest hidden sm:block">Kết thúc sau:</Text>
             <CountdownTimer targetDate={new Date(Date.now() + 86400000).toISOString()} />
          </div>
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
    </div>
  );
};

export default FlashSaleSection;
