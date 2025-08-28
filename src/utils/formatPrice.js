/**
 * Format price with Vietnamese formatting:
 * - Use dots as thousand separators
 * - Remove trailing zeros
 * - Add VNĐ currency suffix
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0 VNĐ';
  }
  
  // Convert to number and remove trailing zeros
  const num = parseFloat(price);
  
  // Format with dots as thousand separators
  const formatted = num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return `${formatted} VNĐ`;
};

/**
 * Format price without currency suffix
 * - Use dots as thousand separators
 * - Remove trailing zeros
 */
export const formatPriceNumber = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '0';
  }
  
  // Convert to number and remove trailing zeros
  const num = parseFloat(price);
  
  // Format with dots as thousand separators
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};