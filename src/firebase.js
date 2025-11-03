// Local storage keys
const STORAGE_KEYS = {
  SWEETS: 'sweetshop_sweets',
  ORDERS: 'sweetshop_orders',
  BASKET: 'sweetshop_basket',
  USER_ID: 'sweetshop_user_id'
};

// Generate a unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Get current user ID or create a new one
const getUserId = () => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = generateId();
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

// Local storage operations
const getSweets = () => {
  const sweets = localStorage.getItem(STORAGE_KEYS.SWEETS);
  return sweets ? JSON.parse(sweets) : [];
};

const saveSweets = (sweets) => {
  localStorage.setItem(STORAGE_KEYS.SWEETS, JSON.stringify(sweets));
};

const getOrders = () => {
  const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
};

const saveOrders = (orders) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

const getBasket = () => {
  const basket = localStorage.getItem(STORAGE_KEYS.BASKET);
  return basket ? JSON.parse(basket) : { items: [] };
};

const saveBasket = (basket) => {
  localStorage.setItem(STORAGE_KEYS.BASKET, JSON.stringify(basket));
};

// Export everything needed by the app
export {
  getUserId,
  getSweets,
  saveSweets,
  getOrders,
  saveOrders,
  getBasket,
  saveBasket,
  generateId
};