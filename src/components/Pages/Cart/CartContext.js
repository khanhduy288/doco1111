import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (dish) => {
    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item.dishId === dish.dishId);
      if (existingDish) {
        return prevCart.map((item) =>
          item.dishId === dish.dishId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...dish, quantity: 1 }];
      }
    });
  };

  const removeItem = (dishId) => {
    setCart((prevCart) => prevCart.filter((item) => item.dishId !== dishId));
  };

  const updateQuantity = (dishId, amount) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.dishId === dishId) {
            const newQuantity = Math.min(Math.max(item.quantity + amount, 0), 50);
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        updateQuantity,
        getTotalItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
