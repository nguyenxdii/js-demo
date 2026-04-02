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
    <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden relative group">
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <div className="w-12 h-1.5 bg-orange-500 rounded-full mb-3"></div>
          <Title level={2} className="!m-0 !text-3xl !font-black !tracking-tighter uppercase italic logo-font">
            {section.title}
          </Title>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Exclusive Collection</p>
        </div>
        <Link to="/products">
          <Button type="link" className="group/btn flex items-center gap-2 font-bold text-orange-500 hover:text-orange-600 p-0 h-auto">
            XEM TẤT CẢ <RightOutlined className="text-[10px] group-hover/btn:translate-x-1 transition-transform" />
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
