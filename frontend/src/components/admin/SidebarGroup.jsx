import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RightOutlined, DownOutlined } from "@ant-design/icons";
import SidebarItem from "./SidebarItem";

export default function SidebarGroup({ group }) {
  return (
    <div className="mb-4">
      {/* Group Header - Not clickable anymore */}
      <div
        className="flex items-center justify-between px-4 py-2 mx-2 transition-colors"
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {group.title}
        </h3>
      </div>

      {/* Menu Items - Always visible */}
      <div className="mt-1 space-y-1">
        {group.items.map((item, index) => (
          <SidebarItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
