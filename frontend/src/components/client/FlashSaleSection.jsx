import React from "react";
import Slider from "react-slick";
import { Typography } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import PremiumProductCard from "./PremiumProductCard";
import CountdownTimer from "./CountdownTimer";

const { Text } = Typography;

const FlashSaleSection = ({ section, sliderSettings }) => {
  const isStarted = new Date(section.startDate) <= new Date();
  const isEnded = new Date(section.endDate) <= new Date();

  // Nếu chưa đến ngày bắt đầu hoặc đã kết thúc, không hiện
  if (!isStarted || isEnded) return null;

  return (
    <div className="animate-fadeIn relative py-3">
        {/* Total Box Wrapper */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm transition-all hover:border-blue-100/30 overflow-hidden">
          {/* Header Section - Optimized compact h-14 */}
          <div className="flex items-center justify-between border-b border-gray-100 relative pr-4 md:pr-10 h-12 md:h-14">
              <div className="flex items-center gap-0 h-full">
                {/* Slim Slanted Header Design */}
                <div className="relative flex items-center h-full pr-8">
                    {/* Background Slant (Dark Blue) */}
                    <div className="absolute inset-0 bg-[#002b49] z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)', width: '115%' }}></div>
                    {/* Main Slant (Orange/Red Gradient) */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 md:px-8 h-full flex items-center relative z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}>
                        <span className="text-white font-['Outfit'] font-black text-sm md:text-base tracking-widest uppercase">
                            {section.title}
                        </span>
                    </div>
                </div>

                {/* Countdown Timer - Slimmer & Centered Vertically */}
                <div className="flex items-center gap-2 ml-10 bg-red-50/40 px-3 py-1 rounded-full border border-red-100/40 shadow-inner mt-1.5 translate-y-[2px]">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    <CountdownTimer targetDate={section.endDate} />
                </div>
              </div>

              <Link to={`/products?sectionId=${section.id || section._id}`} className="text-slate-800 hover:text-red-600 text-[10px] font-black uppercase tracking-[2px] flex items-center gap-1 group transition-all font-['Outfit'] ml-auto">
                XEM TẤT CẢ <RightOutlined style={{ fontSize: '9px' }} className="group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>

          <div className="px-4 md:px-6 pb-5 pt-6">
            {section.products && section.products.length > 0 ? (
              <Slider {...sliderSettings}>
                {section.products.map((item) => (
                  <div key={item._id || item.id} className="px-1.5 py-1">
                    <PremiumProductCard 
                        item={item} 
                        discountLabel={section.discountConfig?.label}
                        discountPercentage={section.discountConfig?.discountPercentage}
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="py-10 text-center bg-gray-50/20 rounded-xl border border-dashed border-gray-100 italic">
                <Text type="secondary" className="font-bold uppercase tracking-widest text-[8px] text-gray-400">Đang cập nhật...</Text>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default FlashSaleSection;
