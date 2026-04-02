import React from "react";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";

const PremiumProductCard = ({ item, discountLabel, discountPercentage }) => {
  const { addToCart } = useCart();

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price || 0) + "đ";
  };

  const hasDiscount = discountPercentage > 0;
  const finalPrice = hasDiscount ? item.price * (1 - discountPercentage / 100) : item.price;

  return (
    <div className="group relative bg-white rounded-2xl p-2.5 transition-all duration-300 hover:shadow-xl border-2 border-gray-200 flex flex-col h-[360px]">
      {/* Ảnh sản phẩm - Large and clean */}
      <Link to={`/product/${item.slug}`} className="relative h-44 overflow-hidden mb-3 rounded-md flex items-center justify-center p-2">
        <img
          src={getFullImageUrl(item.mainImageUrl || item.imageUrl)}
          alt={item.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Thông tin */}
      <div className="flex-1 flex flex-col px-1">
        <Link to={`/product/${item.slug}`} className="mb-2 block flex-1">
          <div className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors duration-300">
            {item.name}
          </div>
        </Link>

        {/* Giá và Badges */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-red-600 font-bold text-lg tracking-tight leading-none mb-0.5">
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 font-medium line-through">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>
            
            {hasDiscount && (
              <div className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                -{discountPercentage}%
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-2">
             <button 
                disabled={item.stock === 0}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (item.stock > 0) {
                        addToCart(item._id || item.id, 1);
                    }
                }}
                className="group/btn relative h-9 flex-1 rounded-full bg-white border border-gray-200 overflow-hidden transition-all duration-500 hover:border-blue-600 shadow-sm flex items-center"
              >
                {/* BLUE BACKGROUND FILL - FIXED CIRCLE TO FULL WIDTH */}
                <div className="absolute left-0 top-0 h-full w-9 bg-blue-600 group-hover/btn:w-full transition-all duration-500 ease-in-out z-0 rounded-full" />
                
                {/* ICON & TEXT - PERFECT CENTERING */}
                <div className="relative z-10 flex items-center w-full h-full">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        <ShoppingCartOutlined className="text-sm text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-800 uppercase tracking-tighter group-hover/btn:text-white transition-colors duration-300 ml-1 pr-4">
                        Thêm giỏ hàng
                    </span>
                </div>
              </button>

              {item.stock > 0 ? (
                <div className="flex items-center gap-1.5 bg-green-50 text-[9px] font-bold text-green-600 px-2 py-1 rounded-full border border-green-100 uppercase tracking-tight shadow-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Còn hàng
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-red-50 text-[9px] font-bold text-red-600 px-2 py-1 rounded-full border border-red-100 uppercase tracking-tight shadow-sm">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Hết hàng
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumProductCard;
