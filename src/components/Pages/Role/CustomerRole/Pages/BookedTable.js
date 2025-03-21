import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BookedTable = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("SEPuser"));
    const token = localStorage.getItem("SEPtoken");

    if (storedUser && storedUser.id) {
      // Fetch user data
      axios
        .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/User/get-by-id?Id=${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const userData = response.data;
          setUser(userData);

          // Fetch orders using the user's full name
          return axios.get(
            `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/ViewOrderHistory/${encodeURIComponent(userData.fullName)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        })
        .then((response) => {
          setOrders(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data or orders:", error);
        });
    }
  }, []);

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
    <>
      <div>
        <h2 className="mt-4 mb-3">DANH SÁCH BÀN ĐÃ ĐẶT</h2>
        <div className="table-responsive">
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày đặt</th>
                <th>Thời gian</th>
                <th>Số người</th>
                <th>Tổng tiền</th>
                <th>Số tiền cọc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.orderID}>
                  <td>{index + 1}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.time}</td>
                  <td>{order.numberOfCustomer}</td>
                  <td>{order.priceTotal.toLocaleString()} đ</td>
                  <td>{order.payment.toLocaleString()} đ</td>
                  <td>{getStatusText(order.status)}</td>
                  <td>
                    <Link
                      to={`/customer/bookeddetail/${order.orderID}`}
                      className="btn btn-sm btn-outline-secondary"
                      style={{ borderRadius: "10px" }}
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default BookedTable;