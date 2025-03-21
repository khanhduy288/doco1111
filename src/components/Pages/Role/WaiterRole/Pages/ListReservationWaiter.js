import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import { Pagination, Input } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListReservationWaiter = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [currentStaff, setCurrentStaff] = useState(null);
  const nav = useNavigate();
  const [phoneFilter, setPhoneFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  useEffect(() => {
    const token = getToken();
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));

    // Fetch current staff information
    if (storedUser && storedUser.id) {
      axios
        .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/get-by-id?Id=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setCurrentStaff(response.data);
          // After getting staff info, fetch orders for their restaurant
          fetchOrders(response.data.restaurantID);
        })
        .catch((error) => {
          console.error("Error fetching staff information:", error);
          toast.error("Lỗi khi lấy thông tin nhân viên");
        });
    }

    // Fetch all restaurants
    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Restaurants/get-full", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          setRestaurants(response.data.resultObj);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the restaurants!", error);
        toast.error("Lỗi khi lấy danh sách nhà hàng");
      });
  }, []);

  const fetchOrders = (restaurantID) => {
    const token = getToken();
    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-all-order", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          const filteredOrders = response.data.resultObj
            .filter((order) => 
              (order.status === 1 || order.status === 2) && 
              order.restaurantID === restaurantID
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setOrders(filteredOrders);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the orders!", error);
        toast.error("Lỗi khi lấy danh sách đơn đặt bàn");
      });
  };

  const handleChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const filteredOrders = orders
    .filter((order) => {
      const phoneMatch = order.phone.includes(phoneFilter);
      return phoneMatch;
    })
    .sort((a, b) => {
      if (dateFilter === "oldest") {
        return new Date(a.date) - new Date(b.date);
      } else {
        return 0;
      }
    });

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleViewDetail = (id) => {
    nav(`/waiter/acceptstate/${id}`);
  };

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find((r) => r.restaurantID === id);
    return restaurant ? restaurant.address : "Unknown";
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
      <div className="main">
        <h3>LỊCH ĐẶT BÀN - Cơ sở{" "} {currentStaff && getRestaurantName(currentStaff.restaurantID)}</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-6 col-sm-12 mb-2">
              <Input.Search
                type="search"
                placeholder="Nhập số điện thoại khách "
                aria-label="Search"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
            <div className="col-lg-6 col-sm-12">
              <select
                className="form-select-sm"
                aria-label="Large select example"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">Chọn ngày</option>
                <option value="newest">Ngày gần nhất</option>
                <option value="oldest">Ngày xa nhất</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">STT</th>
                <th scope="col">Tên</th>
                <th scope="col">SĐT</th>
                <th scope="col">Số lượng khách</th>
                <th scope="col">Ngày đặt</th>
                <th scope="col">Giờ đặt</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr key={order.orderID}>
                  <th scope="row">{startIndex + index + 1}</th>
                  <td>{order.userName}</td>
                  <td>{order.phone}</td>
                  <td>{order.numberOfCustomer}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.time}</td>
                  <td>{getStatusText(order.status)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => handleViewDetail(order.orderID)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="pagination-container"
            style={{ marginTop: "20px", textAlign: "center" }}
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              onChange={handleChange}
              total={filteredOrders.length}
            />
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default ListReservationWaiter;