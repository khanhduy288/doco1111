import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Input, Button, Select } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment-timezone";

const ListReservationReceptionist = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const nav = useNavigate();
  const [phoneFilter, setPhoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentTime, setCurrentTime] = useState(
    moment().tz("Asia/Ho_Chi_Minh")
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newReservation, setNewReservation] = useState({
    userName: "",
    restaurantID: "",
    numberOfCustomer: "",
    phone: "",
    date: "",
    time: "",
  });
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [currentStaff, setCurrentStaff] = useState(null);

  useEffect(() => {
    const token = getToken();
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));

    if (storedUser && storedUser.id) {
      axios
        .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/Staff/get-by-id?Id=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setCurrentStaff(response.data);
          fetchOrders(response.data.restaurantID);
        })
        .catch((error) => {
          console.error("Error fetching staff information:", error);
          toast.error("Lỗi khi lấy thông tin nhân viên");
        });
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate());

    setMinDate(today.toISOString().split("T")[0]);
    setMaxDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().tz("Asia/Ho_Chi_Minh"));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate >= today && selectedDate <= new Date(maxDate)) {
      setNewReservation({ ...newReservation, date: e.target.value });
    }
  };

  const handleTimeChange = (e) => {
    const selectedDateTime = moment(
      newReservation.date + " " + e.target.value,
      "YYYY-MM-DD HH:mm"
    ).tz("Asia/Ho_Chi_Minh");

    if (selectedDateTime.isAfter(currentTime)) {
      setNewReservation({ ...newReservation, time: e.target.value });
    } else {
      toast.error("Không thể chọn thời gian trong quá khứ");
    }
  };

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchOrders = async (restaurantID) => {
    const token = getToken();
    try {
      const response = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-all-order",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.isSuccessed) {
        const filteredOrders = response.data.resultObj
          .filter((order) => order.restaurantID === restaurantID)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error("There was an error fetching the orders!", error);
      toast.error("Lỗi khi lấy danh sách đơn đặt bàn");
    }
  };

  useEffect(() => {
    fetchOrders();

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
      return phoneMatch && statusMatch;
    })
    .sort((a, b) => {
      if (dateFilter === "oldest") {
        return new Date(a.date) - new Date(b.date);
      } else {
        // Giữ nguyên thứ tự hiện tại (đã được sắp xếp từ mới đến cũ)
        return 0;
      }
    });

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleViewDetail = (id) => {
    nav(`/receptionist/waitstate/${id}`);
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

  const handleAddReservation = async () => {
    const token = getToken();
    if (
      !newReservation.userName.trim() ||
      !newReservation.phone.trim() ||
      !newReservation.numberOfCustomer ||
      !newReservation.date ||
      !newReservation.time
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newReservation.phone.trim())) {
      toast.error("Số điện thoại phải có đúng 10 chữ số");
      return;
    }

    try {
      const response = await axios.post(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Order/post",
        {
          ...newReservation,
          numberOfCustomer: parseInt(newReservation.numberOfCustomer),
          restaurantID: currentStaff.restaurantID,
          status: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderID: 0,
          priceTotal: 0,
          description: "",
          tableID: 0,
          payment: 0,
          vat: 0,
          deposit: false,
          orderDetailDtos: [],
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isSuccessed) {
        toast.success("Đặt bàn thành công");
        setModalVisible(false);
        setNewReservation({
          userName: "",
          restaurantID: "",
          numberOfCustomer: "",
          phone: "",
          date: "",
          time: "",
        });
        // Refresh danh sách đặt bàn
        fetchOrders(currentStaff.restaurantID);
        console.log("Tạo đơn đặt bàn thành công");
      } else {
        toast.error("Đặt bàn thất bại: " + response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi đặt bàn: " + error.message);
      console.error("Error adding reservation:", error);
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
        <h3>
          LỊCH ĐẶT BÀN - Cơ sở{" "}
          {currentStaff && getRestaurantName(currentStaff.restaurantID)}
        </h3>
        <div className="container mb-2">
          <div className="row">
            <div className="col-lg-4">
              <Input.Search
                type="search"
                placeholder="Nhập số điện thoại khách "
                aria-label="Search"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-warning mt-2"
                onClick={() => setModalVisible(true)}
              >
                Tạo đơn đặt bàn
              </button>
            </div>
            <div className="col-lg-4">
              <select
                className="form-select-sm"
                aria-label="Large select example"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Trạng thái</option>
                <option value="0">Chờ</option>
                <option value="1">Chấp nhận</option>
                <option value="2">Đang dùng</option>
                <option value="3">Hủy</option>
                <option value="4">Hoàn thành</option>
              </select>
            </div>
            <div className="col-lg-4">
              <select
                className="form-select-sm "
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
              total={orders.length}
            />
          </div>
        </div>
      </div>
      <Modal
        title="Tạo đơn đặt bàn mới"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddReservation}>
            Đặt bàn
          </Button>,
        ]}
      >
        <label className="text-dark">Nhập tên khách hàng (*)</label>
        <Input
          placeholder="Tên khách hàng"
          value={newReservation.userName}
          onChange={(e) =>
            setNewReservation({ ...newReservation, userName: e.target.value })
          }
          maxLength={40}
        />
        <label className="text-dark mt-3">Nhà hàng (*)</label>
        <Input
          value={
            currentStaff ? getRestaurantName(currentStaff.restaurantID) : ""
          }
          readOnly
        />

        <Input
          type="hidden"
          value={currentStaff ? currentStaff.restaurantID : ""}
          onChange={(e) =>
            setNewReservation({
              ...newReservation,
              restaurantID: e.target.value,
            })
          }
        />
        <label className="text-dark mt-3">Nhập số lượng khách hàng (*)</label>
        <Input
          type="number"
          placeholder="Số lượng khách"
          value={newReservation.numberOfCustomer}
          onChange={(e) => {
            const value = Math.min(
              60,
              Math.max(1, parseInt(e.target.value) || 1)
            );
            setNewReservation({
              ...newReservation,
              numberOfCustomer: value,
            });
          }}
          min={1}
          max={60}
        />
        <label className="text-dark mt-3">Nhập SĐT khách hàng (*)</label>
        <Input
          type="tel"
          placeholder="Số điện thoại"
          value={newReservation.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
            setNewReservation({ ...newReservation, phone: value });
          }}
          maxLength={10}
        />
        <label className="text-dark mt-3">Chọn ngày ăn (*)</label>
        <Input
          type="date"
          value={newReservation.date}
          onChange={handleDateChange}
          min={minDate}
          max={maxDate}
        />
        <label className="text-dark mt-3">Chọn giờ ăn (*)</label>
        <Input
          type="time"
          value={newReservation.time}
          onChange={handleTimeChange}
          min={
            newReservation.date === currentTime.format("YYYY-MM-DD")
              ? currentTime.format("HH:mm")
              : "00:00"
          }
        />
      </Modal>
    </WithBootstrap>
  );
};

export default ListReservationReceptionist;
