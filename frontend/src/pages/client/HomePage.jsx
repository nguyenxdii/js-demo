import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import {
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { Typography } from "antd";
import { bannerService } from "../../services/bannerService";
import { sectionService } from "../../services/sectionService";
import { useCart } from "../../contexts/CartContext";
import StandardSection from "../../components/client/StandardSection";
import FlashSaleSection from "../../components/client/FlashSaleSection";
import NewArrivalSection from "../../components/client/NewArrivalSection";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const { Title, Text } = Typography;

// Custom arrow components for better UX
function NextArrow(props) {
  const { onClick } = props;
  return (
    <div
      className="absolute right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-xl hover:bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 border border-white group"
      onClick={onClick}
    >
      <RightOutlined style={{ fontSize: "14px" }} className="text-gray-900 group-hover:text-white transition-colors" />
    </div>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <div
      className="absolute left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-xl hover:bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 border border-white group"
      onClick={onClick}
    >
      <LeftOutlined style={{ fontSize: "14px" }} className="text-gray-900 group-hover:text-white transition-colors" />
    </div>
  );
}

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    // Xử lý cả trường hợp bắt đầu bằng /uploads hoặc uploads
    if (cleanUrl.startsWith("/uploads") || cleanUrl.startsWith("uploads")) {
        const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
        return `http://localhost:8080${pathOnly}`;
    }
    return cleanUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bannerData, sectionData] = await Promise.all([
          bannerService.getActiveBanners(),
          sectionService.getActiveSections()
        ]);
        setBanners(bannerData);
        setSections(sectionData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const sectionSliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: 4 } },
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2.2, arrows: false } },
      { breakpoint: 640, settings: { slidesToShow: 1.2, arrows: false } },
    ],
  };

  const renderSection = (section) => {
    switch (section.layoutType) {
      case "FLASH_SALE":
        return <FlashSaleSection key={section._id} section={section} sliderSettings={sectionSliderSettings} />;
      case "NEW_ARRIVAL":
        return <NewArrivalSection key={section._id} section={section} sliderSettings={sectionSliderSettings} />;
      default:
        return <StandardSection key={section._id} section={section} sliderSettings={sectionSliderSettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] overflow-x-hidden relative pb-10">
      {/* Hero Banner Section */}
      {(!loading && banners.length > 0) && (
        <div className="container mx-auto px-4 md:px-12 py-4 md:py-6 animate-fadeIn">
          <div className="rounded-xl shadow-sm relative border border-gray-100 bg-white">
              <Slider {...sliderSettings}>
                 {banners.map((banner) => (
                    <div key={banner._id} className="outline-none">
                     <Link to={banner.linkUrl || "#"}>
                       <div className="aspect-[21/9] md:aspect-[21/6.5] relative bg-gray-50 flex items-center justify-center overflow-hidden">
                         <img
                           src={getFullImageUrl(banner.imageUrl)}
                           alt={banner.title}
                           className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105"
                         />
                       </div>
                     </Link>
                   </div>
                 ))}
              </Slider>
          </div>
        </div>
      )}

      {/* Dynamic Sections Loop - Boxed Layout Replication */}
      <div className="container mx-auto px-4 space-y-10 mt-2">
        {sections.map((section) => renderSection(section))}
      </div>
    </div>
  );
}
