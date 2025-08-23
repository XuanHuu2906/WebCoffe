import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create Product Context
const ProductContext = createContext();

// Product reducer
const productReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_PRODUCTS_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'FETCH_PRODUCTS_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.data,
        pagination: action.payload.pagination,
        error: null
      };
    
    case 'FETCH_PRODUCTS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'FETCH_CATEGORIES_SUCCESS':
      return {
        ...state,
        categories: action.payload
      };
    
    case 'FETCH_FEATURED_SUCCESS':
      return {
        ...state,
        featuredProducts: action.payload
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          category: '',
          search: '',
          featured: false,
          page: 1,
          limit: 12
        }
      };
    
    case 'SET_SINGLE_PRODUCT':
      return {
        ...state,
        currentProduct: action.payload
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  filters: {
    category: '',
    search: '',
    featured: false,
    page: 1,
    limit: 12
  }
};

// Product Provider Component
export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Base API URL
  const API_BASE_URL = 'http://localhost:5003/api';

  // Fetch products with filters
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: 'FETCH_PRODUCTS_START' });
      
      const queryParams = new URLSearchParams();
      
      // Apply filters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.featured) queryParams.append('featured', 'true');
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await axios.get(`${API_BASE_URL}/products?${queryParams}`);
      
      dispatch({
        type: 'FETCH_PRODUCTS_SUCCESS',
        payload: response.data
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  }, [API_BASE_URL]);

  // Fetch single product by ID
  const fetchProductById = async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      
      dispatch({
        type: 'SET_SINGLE_PRODUCT',
        payload: response.data.data
      });
      
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch product';
      dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: errorMessage
      });
      throw error;
    }
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`);
      
      dispatch({
        type: 'FETCH_CATEGORIES_SUCCESS',
        payload: response.data.data
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [API_BASE_URL]);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/featured`);
      
      dispatch({
        type: 'FETCH_FEATURED_SUCCESS',
        payload: response.data.data
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  }, [API_BASE_URL]);

  // Set filters
  const setFilters = (newFilters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: newFilters
    });
  };

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Search products
  const searchProducts = async (searchTerm) => {
    const filters = {
      ...state.filters,
      search: searchTerm,
      page: 1
    };
    
    setFilters(filters);
    return await fetchProducts(filters);
  };

  // Filter by category
  const filterByCategory = async (category) => {
    const filters = {
      ...state.filters,
      category,
      page: 1
    };
    
    setFilters(filters);
    return await fetchProducts(filters);
  };

  // Load more products (pagination)
  const loadMoreProducts = async () => {
    if (state.pagination.current < state.pagination.pages) {
      const filters = {
        ...state.filters,
        page: state.pagination.current + 1
      };
      
      setFilters(filters);
      return await fetchProducts(filters);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    fetchProducts(state.filters);
    fetchCategories();
    fetchFeaturedProducts();
  }, [fetchProducts, fetchCategories, fetchFeaturedProducts, state.filters]);

  // Refetch products when filters change
  useEffect(() => {
    if (state.filters.category || state.filters.search || state.filters.featured) {
      fetchProducts(state.filters);
    }
  }, [state.filters.category, state.filters.search, state.filters.featured, state.filters, fetchProducts]);

  const value = {
    ...state,
    fetchProducts,
    fetchProductById,
    fetchCategories,
    fetchFeaturedProducts,
    setFilters,
    clearFilters,
    searchProducts,
    filterByCategory,
    loadMoreProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;