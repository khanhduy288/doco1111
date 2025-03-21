import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Input, Button } from "antd";
import "react-toastify/dist/ReactToastify.css";

const Waitstate = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [dishes, setDishes] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [status, setStatus] = useState(null);
  const [areas, setAreas] = useState([]);
  const [isTableAssigned, setIsTableAssigned] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [discount, setDiscount] = useState(0);

  const nav = useNavigate();

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
          setIsTableAssigned(response.data.resultObj.tableID !== 0);
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

  const handleArrangeTable = () => {
    nav(`/receptionist/arrange/${id}/${order.restaurantID}`);
  };

  const updateTableStatus = (tableStatus) => {
    const token = getToken();
    axios
      .put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/UpdateStatus/${order.tableID}`,
        tableStatus,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json-patch+json",
          },
        }
      )
      .then((response) => {
        if (response.data.isSuccessed) {
          console.log("Table status reset successfully");
          toast.success("Trạng thái bàn đã được cập nhật");
        }
      })
      .catch((error) => {
        console.error("There was an error resetting the table status!", error);
        toast.error("Lỗi khi cập nhật trạng thái bàn");
      });
  };

  const updateStatus = (newStatus) => {
    const token = getToken();
    axios
      .put(`https://projectsep490g64summer24backend.azurewebsites.net/api/Order/UpdateStatus/${id}`, newStatus, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json-patch+json",
        },
      })
      .then((response) => {
        if (response.data.isSuccessed) {
          setStatus(newStatus);
          console.log("Update Status Successfully");
          toast.success("Cập nhật trạng thái thành công");

          if (newStatus === 2) {
            updateTableStatus(2);
          } else if (newStatus === 4 || newStatus === 3) {
            updateTableStatus(0);
          }
        }
      })
      .catch((error) => {
        console.error("There was an error updating the status!", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          toast.error("Cập nhật trạng thái thất bại");
        }
      });
  };

  const handleCancelOrder = () => {
    toast.warn(
      <div>
        Bạn có chắc chắn muốn hủy đơn hàng này?
        <button
          className="btn btn-danger btn-sm ml-2"
          onClick={() => {
            updateStatus(3);
            toast.dismiss();
          }}
        >
          Xác nhận
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      }
    );
  };

  const updateDiscount = (newDiscount) => {
    const token = getToken();
    axios
      .put(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/put?id=${id}`,
        { ...order, discount: newDiscount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json-patch+json",
          },
        }
      )
      .then((response) => {
        if (response.data.isSuccessed) {
          setOrder({ ...order, discount: newDiscount });
          toast.success("Cập nhật khuyến mãi thành công");
        }
      })
      .catch((error) => {
        console.error("There was an error updating the discount!", error);
        toast.error("Cập nhật khuyến mãi thất bại");
      });
  };

  if (!order) {
    return <p>Loading...</p>;
  }

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    updateDiscount(discount);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDiscountChange = (e) => {
    const newDiscount = Number(e.target.value);
    setDiscount(newDiscount);
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
      <div className="container mt-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">CHI TIẾT ĐƠN HÀNG</h5>
            {status === 1 && (
              <button className="btn btn-primary" onClick={handleArrangeTable}>
                Xếp bàn
              </button>
            )}
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
                <p>Bàn số: {getTableNumber(order.tableID)}</p>
                <p>
                  Khu vực:{" "}
                  {order.tableID ? getAreaName(order.tableID) : "Chưa có"}
                </p>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
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
                          {" "}
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
              <p>Tổng số tiền phải thanh toán: {totalPrice} đ</p>
              <p>Khách đã cọc: {order.payment}đ</p>
              <p>
                {status !== 4 && status !== 3 && (
                  <>
                    <Button
                      type="primary"
                      size="small"
                      onClick={showModal}
                      style={{ marginRight: "10px" }}
                    >
                      Nhập khuyến mại
                    </Button>
                  </>
                )}
                Chiết khấu khuyến mại: {order.discount}đ
              </p>
              <p>
                Số tiền còn lại cần thanh toán:{" "}
                {totalPrice - order.payment - order.discount}đ
              </p>

              <Modal
                title="Nhập số tiền khuyến mại theo VNĐ"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
              >
                <Input
                  type="number"
                  placeholder="Nhập số tiền khuyến mại"
                  value={discount}
                  onChange={handleDiscountChange}
                />
              </Modal>
            </div>

            <div className="d-flex justify-content-end mt-3">
              {status === 0 && (
                <>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => updateStatus(1)}
                  >
                    Chấp nhận
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleCancelOrder}
                  >
                    Hủy
                  </button>
                </>
              )}
              {status === 1 && isTableAssigned && (
                <button
                  className="btn btn-info"
                  onClick={() => updateStatus(2)}
                >
                  Đang dùng
                </button>
              )}
              {status === 1 && !isTableAssigned && (
                <p className="text-danger">
                  Vui lòng xếp bàn trước khi chuyển trạng thái sang "Đang dùng"
                </p>
              )}
              {status === 2 && (
                <button
                  className="btn btn-warning"
                  onClick={() => updateStatus(4)}
                >
                  Xác nhận thanh toán
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default Waitstate;
