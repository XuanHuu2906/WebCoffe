// Product validation service to check if products exist in the database

class ProductValidationService {
  constructor() {
    this.validatedProducts = new Map(); // Cache for validated products
    this.invalidProducts = new Set(); // Cache for invalid product IDs
    this.validationPromises = new Map(); // Prevent duplicate API calls
  }

  /**
   * Validate a single product ID against the database
   * @param {string} productId - The product ID to validate
   * @returns {Promise<boolean>} - True if product exists, false otherwise
   */
  async validateProductId(productId) {
    // Check cache first
    if (this.validatedProducts.has(productId)) {
      return true;
    }
    if (this.invalidProducts.has(productId)) {
      return false;
    }

    // Check if validation is already in progress
    if (this.validationPromises.has(productId)) {
      return await this.validationPromises.get(productId);
    }

    // Start validation
    const validationPromise = this._fetchProductFromAPI(productId);
    this.validationPromises.set(productId, validationPromise);

    try {
      const isValid = await validationPromise;
      
      // Cache the result
      if (isValid) {
        this.validatedProducts.set(productId, true);
      } else {
        this.invalidProducts.add(productId);
      }
      
      return isValid;
    } finally {
      // Clean up the promise
      this.validationPromises.delete(productId);
    }
  }

  /**
   * Validate multiple product IDs
   * @param {string[]} productIds - Array of product IDs to validate
   * @returns {Promise<{valid: string[], invalid: string[]}>} - Object with valid and invalid product IDs
   */
  async validateProductIds(productIds) {
    const validationResults = await Promise.allSettled(
      productIds.map(id => this.validateProductId(id))
    );

    const valid = [];
    const invalid = [];

    productIds.forEach((id, index) => {
      const result = validationResults[index];
      if (result.status === 'fulfilled' && result.value) {
        valid.push(id);
      } else {
        invalid.push(id);
      }
    });

    return { valid, invalid };
  }

  /**
   * Validate cart items and return only valid ones
   * @param {Array} cartItems - Array of cart items to validate
   * @returns {Promise<{validItems: Array, invalidItems: Array}>} - Object with valid and invalid cart items
   */
  async validateCartItems(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { validItems: [], invalidItems: [] };
    }

    const productIds = cartItems.map(item => item.product?._id).filter(Boolean);
    const { valid: validProductIds, invalid: invalidProductIds } = await this.validateProductIds(productIds);

    const validItems = cartItems.filter(item => 
      item.product?._id && validProductIds.includes(item.product._id)
    );

    const invalidItems = cartItems.filter(item => 
      item.product?._id && invalidProductIds.includes(item.product._id)
    );

    return { validItems, invalidItems };
  }

  /**
   * Fetch product from API to check if it exists
   * @private
   * @param {string} productId - The product ID to fetch
   * @returns {Promise<boolean>} - True if product exists, false otherwise
   */
  async _fetchProductFromAPI(productId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}`);
      
      if (response.ok) {
        const product = await response.json();
        return product && product._id === productId;
      } else if (response.status === 404) {
        return false;
      } else {
        console.warn(`Failed to validate product ${productId}: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Error validating product ${productId}:`, error);
      return false;
    }
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validatedProducts.clear();
    this.invalidProducts.clear();
    this.validationPromises.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    return {
      validatedProducts: this.validatedProducts.size,
      invalidProducts: this.invalidProducts.size,
      pendingValidations: this.validationPromises.size
    };
  }
}

// Create a singleton instance
const productValidationService = new ProductValidationService();

export default productValidationService;