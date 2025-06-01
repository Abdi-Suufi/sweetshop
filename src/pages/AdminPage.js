import React, { useState, useEffect } from 'react';
import { Package, ListOrdered } from 'lucide-react';
import AdminProductsPage from './AdminProductsPage';
import AdminOrdersPage from './AdminOrdersPage';

const AdminPage = (props) => {
  const [adminView, setAdminView] = useState('products'); // 'products' or 'orders'
  
  // Destructure all necessary props passed from App.js
  const {
    sweets,
    orders,
    isLoadingSweets, // Renamed for clarity if you have multiple loading states
    isLoadingOrders, // Renamed for clarity
    openProductModal,
    deleteProduct,
    isProductModalOpen,
    closeProductModal,
    editingProduct,
    handleProductSubmit,
    updateOrderStatus,
    showNotification, // Pass this down
    setCurrentPage // To trigger order fetching when switching to orders tab
  } = props;

  useEffect(() => {
    // If adminView is orders and orders haven't been loaded (or need refresh),
    // App.js's useEffect for orders will handle fetching based on currentPage.
    // This ensures orders are fetched when navigating to admin and then to orders tab.
    if (adminView === 'orders') {
        setCurrentPage('admin-orders'); // Signal App.js to potentially fetch orders
    } else if (adminView === 'products') {
        setCurrentPage('admin-products');
    }
  }, [adminView, setCurrentPage]);


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setAdminView('products')}
          className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${adminView === 'products' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Package size={18} className="inline-block mr-1 sm:mr-2 mb-0.5"/> Manage Products
        </button>
        <button 
          onClick={() => setAdminView('orders')}
          className={`py-3 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors ${adminView === 'orders' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ListOrdered size={18} className="inline-block mr-1 sm:mr-2 mb-0.5"/> View Orders
        </button>
      </div>
      
      {adminView === 'products' && (
        <AdminProductsPage 
          sweets={sweets}
          isLoading={isLoadingSweets}
          openProductModal={openProductModal}
          deleteProduct={deleteProduct}
          isProductModalOpen={isProductModalOpen}
          closeProductModal={closeProductModal}
          editingProduct={editingProduct}
          handleProductSubmit={handleProductSubmit}
          showNotification={showNotification}
        />
      )}
      {adminView === 'orders' && (
        <AdminOrdersPage 
          orders={orders}
          isLoading={isLoadingOrders}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default AdminPage;