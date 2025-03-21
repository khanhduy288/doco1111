import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BookedDetails = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [dishes, setDishes] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState(null);
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  useEffect(() => {
    const token = getToken();
    axios
      .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-by-id?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          setOrder(response.data.resultObj);
          setStatus(response.data.resultObj.status);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the order details!", error);
      });

    axios
      .get(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-all-order-detail-by-orderId?orderId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.isSuccessed) {
          const details = response.data.resultObj;
          setOrderDetails(details);
          details.forEach((detail) => {
            axios
              .get(
                `https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/get-by-id?id=${detail.dishID}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
              .then((res) => {
                setDishes((prevDishes) => ({
                  ...prevDishes,
                  [detail.dishID]: res.data,
                }));
              })
              .catch((error) => {
                console.error(
                  "There was an error fetching the dish details!",
                  error
                );
              });
          });
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the order details!", error);
      });
  }, [id]);

  useEffect(() => {
    const token = getToken();
    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/get-full")
      .then((response) => {
        if (response.data.isSuccessed) {
          setRestaurants(response.data.resultObj);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the restaurants!", error);
      });

    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/get-full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          setTables(response.data.resultObj);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the tables!", error);
      });

    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/get-full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          setAreas(response.data.resultObj);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the areas!", error);
      });
  }, []);

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find((r) => r.restaurantID === id);
    return restaurant ? restaurant.address : "Unknown";
  };

  const totalPrice = orderDetails.reduce(
    (sum, detail) => sum + detail.price * detail.quantity,
    0
  );

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Chờ";
      case 1:
        return "Chấp nhận";
      case 2:
        return "Đang dùng";
      case 3:
        return "Hủy";
      case 4:
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };

  if (!order) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <h5>Nhà hàng</h5>
            <p>Cơ sở : {getRestaurantName(order.restaurantID)}</p>
            <p>Trạng thái đơn : {getStatusText(order.status)}</p>
            <p>Số điện thoại: 039 797 0202</p>
            <p>Email: sep490_g64@gmail.com</p>
          </div>
          <div className="col-lg-4">
            <h5>Khách hàng</h5>
            <p>Tên : {order.userName}</p>
            <p>Số điện thoại: {order.phone}</p>
            <p>Ngày đặt : 06/06/2024</p>
            <p>Giờ đặt : {new Date(order.date).toLocaleDateString()}</p>
            <p>Số người : {order.numberOfCustomer}</p>
          </div>
          <div className="col-lg-4">
            <h5>Thanh toán</h5>
            <p>Tổng tiền : {order.priceTotal}</p>
            <p>Đã cọc : {order.payment}đ</p>
            <p>Còn lại : {order.priceTotal - order.payment}</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr style={{ textAlign: "center" }}>
                <th>STT</th>
                <th>Hình ảnh</th>
                <th style={{ textAlign: "left" }}>Món ăn</th>
                <th style={{ textAlign: "left" }}>Loại</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {orderDetails.map((detail, index) => {
                const dish = dishes[detail.dishID] || {};
                return (
                  <tr key={detail.dishID}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={dish.image}
                        style={{ width: "50px", height: "auto" }}
                      />
                    </td>
                    <td style={{ textAlign: "left" }}>
                      {dish.name || detail.dishID}
                    </td>
                    <td style={{ textAlign: "left" }}>
                      {dish.categoryName || ""}
                    </td>
                    <td>
                      {detail.quantity} {dish.type}
                    </td>
                    <td>{detail.price}đ</td>
                    <td>{detail.price * detail.quantity}đ</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default BookedDetails;
