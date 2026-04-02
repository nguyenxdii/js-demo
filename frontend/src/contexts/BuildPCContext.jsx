import React, { createContext, useContext, useState, useEffect } from 'react';

const BuildPCContext = createContext();

export const SLOTS = [
  { id: 'cpu', name: 'Bộ vi xử lý (CPU)', category: 'cpu-bo-vi-xu-ly' },
  { id: 'main', name: 'Bo mạch chủ (Mainboard)', category: 'mainboard-bo-mach-chu' },
  { id: 'vga', name: 'Card màn hình (VGA)', category: 'vga-card-do-hoa' },
  { id: 'ram', name: 'Bộ nhớ trong (RAM)', category: 'ram-bo-nho-trong' },
  { id: 'ssd', name: 'Ổ cứng', category: 'o-cung' },
  { id: 'psu', name: 'Nguồn máy tính (PSU)', category: 'psu-nguon-may-tinh' },
  { id: 'case', name: 'Vỏ máy tính (Case)', category: 'vo-case-premium' },
  { id: 'cooler', name: 'Tản nhiệt (Cooling)', category: 'tan-nhiet-khi' },
  { id: 'monitor', name: 'Màn hình', category: 'man-hinh-gaming' },
  { id: 'keyboard', name: 'Bàn phím', category: 'ban-phim-co' },
  { id: 'mouse', name: 'Chuột', category: 'chuot-gaming' },
];

export const BuildPCProvider = ({ children }) => {
  const [selectedParts, setSelectedParts] = useState(() => {
    const saved = localStorage.getItem('pc_build_current');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('pc_build_current', JSON.stringify(selectedParts));
  }, [selectedParts]);

  const selectPart = (slotId, product) => {
    setSelectedParts(prev => ({
      ...prev,
      [slotId]: product
    }));
  };

  const removePart = (slotId) => {
    setSelectedParts(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  const clearBuild = () => {
    setSelectedParts({});
  };

  const totalPrice = Object.values(selectedParts).reduce((sum, p) => sum + (p.salePrice || p.price || 0), 0);
  
  const totalWattage = Object.values(selectedParts).reduce((sum, p) => sum + (p.wattage || 0), 0);

  return (
    <BuildPCContext.Provider value={{ 
      selectedParts, 
      setSelectedParts,
      selectPart, 
      removePart, 
      clearBuild, 
      totalPrice,
      totalWattage
    }}>
      {children}
    </BuildPCContext.Provider>
  );
};

export const useBuildPC = () => useContext(BuildPCContext);
