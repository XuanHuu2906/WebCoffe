// Environment configuration checker
export const getEnvironmentConfig = () => {
  const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    nodeEnv: import.meta.env.VITE_NODE_ENV,
    webllmModel: import.meta.env.VITE_WEBLLM_MODEL,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  };

  console.log('🔧 Environment Configuration:', config);
  return config;
};

// Check if we're in development or production
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development' || import.meta.env.DEV;
};

export const isProduction = () => {
  return import.meta.env.MODE === 'production' || import.meta.env.PROD;
};

// Get the correct API URL based on environment
export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    console.warn('⚠️ VITE_API_URL not found, falling back to localhost');
    return 'http://localhost:5000';
  }
  
  console.log(`🌐 Using API URL: ${apiUrl}`);
  return apiUrl;
};