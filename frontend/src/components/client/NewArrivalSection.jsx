import React from "react";
import Slider from "react-slick";
import PremiumProductCard from "./PremiumProductCard";
import { Typography, Button } from "antd";
import { RightOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const NewArrivalSection = ({ section, sliderSettings }) => {
  if (!section || !section.products || section.products.length === 0) return null;

  return (
    <div className="bg-[#111] rounded-[48px] p-10 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden relative group border border-white/5">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full -ml-40 -mt-40 blur-[100px] group-hover:opacity-100 opacity-50 transition-opacity duration-1000"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
             <ThunderboltOutlined className="text-orange-500 text-xl" />
          </div>
          <Title level={1} className="!m-0 !text-5xl !font-black !tracking-tighter uppercase italic logo-font text-white leading-tight">
            BST MỚI NHẤT
          </Title>
          <Text className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] mt-3 block">
             The Future of Performance
          </Text>
        </div>
        
        <Link to="/products">
          <Button 
            className="group/btn h-14 px-8 rounded-full bg-white hover:!bg-orange-500 hover:!border-orange-500 border-white text-black hover:!text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-white/5"
          >
            KHÁM PHÁ NGAY <RightOutlined className="text-[10px] group-hover/btn:translate-x-1 transition-transform ml-2" />
          </Button>
        </Link>
      </div>

      <div className="relative z-10 slick-dark">
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

export default NewArrivalSection;
