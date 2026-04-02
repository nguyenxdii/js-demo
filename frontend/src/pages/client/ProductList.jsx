import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Typography, Breadcrumb, Skeleton, Empty, Pagination, Radio, Collapse } from "antd";
import { 
  ShoppingCartOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { brandService } from "../../services/brandService";
import { useCart } from "../../contexts/CartContext";
import PremiumProductCard from "../../components/client/PremiumProductCard";

const { Title } = Typography;

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const categoryId = searchParams.get("category");
  const brandId = searchParams.get("brand");
  const genderParam = searchParams.get("gender");
  const priceParam = searchParams.get("price");
  const sortParam = searchParams.get("sort") || "newest";
  const pageParam = parseInt(searchParams.get("page") || "1");

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 0, totalElements: 0 });
  const [brands, setBrands] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
 
  const getFullImageUrl = (url) => {
    if (!url) return "/images/cat-placeholder.png";
    const cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith("http")) return cleanUrl;
    const pathOnly = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
    return `http://localhost:8080${pathOnly}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const allBrands = await brandService.getActiveBrands();
        setBrands(allBrands || []);
      } catch (error) {
        console.error("Lỗi khi tải brands:", error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Backend dùng pageNumber, không phải page
        const params = { 
          sectionId: sectionId,
          category: categoryId,
          brand: brandId,
          gender: genderParam,
          priceRange: priceParam,
          sort: sortParam,
          pageNumber: pageParam
        };
        // Xóa params undefined
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        
        const response = await productService.getAllProducts(params);
        setProducts(response.products || []);
        setPagination({
          totalPages: response.pages || 0,
          totalElements: response.total || 0
        });

        if (categoryId) {
          try {
            const current = await categoryService.getCategoryById(categoryId);
            setCurrentCategory(current);
          } catch (err) {
            setCurrentCategory(null);
          }
        } else if (sectionId) {
          try {
             const allSections = await sectionService.getAllSections();
             const currentSection = allSections.find(s => (s._id || s.id) === sectionId);
             if (currentSection) {
                setCurrentCategory({ name: currentSection.title || currentSection.name, isSection: true });
             }
          } catch (err) {
            setCurrentCategory(null);
          }
        } else {
          setCurrentCategory(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [sectionId, categoryId, brandId, genderParam, priceParam, sortParam, pageParam]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(page));
    setSearchParams(newParams);
  };

  const priceRanges = [
    { label: "Tất cả mức giá", value: "" },
    { label: "Dưới 1.000.000đ", value: "0-1000000" },
    { label: "1tr - 3tr", value: "1000000-3000000" },
    { label: "3tr - 5tr", value: "3000000-5000000" },
    { label: "Trên 5.000.000đ", value: "5000000-999000000" }
  ];

  const breadcrumbItems = [
    { title: <Link to="/">Trang chủ</Link> },
    { title: <Link to="/products" className="text-gray-400 hover:text-orange-500 font-medium">Sản phẩm</Link> },
    ...(currentCategory ? [{ title: <span className="text-orange-500 font-semibold">{currentCategory.name}</span> }] : [])
  ];

  const filterItems = [
    {
      key: 'gender',
      label: <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-800">Giới tính</span>,
      children: (
        <div className="flex flex-col gap-3">
          {["Tất cả", "Nam", "Nữ", "Unisex"].map(g => (
            <Radio 
              key={g} 
              checked={genderParam === g || (!genderParam && g === "Tất cả")}
              onClick={() => updateFilters("gender", g === "Tất cả" ? "" : g)}
              className="text-sm text-slate-700"
            >
              {g}
            </Radio>
          ))}
        </div>
      )
    },
    {
      key: 'brand',
      label: <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-800">Thương hiệu</span>,
      children: (
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          <div 
            className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${!brandId ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-50 text-slate-600 hover:bg-gray-100'}`}
            onClick={() => updateFilters("brand", "")}
          >
            Tất cả
          </div>
          {(() => {
            // Dùng brands đã populate từ category, nếu không thì fallback brands từ service
            const brandList = (currentCategory?.brands?.length > 0 && typeof currentCategory.brands[0] === 'object') 
              ? currentCategory.brands 
              : brands;
            return brandList.map(b => (
              <div 
                key={b._id || b}
                className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${brandId === (b._id || b) ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-50 text-slate-600 hover:bg-gray-100'}`}
                onClick={() => updateFilters("brand", b._id || b)}
              >
                {b.name || 'N/A'}
              </div>
            ));
          })()}
        </div>
      )
    },
    {
      key: 'price',
      label: <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-800">Mức giá</span>,
      children: (
        <div className="flex flex-col gap-2">
          {priceRanges.map(range => (
            <div 
              key={range.value}
              className={`px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${priceParam === range.value || (!priceParam && range.value === "") ? 'bg-orange-50 text-orange-600 font-semibold' : 'bg-gray-50 text-slate-600 hover:bg-gray-100'}`}
              onClick={() => updateFilters("price", range.value)}
            >
              {range.label}
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb className="mb-4" items={breadcrumbItems} />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase italic m-0 font-['Inter']">
                {currentCategory ? currentCategory.name : "Tất cả sản phẩm"}
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-medium">{pagination.totalElements} sản phẩm</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Sắp xếp:</span>
              <select 
                value={sortParam}
                onChange={(e) => updateFilters("sort", e.target.value)}
                className="bg-white text-xs text-slate-700 outline-none cursor-pointer px-4 py-2.5 border border-gray-200 rounded-lg focus:border-orange-500 transition-all"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-28">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                <FilterOutlined className="text-blue-600 text-sm" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Bộ lọc</span>
              </div>
              <Collapse ghost items={filterItems} defaultActiveKey={['gender', 'price']} expandIconPosition="end" />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-50">
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <PremiumProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                <div className="mt-12 flex justify-center">
                  <Pagination 
                    current={pageParam}
                    total={pagination.totalElements}
                    pageSize={12}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white py-24 rounded-2xl border border-dashed border-gray-200 flex justify-center">
                <Empty description={<span className="text-gray-400 text-sm">Không tìm thấy sản phẩm nào</span>} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
