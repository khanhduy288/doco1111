import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../../../../components/Pages/Cart/CartContext";
import WithBootstrap from "../../../../../WithBoostrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Pagination } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChooseDish = () => {
  const { cart, addToCart, removeItem, updateQuantity } =
    useContext(CartContext);
  const [foods, setFoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchDishes = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/get-full"
      );
      if (response.data.isSuccessed) {
        const dishes = response.data.resultObj;
        if (Array.isArray(dishes)) {
          setFoods(dishes);
        } else {
          console.error("Unexpected response data format:", dishes);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the dishes:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Categories/get-full"
      );
      if (response.data.isSuccessed) {
        const categories = response.data.resultObj;
        if (Array.isArray(categories)) {
          setCategories(categories);
        } else {
          console.error("Unexpected response data format:", categories);
        }
      } else {
        console.error("API call unsuccessful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching the categories:", error);
    }
  };

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  useEffect(() => {
    const token = getToken();
    const fetchCurrentOrder = async () => {
      try {
        const response = await axios.get(
          `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-by-id?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.isSuccessed) {
          setCurrentOrder(response.data.resultObj);
        } else {
          console.error(
            "Failed to fetch current order:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching current order:", error);
      }
    };

    fetchCurrentOrder();
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`cart_${id}`, JSON.stringify(cart));
  }, [cart, id]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredFoods = activeCategory
    ? foods.filter((food) => food.categoryID === activeCategory)
    : foods;

  const nav = useNavigate();

  const handleBack = () => {
    nav(`/waiter/acceptstate/${id}`);
  };

  const handleSaveOrder = async () => {
    const token = getToken();
    if (!currentOrder || cart.length === 0) {
      toast.error(
        "Không thể cập nhật đơn hàng. Dữ liệu đơn hàng hoặc giỏ hàng trống."
      );
      return;
    }

    try {
      const orderDetails = cart.map((item) => ({
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderID: parseInt(id),
        price: item.price,
        description: item.description || "string",
        dishID: item.dishId,
        date: currentOrder.date,
        numberOfCustomer: currentOrder.numberOfCustomer || 0,
        tableID: currentOrder.tableID || 0,
        payment: 0,
        quantity: item.quantity,
        id: 0,
        tableNumber: currentOrder.tableID || 0,
      }));

      const requestBody = {
        orderID: parseInt(id),
        orderDetails: orderDetails,
      };

      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Order/update-order-details",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Updated order, Response:", response);
      toast.success("Tất cả các món đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi cập nhật đơn hàng: " + error.message);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentFoods = filteredFoods.slice(startIndex, endIndex);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  return (
    <WithBootstrap>
      <ToastContainer
        style={{
          top: "80px",
          right: "20px",
        }}
        position="top-right"
        autoClose={1500}
      />
      <div className="container">
        <div className="row mb-3">
          <div className="col-lg-12">
            <div className="d-flex" style={{ gap: "10px", overflowX: "auto" }}>
              <button
                className={`btn ${
                  activeCategory === null ? "btn-info" : "btn-light"
                }`}
                onClick={() => setActiveCategory(null)}
                style={{
                  borderRadius: "20px",
                  padding: "8px 16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                TẤT CẢ
              </button>
              {categories.map((category) => (
                <button
                  key={category.idCategory}
                  className={`btn ${
                    category.idCategory === activeCategory
                      ? "btn-info"
                      : "btn-light"
                  }`}
                  onClick={() => setActiveCategory(category.idCategory)}
                  style={{
                    borderRadius: "20px",
                    padding: "8px 16px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="row">
              {currentFoods.map((food) => (
                <div key={food.dishId} className="col-md-4 mb-3">
                  <div className="card">
                    <img
                      src={food.image}
                      className="card-img-top"
                      alt={food.name}
                      style={{ height: "150px", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">
                        {truncateText(food.name, 15)}
                      </h5>
                      <p className="card-text">
                        {food.price.toLocaleString()} đ
                      </p>
                      <button
                        className="btn btn-info"
                        onClick={() => addToCart(food)}
                      >
                        Thêm vào giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="pagination-container"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredFoods.length}
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <h3>Giỏ hàng</h3>
            {cart.map((item) => (
              <div
                key={item.dishId}
                className="d-flex justify-content-between align-items-center mb-2"
                style={{ overflowX: "auto" }}
              >
                <span>{truncateText(item.name, 15)}</span>
                <div class="qty-container">
                  <button
                    className="qty-btn-minus btn-light"
                    onClick={() => updateQuantity(item.dishId, -1)}
                  >
                    <i class="fa fa-minus"></i>
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    className="qty-btn-minus btn-light"
                    onClick={() => updateQuantity(item.dishId, 1)}
                  >
                    <i class="fa fa-plus"></i>
                  </button>
                  <span className="mx-2">
                    {(item.price * item.quantity).toLocaleString()} đ
                  </span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(item.dishId)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between">
              <strong>Tổng tiền:</strong>
              <strong>{totalAmount.toLocaleString()} đ</strong>
            </div>
            <div className="mt-3">
              <button className="btn btn-danger btn-block" onClick={handleBack}>
                Quay lại
              </button>
              <button
                className="btn btn-success btn-block mt-2"
                onClick={handleSaveOrder}
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default ChooseDish;
