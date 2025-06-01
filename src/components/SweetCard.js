import React from 'react';
import { ShoppingCart } from 'lucide-react';

const SweetCard = ({ sweet, onAddToBasket }) => {
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = `https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Not+Found`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
      <img 
        className="w-full h-56 object-cover" // Increased height for better visuals
        src={sweet.imageUrl || `https://placehold.co/600x400/E91E63/FFFFFF?text=${encodeURIComponent(sweet.name)}`} 
        alt={sweet.name} 
        onError={handleImageError}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={sweet.name}>{sweet.name}</h3>
        <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-3">{sweet.description}</p> {/* line-clamp for consistent description height */}
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <p className="text-2xl font-bold text-pink-500">${sweet.price.toFixed(2)}</p>
            {sweet.stock > 0 && sweet.stock <= 10 && (
              <p className="text-sm text-red-500 font-medium">Only {sweet.stock} left!</p>
            )}
            {sweet.stock === 0 && (
              <p className="text-sm text-red-700 font-bold">Out of Stock!</p>
            )}
          </div>
          <button 
            onClick={() => onAddToBasket(sweet)}
            disabled={sweet.stock === 0}
            className={`w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center ${sweet.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ShoppingCart size={18} className="mr-2"/> Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default SweetCard;