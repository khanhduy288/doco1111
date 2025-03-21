import React, { useState, useEffect } from "react";
import WithBootstrap from "../../../../../WithBoostrap";
import axios from "axios";
import { Pagination } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ArrangeTable = () => {
  const [tables, setTables] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selectedArea, setSelectedArea] = useState(null);
  const [seatFilter, setSeatFilter] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [areas, setAreas] = useState([]);

  const { orderId, restaurantID } = useParams();

  const nav = useNavigate();

  const getToken = () => {
    return localStorage.getItem("SEPtoken");
  };

  const fetchTables = async () => {
    const token = getToken();
    try {
      const tablesResponse = await axios.get(
        "https://projectsep490g64summer24backend.azurewebsites.net/api/Tables/get-full",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (tablesResponse.data.isSuccessed) {
        const areasResponse = await axios.get(
          "https://projectsep490g64summer24backend.azurewebsites.net/api/Areas/get-full",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const areas = areasResponse.data.isSuccessed
          ? areasResponse.data.resultObj
          : [];

        const filteredTables = tablesResponse.data.resultObj.filter((table) => {
          const area = areas.find((a) => a.areaID === table.areaID);
          return area && area.restaurantID.toString() === restaurantID;
        });

        // Fetch all orders
        const ordersResponse = await axios.get(
          "https://projectsep490g64summer24backend.azurewebsites.net/api/Order/get-all-order",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allOrders = ordersResponse.data.isSuccessed
          ? ordersResponse.data.resultObj
          : [];

        const tablesWithOrderInfo = filteredTables.map((table) => {
          const matchingOrders = allOrders.filter(
            (order) => order.tableID === table.tableID
          );
          if (matchingOrders.length > 0) {
            // Lấy order mới nhất (theo thời gian)
            const latestOrder = matchingOrders.reduce((prev, current) =>
              new Date(prev.date + " " + prev.time) >
              new Date(current.date + " " + current.time)
                ? prev
                : current
            );
            return {
              ...table,
              orderDate: latestOrder.date,
              orderTime: latestOrder.time,
              orderStatus: latestOrder.status,
              orderId: latestOrder.orderID,
            };
          }
          return table;
        });

        console.log("Tables with order info:", tablesWithOrderInfo);
        setTables(tablesWithOrderInfo);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

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
        console.error("Error fetching areas:", error);
      });
  }, []);

  useEffect(() => {
    fetchTables();
  }, []);

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find((r) => r.restaurantID === parseInt(id));
    return restaurant ? restaurant.address : "Unknown";
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Trống";
      case 1:
        return "Đã đặt";
      case 2:
        return "Đang dùng";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "bg-light";
      case 1:
        return "bg-warning";
      case 2:
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  const handleTableClick = async (tableId, currentStatus) => {
    const token = getToken();
    if (currentStatus !== 0) {
      toast.error("Bàn này không khả dụng. Vui lòng chọn bàn khác.");
      return;
    }

    try {
      console.log(token);

      const response = await axios.post(
        `https://projectsep490g64summer24backend.azurewebsites.net/api/Order/${orderId}/AssignTable`,
        {
          tableId: tableId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTables((prevTables) =>
          prevTables.map((table) =>
            table.tableID === tableId
              ? {
                  ...table,
                  status: 1,
                  orderDate: new Date().toISOString().split("T")[0],
                  orderTime: new Date()
                    .toTimeString()
                    .split(" ")[0]
                    .substring(0, 5),
                  orderStatus: 1,
                  orderId: orderId,
                }
              : table
          )
        );
        await fetchTables();
        console.log("Gán bàn thành công");
        toast.success("Xếp bàn thành công!");
      } else {
        console.log("Gán bàn thất bại:", response.data.message);
        toast.error(
          response.data.message ||
            "Có lỗi xảy ra khi xếp bàn. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi khi xếp bàn:", error);
      toast.error("Có lỗi xảy ra khi xếp bàn. Vui lòng thử lại.");
    }
  };
  const handleAreaFilter = (floorNumber) => {
    const areaIDs = areas
      .filter(
        (area) =>
          area.areaName.includes(`Tầng ${floorNumber}`) &&
          area.restaurantID.toString() === restaurantID
      )
      .map((area) => area.areaID);

    setSelectedArea((prevSelectedArea) =>
      prevSelectedArea && prevSelectedArea[0] === areaIDs[0] ? null : areaIDs
    );
  };

  const handleSeatFilter = (seatCount) => {
    setSeatFilter(seatCount === seatFilter ? null : seatCount);
  };

  const filteredTables = tables.filter((table) => {
    const areaMatch = !selectedArea || selectedArea.includes(table.areaID);
    const seatMatch =
      !seatFilter ||
      (seatFilter === 2 && table.numberOfDesk == 2) ||
      (seatFilter === 4 && table.numberOfDesk == 4) ||
      (seatFilter === "large" && table.numberOfDesk > 4);
    return areaMatch && seatMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    // Assuming timeString is in format "HH:mm:ss"
    return timeString.substring(0, 5); // Returns "HH:mm"
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTables = filteredTables.slice(startIndex, endIndex);

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
      <h4>Cơ sở : {getRestaurantName(restaurantID)}</h4>
      <div className="container mt-4">
        <div className="row mb-3">
          <div className="col-md-3">
            <h5>Bộ lọc tìm kiếm</h5>
            <div>Theo lượng người</div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="personCount"
                id="ban2"
                checked={seatFilter === 2}
                onChange={() => handleSeatFilter(2)}
                style={{
                  display: "inline-block",
                  visibility: "visible",
                  opacity: 1,
                }}
              />
              <label className="form-check-label text-dark" htmlFor="ban2">
                Bàn 2 người
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="personCount"
                id="ban4"
                checked={seatFilter === 4}
                onChange={() => handleSeatFilter(4)}
                style={{
                  display: "inline-block",
                  visibility: "visible",
                  opacity: 1,
                }}
              />
              <label className="form-check-label text-dark" htmlFor="ban4">
                Bàn 4 người
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="personCount"
                id="banLon"
                checked={seatFilter === "large"}
                onChange={() => handleSeatFilter("large")}
                style={{
                  display: "inline-block",
                  visibility: "visible",
                  opacity: 1,
                }}
              />
              <label className="form-check-label text-dark" htmlFor="banLon">
                Bàn lớn
              </label>
            </div>
          </div>
          <div className="col-md-9">
            <div className="d-flex justify-content-between mb-3">
              <h5>Chọn bàn</h5>
              <div>
                {[1, 2].map((floorNumber) => (
                  <button
                    key={floorNumber}
                    className={`btn ${
                      selectedArea &&
                      selectedArea.includes(
                        areas.find(
                          (area) =>
                            area.areaName.includes(`Tầng ${floorNumber}`) &&
                            area.restaurantID.toString() === restaurantID
                        )?.areaID
                      )
                        ? "btn-secondary"
                        : "btn-outline-secondary"
                    } me-2`}
                    onClick={() => handleAreaFilter(floorNumber)}
                  >
                    Tầng {floorNumber}
                  </button>
                ))}
              </div>
            </div>
            <div className="row">
              {currentTables.map((table) => (
                <div
                  key={`${table.tableID}-${table.status}`}
                  className="col-md-3 mb-3"
                >
                  <div
                    className={`card ${getStatusColor(table.status)}`}
                    onClick={() =>
                      handleTableClick(table.tableID, table.status)
                    }
                    style={{
                      cursor: table.status === 0 ? "pointer" : "not-allowed",
                    }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">Bàn {table.tableNumber}</h5>
                      <p className="card-text">
                        Khu vực:{" "}
                        {areas.find((area) => area.areaID === table.areaID)
                          ?.areaName || "Không xác định"}
                      </p>
                      <p className="card-text">Số ghế: {table.numberOfDesk}</p>
                      {table.status !== 0 && (
                        <>
                          <p>Ngày đặt: {formatDate(table.orderDate)}</p>
                          <p>Giờ: {formatTime(table.orderTime)}</p>
                        </>
                      )}
                      <div className="text-center">
                        {getStatusText(table.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="pagination-container"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredTables.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </WithBootstrap>
  );
};

export default ArrangeTable;
