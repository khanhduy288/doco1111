import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "./CartContext.js";

const Cart = () => {
  const { cart, removeItem, updateQuantity,clearCart } = useContext(CartContext);
  const [totalPrice, setTotalPrice] = useState(0);


  useEffect(() => {
    let total = 0;
    cart.forEach((item) => {
      const price = parseFloat(item.price) * item.quantity;
      if (!isNaN(price)) {
        total += price;
      }
    });
    setTotalPrice(total);
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center" }}>
        <h2>Giỏ hàng trống</h2>
      </div>
    );
  }

  const handleClearCart = (e) => {
    e.preventDefault();
    clearCart();
  };


  return (
    <div className="container">
      <h3>Tổng tiền</h3>
      <div style={{ textAlign: "right", marginBottom: "20px" }}>
        <h4>{totalPrice.toLocaleString()}đ</h4>
        <a href="#" style={{ color: "green" }} onClick={handleClearCart}>
          Xóa hết tạm tính
        </a>
      </div>
      <table className="table">
        <tbody>
          {cart.map((item,index) => (
            <tr key={item.dishId}>
              <td>{index + 1}</td>
              <td>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "50px", height: "auto" }}
                />
              </td>
              <td>
                <h5>{item.name}</h5>
                <p>{item.price.toLocaleString()}đ (đĩa)</p>
              </td>
              <td>
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => updateQuantity(item.dishId, -1)}
                  >
                    -
                  </button>
                  <span style={{ margin: "0 10px" }}>{item.quantity}</span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => updateQuantity(item.dishId, 1)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td style={{ textAlign: "right" }}>
                <h5>{(item.price * item.quantity).toLocaleString()}đ</h5>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => removeItem(item.dishId)}
                  style={{ color: "green", textDecoration: "none" }}
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Cart;
