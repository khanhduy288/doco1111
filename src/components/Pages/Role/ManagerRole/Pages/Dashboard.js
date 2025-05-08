import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import moment from "moment-timezone";
import "chart.js/auto";
import WithBootstrap from "../../../../../WithBoostrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedStatus, setSelectedStatus] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalStatusOrders, setTotalStatusOrders] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: "Doanh thu",
        data: [],
        fill: false,
        backgroundColor: "green",
        borderColor: "green",
      },
    ],
  });

  useEffect(() => {
    fetchCurrentStaffInfo();
  }, []);

  useEffect(() => {
    if (currentStaff) {
      fetchRevenueData();
      fetchOrderData();
      fetchCustomerData();
    }
  }, [selectedMonth, selectedYear, selectedStatus, currentStaff]);

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  useEffect(() => {
    const token = getToken();
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

  const fetchCurrentStaffInfo = () => {
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
        })
        .catch((error) => {
          console.error("Error fetching staff information:", error);
          toast.error("Lỗi khi lấy thông tin nhân viên");
        });
    }
  };

  const fetchRevenueData = () => {
    const token = getToken();
    const endpoint = `/Statistics/revenue/statistics`;
    const params = {
      year: selectedYear,
      month: selectedMonth || null,
      restaurantId: currentStaff.restaurantID,
    };

    axios
      .get(`https://projectsep490g64summer24backend.azurewebsites.net/api${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          setRevenueData(response.data);
          updateChartData(response.data);
          calculateTotalRevenue(response.data);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the statistics!", error);
        toast.error("Lỗi khi lấy dữ liệu thống kê doanh thu");
      });
  };

  const fetchOrderData = () => {
    const token = getToken();
    const endpoint = `/Statistics/orders/statistics`;
    const params = {
      year: selectedYear,
      month: selectedMonth || null,
      restaurantId: currentStaff.restaurantID,
      status: selectedStatus ? parseInt(selectedStatus) : null,
    };

    axios
      .get(`https://projectsep490g64summer24backend.azurewebsites.net/api${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          calculateTotalOrders(response.data);
          calculateTotalStatusOrders(response.data);
        }
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the order statistics!",
          error
        );
        toast.error("Lỗi khi lấy dữ liệu thống kê đơn hàng");
      });
  };

  const fetchCustomerData = () => {
    const token = getToken();
    const endpoint = `/Statistics/customer/statistics`;
    const params = {
      year: selectedYear,
      month: selectedMonth || null,
      restaurantId: currentStaff.restaurantID,
    };

    axios
      .get(`https://projectsep490g64summer24backend.azurewebsites.net/api${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          calculateTotalCustomers(response.data);
        }
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the customer statistics!",
          error
        );
        toast.error("Lỗi khi lấy dữ liệu thống kê khách hàng");
      });
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
        return "Tất cả trạng thái";
    }
  };

  const calculateTotalRevenue = (data) => {
    const total = data.reduce((sum, item) => sum + item.revenue, 0);
    setTotalRevenue(total);
  };

  const calculateTotalOrders = (data) => {
    const total = data.reduce((sum, item) => sum + item.orderCount, 0);
    setTotalOrders(total);
  };

  const calculateTotalCustomers = (data) => {
    const total = data.reduce((sum, item) => sum + item.numberCustomer, 0);
    setTotalCustomers(total);
  };

  const calculateTotalStatusOrders = (data) => {
    const filteredData = data.filter(
      (item) => item.status === parseInt(selectedStatus) || !selectedStatus
    );
    const total = filteredData.reduce((sum, item) => sum + item.orderCount, 0);
    setTotalStatusOrders(total);
  };

  const updateChartData = (apiData) => {
    let labels = [];
    let revenues = [];

    apiData.forEach((item) => {
      labels.push(item.timePeriod);
      revenues.push(item.revenue);
    });

    setData({
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: revenues,
          fill: false,
          backgroundColor: "green",
          borderColor: "green",
        },
      ],
    });
  };

  return (
    <WithBootstrap>
      <div className="container">
        <ToastContainer
          style={{
            top: "80px",
            right: "20px",
          }}
          position="top-right"
          autoClose={1500}
        />
        <h3 className="my-4">
          THỐNG KÊ - Cơ sở{" "}
          {currentStaff && getRestaurantName(currentStaff.restaurantID)}
        </h3>
        <div className="row mb-4 ">
          <div className="col-lg-4">
            <label htmlFor="yearSelect" className="form-label text-dark">
              Chọn năm
            </label>
            <select
              className="form-select"
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 2 }, (_, i) => moment().year() - i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="col-lg-4">
            <label htmlFor="monthSelect" className="form-label text-dark">
              Chọn tháng
            </label>
            <select
              className="form-select"
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value ? parseInt(e.target.value) : "")
              }
            >
              <option value="">Cả năm</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-4">
            <label htmlFor="statusSelect" className="form-label text-dark">
              Trạng thái
            </label>
            <select
              className="form-select"
              id="statusSelect"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="0">Chờ</option>
              <option value="1">Chấp nhận</option>
              <option value="2">Đang dùng</option>
              <option value="3">Hủy</option>
              <option value="4">Hoàn thành</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Tổng doanh thu</h5>
                <div className="card-text">
                  <h3>{totalRevenue.toLocaleString()}</h3>
                  <p>VNĐ</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">
                  Tổng đơn hàng (
                  {selectedStatus
                    ? getStatusText(parseInt(selectedStatus))
                    : "Tất cả"}
                  )
                </h5>
                <div className="card-text">
                  <h3>{totalOrders}</h3>
                  <p>đơn</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Tổng số khách hàng</h5>
                <div className="card-text">
                  <h3>{totalCustomers}</h3>
                  <p>khách</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col">
            <Line
              data={data}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Doanh thu (VND)",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: selectedMonth ? "Ngày" : "Tháng",
                    },
                  },
                },
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: `Biểu đồ doanh thu ${
                      selectedMonth
                        ? `tháng ${selectedMonth}`
                        : `năm ${selectedYear}`
                    }`,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default Dashboard;
