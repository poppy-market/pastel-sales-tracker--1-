import React from 'react';
import { FaShoppingCart, FaUserCircle, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import { IconContext } from 'react-icons';

export const Header: React.FC = () => (
  <IconContext.Provider value={{ className: "align-middle" }}>
    <header className="flex items-center p-4 bg-white/80 shadow-md">
      {/* Placeholder for logo */}
      <div className="flex items-center mr-4">
        <span className="text-pink-400 w-8 h-8 mr-2 flex items-center justify-center">
          <FaShoppingCart size={32} />
        </span>
        <span className="font-bold text-xl tracking-tight">Poppy Market</span>
      </div>
      <nav className="flex-1 flex gap-6 items-center">
        <span className="w-6 h-6 text-gray-600 hover:text-pink-400 cursor-pointer">
          <FaChartBar size={24} title="Dashboard" />
        </span>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-200 border-2 border-pink-300 overflow-hidden">
            <img src="https://sofia.static.domains/Logos/poppy_icon_512x512_transparent.png" alt="Poppy Icon" className="w-9 h-9 object-contain" />
          </span>
      </nav>
      <button className="ml-auto flex items-center gap-2 text-gray-600 hover:text-red-500">
        <span className="w-5 h-5">
          <FaSignOutAlt size={20} />
        </span>
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  </IconContext.Provider>
);
