import React, { useState } from 'react';
import { ShoppingCart, Home, Settings, Menu, X as CloseIcon } from 'lucide-react';

const Navbar = ({ navigate, currentPage, basketItemCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    navigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => handleNavigate('home')} className="flex-shrink-0 text-white font-bold text-2xl hover:opacity-80 transition-opacity">
              Sweet Shop
            </button>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button onClick={() => handleNavigate('home')} className={`text-gray-100 hover:bg-pink-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === 'home' ? 'bg-pink-700' : ''}`}>
                <Home className="inline-block mr-1 mb-1" size={18}/> Home
              </button>
              <button onClick={() => handleNavigate('basket')} className={`text-gray-100 hover:bg-pink-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${currentPage === 'basket' ? 'bg-pink-700' : ''}`}>
                <ShoppingCart className="inline-block mr-1 mb-1" size={18}/> Basket
                {basketItemCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{basketItemCount}</span>
                )}
              </button>
              <button onClick={() => handleNavigate('admin')} className={`text-gray-100 hover:bg-pink-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage.startsWith('admin') ? 'bg-pink-700' : ''}`}>
                <Settings className="inline-block mr-1 mb-1" size={18}/> Admin
              </button>
            </div>
          </div>
          <div className="md:hidden flex items-center">
             <button onClick={() => handleNavigate('basket')} className="text-gray-100 hover:text-white p-2 rounded-md relative mr-2">
                <ShoppingCart size={24}/>
                {basketItemCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{basketItemCount}</span>
                )}
              </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-100 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-pink-600">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNavigate('home')} className="text-gray-100 hover:bg-pink-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">Home</button>
            {/* Basket button already visible in mobile header, so optional here */}
            {/* <button onClick={() => handleNavigate('basket')} className="text-gray-100 hover:bg-pink-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">Basket</button> */}
            <button onClick={() => handleNavigate('admin')} className="text-gray-100 hover:bg-pink-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium">Admin</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;