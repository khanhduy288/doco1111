import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import { Pagination, Input, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const OwnerListTableReservation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const nav = useNavigate();
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("");

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  useEffect(() => {
    const token = getToken();
    axios
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-all-order", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          const sortedOrders = response.data.resultObj.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });
          setOrders(sortedOrders);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the orders!", error);
      });

    // Fetch all restaurants
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
  }, []);

  const handleChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const filteredOrders = orders
    .filter((order) => {
      const phoneMatch = order.phone.includes(phoneFilter);
      const statusMatch = statusFilter
        ? order.status === parseInt(statusFilter)
        : true;
      const restaurantMatch = restaurantFilter
        ? order.restaurantID === parseInt(restaurantFilter)
        : true;
      return phoneMatch && statusMatch && restaurantMatch;
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
    nav(`/owner/details/${id}`);
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
        <h3>LỊCH ĐẶT BÀN</h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-3">
              <Input.Search
                type="search"
                placeholder="Nhập số điện thoại khách "
                aria-label="Search"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
            </div>
            <div className="col-lg-3">
              <Select
                style={{ width: '100%' }}
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="0">Chờ</Option>
                <Option value="1">Chấp nhận</Option>
                <Option value="2">Đang dùng</Option>
                <Option value="3">Hủy</Option>
                <Option value="4">Hoàn thành</Option>
              </Select>
            </div>
            <div className="col-lg-3">
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn ngày"
                value={dateFilter}
                onChange={(value) => setDateFilter(value)}
              >
                <Option value="">Tất cả các ngày</Option>
                <Option value="newest">Ngày gần nhất</Option>
                <Option value="oldest">Ngày xa nhất</Option>
              </Select>
            </div>
            <div className="col-lg-3">
              <Select
                style={{ width: '100%' }}
                placeholder="Chọn nhà hàng"
                value={restaurantFilter}
                onChange={(value) => setRestaurantFilter(value)}
              >
                <Option value="">Tất cả nhà hàng</Option>
                {restaurants.map((restaurant) => (
                  <Option key={restaurant.restaurantID} value={restaurant.restaurantID.toString()}>
                    {restaurant.address}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div>
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
                <th scope="col">Cơ sở</th>
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
                  <td>{getRestaurantName(order.restaurantID)}</td>
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

export default OwnerListTableReservation;