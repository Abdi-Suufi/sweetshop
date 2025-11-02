import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import Spinner from './components/Spinner';
import HomePage from './pages/HomePage';
import BasketPage from './pages/BasketPage';
import AdminPage from './pages/AdminPage';
import {
  getUserId,
  getSweets,
  saveSweets,
  getOrders,
  saveOrders,
  getBasket,
  saveBasket,
  generateId
} from './firebase';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sweets, setSweets] = useState([]);
  const [basket, setBasket] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  const [isLoadingSweets, setIsLoadingSweets] = useState(true);
  const [isLoadingBasket, setIsLoadingBasket] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [userId, setUserId] = useState(null);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Show Notification Utility
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: null, type: null }), duration);
  }, []);

  // Initialize user ID
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  // Load Sweets
  useEffect(() => {
    setIsLoadingSweets(true);
    try {
      const sweetsData = getSweets();
      setSweets(sweetsData);
      setIsLoadingSweets(false);
    } catch (error) {
      console.error("Error loading sweets:", error);
      showNotification('Failed to load sweets.', 'error');
      setIsLoadingSweets(false);
    }
  }, [showNotification]);

  // Load Basket
  useEffect(() => {
    if (!userId) return;
    setIsLoadingBasket(true);
    try {
      const basketData = getBasket();
      setBasket(basketData);
      setIsLoadingBasket(false);
    } catch (error) {
      console.error("Error loading basket:", error);
      showNotification('Failed to load your basket.', 'error');
      setIsLoadingBasket(false);
    }
  }, [userId, showNotification]);

  // Load Orders (for Admin)
  useEffect(() => {
    if (currentPage !== 'admin-orders' && currentPage !== 'admin') return;
    setIsLoadingOrders(true);
    try {
      const ordersData = getOrders();
      setOrders(ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
      setIsLoadingOrders(false);
    } catch (error) {
      console.error("Error loading orders:", error);
      showNotification('Failed to load orders.', 'error');
      setIsLoadingOrders(false);
    }
  }, [currentPage, showNotification]);

  const navigate = (page) => {
    setCurrentPage(page);
  };

  // --- Basket Functions ---
  const addToBasket = (sweet) => {
    if (!userId) {
      showNotification('Please sign in to add items to your basket.', 'error');
      return;
    }
    if (sweet.stock === 0) {
      showNotification(`${sweet.name} is out of stock.`, 'error');
      return;
    }
    try {
      const currentBasket = { ...basket };
      const existingItemIndex = currentBasket.items.findIndex(item => item.sweetId === sweet.id);
      if (existingItemIndex > -1) {
        if (currentBasket.items[existingItemIndex].quantity < sweet.stock) {
          currentBasket.items[existingItemIndex].quantity += 1;
        } else {
          showNotification(`Cannot add more ${sweet.name}. Stock limit reached.`, 'info');
          return;
        }
      } else {
        currentBasket.items.push({ sweetId: sweet.id, name: sweet.name, price: sweet.price, quantity: 1, imageUrl: sweet.imageUrl });
      }
      currentBasket.updatedAt = new Date().toISOString();
      setBasket(currentBasket);
      saveBasket(currentBasket);
      showNotification(`${sweet.name} added to basket!`, 'success');
    } catch (error) {
      console.error("Error adding to basket:", error);
      showNotification('Could not add item to basket.', 'error');
    }
  };

  const updateBasketQuantity = (sweetId, newQuantity) => {
    if (!userId) return;
    try {
      const sweetDetails = sweets.find(s => s.id === sweetId);
      if (!sweetDetails) {
        showNotification('Sweet details not found for quantity update.', 'error');
        return;
      }

      if (newQuantity > sweetDetails.stock) {
        showNotification(`Only ${sweetDetails.stock} units of ${sweetDetails.name} available.`, 'info');
        return;
      }

      const updatedItems = basket.items.map(item =>
        item.sweetId === sweetId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      ).filter(item => item.quantity > 0);

      const updatedBasket = { items: updatedItems, updatedAt: new Date().toISOString() };
      setBasket(updatedBasket);
      saveBasket(updatedBasket);
      
      if (newQuantity > 0) {
        showNotification('Basket updated.', 'success');
      } else {
        showNotification('Item removed from basket.', 'success');
      }
    } catch (error) {
      console.error("Error updating basket quantity:", error);
      showNotification('Could not update basket.', 'error');
    }
  };

  const removeFromBasket = (sweetId) => {
    if (!userId) return;
    try {
      const updatedItems = basket.items.filter(item => item.sweetId !== sweetId);
      const updatedBasket = { items: updatedItems, updatedAt: new Date().toISOString() };
      setBasket(updatedBasket);
      saveBasket(updatedBasket);
      showNotification('Item removed from basket.', 'success');
    } catch (error) {
      console.error("Error removing from basket:", error);
      showNotification('Could not remove item from basket.', 'error');
    }
  };

  const placeOrder = () => {
    if (!userId || basket.items.length === 0) {
      showNotification('Your basket is empty or you are not signed in.', 'error');
      return;
    }
    try {
      const totalAmount = basket.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newOrder = {
        id: generateId(),
        userId: userId,
        items: basket.items,
        totalAmount: totalAmount,
        status: 'placed',
        orderDate: new Date().toISOString(),
        customerDetails: { userId }
      };

      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      saveOrders(updatedOrders);

      const emptyBasket = { items: [], updatedAt: new Date().toISOString() };
      setBasket(emptyBasket);
      saveBasket(emptyBasket);

      showNotification('Order placed successfully!', 'success');
      navigate('home');
    } catch (error) {
      console.error("Error placing order:", error);
      showNotification('There was an issue placing your order.', 'error');
    }
  };

  // --- Admin Functions ---
  const openProductModal = (product = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(false);
  };

  const handleProductSubmit = (productData) => {
    try {
      const dataToSave = {
        ...productData,
        id: editingProduct ? editingProduct.id : generateId(),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
      };

      let updatedSweets;
      if (editingProduct) {
        updatedSweets = sweets.map(sweet => 
          sweet.id === editingProduct.id ? dataToSave : sweet
        );
      } else {
        updatedSweets = [...sweets, dataToSave];
      }

      setSweets(updatedSweets);
      saveSweets(updatedSweets);
      showNotification(`Product ${editingProduct ? 'updated' : 'added'} successfully!`, 'success');
      closeProductModal();
    } catch (error) {
      console.error("Error saving product:", error);
      showNotification('Failed to save product.', 'error');
    }
  };

  const deleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      try {
        const updatedSweets = sweets.filter(sweet => sweet.id !== productId);
        setSweets(updatedSweets);
        saveSweets(updatedSweets);
        showNotification('Product deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting product:", error);
        showNotification('Failed to delete product.', 'error');
      }
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      saveOrders(updatedOrders);
      showNotification(`Order status updated to ${newStatus}.`, 'success');
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification('Failed to update order status.', 'error');
    }
  };

  const basketItemCount = basket.items.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage sweets={sweets} isLoading={isLoadingSweets} onAddToBasket={addToBasket} />;
      case 'basket':
        return <BasketPage 
          basket={basket} 
          isLoading={isLoadingBasket} 
          onUpdateQuantity={updateBasketQuantity} 
          onRemoveFromBasket={removeFromBasket} 
          onPlaceOrder={placeOrder} 
          navigate={navigate}
        />;
      case 'admin':
      case 'admin-products':
      case 'admin-orders':
        return <AdminPage 
          sweets={sweets}
          orders={orders}
          isLoadingSweets={isLoadingSweets}
          isLoadingOrders={isLoadingOrders}
          openProductModal={openProductModal}
          deleteProduct={deleteProduct}
          isProductModalOpen={isProductModalOpen}
          closeProductModal={closeProductModal}
          editingProduct={editingProduct}
          handleProductSubmit={handleProductSubmit}
          updateOrderStatus={updateOrderStatus}
          showNotification={showNotification}
          setCurrentPage={setCurrentPage}
        />;
      default:
        return <HomePage sweets={sweets} isLoading={isLoadingSweets} onAddToBasket={addToBasket} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Navbar navigate={navigate} currentPage={currentPage} basketItemCount={basketItemCount} />
      <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: null, type: null })} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <footer className="bg-gray-800 text-white text-center p-6 mt-auto">
        <p>&copy; {new Date().getFullYear()} Sweet Shop. All rights reserved.</p>
        {userId && <p className="text-xs text-gray-400 mt-1">User ID: {userId.substring(0,10)}...</p>}
      </footer>
    </div>
  );
}

export default App;