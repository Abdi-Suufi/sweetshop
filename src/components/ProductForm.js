import React, { useState, useEffect } from 'react';

const ProductForm = ({ onSubmit, initialData, onCancel, showNotification }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price || '');
      setStock(initialData.stock || '');
      setImageUrl(initialData.imageUrl || '');
    } else {
      // Reset form for new product
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageUrl('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || price <= 0 || stock < 0) {
      // Use showNotification from props if available, otherwise alert
      const message = 'Please fill all fields correctly. Name and description cannot be empty. Price must be > 0 and stock >= 0.';
      if (showNotification) {
        showNotification(message, 'error');
      } else {
        alert(message);
      }
      return;
    }
    onSubmit({ name, description, price: parseFloat(price), stock: parseInt(stock), imageUrl });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="product-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="product-description" value={description} onChange={e => setDescription(e.target.value)} required rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"></textarea>
      </div>
      <div>
        <label htmlFor="product-price" className="block text-sm font-medium text-gray-700">Price ($)</label>
        <input type="number" id="product-price" value={price} onChange={e => setPrice(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
        <input type="number" id="product-stock" value={stock} onChange={e => setStock(e.target.value)} required min="0" step="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"/>
      </div>
      <div>
        <label htmlFor="product-imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
        <input type="url" id="product-imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"/>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 transition-colors">{initialData ? 'Update Product' : 'Add Product'}</button>
      </div>
    </form>
  );
};

export default ProductForm;