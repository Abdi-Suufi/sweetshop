import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import Spinner from './components/Spinner';
import HomePage from './pages/HomePage';
import BasketPage from './pages/BasketPage';
import AdminPage from './pages/AdminPage';

import {
  db, auth, appId as firebaseAppId, // Use appId from firebase.js
  signInAnonymously, signInWithCustomToken, onAuthStateChanged,
  doc, addDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, collection, query, serverTimestamp, writeBatch
} from './firebase'; // Corrected import path

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sweets, setSweets] = useState([]);
  const [basket, setBasket] = useState({ items: [] });
  const [orders, setOrders] = useState([]);
  
  const [isLoadingSweets, setIsLoadingSweets] = useState(true);
  const [isLoadingBasket, setIsLoadingBasket] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true); // Separate loading state for orders

  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [notification, setNotification] = useState({ message: null, type: null });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Show Notification Utility
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: null, type: null }), duration);
  }, []);

  // Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (process.env.REACT_APP_INITIAL_AUTH_TOKEN) {
            await signInWithCustomToken(auth, process.env.REACT_APP_INITIAL_AUTH_TOKEN);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Error during sign-in:", error);
          showNotification('Authentication failed. Some features might be limited.', 'error');
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [showNotification]);

  // Fetch Sweets
  useEffect(() => {
    if (!isAuthReady) return;
    setIsLoadingSweets(true);
    try {
      const sweetsCollectionPath = `/artifacts/${firebaseAppId}/public/data/sweets`;
      const q = query(collection(db, sweetsCollectionPath));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sweetsData = querySnapshot.docs.map(docSn => ({ id: docSn.id, ...docSn.data() }));
        setSweets(sweetsData);
        setIsLoadingSweets(false);
      }, (error) => {
        console.error("Error fetching sweets:", error);
        showNotification('Failed to load sweets. Please try again later.', 'error');
        setIsLoadingSweets(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up sweets listener:", error);
      showNotification('Failed to connect to the database.', 'error');
      setIsLoadingSweets(false);
    }
  }, [isAuthReady, showNotification]);

  // Fetch Basket
  useEffect(() => {
    if (!isAuthReady || !userId) {
      setIsLoadingBasket(isAuthReady && !userId ? false : true); // Stop loading if auth ready but no user
      if(isAuthReady && !userId) setBasket({items: []}); // Clear basket if user logs out
      return;
    }
    setIsLoadingBasket(true);
    const basketDocPath = `/artifacts/${firebaseAppId}/users/${userId}/basket/currentBasket`;
    const unsubscribe = onSnapshot(doc(db, basketDocPath), (docSnap) => {
      if (docSnap.exists()) {
        setBasket(docSnap.data());
      } else {
        setBasket({ items: [] });
      }
      setIsLoadingBasket(false);
    }, (error) => {
      console.error("Error fetching basket:", error);
      showNotification('Failed to load your basket.', 'error');
      setIsLoadingBasket(false);
    });
    return () => unsubscribe();
  }, [isAuthReady, userId, showNotification]);

  // Fetch Orders (for Admin) - Fetch only when on admin orders page or admin main page
  useEffect(() => {
    if (!isAuthReady || !currentPage.startsWith('admin')) {
        // If not on an admin page, or orders are already loaded, don't necessarily re-fetch unless forced
        // This prevents fetching orders if the user is just Browse the shop.
        // Set loading to false if orders were previously loaded and we are navigating away.
        if (orders.length > 0 && !currentPage.startsWith('admin')) setIsLoadingOrders(false);
        return;
    }
    if (currentPage === 'admin-orders' || currentPage === 'admin') { // Only fetch if on relevant pages
        setIsLoadingOrders(true);
        const ordersCollectionPath = `/artifacts/${firebaseAppId}/public/data/orders`;
        // Consider adding orderBy('orderDate', 'desc') for recent orders first
        const q = query(collection(db, ordersCollectionPath)); 
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersData = querySnapshot.docs.map(docSn => ({ id: docSn.id, ...docSn.data() }));
        setOrders(ordersData.sort((a, b) => (b.orderDate?.toDate() || 0) - (a.orderDate?.toDate() || 0)));
        setIsLoadingOrders(false);
        }, (error) => {
        console.error("Error fetching orders:", error);
        showNotification('Failed to load orders.', 'error');
        setIsLoadingOrders(false);
        });
        return () => unsubscribe();
    }
  }, [isAuthReady, currentPage, showNotification, orders.length]); // orders.length helps re-evaluate if it's empty

  const navigate = (page) => {
    setCurrentPage(page);
  };

  // --- Basket Functions ---
  const addToBasket = async (sweet) => {
    if (!userId) {
      showNotification('Please sign in to add items to your basket.', 'error');
      return;
    }
    if (sweet.stock === 0) {
      showNotification(`${sweet.name} is out of stock.`, 'error');
      return;
    }
    const basketDocRef = doc(db, `/artifacts/${firebaseAppId}/users/${userId}/basket/currentBasket`);
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
      currentBasket.updatedAt = serverTimestamp();
      await setDoc(basketDocRef, currentBasket, { merge: true });
      showNotification(`${sweet.name} added to basket!`, 'success');
    } catch (error) {
      console.error("Error adding to basket:", error);
      showNotification('Could not add item to basket.', 'error');
    }
  };

  const updateBasketQuantity = async (sweetId, newQuantity) => {
    if (!userId) return;
    const basketDocRef = doc(db, `/artifacts/${firebaseAppId}/users/${userId}/basket/currentBasket`);
    
    const sweetDetails = sweets.find(s => s.id === sweetId);
    if (!sweetDetails) {
      showNotification('Sweet details not found for quantity update.', 'error');
      return;
    }

    if (newQuantity > sweetDetails.stock) {
      showNotification(`Only ${sweetDetails.stock} units of ${sweetDetails.name} available.`, 'info');
      // Optionally, set quantity to max available stock
      // newQuantity = sweetDetails.stock; 
      return; // Or proceed with newQuantity = sweetDetails.stock
    }

    try {
      const updatedItems = basket.items.map(item =>
        item.sweetId === sweetId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      ).filter(item => item.quantity > 0);

      await setDoc(basketDocRef, { items: updatedItems, updatedAt: serverTimestamp() }, { merge: true });
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

  const removeFromBasket = async (sweetId) => {
    if (!userId) return;
    const basketDocRef = doc(db, `/artifacts/${firebaseAppId}/users/${userId}/basket/currentBasket`);
    try {
      const updatedItems = basket.items.filter(item => item.sweetId !== sweetId);
      await setDoc(basketDocRef, { items: updatedItems, updatedAt: serverTimestamp() }, { merge: true });
      showNotification('Item removed from basket.', 'success');
    } catch (error) {
      console.error("Error removing from basket:", error);
      showNotification('Could not remove item from basket.', 'error');
    }
  };

  const placeOrder = async () => {
    if (!userId || basket.items.length === 0) {
      showNotification('Your basket is empty or you are not signed in.', 'error');
      return;
    }
    const ordersCollectionRef = collection(db, `/artifacts/${firebaseAppId}/public/data/orders`);
    const basketDocRef = doc(db, `/artifacts/${firebaseAppId}/users/${userId}/basket/currentBasket`);
    
    const totalAmount = basket.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      const batch = writeBatch(db);
      batch.set(doc(ordersCollectionRef), {
        userId: userId,
        items: basket.items,
        totalAmount: totalAmount,
        status: 'placed',
        orderDate: serverTimestamp(),
        customerDetails: { userId } 
      });
      batch.set(basketDocRef, { items: [], updatedAt: serverTimestamp() });
      await batch.commit();
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

  const handleProductSubmit = async (productData) => {
    const sweetsCollectionRef = collection(db, `/artifacts/${firebaseAppId}/public/data/sweets`);
    try {
      const dataToSave = {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock)
      };
      if (editingProduct) {
        const productDocRef = doc(db, `/artifacts/${firebaseAppId}/public/data/sweets`, editingProduct.id);
        await updateDoc(productDocRef, dataToSave);
        showNotification('Product updated successfully!', 'success');
      } else {
        await addDoc(sweetsCollectionRef, { ...dataToSave, createdAt: serverTimestamp() });
        showNotification('Product added successfully!', 'success');
      }
      closeProductModal();
    } catch (error) {
      console.error("Error saving product:", error);
      showNotification('Failed to save product. Check console for details.', 'error');
    }
  };

  const deleteProduct = async (productId) => {
    // Consider a custom confirmation modal instead of window.confirm
    if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
        try {
            const productDocRef = doc(db, `/artifacts/${firebaseAppId}/public/data/sweets`, productId);
            await deleteDoc(productDocRef);
            showNotification('Product deleted successfully!', 'success');
        } catch (error) {
            console.error("Error deleting product:", error);
            showNotification('Failed to delete product.', 'error');
        }
    }
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    const orderDocRef = doc(db, `/artifacts/${firebaseAppId}/public/data/orders`, orderId);
    try {
      await updateDoc(orderDocRef, { status: newStatus });
      showNotification(`Order status updated to ${newStatus}.`, 'success');
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification('Failed to update order status.', 'error');
    }
  };

  const basketItemCount = basket.items.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    if (!isAuthReady) { 
      return <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]"><Spinner /></div>;
    }

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
      case 'admin': // Default to admin-products or handle within AdminPage
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
                  showNotification={showNotification} // Pass down for ProductForm
                  setCurrentPage={setCurrentPage} // For AdminPage to manage its state and trigger order fetches
                />;
      default:
        return <HomePage sweets={sweets} isLoading={isLoadingSweets} onAddToBasket={addToBasket} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Navbar navigate={navigate} currentPage={currentPage} basketItemCount={basketItemCount} />
      <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: null, type: null })} />
      <main className="flex-grow"> {/* Make main content area grow */}
        {renderPage()}
      </main>
      <footer className="bg-gray-800 text-white text-center p-6 mt-auto">
        <p>&copy; {new Date().getFullYear()} Sweet Shop. All rights reserved.</p>
        {userId && <p className="text-xs text-gray-400 mt-1">User ID: {userId.substring(0,10)}... | App ID: {firebaseAppId}</p>}
      </footer>
    </div>
  );
}

export default App;