// Cart cleanup utility to remove invalid product IDs from localStorage
import productValidationService from '../services/productValidationService.js';

/**
 * Clean invalid product IDs from all cart storage keys
 * @returns {Promise<{cleaned: number, errors: string[]}>} - Results of cleanup operation
 */
export const cleanAllCartStorage = async () => {
  const results = {
    cleaned: 0,
    errors: []
  };

  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    const cartKeys = keys.filter(key => 
      key.includes('dreamcoffee_cart') || key.includes('pendingCartItems')
    );

    console.log('Found cart storage keys:', cartKeys);

    for (const key of cartKeys) {
      try {
        const data = localStorage.getItem(key);
        if (!data) continue;

        const cartData = JSON.parse(data);
        
        // Handle different cart data structures
        let items = [];
        if (cartData.items && Array.isArray(cartData.items)) {
          items = cartData.items;
        } else if (Array.isArray(cartData)) {
          items = cartData;
        }

        if (items.length === 0) continue;

        // Validate cart items
        const { validItems, invalidItems } = await productValidationService.validateCartItems(items);
        
        if (invalidItems.length > 0) {
          console.log(`Cleaning ${invalidItems.length} invalid items from ${key}`);
          
          if (validItems.length > 0) {
            // Update with valid items only
            if (cartData.items) {
              // Standard cart format
              const validTotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const validItemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
              
              const cleanedCartData = {
                ...cartData,
                items: validItems,
                total: validTotal,
                itemCount: validItemCount
              };
              
              localStorage.setItem(key, JSON.stringify(cleanedCartData));
            } else {
              // Pending items format
              localStorage.setItem(key, JSON.stringify(validItems));
            }
          } else {
            // No valid items, remove the key
            localStorage.removeItem(key);
          }
          
          results.cleaned += invalidItems.length;
        }
      } catch (error) {
        const errorMsg = `Error cleaning cart key ${key}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(`Cart cleanup completed. Removed ${results.cleaned} invalid items.`);
    return results;
  } catch (error) {
    const errorMsg = `Error during cart cleanup: ${error.message}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
    return results;
  }
};

/**
 * Remove a specific invalid product ID from all cart storage
 * @param {string} productId - The product ID to remove
 * @returns {Promise<{removed: number, errors: string[]}>} - Results of removal operation
 */
export const removeInvalidProductFromStorage = async (productId) => {
  const results = {
    removed: 0,
    errors: []
  };

  try {
    // Validate the product ID first
    const isValid = await productValidationService.validateProductId(productId);
    
    if (isValid) {
      console.log(`Product ${productId} is valid, not removing from storage`);
      return results;
    }

    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    const cartKeys = keys.filter(key => 
      key.includes('dreamcoffee_cart') || key.includes('pendingCartItems')
    );

    for (const key of cartKeys) {
      try {
        const data = localStorage.getItem(key);
        if (!data || !data.includes(productId)) continue;

        const cartData = JSON.parse(data);
        let items = [];
        let wasModified = false;

        if (cartData.items && Array.isArray(cartData.items)) {
          const originalLength = cartData.items.length;
          items = cartData.items.filter(item => item.product?._id !== productId);
          wasModified = items.length !== originalLength;
          results.removed += originalLength - items.length;
        } else if (Array.isArray(cartData)) {
          const originalLength = cartData.length;
          items = cartData.filter(item => item.product?._id !== productId);
          wasModified = items.length !== originalLength;
          results.removed += originalLength - items.length;
        }

        if (wasModified) {
          if (items.length > 0) {
            if (cartData.items) {
              // Standard cart format
              const validTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const validItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
              
              const updatedCartData = {
                ...cartData,
                items: items,
                total: validTotal,
                itemCount: validItemCount
              };
              
              localStorage.setItem(key, JSON.stringify(updatedCartData));
            } else {
              // Pending items format
              localStorage.setItem(key, JSON.stringify(items));
            }
          } else {
            // No items left, remove the key
            localStorage.removeItem(key);
          }
          
          console.log(`Removed invalid product ${productId} from ${key}`);
        }
      } catch (error) {
        const errorMsg = `Error removing product from ${key}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return results;
  } catch (error) {
    const errorMsg = `Error removing invalid product: ${error.message}`;
    console.error(errorMsg);
    results.errors.push(errorMsg);
    return results;
  }
};

/**
 * Get information about cart storage
 * @returns {Object} - Information about cart storage
 */
export const getCartStorageInfo = () => {
  try {
    const keys = Object.keys(localStorage);
    const cartKeys = keys.filter(key => 
      key.includes('dreamcoffee_cart') || key.includes('pendingCartItems')
    );

    const info = {
      totalCartKeys: cartKeys.length,
      cartKeys: [],
      totalSize: 0
    };

    cartKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        const size = new Blob([data || '']).size;
        const cartData = data ? JSON.parse(data) : null;
        
        let itemCount = 0;
        if (cartData?.items && Array.isArray(cartData.items)) {
          itemCount = cartData.items.length;
        } else if (Array.isArray(cartData)) {
          itemCount = cartData.length;
        }

        info.cartKeys.push({
          key,
          size,
          itemCount,
          hasData: !!data
        });
        
        info.totalSize += size;
      } catch (error) {
        info.cartKeys.push({
          key,
          size: 0,
          itemCount: 0,
          hasData: false,
          error: error.message
        });
      }
    });

    return info;
  } catch (error) {
    console.error('Error getting cart storage info:', error);
    return {
      totalCartKeys: 0,
      cartKeys: [],
      totalSize: 0,
      error: error.message
    };
  }
};