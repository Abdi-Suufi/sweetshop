import React from 'react';
import { ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import Spinner from '../components/Spinner';

const BasketPage = ({ basket, isLoading, onUpdateQuantity, onRemoveFromBasket, onPlaceOrder, navigate }) => {
  if (isLoading && !basket.items) return <Spinner />; // Show spinner if basket is initially loading

  const totalAmount = basket.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = `https://placehold.co/100x100/CCCCCC/FFFFFF?text=Img`;
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-15rem)]"> {/* Adjust min-height as needed */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Shopping Basket</h1>
      {basket.items.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-lg rounded-lg p-8">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-xl mb-6">Your basket is feeling a bit lonely.</p>
          <button 
            onClick={() => navigate('home')} 
            className="bg-pink-500 text-white font-semibold py-3 px-8 rounded-lg shadow hover:bg-pink-600 transition-colors text-lg"
          >
            Discover Sweets
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg p-4 sm:p-6">
          {basket.items.map(item => (
            <div key={item.sweetId} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center mb-4 sm:mb-0 flex-grow">
                <img 
                  src={item.imageUrl || `https://placehold.co/100x100/E91E63/FFFFFF?text=${encodeURIComponent(item.name)}`} 
                  alt={item.name} 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mr-4 shadow"
                  onError={handleImageError}
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm">Unit Price: ${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 my-2 sm:my-0">
                <button onClick={() => onUpdateQuantity(item.sweetId, item.quantity - 1)} className="text-pink-500 p-1 rounded-full hover:bg-pink-100 transition-colors font-bold text-lg w-8 h-8 flex items-center justify-center">-</button>
                <span className="font-medium text-gray-700 w-8 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.sweetId, item.quantity + 1)} className="text-pink-500 p-1 rounded-full hover:bg-pink-100 transition-colors font-bold text-lg w-8 h-8 flex items-center justify-center">+</button>
              </div>
              <p className="font-semibold text-gray-700 w-24 text-right my-2 sm:my-0">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => onRemoveFromBasket(item.sweetId)} className="text-red-500 hover:text-red-700 transition-colors ml-2 sm:ml-4 p-1">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-end items-center mb-6">
              <span className="text-xl font-semibold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-pink-500 ml-4">${totalAmount.toFixed(2)}</span>
            </div>
            <button 
              onClick={onPlaceOrder}
              className="w-full bg-accent hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-lg"
            >
              <CreditCard size={22} className="mr-2"/> Proceed to Checkout (Simulated)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasketPage;