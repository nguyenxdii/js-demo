import React from "react";
import { Card, Badge, Button, Typography, Space } from "antd";
import { ShoppingCartOutlined, HeartOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const { Text, Title } = Typography;

const PremiumProductCard = ({ product }) => {
  const { addToCart } = useCart();
  if (!product) return null;

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  
  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    if (cleanUrl.startsWith("/uploads") || cleanUrl.startsWith("uploads")) {
        const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
        return `http://localhost:8080${pathOnly}`;
    }
    return cleanUrl;
  };

  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <div className="group h-full">
      <Card
        hoverable
        className="h-full border-none shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-[32px] overflow-hidden"
        cover={
          <div className="relative aspect-[4/5] overflow-hidden bg-[#fafafa] flex items-center justify-center group/img">
            <Link to={`/product/${product.slug}`} className="block w-full h-full">
              <img
                alt={product.name}
                src={getFullImageUrl(product.mainImageUrl)}
                className="w-full h-full object-contain p-4 group-hover/img:scale-110 transition-transform duration-700"
              />
            </Link>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {discount > 0 && (
                <div className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-orange-500/30">
                  -{discount}%
                </div>
              )}
              {product.isHot && (
                <div className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-black/30 italic uppercase tracking-tighter">
                  HOT
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute -bottom-16 group-hover/img:bottom-4 left-1/2 -translate-x-1/2 flex gap-3 transition-all duration-500 z-10">
              <Button 
                shape="circle" 
                icon={<HeartOutlined />} 
                className="hover:!text-red-500 border-none shadow-xl bg-white/90 backdrop-blur-md"
              />
              <Button 
                shape="circle" 
                type="primary"
                icon={<ShoppingCartOutlined />} 
                className="!bg-orange-500 border-none shadow-xl hover:scale-110 transition-transform"
                onClick={() => addToCart(product)}
              />
            </div>
          </div>
        }
        bodyStyle={{ padding: "24px", paddingTop: "16px" }}
      >
        <div className="flex flex-col gap-2">
          {/* Category/Brand */}
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
             {product.brand?.name || "Premium Sport"}
          </Text>
          
          <Link to={`/product/${product.slug}`}>
            <Title level={5} className="!m-0 !text-sm !font-bold line-clamp-2 hover:text-orange-500 transition-colors min-h-[40px]">
              {product.name}
            </Title>
          </Link>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <Text className="text-lg font-black text-slate-900 tracking-tighter leading-none">
                {formatPrice(product.price)}
              </Text>
              {product.oldPrice && (
                <Text delete className="text-[10px] text-gray-400 font-bold mt-1">
                  {formatPrice(product.oldPrice)}
                </Text>
              )}
            </div>
            
            <Link to={`/product/${product.slug}`}>
              <Button 
                type="text" 
                icon={<ArrowRightOutlined />} 
                className="hover:!text-orange-500 !p-0"
              />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PremiumProductCard;
