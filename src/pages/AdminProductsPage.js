import React from 'react';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';

const AdminProductsPage = ({ 
  sweets, 
  isLoading, 
  openProductModal, 
  deleteProduct,
  isProductModalOpen,
  closeProductModal,
  editingProduct,
  handleProductSubmit,
  showNotification // Pass showNotification for ProductForm
}) => {

  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = `https://placehold.co/50x50/CCCCCC/FFFFFF?text=Err`;
  };

  if (isLoading && sweets.length === 0) return <Spinner />;

  return (
    <div className="p-2 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Products</h2>
        <button 
          onClick={() => openProductModal()} 
          className="bg-pink-500 text-white py-2 px-4 rounded-lg shadow hover:bg-pink-600 transition-colors flex items-center text-sm sm:text-base"
        >
          <PlusCircle size={20} className="mr-2"/> Add New Product
        </button>
      </div>
      {sweets.length === 0 && !isLoading && (
        <p className="text-gray-600">No products found. Add some to get started!</p>
      )}
      {sweets.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sweets.map(sweet => (
                <tr key={sweet.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img 
                        src={sweet.imageUrl || `https://placehold.co/50x50/E91E63/FFFFFF?text=${sweet.name.charAt(0)}`} 
                        alt={sweet.name} 
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md shadow"
                        onError={handleImageError}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sweet.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">${sweet.price.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{sweet.stock}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-1 sm:space-x-2">
                    <button onClick={() => openProductModal(sweet)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-1" title="Edit"><Edit3 size={18}/></button>
                    <button onClick={() => deleteProduct(sweet.id)} className="text-red-600 hover:text-red-900 transition-colors p-1" title="Delete"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={isProductModalOpen} onClose={closeProductModal} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <ProductForm 
          onSubmit={handleProductSubmit} 
          initialData={editingProduct} 
          onCancel={closeProductModal}
          showNotification={showNotification} // Pass down for form validation messages
        />
      </Modal>
    </div>
  );
};

export default AdminProductsPage;