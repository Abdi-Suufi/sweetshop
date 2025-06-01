import React from 'react';
import SweetCard from '../components/SweetCard';
import Spinner from '../components/Spinner';

const HomePage = ({ sweets, isLoading, onAddToBasket }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Welcome to Our <span className="text-pink-500">Sweet Paradise!</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover a delightful assortment of handcrafted sweets, made with love and the finest ingredients.
        </p>
      </header>
      {isLoading ? <Spinner /> : (
        sweets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sweets.map(sweet => <SweetCard key={sweet.id} sweet={sweet} onAddToBasket={onAddToBasket} />)}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-500">No sweets available at the moment. Please check back later!</p>
          </div>
        )
      )}
    </div>
  );
};

export default HomePage;