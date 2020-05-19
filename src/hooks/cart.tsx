import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

import api from '../services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLoaded = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsLoaded) {
        setProducts(JSON.parse(productsLoaded));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const isProductOnCart = products.find(p => p.id === product.id);

      if (!isProductOnCart) {
        const newProduct = { ...product, quantity: 1 };

        setProducts([...products, newProduct]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, newProduct]),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id && product.quantity !== 1) {
          const productDecreased = {
            ...product,
            quantity: product.quantity - 1,
          };
          return productDecreased;
        }

        return product;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id) {
          const productIncreased = {
            ...product,
            quantity: product.quantity + 1,
          };
          return productIncreased;
        }

        return product;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
