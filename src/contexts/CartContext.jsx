import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create Cart Context
const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0
      };
    
    case 'ADD_TO_CART': {
      const { product, quantity = 1, size = null } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product._id === product._id && item.size === size
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem = {
          id: `${product._id}_${size || 'default'}`,
          product,
          quantity,
          size,
          price: size ? product.sizes?.find(s => s.name === size)?.price || product.price : product.price
        };
        newItems = [...state.items, newItem];
      }

      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }

    case 'REMOVE_FROM_CART': {
      const { itemId } = action.payload;
      const newItems = state.items.filter(item => item.id !== itemId);
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { itemId } });
      }

      const newItems = state.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false
};

// Cart storage utilities
const CART_STORAGE_KEY = 'webcaffe_cart';
const CART_VERSION = '1.0';
const CART_EXPIRY_DAYS = 7; // Cart expires after 7 days

const cartStorage = {
  save: (cartData) => {
    try {
      const dataToSave = {
        ...cartData,
        version: CART_VERSION,
        timestamp: Date.now(),
        expiresAt: Date.now() + (CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      // Try to clear some space and retry
      try {
        const dataToSave = {
          ...cartData,
          version: CART_VERSION,
          timestamp: Date.now(),
          expiresAt: Date.now() + (CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        };
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
        return true;
      } catch (retryError) {
        console.error('Failed to save cart after retry:', retryError);
        return false;
      }
    }
  },

  load: () => {
    try {
      const savedData = localStorage.getItem(CART_STORAGE_KEY);
      if (!savedData) return null;

      const cartData = JSON.parse(savedData);
      
      // Check if cart has expired
      if (cartData.expiresAt && Date.now() > cartData.expiresAt) {
        console.log('Cart data expired, clearing...');
        cartStorage.clear();
        return null;
      }

      // Validate cart data structure
      if (!cartData.items || !Array.isArray(cartData.items)) {
        console.warn('Invalid cart data structure, clearing...');
        cartStorage.clear();
        return null;
      }

      // Validate each cart item
      const validItems = cartData.items.filter(item => {
        return item && 
               item.id && 
               item.product && 
               item.product._id && 
               typeof item.quantity === 'number' && 
               item.quantity > 0 && 
               typeof item.price === 'number' && 
               item.price >= 0;
      });

      if (validItems.length !== cartData.items.length) {
        console.warn('Some cart items were invalid and removed');
      }

      // Recalculate totals to ensure consistency
      const recalculatedTotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const recalculatedItemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: validItems,
        total: recalculatedTotal,
        itemCount: recalculatedItemCount
      };
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      cartStorage.clear();
      return null;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  },

  getStorageInfo: () => {
    try {
      const savedData = localStorage.getItem(CART_STORAGE_KEY);
      if (!savedData) return null;

      const cartData = JSON.parse(savedData);
      return {
        size: new Blob([savedData]).size,
        timestamp: cartData.timestamp,
        expiresAt: cartData.expiresAt,
        version: cartData.version,
        itemCount: cartData.items?.length || 0
      };
    } catch (error) {
      return null;
    }
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const cartData = cartStorage.load();
        if (cartData) {
          dispatch({ type: 'LOAD_CART', payload: cartData });
          console.log('Cart loaded successfully from localStorage');
        } else {
          console.log('No valid cart data found in localStorage');
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes (with debouncing)
  useEffect(() => {
    // Don't save if cart is loading or empty on initial load
    if (state.loading) return;

    const saveTimer = setTimeout(() => {
      const cartData = {
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      };
      
      const success = cartStorage.save(cartData);
      if (success) {
        console.log('Cart saved successfully to localStorage');
      } else {
        console.warn('Failed to save cart to localStorage');
      }
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(saveTimer);
  }, [state.items, state.total, state.itemCount, state.loading]);

  // Handle storage events (when cart is modified in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY && e.newValue !== e.oldValue) {
        console.log('Cart updated in another tab, syncing...');
        const cartData = cartStorage.load();
        if (cartData) {
          dispatch({ type: 'LOAD_CART', payload: cartData });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle page visibility change (refresh cart when page becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, check if cart data is still valid
        const cartData = cartStorage.load();
        if (cartData && JSON.stringify(cartData) !== JSON.stringify({
          items: state.items,
          total: state.total,
          itemCount: state.itemCount
        })) {
          console.log('Cart data refreshed on page visibility');
          dispatch({ type: 'LOAD_CART', payload: cartData });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.items, state.total, state.itemCount]);

  // Add item to cart
  const addToCart = (product, quantity = 1, size = null) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, quantity, size }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { itemId }
    });
  };

  // Update item quantity
  const updateQuantity = (itemId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { itemId, quantity }
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    cartStorage.clear();
  };

  // Manually sync cart with localStorage
  const syncCart = () => {
    try {
      const cartData = cartStorage.load();
      if (cartData) {
        dispatch({ type: 'LOAD_CART', payload: cartData });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error syncing cart:', error);
      return false;
    }
  };

  // Get cart storage information
  const getStorageInfo = () => {
    return cartStorage.getStorageInfo();
  };

  // Force save cart to localStorage
  const saveCart = () => {
    const cartData = {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount
    };
    return cartStorage.save(cartData);
  };

  // Get item quantity by product ID and size
  const getItemQuantity = (productId, size = null) => {
    const item = state.items.find(
      item => item.product._id === productId && item.size === size
    );
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId, size = null) => {
    return state.items.some(
      item => item.product._id === productId && item.size === size
    );
  };

  // Calculate tax (assuming 8.5% tax rate)
  const getTax = () => {
    return state.total * 0.085;
  };

  // Calculate total with tax
  const getTotalWithTax = () => {
    return state.total + getTax();
  };

  // Get cart summary
  const getCartSummary = () => {
    const subtotal = state.total;
    const tax = getTax();
    const total = getTotalWithTax();
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: state.itemCount
    };
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    getTax,
    getTotalWithTax,
    getCartSummary,
    syncCart,
    getStorageInfo,
    saveCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;