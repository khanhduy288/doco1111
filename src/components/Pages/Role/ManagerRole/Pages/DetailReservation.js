import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const DetailReservation = () => {
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

  const getTableNumber = (id) => {
    const table = tables.find((t) => t.tableID === id);
    return table ? table.tableNumber : "Chưa được xếp";
  };

  const getAreaName = (tableID) => {
    const table = tables.find((t) => t.tableID === tableID);
    if (!table) return "Chưa xác định";

    const area = areas.find((a) => a.areaID === table.areaID);
    return area ? area.areaName : "Chưa xác định";
  };

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

  const totalPrice = orderDetails.reduce(
    (sum, detail) => sum + detail.price * detail.quantity,
    0
  );

  if (!order) {
    return <p>Loading...</p>;
  }
  return (
    <WithBootstrap>
      <div className="container mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">CHI TIẾT ĐƠN HÀNG</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <p>Tên khách hàng: {order.userName}</p>
                <p>Số điện thoại: {order.phone}</p>
                <p>Số lượng khách: {order.numberOfCustomer}</p>
                <p>Ngày đặt: {new Date(order.date).toLocaleDateString()}</p>
                <p>Giờ đặt: {order.time}</p>
              </div>
              <div className="col-md-6">
                <p style={{ fontWeight: "bold" }}>
                  Trạng thái: {getStatusText(status)}
                </p>
                <p>Cơ sở : {getRestaurantName(order.restaurantID)} </p>
                <p>Bàn: {getTableNumber(order.tableID)}</p>
                <p>
                  Khu vực:{" "}
                  {order.tableID ? getAreaName(order.tableID) : "Chưa có"}
                </p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr style={{ textAlign: "center" }}>
                    <th>STT</th>
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

            <div className="text-end">
              <p>Tổng số tiền phải thanh toán: {totalPrice}đ</p>
              <p>Khách đã cọc: {order.payment}đ</p>
              <p>Chiết khấu khuyến mại : {order.discount}đ</p>
              <p>
                Số tiền còn lại cần thanh toán:{" "}
                {totalPrice - order.payment - order.discount}đ
              </p>
            </div>
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default DetailReservation;
