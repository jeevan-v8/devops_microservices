// services/productService.ts
export const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3002/products');  // URL to your product service
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

