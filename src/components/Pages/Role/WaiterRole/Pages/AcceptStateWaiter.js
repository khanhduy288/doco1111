import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AcceptstateWaiter = () => {
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
      .get(`https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-by-id?id=${id}`,{
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
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-all-order-detail-by-orderId?orderId=${id}`,{
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
                `https://projectsep490g64summer24backend.azurewebsites.net/api/Dishs/get-by-id?id=${detail.dishID}`
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
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/get-full",{
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
      .get("https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/get-full",{
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

  const handleDeleteDish = (detailId, dishId) => {
    toast.warn(
      <div>
        <p>Bạn có chắc chắn muốn xóa món ăn này?</p>
        <button
          onClick={() => {
            deleteDish(detailId, dishId);
            toast.dismiss();
          }}
          className="btn btn-danger mr-2"
        >
          Xóa
        </button>
        <button onClick={() => toast.dismiss()} className="btn btn-secondary">
          Hủy
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  const deleteDish = (detailId, dishId) => {
    const token = getToken();
    axios
      .delete(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/${id}/orderDetails/${detailId}/dishes/${dishId}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data === true) {
          setOrderDetails((prevDetails) =>
            prevDetails.filter((detail) => detail.id !== detailId)
          );
          const deletedDetail = orderDetails.find(
            (detail) => detail.id === detailId
          );
          if (deletedDetail) {
            setOrder((prevOrder) => ({
              ...prevOrder,
              totalAmount:
                prevOrder.totalAmount -
                deletedDetail.price * deletedDetail.quantity,
            }));
          }
          toast.success("Món ăn đã được xóa thành công!");
        } else {
          toast.error("Không thể xóa món ăn!");
        }
      })
      .catch((error) => {
        console.error("There was an error deleting the dish!", error);
        toast.error("Có lỗi xảy ra khi xóa món ăn!");
      });
  };

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

  const handleChooseDish = () => {
    nav(`/waiter/choosedish/${id}`);
  };

  const totalPrice = orderDetails.reduce(
    (sum, detail) =>
      sum + (dishes[detail.dishID]?.price || 0) * detail.quantity,
    0
  );

  if (!order) {
    return <p>Loading...</p>;
  }
  return (
    <WithBootstrap>
      <ToastContainer
        style={{
          top: "80px",
          right: "20px",
        }}
      />
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
                <p style={{fontWeight:'bold'}}>Trạng thái: {getStatusText(status)}</p>
                <p>Cơ sở : {getRestaurantName(order.restaurantID)} </p>
                <p>Bàn: {getTableNumber(order.tableID)}</p>
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
                  <th style={{textAlign:'left'}}>Món ăn</th>
                  <th style={{textAlign:'left'}}>Loại</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Thành tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center" }}>
                {orderDetails.map((detail, index) => {
                  const dish = dishes[detail.dishID] || {};
                  return (
                    <tr key={detail.dishID}>
                      <td>{index + 1}</td>
                      <td style={{textAlign:'left'}}>{dish.name || detail.dishID}</td>
                      <td style={{textAlign:'left'}}>{dish.categoryName || ""}</td>
                      <td>
                        {detail.quantity} {dish.type}
                      </td>
                      <td>{detail.price}đ</td>
                      <td>{detail.price * detail.quantity}đ</td>
                      <td>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() =>
                            handleDeleteDish(detail.id, detail.dishID)
                          }
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <button
              className="btn btn-secondary mt-1"
              onClick={handleChooseDish}
            >
              Chọn món
            </button>

            <div className="text-end">
              <p>Tổng số tiền phải thanh toán: {totalPrice}đ</p>
              <p>Khách đã cọc: {order.payment}đ</p>
              <p>Chiết khấu khuyến mại : {order.discount}đ</p>
              <p>
                Số tiền còn lại cần thanh toán: {totalPrice - order.payment - order.discount}đ
              </p>
            </div>
          </div>
        </div>
      </div>
    </WithBootstrap>
  );
};

export default AcceptstateWaiter;
